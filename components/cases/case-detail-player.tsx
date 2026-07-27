"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import type { CaseStudy } from "@/lib/cases/types";
import { caseCoverUrl } from "./case-card";

export function CaseDetailPlayer({ caseStudy }: { caseStudy: CaseStudy }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const episode = caseStudy.episodes[activeIndex];

  async function play(index: number) {
    setActiveIndex(index);
    setVideoUrl("");
    setState("loading");
    try {
      const response = await fetch("/api/media/video-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: caseStudy.episodes[index].videoPath }) });
      if (!response.ok) throw new Error();
      setVideoUrl((await response.json()).url);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return <div>
    <div className="case-detail-player">
      {videoUrl ? (
        <video key={episode.id} src={videoUrl} controls autoPlay playsInline />
      ) : (
        <button className="case-detail-poster" onClick={() => play(activeIndex)} disabled={state === "loading"}>
          <img src={caseCoverUrl(caseStudy.coverPath)} alt={`${caseStudy.title}封面`} />
          <i className="case-detail-play-badge" aria-hidden="true"><Play size={20} fill="currentColor" /></i>
          <span className="case-detail-play-status">{state === "loading" ? "正在载入…" : state === "error" ? "加载失败，点击重试" : "播放影片"}</span>
        </button>
      )}
    </div>
    {caseStudy.episodes.length > 1 && (
      <div className="case-detail-episodes">
        {caseStudy.episodes.map((item, index) => (
          <button key={item.id} className={index === activeIndex ? "active" : ""} onClick={() => play(index)}>{String(index + 1).padStart(2, "0")}</button>
        ))}
      </div>
    )}
  </div>;
}
