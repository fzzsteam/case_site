import { InkLandscape } from "@/components/ink/ink-landscape";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceGrid } from "@/components/sections/service-grid";
import { CaseGallery } from "@/components/cases/case-gallery";
import { caseStudies } from "@/content/cases";

export default function HomePage(){return <>
  <InkLandscape preset="converge"><span className="hero-kicker">CULTURE · TECHNOLOGY · IMAGINATION</span><h1>用 AIGC<br/><em>重新定义</em>文旅表达</h1><p>以 AI 技术与文化叙事相结合，为城市、景区、博物馆与乡村非遗创造更具感染力的影像。</p><div className="hero-actions"><ButtonLink href="/cases">查看案例</ButtonLink><ButtonLink href="/contact" light>获取定制方案</ButtonLink></div></InkLandscape>
  <section className="content-section services-section"><SectionHeading eyebrow="WHAT WE CREATE" title="不只生成画面，更创造文化共鸣" intro="从一次传播到持续运营，我们让技术服务于真正有价值的表达。"/><ServiceGrid/></section>
  <section className="content-section featured-section"><SectionHeading eyebrow="SELECTED WORKS" title="近期案例" intro="每一个项目，都从理解文化开始。"/><CaseGallery cases={caseStudies.filter(c=>c.featured)} limit={3}/><div className="center-action"><ButtonLink href="/cases" light>浏览全部案例</ButtonLink></div></section>
  <section className="home-cta"><span>YOUR STORY, REIMAGINED</span><h2>下一段文旅故事<br/>从这里开始</h2><p>无论是一次表达，还是一个长期项目，我们都愿意从文化本身出发。</p><ButtonLink href="/contact">聊聊你的项目</ButtonLink></section>
</>}
