'use client';

import { Pause, Play, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HERO } from './content';
import { CtaButton } from './LeadProvider';
import { AIGC_MEDIA, aigcImageUrl } from './media';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (saveData || reduced) return;
    setPlayVideo(true);
  }, []);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    void video.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="aigc-hero" id="top" aria-labelledby="aigc-hero-title">
      <div className="aigc-shell">
        <div className="aigc-hero__grid">
          <div className="aigc-hero__copy">
            <div className="aigc-hero__meta">
              <span className="aigc-section-index">EDU / VISUAL LAB / 00</span>
              <span className="aigc-status">ARCHIVE OPEN</span>
            </div>

            <p className="aigc-hero__brandline">{HERO.title} <span aria-hidden="true">×</span> {HERO.partner}</p>
            <h1 id="aigc-hero-title" className="aigc-hero__title">
              <small>31 DAYS / AI CONTENT FIELD LAB</small>
              <span>31 天线下 AIGC</span>
              <span>影视内容商业实训营</span>
            </h1>
            <p className="aigc-hero__tag">{HERO.tagline}</p>
            <p className="aigc-hero__proof">{HERO.proof}</p>

            <div className="aigc-hero__cta">
              <CtaButton source="kit">免费领取实训资料包</CtaButton>
              <CtaButton source="openclass" variant="ghost">预约公开课</CtaButton>
            </div>

            <div className="aigc-hero__proofline" aria-label="实训档案摘要">
              <span><strong>31</strong> 天连续训练</span>
              <span><strong>07</strong> 个交付模块</span>
              <span><strong>01</strong> 套完整作品集</span>
            </div>
          </div>

          <figure className="aigc-hero__stage">
            <div className="aigc-stage-grid" aria-hidden="true" />
            <div className="aigc-stage__topline">
              <span>FIELD NOTE / 031</span>
              <span>LIVE PROCESS / SELECT A PATH</span>
            </div>

            <div className="aigc-stage__media">
              {playVideo ? (
                <video
                  ref={videoRef}
                  src="/api/aigc/hero-video"
                  poster={aigcImageUrl(AIGC_MEDIA.heroPosterPath)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onCanPlay={startPlayback}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  aria-label="AIGC 影视内容商业实训现场视频"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={aigcImageUrl(AIGC_MEDIA.heroPosterPath)} alt="AIGC 影视内容商业实训现场" />
              )}
              <span className="aigc-stage__media-wash" aria-hidden="true" />
              {playVideo && (
                <div className="aigc-stage__controls">
                  <button type="button" onClick={togglePlayback} aria-label={isPlaying ? '暂停 Hero 视频' : '播放 Hero 视频'}>
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <span><VolumeX size={13} aria-hidden="true" /> SOUND OFF</span>
                </div>
              )}
            </div>

            <div className="aigc-stage__route" aria-label="从输入到交付的训练路径">
              <span className="aigc-stage__route-line" aria-hidden="true" />
              <span className="aigc-stage__node aigc-stage__node--input"><b>01</b><small>INPUT</small></span>
              <span className="aigc-stage__node aigc-stage__node--make"><b>02</b><small>MAKE</small></span>
              <span className="aigc-stage__node aigc-stage__node--output"><b>03</b><small>OUTPUT</small></span>
            </div>

            <div className="aigc-stage__core">INPUT<br />TO OUTPUT</div>
            <figcaption className="aigc-stage__caption">
              <span><small>EDU / AIGC TRAINING</small><strong>输入 → 练习 → 交付</strong></span>
              <b>31<small>DAYS</small></b>
            </figcaption>
          </figure>
        </div>
      </div>
      <a className="aigc-hero__scroll" href="#modules">
        <span>向下探索</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
