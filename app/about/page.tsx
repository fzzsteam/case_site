import type { Metadata } from "next";
import { InkLandscape } from "@/components/ink/ink-landscape";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { capabilities, processSteps } from "@/content/services";
import { BrainCircuit, Clapperboard, Handshake, Radio, Search, ScrollText, ImageIcon, BadgeCheck } from "lucide-react";
export const metadata:Metadata={title:"关于我们",description:"了解万象元生的文旅 AIGC 服务能力与合作方法。",alternates:{canonical:"/about"}};
const capIcons=[BrainCircuit,Clapperboard,Handshake,Radio];const stepIcons=[Search,ScrollText,ImageIcon,BadgeCheck,Radio];
export default function AboutPage(){return <><InkLandscape preset="unfold" compact><span className="hero-kicker">ABOUT WANXIANG</span><h1>让文化被看见<br/>让文旅更动人</h1><p>我们是一支由文化策划、视觉创作与 AI 技术组成的团队。</p></InkLandscape><section className="content-section"><SectionHeading eyebrow="OUR CAPABILITIES" title="我们如何让想法落地"/><div className="capability-grid">{capabilities.map((c,i)=>{const Icon=capIcons[i];return <article key={c}><span>0{i+1}</span><Icon/><h3>{c}</h3><p>{["深挖文化内核，找到真正值得讲述的故事。","用 AI 拓展视觉边界，建立独特影像风格。","从脚本到成片，一站式保证项目质量。","让优质内容持续产生传播与商业价值。"][i]}</p></article>})}</div></section><section className="process-section"><SectionHeading eyebrow="HOW WE WORK" title="把复杂的创作，变成清晰的过程"/><div className="process-line">{processSteps.map((s,i)=>{const Icon=stepIcons[i];return <article key={s}><span>{String(i+1).padStart(2,"0")}</span><i><Icon/></i><h3>{s}</h3></article>})}</div></section><section className="story-panel"><div><span>OUR BELIEF</span><h2>技术只是笔墨<br/>文化才是灵魂</h2></div><div><p>我们相信，真正动人的影像从来不只依靠技术。AIGC 让想象变得更自由，而我们要做的，是让每一份想象都扎根于文化。</p><ButtonLink href="/contact">与我们合作</ButtonLink></div></section></>}
