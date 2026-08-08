'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

/** 元素进入视口时打上 is-in，驱动 CSS 里的入场动画。只触发一次。 */
export function useInView<T extends HTMLElement>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  /** 入场方向，默认从下往上 */
  variant?: 'up' | 'left' | 'right' | 'scale';
  /** 毫秒级延迟，用于同组元素错峰 */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  id,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const variantClass = variant === 'up' ? '' : ` aigc-reveal--${variant}`;

  return (
    <Tag
      id={id}
      ref={ref}
      className={`aigc-reveal${variantClass} ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ ...style, ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** 数字滚动。进入视口后用 rAF 缓动到目标值。 */
export function CountUp({
  to,
  suffix = '',
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/**
 * 卡片：鼠标位置写进 CSS 变量驱动高光，桌面端额外做轻微 3D 倾斜。
 * 触摸设备不做倾斜，避免误触时抖动。
 */
export function TiltCard({
  children,
  className = '',
  tilt = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || e.pointerType === 'touch') return;

      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);

      if (tilt) {
        const rx = ((y / r.height) * 2 - 1) * -3.2;
        const ry = ((x / r.width) * 2 - 1) * 3.2;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
    },
    [tilt],
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div
      ref={ref}
      className={`aigc-card aigc-tilt ${className}`.trim()}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}

/** 关键词跑马灯，轨道渲染两遍以实现无缝循环。 */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="aigc-marquee" aria-hidden>
      {[0, 1].map((track) => (
        <div className="aigc-marquee__track" key={track}>
          {items.map((it) => (
            <span className="aigc-marquee__item" key={`${track}-${it}`}>
              {it}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
