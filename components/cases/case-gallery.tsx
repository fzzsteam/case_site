"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, X } from "lucide-react";
import type { CaseStudy } from "@/content/cases";

const categories = ["全部", "城市文旅", "文博数字化", "文化短片", "品牌宣传"];
export function CaseGallery({ cases, limit }: { cases: CaseStudy[]; limit?: number }) {
  const [category, setCategory] = useState("全部");
  const [active, setActive] = useState<CaseStudy>();
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const visible = cases.filter(c => category === "全部" || c.category === category).slice(0, limit);
  async function play(item: CaseStudy) { setActive(item); setError(""); setVideoUrl(""); try { const response = await fetch("/api/media/video-url", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({path:item.videoPath}) }); if (!response.ok) throw new Error(); setVideoUrl((await response.json()).url); } catch { setError("视频暂时无法播放，请稍后重试"); } }
  return <>
    {!limit && <div className="case-filters" aria-label="案例分类">{categories.map(c => <button className={c === category ? "active" : ""} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div>}
    <div className="case-grid">{visible.map((item, i) => <article className={`case-card case-${i%4}`} key={item.slug}>
      <div className="case-cover"><img src={`/api/media/image/${item.coverPath}`} alt={`${item.title}案例封面`} onError={(e) => e.currentTarget.classList.add("failed")} /><span className="case-category">{item.category}</span><button onClick={() => play(item)} aria-label={`播放 ${item.title}`}><Play fill="currentColor" /></button></div>
      <div className="case-info"><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/cases/${item.slug}`}>查看项目 <ArrowRight size={16}/></Link></div>
    </article>)}</div>
    {active && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setActive(undefined)}><section className="video-dialog" role="dialog" aria-modal="true" aria-label={active.title} onMouseDown={e => e.stopPropagation()}><button className="dialog-close" onClick={() => setActive(undefined)} aria-label="关闭"><X /></button><div className="video-frame">{videoUrl ? <video src={videoUrl} controls autoPlay /> : error ? <div className="video-error"><p>{error}</p><button onClick={() => play(active)}>重新加载</button></div> : <span className="loader" />}</div><h2>{active.title}</h2><p>{active.summary}</p></section></div>}
  </>;
}
