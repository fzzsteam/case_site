"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, GripVertical, Image as ImageIcon, Trash2, Video } from "lucide-react";
import type { Category, CaseCategory, CaseStudy, VideoOrientation } from "@/lib/cases/types";
import { detectVideoOrientation, uploadFile } from "@/lib/admin/upload-client";
import { useToast } from "./toast";
import { FileDropTarget } from "./file-drop-target";
import { VideoPreviewDialog } from "./video-preview-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const coverUrl = (path: string) => `/api/media/image/${path.split("/").map(encodeURIComponent).join("/")}`;

type EpisodeDraft = { key: string; fileName: string; videoPath: string; orientation: VideoOrientation | null; uploading: boolean; progress: number; previewUrl?: string };

let keyCounter = 0;
const nextKey = () => `episode-${Date.now()}-${keyCounter++}`;

export function CaseForm({ initialCase }: { initialCase?: CaseStudy }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(initialCase);

  const [title, setTitle] = useState(initialCase?.title ?? "");
  const [category, setCategory] = useState<CaseCategory>(initialCase?.category ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState(initialCase?.summary ?? "");
  const [coverPath, setCoverPath] = useState(initialCase?.coverPath ?? "");
  const [coverPreview, setCoverPreview] = useState(initialCase ? coverUrl(initialCase.coverPath) : "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [episodes, setEpisodes] = useState<EpisodeDraft[]>(
    initialCase ? initialCase.episodes.map((episode) => ({ key: episode.id, fileName: episode.videoPath.split("/").pop() ?? episode.videoPath, videoPath: episode.videoPath, orientation: episode.orientation, uploading: false, progress: 100 })) : [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: "", title: "" });
  const [resolvingPreview, setResolvingPreview] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { categories?: Category[] }) => {
        const list = data.categories ?? [];
        setCategories(list);
        setCategory((current) => current || list[0]?.name || "");
      })
      .catch(() => showToast("error", "加载分类列表失败"));
  }, [showToast]);

  async function handleCoverFile(file: File) {
    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    setCoverProgress(0);
    try {
      const objectPath = await uploadFile("cover", file, setCoverProgress);
      setCoverPath(objectPath);
      setErrors((current) => { const next = { ...current }; delete next.coverPath; return next; });
    } catch {
      showToast("error", "封面上传失败，请重试");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleVideoFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const drafts = list.map((file) => ({ key: nextKey(), fileName: file.name, videoPath: "", orientation: null as VideoOrientation | null, uploading: true, progress: 0, previewUrl: URL.createObjectURL(file) }));
    setEpisodes((current) => [...current, ...drafts]);

    await Promise.all(list.map(async (file, index) => {
      const draftKey = drafts[index].key;
      try {
        const [orientation, videoPath] = await Promise.all([
          detectVideoOrientation(file),
          uploadFile("video", file, (percent) => setEpisodes((current) => current.map((episode) => (episode.key === draftKey ? { ...episode, progress: percent } : episode)))),
        ]);
        setEpisodes((current) => current.map((episode) => (episode.key === draftKey ? { ...episode, orientation, videoPath, uploading: false, progress: 100 } : episode)));
      } catch {
        showToast("error", `${file.name} 上传失败，请重试`);
        setEpisodes((current) => current.filter((episode) => episode.key !== draftKey));
      }
    }));
  }

  function removeEpisode(key: string) {
    setEpisodes((current) => current.filter((episode) => episode.key !== key));
  }

  function handleEpisodeDrop(targetIndex: number) {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    if (fromIndex === null || fromIndex === targetIndex) return;
    setEpisodes((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function openPreview(episode: EpisodeDraft) {
    if (episode.previewUrl) {
      setPreview({ open: true, url: episode.previewUrl, title: episode.fileName });
      return;
    }
    if (!episode.videoPath) return;
    setResolvingPreview(episode.key);
    try {
      const response = await fetch("/api/media/video-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: episode.videoPath }) });
      if (!response.ok) throw new Error();
      const { url } = (await response.json()) as { url: string };
      setPreview({ open: true, url, title: episode.fileName });
    } catch {
      showToast("error", "视频预览加载失败");
    } finally {
      setResolvingPreview(null);
    }
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "请填写标题";
    if (!category) next.category = "请选择分类";
    if (!summary.trim()) next.summary = "请填写简介";
    if (!coverPath) next.coverPath = "请上传封面图片";
    if (episodes.length === 0) next.episodes = "请至少上传一个视频";
    if (episodes.some((episode) => episode.uploading || !episode.videoPath)) next.episodes = "请等待视频上传完成";
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        summary: summary.trim(),
        coverPath,
        episodes: episodes.map((episode) => ({ videoPath: episode.videoPath, orientation: episode.orientation })),
      };
      const response = await fetch(isEdit ? `/api/admin/cases/${initialCase!.id}` : "/api/admin/cases", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      showToast("success", isEdit ? "案例已更新" : "案例已创建");
      router.push("/admin/cases");
      router.refresh();
    } catch {
      showToast("error", "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{isEdit ? "编辑案例" : "新建案例"}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="case-title">标题</Label>
              <Input id="case-title" value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={Boolean(errors.title)} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-category">分类</Label>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  暂无分类，请先在<Link href="/admin/categories" className="text-primary underline-offset-2 hover:underline">分类管理</Link>中添加
                </p>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="case-category" aria-invalid={Boolean(errors.category)}>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-summary">简介</Label>
              <Textarea id="case-summary" value={summary} onChange={(event) => setSummary(event.target.value)} aria-invalid={Boolean(errors.summary)} />
              {errors.summary && <p className="text-xs text-destructive">{errors.summary}</p>}
            </div>

            <div className="pt-2">
              <h2 className="mb-3 text-sm font-semibold text-foreground">分集视频</h2>
              {episodes.length > 0 && (
                <div className="mb-3 space-y-2">
                  {episodes.map((episode, index) => (
                    <div
                      key={episode.key}
                      draggable={!episode.uploading}
                      onDragStart={() => { dragIndex.current = index; }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleEpisodeDrop(index)}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
                    >
                      <span className="text-muted-foreground"><GripVertical size={14} /></span>
                      <Video size={16} className="shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{episode.fileName}</span>
                      {episode.uploading ? (
                        <span className="text-xs text-muted-foreground">上传中 {episode.progress}%</span>
                      ) : (
                        <>
                          <Badge variant="secondary">{episode.orientation === "landscape" ? "横屏" : "竖屏"}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`预览${episode.fileName}`}
                            disabled={resolvingPreview === episode.key}
                            onClick={() => openPreview(episode)}
                          >
                            <Eye size={14} />
                          </Button>
                        </>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`移除${episode.fileName}`} onClick={() => removeEpisode(episode.key)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <FileDropTarget accept="video/*" label="点击或拖拽上传视频，可多选" onFile={(file) => handleVideoFiles([file])} />
              {errors.episodes && <p className="mt-1.5 text-xs text-destructive">{errors.episodes}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>封面图片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropTarget accept="image/*" label="点击或拖拽上传封面" onFile={handleCoverFile} disabled={coverUploading}>
              {coverPreview ? (
                <div className="flex items-center gap-3 text-left">
                  <img src={coverPreview} alt="" className="h-[50px] w-20 shrink-0 rounded-md object-cover bg-secondary" />
                  <span>{coverUploading ? `上传中 ${coverProgress}%` : "点击更换封面"}</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ImageIcon size={18} /> 点击或拖拽上传封面
                </span>
              )}
            </FileDropTarget>
            {errors.coverPath && <p className="text-xs text-destructive">{errors.coverPath}</p>}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? "保存中…" : "保存"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/cases")}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <VideoPreviewDialog open={preview.open} url={preview.url} title={preview.title} onClose={() => setPreview({ open: false, url: "", title: "" })} />
    </form>
  );
}
