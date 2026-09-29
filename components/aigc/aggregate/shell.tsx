'use client';

import Link from 'next/link';
import { ArrowRight, Check, Menu, X } from 'lucide-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { EDU_ASSETS, HERO, LEAD_COPY, type LeadSource } from '@/components/aigc/content';
import { AggregateDialog } from './dialog';

const LeadContext = createContext<{ open: (source: LeadSource) => void } | null>(null);
export function useAggregateLead() {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useAggregateLead must be used inside AggregateShell');
  return context;
}
export function AggregateCtaButton({ source, children, variant = 'primary', compact = false, withArrow = true }: {
  source: LeadSource; children: ReactNode; variant?: 'primary' | 'outline' | 'quiet'; compact?: boolean; withArrow?: boolean;
}) {
  const { open } = useAggregateLead();
  return <button type="button" className={`aggregate-cta aggregate-cta--${variant}${compact ? ' aggregate-cta--compact' : ''}`} onClick={() => open(source)}>
    <span>{children}</span>{withArrow && <ArrowRight size={18} aria-hidden="true" />}
  </button>;
}
export function BrandLockup() {
  return <span className="ag-brand-lockup">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="ag-brand-lockup__fangzhi" src={EDU_ASSETS.fangzhiLockup} alt="方直智胜" width={2048} height={536} />
    <span aria-hidden="true" className="ag-brand-lockup__cross">×</span>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="ag-brand-lockup__szfs" src={EDU_ASSETS.szfsLogo} alt="深圳电影制片厂" width={1840} height={494} />
  </span>;
}
const links = [
  { id: 'top', label: '首页' }, { id: 'paths', label: '训练路径' },
  { id: 'archive', label: '学员作品' }, { id: 'results', label: '结果案例' },
  { id: 'mentors', label: '导师团队' }, { id: 'talent', label: '人才集市' },
];
function AggregateNav({ active }: { active: 'home' | 'talent' }) {
  const [current, setCurrent] = useState(active === 'talent' ? 'talent' : 'top');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sync = () => {
      setScrolled(window.scrollY > 32);
      if (active === 'talent') return;
      let section = 'top';
      for (const link of links) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= 160) section = link.id;
      }
      setCurrent(section);
    };
    sync(); window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, [active]);
  const href = (id: string) => id === 'talent' ? '/edu/aggregate/talent' : `/edu/aggregate#${id}`;
  return <header className={`ag-nav${scrolled || active === 'talent' ? ' ag-nav--solid' : ''}`}>
    <div className="ag-nav__inner">
      <Link href="/edu/aggregate" className="ag-nav__brand" aria-label="方直智胜实训营首页"><BrandLockup /></Link>
      <nav className="ag-nav__links" aria-label="主导航">{links.map(link => <Link key={link.id} href={href(link.id)} className={current === link.id ? 'is-active' : ''} aria-current={current === link.id ? 'location' : undefined}>{link.label}</Link>)}</nav>
      <div className="ag-nav__actions"><AggregateCtaButton source="openclass" variant="outline" compact>预约公开课</AggregateCtaButton>
        <button type="button" className="ag-nav__toggle" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} aria-controls="ag-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </div>
    {menuOpen && <nav id="ag-mobile-nav" className="ag-nav__mobile" aria-label="移动端导航">{links.map(link => <Link key={link.id} href={href(link.id)} onClick={() => setMenuOpen(false)}>{link.label}<ArrowRight size={16} /></Link>)}</nav>}
  </header>;
}
function LeadModal({ source, onClose }: { source: LeadSource; onClose: () => void }) {
  const copy = LEAD_COPY[source];
  return <AggregateDialog title={copy.title} onClose={onClose} className="ag-lead-dialog">
    <p className="ag-eyebrow">{copy.eyebrow} / LET’S TALK</p><h2>{copy.title}</h2><p>{copy.desc}</p>
    <div className="ag-lead-dialog__body"><div className="ag-lead-dialog__qr">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={EDU_ASSETS.wechatQr} alt="课程顾问微信二维码" width={282} height={278} /><small>微信扫一扫，添加课程顾问</small>
    </div><ul>{copy.benefits.map(benefit => <li key={benefit}><Check size={17} aria-hidden="true" />{benefit}</li>)}</ul></div>
  </AggregateDialog>;
}
export function AggregateShell({ children, active = 'home' }: { children: ReactNode; active?: 'home' | 'talent' }) {
  const [source, setSource] = useState<LeadSource | null>(null);
  return <div className="aggregate-root"><LeadContext.Provider value={{ open: setSource }}>
    <a className="ag-skip" href="#aggregate-main">跳转到主要内容</a><AggregateNav active={active} />{children}
    <footer className="ag-footer aggregate-container"><div><BrandLockup /><p>{HERO.tagline}</p></div><p>用 AI 打开影视内容的新可能<small>MORE STORIES, A BRIGHTER TOMORROW</small></p><Link href="/edu/aggregate/talent">人才集市 <ArrowRight size={16} /></Link></footer>
    {source && <LeadModal source={source} onClose={() => setSource(null)} />}
  </LeadContext.Provider></div>;
}
