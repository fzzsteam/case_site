'use client';

import { useEffect, useState } from 'react';
import { WORKS } from './content';
import { IconClose, IconZoom } from './icons';
import { Reveal } from './primitives';

export function WorksGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex === null ? null : WORKS[openIndex];

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? i : (i + 1) % WORKS.length));
      if (e.key === 'ArrowLeft')
        setOpenIndex((i) => (i === null ? i : (i - 1 + WORKS.length) % WORKS.length));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  return (
    <>
      <div className="aigc-works">
        {WORKS.map((w, i) => (
          <Reveal key={w.src} variant="scale" delay={i * 70}>
            <button
              type="button"
              className="aigc-work"
              onClick={() => setOpenIndex(i)}
              aria-label={`放大查看：${w.cat}`}
              style={{ width: '100%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.src} alt={w.cat} loading="lazy" decoding="async" />
              <span className="aigc-work__veil" />
              <span className="aigc-work__zoom">
                <IconZoom />
              </span>
              <span className="aigc-work__meta">
                <span className="aigc-work__cat">{w.cat}</span>
                <br />
                <span className="aigc-work__by">{w.by}</span>
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
            <img className="aigc-lightbox__img" src={current.src} alt={current.cat} />
            <p className="aigc-lightbox__cap">
              {current.cat} · {current.by}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
