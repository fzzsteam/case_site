'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Pause, Play } from 'lucide-react';
import { HERO } from '@/components/aigc/content';
import { AIGC_MEDIA, aigcImageUrl } from '@/components/aigc/media';
import { AggregateCtaButton } from './shell';

const chapters = [['AIGC 影视', 'AI FILM'], ['视觉创意', 'VISUAL DESIGN'], ['短视频内容', 'SHORT VIDEO'], ['电商商业内容', 'E-COMMERCE'], ['商业作品集', 'PORTFOLIO']];
export function AggregateHero() {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const sync = () => setEnabled(!reduced.matches && !connection?.saveData);
    sync(); reduced.addEventListener('change', sync);
    return () => reduced.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !paused) void video.play().catch(() => setPaused(true));
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [enabled, paused]);
  return <section id="top" className="ag-hero" aria-labelledby="ag-hero-title">
    <div className="ag-hero__media" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={aigcImageUrl(AIGC_MEDIA.heroPosterPath)} alt="" fetchPriority="high" />
      {enabled && !failed && <video ref={ref} src="/api/aigc/hero-video" poster={aigcImageUrl(AIGC_MEDIA.heroPosterPath)} muted autoPlay loop playsInline preload="metadata" onError={() => setFailed(true)} />}
    </div>
    <div className="aggregate-container ag-hero__inner">
      <div className="ag-hero__copy"><p className="ag-eyebrow">AI × FILM × BUSINESS</p>
        <h1 id="ag-hero-title"><span><em>31</em> 天线下</span><span><b>AIGC</b> 影视内容</span><span>商业实训营</span></h1>
        <p className="ag-hero__proof">{HERO.proof}</p>
        <div className="ag-actions"><AggregateCtaButton source="kit">免费领取实训资料包</AggregateCtaButton><AggregateCtaButton source="openclass" variant="outline">预约公开课</AggregateCtaButton></div>
      </div>
      <div className="ag-hero__aside"><p>想象<br />创作<br />成为现实</p><span /><small>FROM<br />IMAGINATION<br />TO REALITY</small></div>
      <div className="ag-hero__signature"><p>用 AI 打开影视内容的新可能</p><small>MORE STORIES<br />A BRIGHTER TOMORROW</small></div>
      <div className="ag-hero__bottom"><div className="ag-hero__chapters">{chapters.map(([title, english], i) => <a href={i === 4 ? '#archive' : '#paths'} key={english}><small>0{i + 1}</small><span>{title}</span><small>{english}</small></a>)}</div><p>连接产业<br />培养下一代影视内容创作者</p><a href="#paths" className="ag-scroll"><span><ArrowDown size={18} /></span><small>SCROLL</small></a></div>
      {enabled && !failed && <button className="ag-hero__pause" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? '播放背景视频' : '暂停背景视频'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>}
    </div>
  </section>;
}
