"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Film, Landmark, Mountain, Play, Radio, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseStudies, caseVideos, type CaseCategory } from "@/content/cases";
import { siteConfig } from "@/content/site";
import { QuotePanel } from "./quote-panel";
const driftClouds = [
  ["/ink/cloud4.png", "drift-1"], ["/ink/cloud3.png", "drift-2"], ["/ink/cloud4.png", "drift-3"],
  ["/ink/cloud3.png", "drift-4"], ["/ink/cloud4.png", "drift-5"], ["/ink/cloud3.png", "drift-6"],
  ["/ink/cloud4.png", "drift-7"], ["/ink/cloud3.png", "drift-8"], ["/ink/cloud4.png", "drift-9"],
  ["/ink/cloud3.png", "drift-10"],
] as const;

const categories: Array<"全部" | CaseCategory> = ["全部", "宣传片", "广告片", "短剧", "IP创造"];
const serviceItems = [
  { title: "城市文旅 AI 宣传片", icon: Mountain }, { title: "文旅短视频 / 微短剧代运营", icon: Radio },
  { title: "博物馆文物数字化", icon: Landmark }, { title: "乡村文旅 / 非遗数字化", icon: Film },
];
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

export function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<"全部" | CaseCategory>("全部");
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoState, setVideoState] = useState<"idle" | "loading" | "error">("idle");
  const filtered = caseStudies.filter((item) => category === "全部" || item.category === category);
  const currentVideo = activeVideo === null ? null : caseVideos[activeVideo];
  const currentCaseVideos = currentVideo ? caseVideos.filter((video) => video.projectSlug === currentVideo.projectSlug) : [];
  const currentCasePosition = currentVideo ? currentCaseVideos.findIndex((video) => video.videoPath === currentVideo.videoPath) : -1;
  const previousCaseVideo = currentCasePosition > 0 ? currentCaseVideos[currentCasePosition - 1] : null;
  const nextCaseVideo = currentCasePosition >= 0 && currentCasePosition < currentCaseVideos.length - 1 ? currentCaseVideos[currentCasePosition + 1] : null;
  const openQuote = () => window.dispatchEvent(new Event("open-quote"));
  const coverUrl = (path: string) => `/api/media/image/${path.split("/").map(encodeURIComponent).join("/")}`;
  async function loadVideo(index: number) {
    setActiveVideo(index); setVideoUrl(""); setVideoState("loading");
    try {
      const response = await fetch("/api/media/video-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: caseVideos[index].videoPath }) });
      if (!response.ok) throw new Error();
      setVideoUrl((await response.json()).url); setVideoState("idle");
    } catch { setVideoState("error"); }
  }
  useEffect(() => {
    if (activeVideo === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setActiveVideo(null); setVideoUrl(""); }
      if (event.key === "ArrowLeft" && previousCaseVideo) loadVideo(caseVideos.findIndex((video) => video.videoPath === previousCaseVideo.videoPath));
      if (event.key === "ArrowRight" && nextCaseVideo) loadVideo(caseVideos.findIndex((video) => video.videoPath === nextCaseVideo.videoPath));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo, previousCaseVideo, nextCaseVideo]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(".hero-mist-front .hero-mist-left", { x: "-48vw", opacity: 0, duration: 2.3 }, 0)
        .to(".hero-mist-front .hero-mist-right", { x: "48vw", opacity: 0, duration: 2.3 }, 0)
        .to(".hero-mist-back .hero-mist-left", { x: "-30vw", opacity: .08, duration: 3 }, .12)
        .to(".hero-mist-back .hero-mist-right", { x: "30vw", opacity: .08, duration: 3 }, .12)
        .from(".origin-back-bridge, .origin-left-pagodas, .origin-left-foreground", { x: "-16vw", duration: 2.1 }, .18)
        .from(".origin-middle-islands, .origin-right-mountain, .origin-right-pavilion", { x: "16vw", duration: 2.1 }, .18)
        .from(".hero-copy > *", { y: 14, stagger: .08, duration: .6 }, "-=1")
      gsap.from(".editorial-case", { y: 50, opacity: 0, stagger: .08, scrollTrigger: { trigger: ".case-editorial-grid", start: "top 78%" } });
      gsap.from(".service-heading, .compact-services", { y: 44, opacity: 0, stagger: .18, scrollTrigger: { trigger: ".service-heading", start: "top 80%" } });
    }, root);
    return () => context.revert();
  }, [filtered.length]);

  return <div ref={root} className="scroll-story">
    <section id="home" className="hero-chapter story-chapter">
      <div className="hero-paper" />
      <div className="hero-art-viewport" aria-hidden="true">
        <HeroArtCanvas />
      </div>
      {driftClouds.map(([src, cls]) => <img key={cls} className={`hero-drift ${cls}`} src={src} alt="" aria-hidden="true" />)}
      <HeroMist depth="back" />
      <HeroMist depth="front" />
      <div className="hero-copy"><span>CULTURE · TECHNOLOGY · IMAGINATION</span><h1>用 AIGC<br/><em>重新定义</em>文旅表达</h1><p>以 AI 技术与文化叙事相结合，为城市、景区、博物馆与乡村非遗创造更具感染力的影像。</p><div><a href="#cases">查看案例 <ArrowUpRight size={17}/></a><button onClick={openQuote}>获取定制方案 <ArrowUpRight size={17}/></button></div></div>
    </section>

    <section id="cases" className="cases-chapter story-chapter">
      <header className="chapter-heading"><span>PROJECTS</span><h2>案例作品</h2></header>
      <div className="case-filters story-filters">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="case-editorial-grid">{filtered.map((item, index) => <article className={`editorial-case editorial-${index % 5}`} key={item.slug}>
        <button className="editorial-cover" onClick={() => loadVideo(caseVideos.findIndex((video) => video.projectSlug === item.slug))}><img src={coverUrl(item.coverPath)} alt={`${item.title}封面`}/><span><Play fill="currentColor"/></span></button>
        <div className="editorial-caption"><small>{item.category}</small><h3>{item.title}</h3><p>{item.summary}</p></div>
      </article>)}</div>
      <header className="service-heading"><span>SERVICES</span><h3>服务内容</h3></header>
      <div className="service-nodes compact-services">{serviceItems.map(({title,icon:Icon}, index)=><article className="service-node" key={title}><span>0{index+1}</span><Icon/><h3>{title}</h3></article>)}</div>
    </section>

    <section id="about" className="about-chapter story-chapter">
      <div className="about-layout">
        <header className="chapter-heading about-heading"><span>ABOUT US</span><h2>关于我们</h2><p>{siteConfig.companyIntro}</p></header>
        <dl className="company-facts">
          <div><dt>公司名称</dt><dd>{siteConfig.companyName}</dd></div>
          <div><dt>办公地址</dt><dd>{siteConfig.address}</dd></div>
          <div><dt>企业愿景</dt><dd>{siteConfig.companyVision}</dd></div>
        </dl>
      </div>
      <div className="closing-cta"><i className="cta-rule" aria-hidden="true"/><span>CONTACT</span><h2>告诉我们你的项目需求</h2><p>从创意方向到成片交付，留下你的想法，我们会尽快联系你并给出方案与报价。</p><button onClick={openQuote}>获取方案与报价 <ArrowUpRight/></button></div>
    </section>

    {activeVideo !== null && currentVideo && <div className="video-lightbox" role="dialog" aria-modal="true" aria-label={currentVideo.projectTitle}><button className="lightbox-close" onClick={()=>{setActiveVideo(null);setVideoUrl("")}} aria-label="关闭案例"><X/></button><div className={`video-stage is-${currentVideo.orientation}`}>{previousCaseVideo && <button className="lightbox-arrow prev" onClick={()=>loadVideo(caseVideos.findIndex((video) => video.videoPath === previousCaseVideo.videoPath))} aria-label="上一个视频"><ArrowLeft size={22}/></button>}<div className={`video-shell is-${currentVideo.orientation}`}>{videoUrl ? <video src={videoUrl} controls autoPlay playsInline/> : <button className="video-poster" onClick={()=>loadVideo(activeVideo)} disabled={videoState==="loading"}><img src={coverUrl(currentVideo.coverPath)} alt={`${currentVideo.projectTitle}封面`}/><Play size={46}/><span>{videoState==="loading"?"正在载入…":videoState==="error"?"加载失败，点击重试":"播放影片"}</span></button>}<footer><div><small>{currentVideo.category}</small><strong>{currentVideo.projectTitle}</strong></div><span>{String(currentCasePosition+1).padStart(2,"0")} / {String(currentCaseVideos.length).padStart(2,"0")}</span></footer></div>{nextCaseVideo && <button className="lightbox-arrow next" onClick={()=>loadVideo(caseVideos.findIndex((video) => video.videoPath === nextCaseVideo.videoPath))} aria-label="下一个视频"><ArrowRight size={22}/></button>}</div></div>}
    <QuotePanel />
  </div>;
}
