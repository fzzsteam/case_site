'use client';

import { useEffect, useState } from 'react';
import { WORKS, WORK_CATEGORIES, type WorkCategory } from './content';
import { IconClose, IconZoom } from './icons';
import { IconPlay } from './icons';
import { Reveal } from './primitives';
import { aigcImageUrl, fetchAigcVideoUrl } from './media';

const isVideoWork = (path: string) => path.endsWith('.mp4');

export function WorksGrid() {
  const [category, setCategory] = useState<WorkCategory>('全部');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const visibleWorks = category === '全部' ? WORKS : WORKS.filter((work) => work.category === category);
  const current = openIndex === null ? null : visibleWorks[openIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const videoPaths = WORKS.filter((work) => isVideoWork(work.path)).map((work) => work.path);

    Promise.all(
      videoPaths.map(async (path) => {
        try {
          return [path, await fetchAigcVideoUrl(path)] as const;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
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
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? i : (i + 1) % visibleWorks.length));
      if (e.key === 'ArrowLeft')
        setOpenIndex((i) => (i === null ? i : (i - 1 + visibleWorks.length) % visibleWorks.length));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, visibleWorks.length]);

  return (
    <>
      <div className="aigc-work-filters" role="group" aria-label="学员案例分类">
        {WORK_CATEGORIES.map((item) => {
          const count = item === '全部' ? WORKS.length : WORKS.filter((work) => work.category === item).length;
          const selected = category === item;
          return (
            <button
              type="button"
              className={`aigc-work-filter${selected ? ' is-active' : ''}`}
              aria-pressed={selected}
              aria-label={`${item}（${count} 个作品）`}
              key={item}
              onClick={() => {
                setCategory(item);
                setOpenIndex(null);
              }}
            >
              <span className="aigc-work-filter__label">{item}</span>
              <span className="aigc-work-filter__count" aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="aigc-works">
        {visibleWorks.map((w, i) => (
          <Reveal key={w.path} variant="scale" delay={i * 70}>
            <button
              type="button"
              className="aigc-work"
              onClick={() => setOpenIndex(i)}
              aria-label={`放大查看：${w.cat}`}
              style={{ width: '100%' }}
            >
              {isVideoWork(w.path) ? (
                videoUrls[w.path] ? (
                  <video
                    className="aigc-work__video"
                    src={videoUrls[w.path]}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onMouseEnter={(event) => void event.currentTarget.play()}
                    onMouseLeave={(event) => {
                      event.currentTarget.pause();
                      event.currentTarget.currentTime = 0;
                    }}
                  />
                ) : (
                  <span className="aigc-work__video-loading">视频加载中…</span>
                )
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aigcImageUrl(w.path)} alt={w.cat} loading="lazy" decoding="async" />
                </>
              )}
              <span className="aigc-work__veil" />
              <span className="aigc-work__zoom">
                {isVideoWork(w.path) ? <IconPlay /> : <IconZoom />}
              </span>
              <span className="aigc-work__meta">
                <span className="aigc-work__cat">{w.cat}</span>
                <span className="aigc-work__by">
                  <span className="aigc-work__tag">{w.category}</span>
                  <span className="aigc-work__author">{w.by}</span>
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {current && (
        <div className="aigc-lightbox" onClick={() => setOpenIndex(null)} role="dialog" aria-modal="true">
          <button type="button" className="aigc-lightbox__close" aria-label="关闭">
            <IconClose size={18} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', cursor: 'auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {isVideoWork(current.path) ? (
              videoUrls[current.path] ? (
                <video
                  className="aigc-lightbox__video"
                  src={videoUrls[current.path]}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <p className="aigc-lightbox__loading">视频加载中…</p>
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="aigc-lightbox__img" src={aigcImageUrl(current.path)} alt={current.cat} />
            )}
            <p className="aigc-lightbox__cap">
              {current.category} · {current.cat} · {current.by}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
