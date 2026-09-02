'use client';

import { useEffect, useRef, useState } from 'react';
import { WORKS, WORK_CATEGORIES, type WorkCategory } from './content';
import { IconArrow, IconClose, IconPlay, IconZoom } from './icons';
import { Reveal } from './primitives';
import { aigcImageUrl, fetchAigcVideoUrl } from './media';

const isVideoWork = (path: string) => path.endsWith('.mp4');

export function WorksGrid() {
  const [category, setCategory] = useState<WorkCategory>('全部');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [swipe, setSwipe] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const PAGE_SIZE = 8;
  const visibleWorks = category === '全部' ? WORKS : WORKS.filter((work) => work.category === category);
  const totalPages = Math.max(1, Math.ceil(visibleWorks.length / PAGE_SIZE));
  const pageWorks = swipe ? visibleWorks : visibleWorks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const current = openIndex === null ? null : pageWorks[openIndex] ?? null;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => {
      setSwipe(media.matches);
      setPage(0);
      setOpenIndex(null);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  useEffect(() => {
    let cancelled = false;
    const videoPaths = pageWorks.filter((work) => isVideoWork(work.path)).map((work) => work.path);

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
      setVideoUrls((currentUrls) => ({ ...currentUrls, ...nextUrls }));
    });

    return () => {
      cancelled = true;
    };
  }, [page, swipe, category]);

  useEffect(() => {
    if (openIndex === null) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
      if (event.key === 'ArrowRight') setOpenIndex((index) => (index === null ? index : (index + 1) % pageWorks.length));
      if (event.key === 'ArrowLeft') setOpenIndex((index) => (index === null ? index : (index - 1 + pageWorks.length) % pageWorks.length));
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [openIndex, pageWorks.length]);

  const openWork = (index: number) => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenIndex(index);
  };

  return (
    <>
      <div className="aigc-archive-toolbar">
        <div className="aigc-archive-filters" role="group" aria-label="学员案例分类">
          {WORK_CATEGORIES.map((item) => {
            const count = item === '全部' ? WORKS.length : WORKS.filter((work) => work.category === item).length;
            const selected = category === item;
            return (
              <button
                type="button"
                className={`aigc-filter${selected ? ' is-active' : ''}`}
                aria-pressed={selected}
                aria-label={`${item}（${count} 个作品）`}
                key={item}
                onClick={() => {
                  setCategory(item);
                  setPage(0);
                  setOpenIndex(null);
                }}
              >
                <span>{item}</span><b>{String(count).padStart(2, '0')}</b>
              </button>
            );
          })}
        </div>
        <span className="aigc-archive-count" aria-live="polite">
          {String(visibleWorks.length).padStart(2, '0')} / {String(WORKS.length).padStart(2, '0')} WORKS
        </span>
      </div>

      <div
        className={`aigc-archive-grid${swipe ? ' aigc-archive-grid--swipe' : ''}`}
        {...(swipe ? { role: 'group', 'aria-label': '学员案例，可左右滑动查看', tabIndex: 0 } : {})}
      >
        {pageWorks.map((work, index) => (
          <Reveal key={work.path} variant="scale" delay={swipe ? 0 : index * 50}>
            <button type="button" className="aigc-archive-card" onClick={() => openWork(index)} aria-label={`放大查看：${work.cat}`}>
              <span className="aigc-archive-card__visual">
                {isVideoWork(work.path) ? (
                  videoUrls[work.path] ? (
                    <video
                      src={videoUrls[work.path]}
                      muted
                      loop
                      playsInline
                      preload={swipe ? 'none' : 'metadata'}
                      onMouseEnter={(event) => void event.currentTarget.play()}
                      onMouseLeave={(event) => {
                        event.currentTarget.pause();
                        event.currentTarget.currentTime = 0;
                      }}
                      onFocus={(event) => void event.currentTarget.play()}
                      onBlur={(event) => {
                        event.currentTarget.pause();
                        event.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <span className="aigc-archive-card__loading">视频加载中…</span>
                  )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={aigcImageUrl(work.path)} alt={work.cat} loading="lazy" decoding="async" />
                )}
                <span className="aigc-archive-card__wash" aria-hidden="true" />
                <span className="aigc-archive-card__zoom" aria-hidden="true">{isVideoWork(work.path) ? <IconPlay /> : <IconZoom />}</span>
                <span className="aigc-archive-card__meta">
                  <span>{work.cat}</span>
                  <small><b>{work.category}</b>{work.by}</small>
                </span>
              </span>
              <span className="aigc-archive-card__footer">
                <span>VIEW / {String(index + 1).padStart(2, '0')}</span>
                <IconArrow size={16} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {swipe && visibleWorks.length > 4 && <p className="aigc-archive-hint">← 左右滑动查看全部 {visibleWorks.length} 件作品 →</p>}

      {!swipe && totalPages > 1 && (
        <div className="aigc-pager" aria-label="学员案例翻页">
          <button type="button" onClick={() => { setPage((value) => Math.max(0, value - 1)); setOpenIndex(null); }} disabled={page === 0}>上一页</button>
          <span><strong>{String(page + 1).padStart(2, '0')}</strong> / {String(totalPages).padStart(2, '0')}</span>
          <button type="button" onClick={() => { setPage((value) => Math.min(totalPages - 1, value + 1)); setOpenIndex(null); }} disabled={page === totalPages - 1}>下一页</button>
        </div>
      )}

      {current && (
        <div className="aigc-lightbox" onClick={() => setOpenIndex(null)} role="dialog" aria-modal="true" aria-label={`${current.cat}预览`}>
          <button ref={closeRef} type="button" className="aigc-lightbox__close" onClick={() => setOpenIndex(null)} aria-label="关闭作品预览">
            <IconClose size={18} />
          </button>
          <div className="aigc-lightbox__panel" onClick={(event) => event.stopPropagation()}>
            {isVideoWork(current.path) ? (
              videoUrls[current.path] ? <video className="aigc-lightbox__video" src={videoUrls[current.path]} controls autoPlay muted playsInline /> : <p>视频加载中…</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="aigc-lightbox__img" src={aigcImageUrl(current.path)} alt={current.cat} />
            )}
            <p className="aigc-lightbox__cap"><span>{current.category}</span><strong>{current.cat}</strong><small>{current.by} · ← → 切换作品</small></p>
          </div>
        </div>
      )}
    </>
  );
}
