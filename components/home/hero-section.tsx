"use client";
import { ArrowUpRight } from "lucide-react";

const openQuote = () => window.dispatchEvent(new Event("open-quote"));

const driftClouds = [
  ["/ink/cloud4.png", "drift-1"], ["/ink/cloud3.png", "drift-2"], ["/ink/cloud4.png", "drift-3"],
  ["/ink/cloud3.png", "drift-4"], ["/ink/cloud4.png", "drift-5"], ["/ink/cloud3.png", "drift-6"],
  ["/ink/cloud4.png", "drift-7"], ["/ink/cloud3.png", "drift-8"], ["/ink/cloud4.png", "drift-9"],
  ["/ink/cloud3.png", "drift-10"],
] as const;

const heroLayers = [
  ["origin-back-bridge", "/ink/back2.png"],
  ["origin-left-pagodas", "/ink/left2.png"],
  ["origin-right-mountain", "/ink/right2.png"],
  ["origin-middle-islands", "/ink/back1.png"],
  ["origin-left-foreground", "/ink/left1.png"],
  ["origin-right-pavilion", "/ink/right1.png"],
] as const;

function HeroArtCanvas() {
  return <div className="hero-art-canvas">
    {heroLayers.map(([className, src]) => <img key={src} className={`origin-layer ${className}`} data-origin-layer src={src} alt="" />)}
  </div>;
}

function HeroMist({ depth }: { depth: "back" | "front" }) {
  return <div className={`hero-mist hero-mist-${depth}`} aria-hidden="true">
    <div className="hero-mist-half hero-mist-left" />
    <div className="hero-mist-half hero-mist-right" />
  </div>;
}

export function HeroSection() {
  return <section id="home" className="hero-chapter story-chapter">
    <div className="hero-paper" />
    <div className="hero-art-viewport" aria-hidden="true">
      <HeroArtCanvas />
    </div>
    {driftClouds.map(([src, cls]) => <img key={cls} className={`hero-drift ${cls}`} src={src} alt="" aria-hidden="true" />)}
    <HeroMist depth="back" />
    <HeroMist depth="front" />
    <div className="hero-copy">
      <span>CULTURE · TECHNOLOGY · IMAGINATION</span>
      <h1>用 AIGC<br /><em>重新定义</em>文旅表达</h1>
      <p>以 AI 技术与文化叙事相结合，为城市、景区、博物馆与乡村非遗创造更具感染力的影像。</p>
      <div>
        <a href="#cases">查看案例 <ArrowUpRight size={17} /></a>
        <button onClick={openQuote}>获取定制方案 <ArrowUpRight size={17} /></button>
      </div>
    </div>
  </section>;
}
