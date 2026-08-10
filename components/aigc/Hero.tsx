'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO } from './content';
import { CtaButton } from './LeadProvider';
import { AIGC_MEDIA, aigcImageUrl, fetchAigcVideoUrl } from './media';

export function Hero() {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  /** 省流量 / 降低动态偏好时只显示 poster，不加载视频 */
  const [playVideo, setPlayVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (saveData || reduced) return;
    setPlayVideo(true);
    fetchAigcVideoUrl(AIGC_MEDIA.heroVideoPath)
      .then(setVideoSrc)
      .catch(() => setVideoSrc(null));
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
      <div className="aigc-hero__media" ref={mediaRef}>
        {playVideo && videoSrc ? (
          <video
            src={videoSrc}
            poster={aigcImageUrl(AIGC_MEDIA.heroPosterPath)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={aigcImageUrl(AIGC_MEDIA.heroPosterPath)} alt="" />
        )}
        <div className="aigc-hero__scrim" />
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
        </div>
      </div>

      <div className="aigc-hero__scroll" aria-hidden>
        向下探索
        <i />
      </div>
    </section>
  );
}
