"use client";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/content/site";
import { ServiceHighlights } from "@/components/home/service-highlights";

const openQuote = () => window.dispatchEvent(new Event("open-quote"));

export function AboutSection() {
  return <section id="about" className="about-chapter story-chapter">
    <header className="chapter-heading about-heading">
      <i className="cta-rule" aria-hidden="true" />
      <span>ABOUT US</span>
      <h2>关于我们</h2>
    </header>
    <div className="about-layout">
      <p className="about-intro">{siteConfig.companyIntro}</p>
      <dl className="company-facts">
        <div><dt>公司名称</dt><dd>{siteConfig.companyName}</dd></div>
        <div><dt>办公地址</dt><dd>{siteConfig.address}</dd></div>
        <div><dt>企业愿景</dt><dd>{siteConfig.companyVision}</dd></div>
      </dl>
    </div>
    <div className="closing-cta">
      <div className="closing-cta-layout">
        <ServiceHighlights />
        <div className="closing-cta-content">
          <h2>告诉我们你的项目需求</h2>
          <p>从创意方向到成片交付，留下你的想法，我们会尽快联系你并给出方案与报价。</p>
          <button onClick={openQuote}>获取方案与报价 <ArrowUpRight /></button>
        </div>
      </div>
    </div>
  </section>;
}
