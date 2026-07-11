"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Film, Landmark, Mountain, Play, Radio, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseStudies, type CaseCategory, type CaseStudy } from "@/content/cases";
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
  const track = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<"全部" | CaseCategory>("全部");
  const [activeCase, setActiveCase] = useState<CaseStudy>();
  const [episode, setEpisode] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoState, setVideoState] = useState<"idle" | "loading" | "error">("idle");
  const filtered = caseStudies.filter((item) => category === "全部" || item.category === category);
  const openQuote = () => window.dispatchEvent(new Event("open-quote"));
  const coverUrl = (path: string) => `/api/media/image/${path.split("/").map(encodeURIComponent).join("/")}`;
  async function playEpisode(item: CaseStudy, episodeIndex: number) {
    setEpisode(episodeIndex); setVideoUrl(""); setVideoState("loading");
    try {
      const response = await fetch("/api/media/video-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: item.episodes[episodeIndex].videoPath }) });
      if (!response.ok) throw new Error();
      setVideoUrl((await response.json()).url); setVideoState("idle");
    } catch { setVideoState("error"); }
  }

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-mountain-left", { xPercent: -38, opacity: 0, duration: 1.8 })
        .from(".hero-mountain-right", { xPercent: 38, opacity: 0, duration: 1.8 }, "<")
        .from(".hero-pavilion", { xPercent: 22, yPercent: 12, opacity: 0, duration: 1.5 }, "-=1.1")
        .from(".hero-copy > *", { y: 28, opacity: 0, stagger: .12, duration: .8 }, "-=1")
        .from(".story-birds", { x: -120, y: 50, opacity: 0, duration: 2 }, "-=1.2");
      gsap.to(".cloud-back", { xPercent: 8, duration: 24, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".cloud-front", { xPercent: -10, duration: 31, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-mountain-left", { xPercent: -14, yPercent: -5, scrollTrigger: { trigger: ".hero-chapter", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero-mountain-right", { xPercent: 14, yPercent: -2, scrollTrigger: { trigger: ".hero-chapter", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".case-cloud-wipe", { xPercent: 18, yPercent: -8, opacity: .18 }, { xPercent: -10, yPercent: 8, opacity: .74, scrollTrigger: { trigger: ".cases-chapter", start: "top bottom", end: "top 42%", scrub: 1.2 } });
      const media = gsap.matchMedia();
      media.add("(min-width: 821px)", () => {
        const distance = () => Math.max(0, (track.current?.scrollWidth || 0) - window.innerWidth + window.innerWidth * .16);
        gsap.to(track.current, { x: () => -distance(), ease: "none", scrollTrigger: { trigger: ".case-scroll", start: "top top", end: () => `+=${distance() + window.innerWidth * .8}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      });
      gsap.from(".service-node", { y: 50, opacity: 0, stagger: .16, scrollTrigger: { trigger: ".service-nodes", start: "top 72%" } });
      gsap.from(".process-node", { scale: .7, opacity: 0, stagger: .12, scrollTrigger: { trigger: ".process-river", start: "top 72%" } });
      return () => media.revert();
    }, root);
    return () => context.revert();
  }, [filtered.length]);

  return <div ref={root} className="scroll-story">
    <section id="home" className="hero-chapter story-chapter">
      <div className="hero-paper" />
      <img className="hero-layer hero-far" src="/ink/mou1.png" alt="" />
      <img className="hero-layer hero-mid-left" src="/ink/mou2.png" alt="" />
      <img className="hero-layer hero-mountain-left" src="/ink/tree.png" alt="" />
      <img className="hero-layer hero-mountain-right" src="/ink/mou4.png" alt="" />
      <img className="hero-layer hero-pavilion" src="/ink/house.png" alt="" />
      <InkClouds className="hero-layer cloud-back" />
      <InkClouds className="hero-layer cloud-front" />
      <InkBirds />
      <div className="hero-copy"><span>CULTURE · TECHNOLOGY · IMAGINATION</span><h1>用 AIGC<br/><em>重新定义</em>文旅表达</h1><p>以 AI 技术与文化叙事相结合，为城市、景区、博物馆与乡村非遗创造更具感染力的影像。</p><div><a href="#cases">查看案例 <ArrowUpRight size={17}/></a><button onClick={openQuote}>获取定制方案 <ArrowUpRight size={17}/></button></div></div>
      <a className="scroll-cue" href="#cases"><span>向下展开画卷</span><ArrowDown size={17}/></a>
    </section>

    <section id="cases" className="cases-chapter story-chapter">
      <div className="case-cloud-wipe"><InkClouds /></div>
      <header className="chapter-heading"><span>SELECTED WORKS · 作品志</span><h2>让作品，替我们表达</h2><p>从文化内核出发，为不同场景寻找最恰当的影像语言。</p></header>
      <div className="case-filters story-filters">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="case-scroll"><div className="cinema-track" ref={track}>{filtered.map((item, index) => <article className="cinema-card" key={item.slug}>
        <button className="cinema-visual" onClick={() => { setActiveCase(item); setEpisode(0); setVideoUrl(""); setVideoState("idle"); }}><div className={`ink-placeholder placeholder-${index % 4}`}><img src={coverUrl(item.coverPath)} alt={`${item.title}封面`}/><span>{item.episodes.length > 1 ? `${item.episodes.length} 集案例` : "播放案例"}</span></div><i><Play fill="currentColor"/></i><small>{String(index + 1).padStart(2,"0")} / {String(filtered.length).padStart(2,"0")}</small></button>
        <div className="cinema-caption"><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p>{item.episodes.length > 1 && <b>{item.episodes.length} 集 / 版本</b>}</div>
      </article>)}</div></div>
    </section>

    <section id="about" className="about-chapter story-chapter">
      <img className="about-landscape" src="/ink/mou3.png" alt="" />
      <header className="chapter-heading about-heading"><span>ABOUT WANXIANG · 关于我们</span><h2>技术只是笔墨<br/>文化才是灵魂</h2><p>我们是一支由文化策划、视觉创作与 AI 技术组成的团队，让每一份想象都扎根于真实文化。</p></header>
      <div className="service-nodes">{serviceItems.map(({title,icon:Icon}, index)=><article className="service-node" key={title}><span>0{index+1}</span><Icon/><h3>{title}</h3></article>)}</div>
      <div className="about-method"><h3>从理解开始，到传播发生</h3><div className="process-river">{processSteps.map((step,index)=><article className="process-node" key={step}><i>{String(index+1).padStart(2,"0")}</i><strong>{step}</strong></article>)}</div></div>
      <div className="closing-cta"><span>NEXT STORY</span><h2>下一段文旅故事<br/>从这里开始</h2><button onClick={openQuote}>获取方案与报价 <ArrowUpRight/></button></div>
    </section>

    {activeCase && <div className="project-overlay" role="dialog" aria-modal="true" aria-label={activeCase.title}><button className="project-close" onClick={()=>setActiveCase(undefined)} aria-label="关闭案例"><X/></button><div className={`project-stage is-${activeCase.episodes[episode].orientation}`}>{videoUrl ? <video className="project-video" src={videoUrl} controls autoPlay playsInline/> : <button className="project-placeholder" onClick={()=>playEpisode(activeCase,episode)} disabled={videoState==="loading"}><img src={coverUrl(activeCase.coverPath)} alt={`${activeCase.title}封面`}/><Play size={52}/><span>{videoState==="loading" ? "正在获取视频…" : videoState==="error" ? "加载失败，点击重试" : `播放${activeCase.episodes[episode].title}`}</span></button>}</div><div className="project-info"><span>{activeCase.category}</span><h2>{activeCase.title}</h2><p>{activeCase.summary}</p>{activeCase.episodes.length>1&&<div className="episode-tabs">{activeCase.episodes.map((item,index)=><button className={episode===index?"active":""} onClick={()=>{setEpisode(index);setVideoUrl("");setVideoState("idle")}} key={item.title}>{item.title}<small>{item.orientation === "portrait" ? "竖版" : "横版"}</small></button>)}</div>}<small>视频来自私有 OSS，播放链接将在打开时临时生成</small></div></div>}
    <QuotePanel />
  </div>;
}
