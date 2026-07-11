"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Film, Landmark, Mountain, Play, Radio, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseStudies, caseVideos, type CaseCategory } from "@/content/cases";
import { processSteps } from "@/content/services";
import { InkBirds } from "./ink-birds";
import { InkClouds } from "./ink-clouds";
import { QuotePanel } from "./quote-panel";

const categories: Array<"全部" | CaseCategory> = ["全部", "宣传片", "广告片", "短剧"];
const serviceItems = [
  { title: "城市文旅 AI 宣传片", icon: Mountain }, { title: "文旅短视频 / 微短剧代运营", icon: Radio },
  { title: "博物馆文物数字化", icon: Landmark }, { title: "乡村文旅 / 非遗数字化", icon: Film },
];

export function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<"全部" | CaseCategory>("全部");
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoState, setVideoState] = useState<"idle" | "loading" | "error">("idle");
  const filtered = caseStudies.filter((item) => category === "全部" || item.category === category);
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
      if (event.key === "ArrowLeft") loadVideo((activeVideo - 1 + caseVideos.length) % caseVideos.length);
      if (event.key === "ArrowRight") loadVideo((activeVideo + 1) % caseVideos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-far", { yPercent: -6, scale: .97, duration: 1.7 })
        .from(".hero-mid-ridge", { xPercent: -8, duration: 1.5 }, "-=1.3")
        .from(".hero-mountain-left", { xPercent: -14, duration: 1.5 }, "-=1.25")
        .from(".hero-mountain-right", { xPercent: 14, duration: 1.5 }, "<")
        .from(".hero-copy > *", { y: 14, stagger: .08, duration: .6 }, "-=1")
      gsap.fromTo(".story-birds", { x: "-16vw", y: "12vh", opacity: .72 }, { x: "34vw", y: "-18vh", opacity: 0, duration: 12, delay: 1.2, ease: "none" });
      gsap.to(".cloud-back", { xPercent: 8, duration: 24, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".cloud-front", { xPercent: -10, duration: 31, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-mountain-left", { xPercent: -14, yPercent: -5, scrollTrigger: { trigger: ".hero-chapter", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero-mountain-right", { xPercent: 14, yPercent: -2, scrollTrigger: { trigger: ".hero-chapter", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".case-cloud-wipe", { xPercent: 18, yPercent: -8, opacity: .18 }, { xPercent: -10, yPercent: 8, opacity: .74, scrollTrigger: { trigger: ".cases-chapter", start: "top bottom", end: "top 42%", scrub: 1.2 } });
      gsap.from(".editorial-case", { y: 50, opacity: 0, stagger: .08, scrollTrigger: { trigger: ".case-editorial-grid", start: "top 78%" } });
      gsap.from(".service-node", { y: 50, opacity: 0, stagger: .16, scrollTrigger: { trigger: ".service-nodes", start: "top 72%" } });
      gsap.from(".process-node", { scale: .7, opacity: 0, stagger: .12, scrollTrigger: { trigger: ".process-river", start: "top 72%" } });
    }, root);
    return () => context.revert();
  }, [filtered.length]);

  return <div ref={root} className="scroll-story">
    <section id="home" className="hero-chapter story-chapter">
      <div className="hero-paper" />
      <img className="hero-layer hero-far" src="/ink/mou1.png" alt="" />
      <img className="hero-layer hero-mid-ridge" src="/ink/mou2.png" alt="" />
      <img className="hero-layer hero-mountain-left" src="/ink/tree.png" alt="" />
      <img className="hero-layer hero-mountain-right" src="/ink/mou4.png" alt="" />
      <InkClouds className="hero-layer cloud-back" />
      <InkClouds className="hero-layer cloud-front" />
      <InkBirds />
      <div className="hero-copy"><span>CULTURE · TECHNOLOGY · IMAGINATION</span><h1>用 AIGC<br/><em>重新定义</em>文旅表达</h1><p>以 AI 技术与文化叙事相结合，为城市、景区、博物馆与乡村非遗创造更具感染力的影像。</p><div><a href="#cases">查看案例 <ArrowUpRight size={17}/></a><button onClick={openQuote}>获取定制方案 <ArrowUpRight size={17}/></button></div></div>
      <a className="scroll-cue" href="#cases"><span>向下展开画卷</span><ArrowDown size={17}/></a>
    </section>

    <section id="cases" className="cases-chapter story-chapter">
      <div className="case-cloud-wipe"><InkClouds /></div>
      <header className="chapter-heading"><span>PROJECTS</span><h2>案例作品</h2><p>宣传片、广告片与短剧项目。点击封面即可播放。</p></header>
      <div className="case-filters story-filters">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="case-editorial-grid">{filtered.map((item, index) => <article className={`editorial-case editorial-${index % 5}`} key={item.slug}>
        <button className="editorial-cover" onClick={() => loadVideo(caseVideos.findIndex((video) => video.projectSlug === item.slug))}><img src={coverUrl(item.coverPath)} alt={`${item.title}封面`}/><span><Play fill="currentColor"/></span></button>
        <div className="editorial-caption"><small>{item.category}</small><h3>{item.title}</h3><p>{item.summary}</p></div>
      </article>)}</div>
    </section>

    <section id="about" className="about-chapter story-chapter">
      <img className="about-landscape" src="/ink/mou3.png" alt="" />
      <header className="chapter-heading about-heading"><span>SERVICES</span><h2>文旅影像与<br/>数字内容服务</h2><p>从内容策划、AIGC 影像制作到项目交付与长期运营。</p></header>
      <div className="service-nodes">{serviceItems.map(({title,icon:Icon}, index)=><article className="service-node" key={title}><span>0{index+1}</span><Icon/><h3>{title}</h3></article>)}</div>
      <div className="about-method"><h3>从理解开始，到传播发生</h3><div className="process-river">{processSteps.map((step,index)=><article className="process-node" key={step}><i>{String(index+1).padStart(2,"0")}</i><strong>{step}</strong></article>)}</div></div>
      <div className="closing-cta"><span>CONTACT</span><h2>告诉我们你的项目需求</h2><button onClick={openQuote}>获取方案与报价 <ArrowUpRight/></button></div>
    </section>

    {activeVideo !== null && <div className="video-lightbox" role="dialog" aria-modal="true" aria-label={caseVideos[activeVideo].projectTitle}><button className="lightbox-close" onClick={()=>{setActiveVideo(null);setVideoUrl("")}} aria-label="关闭案例"><X/></button><button className="lightbox-arrow prev" onClick={()=>loadVideo((activeVideo-1+caseVideos.length)%caseVideos.length)} aria-label="上一个视频">‹</button><div className={`video-shell is-${caseVideos[activeVideo].orientation}`}>{videoUrl ? <video src={videoUrl} controls autoPlay playsInline/> : <button className="video-poster" onClick={()=>loadVideo(activeVideo)} disabled={videoState==="loading"}><img src={coverUrl(caseVideos[activeVideo].coverPath)} alt={`${caseVideos[activeVideo].projectTitle}封面`}/><Play size={46}/><span>{videoState==="loading"?"正在载入…":videoState==="error"?"加载失败，点击重试":"播放影片"}</span></button>}<footer><div><small>{caseVideos[activeVideo].category}</small><strong>{caseVideos[activeVideo].projectTitle}</strong></div><span>{String(activeVideo+1).padStart(2,"0")} / {caseVideos.length}</span></footer></div><button className="lightbox-arrow next" onClick={()=>loadVideo((activeVideo+1)%caseVideos.length)} aria-label="下一个视频">›</button></div>}
    <QuotePanel />
  </div>;
}
