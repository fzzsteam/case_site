'use client';

import { FileImage, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { aigcImageUrl, fetchAigcVideoUrl } from '@/components/aigc/media';
import { AggregateDialog } from './dialog';

const signedUrls = new Map<string, { promise: Promise<string>; expires: number }>();
function resolveVideo(path: string) {
  if (!path.startsWith('case-site/cases/')) return Promise.resolve(path);
  const cached = signedUrls.get(path);
  if (cached && cached.expires > Date.now()) return cached.promise;
  const promise = fetchAigcVideoUrl(path).catch(error => { signedUrls.delete(path); throw error; });
  signedUrls.set(path, { promise, expires: Date.now() + 10 * 60 * 1000 });
  return promise;
}

function useVideoUrl(path?: string, enabled = true) {
  const [result, setResult] = useState<{ path?: string; url?: string; error?: boolean }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path || !enabled) return;
    let cancelled = false;
    setResult({ path });
    resolveVideo(path).then(url => { if (!cancelled) setResult({ path, url }); })
      .catch(() => { if (!cancelled) setResult({ path, error: true }); });
    return () => { cancelled = true; };
  }, [path, enabled, attempt]);
  return { ...(result.path === path ? result : {}), retry: () => { if (path) signedUrls.delete(path); setAttempt(n => n + 1); } };
}

export function MediaVisual({ coverPath, videoPath, alt, className = '' }: {
  coverPath?: string; videoPath?: string; alt: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [failedImage, setFailedImage] = useState(false);
  const [failedVideo, setFailedVideo] = useState(false);
  useEffect(() => { setFailedImage(false); setFailedVideo(false); }, [coverPath, videoPath]);
  const loadVideo = Boolean(videoPath && (!coverPath || failedImage));
  const video = useVideoUrl(videoPath, visible && loadVideo);
  useEffect(() => {
    if (!loadVideo || !ref.current) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '160px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loadVideo]);
  return <span ref={ref} className={`ag-media-visual ${className}`}>
    {coverPath && !failedImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={aigcImageUrl(coverPath)} alt={alt} loading="lazy" decoding="async" onError={() => setFailedImage(true)} />
    ) : video.url && !failedVideo ? <video src={video.url} muted playsInline preload="metadata" aria-label={alt}
      onLoadedMetadata={event => { event.currentTarget.currentTime = Math.min(.1, event.currentTarget.duration / 2 || 0); }} onError={() => setFailedVideo(true)} />
      : <span className="ag-media-visual__fallback">{videoPath ? <Play size={28} /> : <FileImage size={28} />}<small>{video.error || failedVideo ? '打开查看视频' : videoPath ? 'VIDEO WORK' : 'IMAGE WORK'}</small></span>}
  </span>;
}

function PreviewVideo({ path, coverPath }: { path: string; coverPath?: string }) {
  const { url, error, retry } = useVideoUrl(path);
  const [failed, setFailed] = useState(false);
  return <div className="ag-media-preview__video">
    {error || failed ? <div className="ag-media-preview__status"><p>视频暂时无法加载</p><button type="button" onClick={() => { setFailed(false); retry(); }}>重试加载</button></div>
      : url ? <video src={url} controls playsInline preload="metadata" poster={coverPath ? aigcImageUrl(coverPath) : undefined} onError={() => setFailed(true)} />
        : <div className="ag-media-preview__status" role="status">正在加载视频…</div>}
  </div>;
}

export function MediaDialog({ title, summary, images = [], videos = [], coverPath, onClose }: {
  title: string; summary?: string; images?: string[]; videos?: string[]; coverPath?: string; onClose: () => void;
}) {
  return <AggregateDialog title={title} onClose={onClose} className="ag-media-preview">
    <div className="ag-media-preview__heading"><p className="ag-eyebrow">SELECTED WORK / 作品预览</p><h2>{title}</h2>{summary && <p>{summary}</p>}</div>
    <div className="ag-media-preview__gallery">
      {images.map((path, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${path}-${i}`} src={aigcImageUrl(path)} alt={`${title} · 图片 ${i + 1}`} loading="lazy" />
      ))}
      {videos.map((path, i) => <div key={`${path}-${i}`}><PreviewVideo path={path} coverPath={coverPath} />{videos.length > 1 && <small>片段 {i + 1} / {videos.length}</small>}</div>)}
      {!images.length && !videos.length && <p>该作品暂无可预览的媒体。</p>}
    </div>
  </AggregateDialog>;
}
