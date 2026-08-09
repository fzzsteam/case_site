'use client';

import { useRef } from 'react';
import { CASES } from './content';
import { TiltCard } from './primitives';

/** 就业案例横向轨道：桌面端支持按住拖拽，移动端走原生 snap 滑动。 */
export function CaseRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = railRef.current;
    if (!el || e.pointerType === 'touch') return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };
    el.classList.add('is-dragging');
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = railRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    el.scrollLeft = drag.current.startLeft - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const el = railRef.current;
    if (!el || !drag.current.active) return;
    drag.current.active = false;
    el.classList.remove('is-dragging');
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      className="aigc-rail"
      ref={railRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {CASES.map((c) => (
        <TiltCard className="aigc-case" tilt={false} key={c.dest}>
          <div className="aigc-case__tags">
            {c.tags.map((t, i) => (
              <span className={`aigc-case__tag${i === 0 ? ' aigc-case__tag--hi' : ''}`} key={t}>
                {t}
              </span>
            ))}
          </div>
          <p className="aigc-case__dest">{c.dest}</p>
          <p className="aigc-case__quote">“{c.quote}”</p>
        </TiltCard>
      ))}
    </div>
  );
}
