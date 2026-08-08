'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO } from './content';
import { CtaButton } from './LeadProvider';

export function Hero() {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /** 首帧可播之前视频保持透明，由底下的品牌渐变兜底，避免出现「静态图 → 视频」的跳变 */
  const [ready, setReady] = useState(false);

  // src 故意不写在 JSX 上：服务端渲染出的是一个空的 <video>，
  // 由这里决定要不要喂 src。这样视频元素自始至终只挂载一次（不会 img/video 互换导致闪烁），
  // 同时省流量模式下依然一个字节都不下载。
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;

    video.src = HERO.video;
    // 降低动态偏好：照常加载并停在首帧，只是不播放
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        if (mediaRef.current) {
          mediaRef.current.style.transform = `translate3d(0, ${y * 0.24}px, 0)`;
        }
        if (bodyRef.current) {
          bodyRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
          bodyRef.current.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="aigc-hero" id="top">
      <div className={`aigc-hero__media${ready ? ' is-ready' : ''}`} ref={mediaRef}>
        {/* 视频到位前的占位动效：全息极光漂移 + shimmer 扫过，ready 后与视频交叉淡出 */}
        <div className="aigc-hero__skeleton" aria-hidden />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
        />
        <div className="aigc-hero__scrim" />
        {/* 胶片颗粒：盖在 scrim 之上但仍在 media 层内，所以只作用于背景画面、碰不到文案。
            720p 源铺满全屏会放大 1.24×（高 DPI 屏更多），颗粒能有效掩盖插值带来的软化。 */}
        <div className="aigc-hero__grain" aria-hidden />
      </div>

      <div className="aigc-shell">
        <div className="aigc-hero__body" ref={bodyRef}>
          <span className="aigc-eyebrow">方直科技 300235 · 战略级 AIGC 人才培育项目</span>

          <h1 className="aigc-hero__title">
            {Array.from(HERO.title).map((ch, i) => (
              <span
                className="ch"
                key={`${ch}-${i}`}
                style={{ animationDelay: `${120 + i * 95}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>

          <p className="aigc-hero__sub">{HERO.sub}</p>
          <p className="aigc-hero__tag">{HERO.tagline}</p>

          <div className="aigc-hero__cta">
            <CtaButton source="kit">免费领取实训资料包</CtaButton>
            <CtaButton source="openclass" variant="ghost">
              预约公开课
            </CtaButton>
          </div>

          <div className="aigc-hero__chips">
            {HERO.chips.map((c) => (
              <span className="aigc-chip" key={c}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="aigc-hero__scroll" aria-hidden>
        向下探索
        <i />
      </div>
    </section>
  );
}
