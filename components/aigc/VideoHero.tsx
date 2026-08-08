"use client";

import { useEffect, useRef, useState } from "react";

import { HERO } from "./content";
import { CtaButton } from "./LeadProvider";

function enterFlux() {
  document.getElementById("aigc-flux")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}
/**
 * 独立的视频首屏。视频不与粒子场同屏，避免两个动态主视觉互相争夺注意力；
 * 进入按钮把浏览者送到后面的 Flux Reel。
 */
export function VideoHero() {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (connection.connection?.saveData) return;

    video.src = HERO.video;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.play().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const viewport = window.innerHeight;
        if (y > viewport * 1.15) return;

        mediaRef.current?.style.setProperty(
          "transform",
          `translate3d(0, ${y * 0.24}px, 0)`,
        );
        bodyRef.current?.style.setProperty(
          "transform",
          `translate3d(0, ${y * -0.06}px, 0)`,
        );
        bodyRef.current?.style.setProperty(
          "opacity",
          String(Math.max(0, 1 - y / (viewport * 0.75))),
        );
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="aigc-video-hero" id="aigc-video" aria-labelledby="aigc-video-title">
      <div
        className={`aigc-video-hero__media${ready ? " is-ready" : ""}`}
        ref={mediaRef}
      >
        <div className="aigc-video-hero__skeleton" aria-hidden="true" />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          aria-hidden="true"
        />
        <div className="aigc-video-hero__scrim" aria-hidden="true" />
        <div className="aigc-video-hero__grain" aria-hidden="true" />
      </div>

      <div className="aigc-video-hero__chrome" aria-hidden="true">
        <span>万象元生</span>
        <span>AIGC 商业实践实训</span>
      </div>

      <div className="aigc-video-hero__body" ref={bodyRef}>
        <div className="aigc-video-hero__eyebrow">
          <span>方直科技 300235</span>
          <span>战略级 AIGC 人才培育项目</span>
        </div>
        <h1 id="aigc-video-title">{HERO.title}</h1>
        <p className="aigc-video-hero__sub">{HERO.sub}</p>
        <p className="aigc-video-hero__tag">{HERO.tagline}</p>

        <div className="aigc-video-hero__actions">
          <CtaButton source="kit">免费领取实训资料包</CtaButton>
          <CtaButton source="openclass" variant="ghost">
            预约免费公开课
          </CtaButton>
        </div>

        <div className="aigc-video-hero__chips" aria-label="项目特点">
          {HERO.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>

      <button className="aigc-video-hero__explore" type="button" onClick={enterFlux}>
        <span>开始探索</span>
        <i aria-hidden="true" />
      </button>
    </section>
  );
}
