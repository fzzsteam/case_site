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
  const [page, setPage] = useState(0);
  /** 手机端改用横向滑动轨（两行一屏、手指拖动），桌面端保留上下页按钮。 */
  const [swipe, setSwipe] = useState(false);
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
      setVideoUrls(nextUrls);
    });

    return () => {
      cancelled = true;
    };
  }, [page, swipe, category]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? i : (i + 1) % pageWorks.length));
      if (e.key === 'ArrowLeft')
        setOpenIndex((i) => (i === null ? i : (i - 1 + pageWorks.length) % pageWorks.length));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, pageWorks.length]);

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
                setPage(0);
                setOpenIndex(null);
              }}
            >
              <span className="aigc-work-filter__label">{item}</span>
              <span className="aigc-work-filter__count" aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`aigc-works${swipe ? ' aigc-works--swipe' : ''}`}
        {...(swipe
          ? { role: 'group', 'aria-label': '学员案例，可左右滑动查看', tabIndex: 0 }
          : {})}
      >
        {pageWorks.map((w, i) => (
          <Reveal key={w.path} variant="scale" delay={swipe ? 0 : i * 70}>
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
                    preload={swipe ? 'none' : 'metadata'}
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

      {swipe && visibleWorks.length > 4 && (
        <p className="aigc-works-hint" aria-hidden>
          ← 左右滑动查看全部 {visibleWorks.length} 件作品 →
        </p>
      )}

      {!swipe && totalPages > 1 && (
        <div className="aigc-works-pager" aria-label="学员案例翻页">
          <button
            type="button"
            className="aigc-works-pager__button"
            onClick={() => {
              setPage((currentPage) => Math.max(0, currentPage - 1));
              setOpenIndex(null);
            }}
            disabled={page === 0}
          >
            上一页
          </button>
          <span className="aigc-works-pager__status" aria-live="polite">
            <strong>{page + 1}</strong> / {totalPages}
          </span>
          <button
            type="button"
            className="aigc-works-pager__button"
            onClick={() => {
              setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1));
              setOpenIndex(null);
            }}
            disabled={page === totalPages - 1}
          >
            下一页
          </button>
        </div>
      )}

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
