import type { Metadata } from "next";
import { InkLandscape } from "@/components/ink/ink-landscape";
import { PricingGrid } from "@/components/sections/pricing-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Mail, Phone, ScanLine } from "lucide-react";
import { siteConfig } from "@/content/site";
export const metadata:Metadata={title:"联系与报价",description:"查看文旅短视频、AI 宣传片和文博动态影像基础报价，联系万象元生获取定制方案。",alternates:{canonical:"/contact"}};
export default function ContactPage(){return <><InkLandscape preset="reveal" compact><span className="hero-kicker">LET'S CREATE TOGETHER</span><h1>期待与你<br/>共创文旅新表达</h1><p>城市文旅宣传片 / 博物馆数字化 / 乡村非遗 / 政企项目</p></InkLandscape><section className="content-section pricing-section"><SectionHeading eyebrow="SERVICE & PRICING" title="选择适合你的合作方式" intro="以下为基础参考报价，最终方案将根据创意复杂度、素材规模与交付周期确定。"/><PricingGrid/></section><section className="contact-panel"><div className="contact-copy"><span>FREE CONSULTATION</span><h2>免费获取<br/>定制化方案</h2><p>告诉我们你的项目背景、目标与预算，我们会给出清晰、可执行的内容建议。</p><div className="contact-items"><a href={`tel:${siteConfig.phone}`}><Phone/> {siteConfig.phone}</a><a href={`mailto:${siteConfig.email}`}><Mail/> {siteConfig.email}</a></div></div><div className="qr-card"><ScanLine/><img src="/brand/wechat-qr.png" alt="万象元生微信咨询二维码"/><strong>扫码添加微信</strong><small>备注“文旅合作”</small></div></section></>}
