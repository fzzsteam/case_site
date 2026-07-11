"use client";
import { useEffect, useState } from "react";
import { Check, Mail, Phone, X } from "lucide-react";
import { pricing } from "@/content/pricing";
import { siteConfig } from "@/content/site";

export function QuotePanel() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(1);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("open-quote", show);
    return () => window.removeEventListener("open-quote", show);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return <div className={`quote-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
    <div className="quote-cloud quote-cloud-left" /><div className="quote-cloud quote-cloud-right" />
    <section className="quote-sheet" role="dialog" aria-modal="true" aria-label="服务报价与联系">
      <button className="quote-close" onClick={() => setOpen(false)} aria-label="关闭报价"><X /></button>
      <div className="quote-heading"><span>SERVICE & PRICING</span><h2>选择适合你的<br />合作方式</h2><p>以下为基础参考报价，最终方案根据创意复杂度、素材规模与交付周期确定。</p></div>
      <div className="quote-plans">{pricing.map((plan, index) => <article className={active === index ? "active" : ""} key={plan.name}>
        <button onClick={() => setActive(index)}><span>0{index + 1}</span><strong>{plan.name}</strong><b>{plan.price}</b></button>
        <div className="quote-plan-detail"><div><em>{plan.rate}</em><small>{plan.unit}</small></div><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul></div>
      </article>)}</div>
      <aside className="quote-contact"><div className="quote-pavilion"><img src="/ink/house.png" alt="" /></div><div className="quote-qr"><img src="/brand/wechat-qr.png" alt="万象元生微信咨询二维码" /></div><strong>扫码获取定制化方案</strong><a href={`tel:${siteConfig.phone}`}><Phone size={15}/>{siteConfig.phone}</a><a href={`mailto:${siteConfig.email}`}><Mail size={15}/>{siteConfig.email}</a></aside>
    </section>
  </div>;
}
