import type { Metadata } from "next";
import { InkLandscape } from "@/components/ink/ink-landscape";
import { CaseGallery } from "@/components/cases/case-gallery";
import { SectionHeading } from "@/components/ui/section-heading";
import { caseStudies } from "@/content/cases";
export const metadata: Metadata = { title: "文旅案例", description: "查看城市文旅、博物馆数字化、文化短片与品牌宣传 AIGC 案例。", alternates:{canonical:"/cases"} };
export default function CasesPage(){return <><InkLandscape preset="river" compact><span className="hero-kicker">CASE ARCHIVE · 案例志</span><h1>文旅案例展示</h1><p>用 AIGC 创造有温度、可传播的文化影像。</p></InkLandscape><section className="content-section"><SectionHeading eyebrow="SELECTED WORKS" title="让作品，替我们表达" intro="从文化内核出发，为不同场景寻找最恰当的影像语言。"/><CaseGallery cases={caseStudies}/></section></>}
