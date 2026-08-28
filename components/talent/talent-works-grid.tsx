'use client';

import { ArrowUpRight, ExternalLink, FileImage, Globe2, Maximize2, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/aigc/primitives';
import { getStaticSiteUrl, getWorkTypeLabel } from '@/lib/talent/demo-data';
import type { TalentProfile, TalentWork } from '@/lib/talent/types';

function WorkIcon({ type, size = 14 }: { type: TalentWork['type']; size?: number }) {
  if (type === 'video') return <Play size={size} aria-hidden="true" />;
  if (type === 'image') return <FileImage size={size} aria-hidden="true" />;
  return <Globe2 size={size} aria-hidden="true" />;
}

function siteHref(work: TalentWork, localStaticPreview: boolean) {
  if (work.source === 'static' && work.siteSlug && localStaticPreview) return `/portfolio-preview/${work.siteSlug}/`;
  return work.siteUrl ?? (work.siteSlug ? getStaticSiteUrl(work.siteSlug) : '#');
}

function WorkVisual({ work, talent }: { work: TalentWork; talent: TalentProfile }) {
  return (
    <div className={`aigc-work aigc-talent-work aigc-talent-work--${work.type}`}>
      {work.coverPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={work.coverPath} alt={`${talent.name} · ${work.title}`} loading="lazy" />
      ) : (
        <div className="aigc-talent-work__placeholder" aria-hidden="true">
          <span>{talent.name.slice(0, 1)}</span>
          <small>{getWorkTypeLabel(work.type)}</small>
        </div>
      )}
      <span className="aigc-work__veil" aria-hidden="true" />
      <span className="aigc-talent-work__type">
        <WorkIcon type={work.type} />
        {getWorkTypeLabel(work.type)}
      </span>
      <span className="aigc-work__zoom" aria-hidden="true">
        {work.type === 'website' ? <ExternalLink size={15} /> : <Maximize2 size={15} />}
      </span>
      <div className="aigc-work__meta">
        <span className="aigc-work__cat">{work.title}</span>
        <span className="aigc-work__by">
          <span className="aigc-work__author">{talent.name}</span>
        </span>
      </div>
    </div>
  );
}

export function TalentWorksGrid({ talent }: { talent: TalentProfile }) {
  const [current, setCurrent] = useState<TalentWork | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const localStaticPreview = process.env.NODE_ENV !== 'production';

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

      {current && <TalentWorkLightbox work={current} talent={talent} closeRef={closeRef} onClose={() => setCurrent(null)} />}
    </>
  );
}

function TalentWorkLightbox({
  work,
  talent,
  closeRef,
  onClose,
}: {
  work: TalentWork;
  talent: TalentProfile;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const images = work.galleryPaths?.length ? work.galleryPaths : work.coverPath ? [work.coverPath] : [];

  return (
    <div className="aigc-lightbox aigc-talent-lightbox" role="dialog" aria-modal="true" aria-label={work.title} onClick={onClose}>
      <button ref={closeRef} type="button" className="aigc-lightbox__close" onClick={onClose} aria-label="关闭作品预览">
        <X size={20} />
      </button>
      <div className="aigc-talent-lightbox__panel" onClick={(event) => event.stopPropagation()}>
        {work.type === 'video' && work.mediaPath ? (
          <video
            className="aigc-lightbox__video"
            src={work.mediaPath}
            poster={work.coverPath}
            controls
            playsInline
            preload="metadata"
          />
        ) : images.length > 0 ? (
          <div className={`aigc-talent-lightbox__gallery${images.length === 1 ? ' is-single' : ''}`}>
            {images.map((path, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${path}-${index}`} className="aigc-lightbox__img" src={path} alt={`${talent.name} · ${work.title} ${index + 1}`} />
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
