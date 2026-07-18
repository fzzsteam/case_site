"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clapperboard, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category, CaseStudy } from "@/lib/cases/types";
import { useToast } from "./toast";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const coverUrl = (path: string) => `/api/media/image/${path.split("/").map(encodeURIComponent).join("/")}`;

export function CaseList() {
  const { showToast } = useToast();
  const [cases, setCases] = useState<CaseStudy[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("全部");
  const [pendingDelete, setPendingDelete] = useState<CaseStudy | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const tabs = ["全部", ...categories.map((item) => item.name)];

  useEffect(() => {
    fetch("/api/admin/cases")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setCases(data.cases))
      .catch(() => showToast("error", "加载案例列表失败"));
    fetch("/api/admin/categories")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setCategories(data.categories))
      .catch(() => showToast("error", "加载分类列表失败"));
  }, [showToast]);

  const filtered = cases ? (category === "全部" ? cases : cases.filter((item) => item.category === category)) : [];
  const canReorder = category === "全部";

  function handleDrop(targetIndex: number) {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    if (fromIndex === null || fromIndex === targetIndex || !cases) return;
    const next = [...cases];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);
    setCases(next);
    persistOrder(next.map((item) => item.id));
  }

  async function persistOrder(orderedIds: string[]) {
    try {
      const response = await fetch("/api/admin/cases/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds }) });
      if (!response.ok) throw new Error();
      showToast("success", "排序已保存");
    } catch {
      showToast("error", "排序保存失败，请刷新页面重试");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/cases/${pendingDelete.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setCases((current) => (current ? current.filter((item) => item.id !== pendingDelete.id) : current));
      showToast("success", "案例已删除");
    } catch {
      showToast("error", "删除失败，请重试");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">案例管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理官网展示的案例内容与排序</p>
        </div>
        <Button asChild>
          <Link href="/admin/cases/new">
            <Plus size={16} />
            新建案例
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCategory(tab)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === tab ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {cases === null && (
        <Card className="divide-y divide-border">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {cases !== null && filtered.length === 0 && (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Clapperboard size={22} />
          </div>
          <p className="text-sm text-muted-foreground">还没有案例，点击右上角新建一个吧</p>
        </Card>
      )}

      {cases !== null && filtered.length > 0 && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {canReorder && <TableHead className="w-10" />}
                <TableHead className="w-20">封面</TableHead>
                <TableHead>案例</TableHead>
                <TableHead className="w-28">视频数</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow
                  key={item.id}
                  draggable={canReorder}
                  onDragStart={() => { dragIndex.current = index; }}
                  onDragOver={(event) => canReorder && event.preventDefault()}
                  onDrop={() => canReorder && handleDrop(index)}
                  className={cn(canReorder && "cursor-grab active:cursor-grabbing")}
                >
                  {canReorder && (
                    <TableCell className="text-muted-foreground">
                      <span aria-label="拖拽排序">
                        <GripVertical size={16} />
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <img src={coverUrl(item.coverPath)} alt="" className="h-10 w-16 rounded-md object-cover bg-secondary" />
                  </TableCell>
                  <TableCell>
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <Badge className="mt-1">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.episodes.length} 个视频</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link href={`/admin/cases/${item.id}/edit`} aria-label={`编辑${item.title}`}>
                          <Pencil size={15} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`删除${item.title}`} onClick={() => setPendingDelete(item)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除案例"
        description={pendingDelete ? `确定要删除「${pendingDelete.title}」吗？此操作不可撤销，OSS 上的素材文件不会被删除。` : ""}
        confirmLabel={deleting ? "删除中…" : "删除"}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
