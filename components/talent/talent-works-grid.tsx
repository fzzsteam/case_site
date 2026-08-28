'use client';

import { ArrowUpRight, ExternalLink, Maximize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { aigcImageUrl, fetchAigcVideoUrl } from '@/components/aigc/media';
import { Reveal } from '@/components/aigc/primitives';
import { getStaticSiteUrl, getWorkTypeLabel } from '@/lib/talent/presentation';
import type { TalentProfile, TalentWork } from '@/lib/talent/types';

function workTypeTag(type: TalentWork['type']) {
  if (type === 'video') return '视频';
  if (type === 'image') return '图片';
  return '网站';
}

function siteHref(work: TalentWork, localStaticPreview: boolean) {
  if (work.source === 'static' && work.siteSlug && localStaticPreview) return `/portfolio-preview/${work.siteSlug}/`;
  return work.siteUrl ?? (work.siteSlug ? getStaticSiteUrl(work.siteSlug) : '#');
}

function workMediaPaths(work: TalentWork) {
  return work.mediaPaths?.length ? work.mediaPaths : work.mediaPath ? [work.mediaPath] : [];
}

function isOssMediaPath(path: string) {
  return path.startsWith('case-site/cases/');
}

function WorkVisual({ work, talent }: { work: TalentWork; talent: TalentProfile }) {
  return (
    <div className={`aigc-work aigc-talent-work aigc-talent-work--${work.type}`}>
      {work.coverPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={aigcImageUrl(work.coverPath)} alt={`${talent.name} · ${work.title}`} loading="lazy" />
      ) : (
        <div className="aigc-talent-work__placeholder" aria-hidden="true">
          <span>{talent.name.slice(0, 1)}</span>
          <small>{getWorkTypeLabel(work.type)}</small>
        </div>
      )}
      <span className="aigc-work__veil" aria-hidden="true" />
      <span className="aigc-work__zoom" aria-hidden="true">
        {work.type === 'website' ? <ExternalLink size={15} /> : <Maximize2 size={15} />}
      </span>
      <div className="aigc-work__meta">
        <span className="aigc-work__cat">{work.title}</span>
        <span className="aigc-work__by">
          <span className="aigc-work__tag">{workTypeTag(work.type)}</span>
        </span>
      </div>
    </div>
  );
}

export function TalentWorksGrid({ talent }: { talent: TalentProfile }) {
  const [current, setCurrent] = useState<TalentWork | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const localStaticPreview = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    const paths = current?.type === 'video' ? workMediaPaths(current).filter(isOssMediaPath) : [];
    if (paths.length === 0) {
      setVideoUrls({});
      return;
    }

    let cancelled = false;
    Promise.all(paths.map(async (path) => {
      try {
        return [path, await fetchAigcVideoUrl(path)] as const;
      } catch {
        return null;
      }
    })).then((entries) => {
      if (cancelled) return;
      const nextUrls: Record<string, string> = {};
      entries.forEach((entry) => {
        if (entry) nextUrls[entry[0]] = entry[1];
      });
      setVideoUrls(nextUrls);
    });

    return () => {
      cancelled = true;
    };
  }, [current]);

  useEffect(() => {
    if (!current) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCurrent(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [current]);

  return (
    <>
      <div className="aigc-works aigc-talent-works-grid">
        {talent.works.map((work, index) => {
          const visual = <WorkVisual key={work.id} work={work} talent={talent} />;
          if (work.type === 'website') {
            return (
              <Reveal key={work.id} variant="scale" delay={index * 60} className="aigc-talent-work-item">
                <a
                  className="aigc-talent-work-link"
                  href={siteHref(work, localStaticPreview)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`新窗口打开${work.title}`}
                >
                  {visual}
                </a>
              </Reveal>
            );
          }

          return (
            <Reveal key={work.id} variant="scale" delay={index * 60} className="aigc-talent-work-item">
              <button type="button" className="aigc-talent-work-button" onClick={() => setCurrent(work)} aria-label={`查看${work.title}`}>
                {visual}
              </button>
            </Reveal>
          );
        })}
      </div>

      {current && <TalentWorkLightbox work={current} talent={talent} videoUrls={videoUrls} closeRef={closeRef} onClose={() => setCurrent(null)} />}
    </>
  );
}

function TalentWorkLightbox({
  work,
  talent,
  videoUrls,
  closeRef,
  onClose,
}: {
  work: TalentWork;
  talent: TalentProfile;
  videoUrls: Record<string, string>;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const images = work.galleryPaths?.length ? work.galleryPaths : work.coverPath ? [work.coverPath] : [];
  const videos = workMediaPaths(work);

  return (
    <div className="aigc-lightbox aigc-talent-lightbox" role="dialog" aria-modal="true" aria-label={work.title} onClick={onClose}>
      <button ref={closeRef} type="button" className="aigc-lightbox__close" onClick={onClose} aria-label="关闭作品预览">
        <X size={20} />
      </button>
      <div className="aigc-talent-lightbox__panel" onClick={(event) => event.stopPropagation()}>
        {work.type === 'video' && videos.length > 0 ? (
          <div className={`aigc-talent-lightbox__video-grid${videos.length === 1 ? ' is-single' : ''}`}>
            {videos.map((path, index) => {
              const src = isOssMediaPath(path) ? videoUrls[path] : path;
              return (
                <div key={path} className="aigc-talent-lightbox__video-card">
                  {src ? (
                    <video
                      className="aigc-lightbox__video"
                      src={src}
                      poster={work.coverPath ? aigcImageUrl(work.coverPath) : undefined}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <div className="aigc-talent-lightbox__video-loading">视频加载中…</div>
                  )}
                  <span className="aigc-talent-lightbox__video-index">片段 {String(index + 1).padStart(2, '0')}</span>
                </div>
              );
            })}
          </div>
        ) : images.length > 0 ? (
          <div className={`aigc-talent-lightbox__gallery${images.length === 1 ? ' is-single' : ''}`}>
            {images.map((path, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${path}-${index}`} className="aigc-lightbox__img" src={aigcImageUrl(path)} alt={`${talent.name} · ${work.title} ${index + 1}`} />
            ))}
          </div>
        ) : (
          <div className="aigc-talent-lightbox__empty">暂无可预览的作品文件</div>
        )}
        <div className="aigc-talent-lightbox__caption">
          <span>{getWorkTypeLabel(work.type)}</span>
          <strong>{work.title}</strong>
          <p>{work.summary}</p>
        </div>
      </div>
      <span className="aigc-talent-lightbox__hint" aria-hidden="true"><ArrowUpRight size={14} /> ESC 关闭</span>
    </div>
  );
}
