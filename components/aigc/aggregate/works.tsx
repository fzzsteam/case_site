'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, FileImage, Film, Play, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { WORKS, WORK_CATEGORIES, type WorkCategory } from '@/components/aigc/content';
import { SectionHeading } from './primitives';
import { MediaDialog, MediaVisual } from './media';

type Work = typeof WORKS[number];
const isVideo = (work: Work) => work.path.endsWith('.mp4');
const coverFor = (work: Work) => !isVideo(work) ? work.path : WORKS.find(item => !isVideo(item) && item.by === work.by)?.path;
// A varied first page, retaining every original item and its factual labels.
const featured = WORK_CATEGORIES.slice(1).flatMap(category => WORKS.filter(work => work.category === category).slice(0, 1));
const orderedWorks = [...featured, ...WORKS.filter(work => !featured.includes(work))];
const PAGE_SIZE = 8;

export function WorksArchive() {
  const [category, setCategory] = useState<WorkCategory>('全部');
  const [type, setType] = useState<'all' | 'video' | 'image'>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Work | null>(null);
  const filtered = useMemo(() => orderedWorks.filter(work =>
    (category === '全部' || work.category === category) && (type === 'all' || isVideo(work) === (type === 'video')) &&
    `${work.cat} ${work.by} ${work.category}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [category, type, query]);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageWorks = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const recommendation = filtered.find(isVideo) ?? filtered[0];
  const reset = () => { setCategory('全部'); setType('all'); setQuery(''); setPage(0); };
  return <section id="archive" className="ag-works aggregate-container" aria-labelledby="ag-works-title">
    <SectionHeading number="04" title="学员作品档案" eyebrow="STUDENT WORKS / SELECTED ARCHIVE" description="真实创作 · 持续沉淀 · 专业成长的足迹" id="ag-works-title" />
    <div className="ag-works__layout">
      <aside className="ag-works__sidebar">
        <div className="ag-works__filter-group"><h3>作品分类</h3><div role="group" aria-label="作品分类">{WORK_CATEGORIES.map(item => <button key={item} type="button" aria-pressed={category === item} className={category === item ? 'is-active' : ''} onClick={() => { setCategory(item); setPage(0); }}><span>{item}</span><small>{item === '全部' ? WORKS.length : WORKS.filter(work => work.category === item).length}</small></button>)}</div></div>
        <div className="ag-works__filter-group"><h3>作品类型</h3><div role="group" aria-label="作品类型">{(['all', 'video', 'image'] as const).map(item => <button type="button" key={item} aria-pressed={type === item} className={type === item ? 'is-active' : ''} onClick={() => { setType(item); setPage(0); }}><span>{item === 'video' ? <Play size={15} /> : <FileImage size={15} />}{item === 'all' ? '全部作品' : item === 'video' ? '视频作品' : '图像作品'}</span><small>{WORKS.filter(work => item === 'all' || isVideo(work) === (item === 'video')).length}</small></button>)}</div></div>
        <Link className="ag-works__talent-link" href="/edu/aggregate/talent"><span>发现作品背后的创作者<small>TALENT MARKET</small></span><ArrowRight size={18} /></Link>
      </aside>
      <div className="ag-works__content">
        <div className="ag-works__toolbar"><label className="ag-search"><Search size={17} /><span className="aggregate-sr-only">搜索学员作品</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="搜索作品名称 / 项目 / 关键词" />{query && <button type="button" aria-label="清除作品搜索" onClick={() => { setQuery(''); setPage(0); }}><X size={16} /></button>}</label><span aria-live="polite">{filtered.length} 件作品</span></div>
        {recommendation && <div className="ag-works__featured"><div className="ag-works__featured-copy"><p className="ag-eyebrow">作品选映 / IN FOCUS</p><h3>{recommendation.cat}</h3><span className="ag-tag">{recommendation.category}</span><p>{recommendation.by}</p><button type="button" className="aggregate-cta aggregate-cta--primary aggregate-cta--compact" onClick={() => setSelected(recommendation)}>查看作品 <ArrowRight size={17} /></button></div><button type="button" className="ag-works__featured-media" aria-label={`预览${recommendation.cat}`} onClick={() => setSelected(recommendation)}><MediaVisual coverPath={coverFor(recommendation)} videoPath={isVideo(recommendation) ? recommendation.path : undefined} alt={recommendation.cat} /><span className="ag-play">{isVideo(recommendation) ? <Play size={24} /> : <FileImage size={24} />}</span></button></div>}
        {pageWorks.length ? <div className="ag-works__grid">{pageWorks.map(work => <button className="ag-work-card" key={work.path} type="button" onClick={() => setSelected(work)}><div className="ag-work-card__visual"><MediaVisual coverPath={coverFor(work)} videoPath={isVideo(work) ? work.path : undefined} alt={work.cat} /><span className="ag-work-card__type">{isVideo(work) ? <Play size={14} /> : <FileImage size={14} />}</span></div><div className="ag-work-card__copy"><h3>{work.cat}</h3><p><span>{work.category}</span><small>{isVideo(work) ? 'VIDEO' : 'IMAGE'}</small></p><small>{work.by}</small></div></button>)}</div>
          : <div className="ag-empty"><Film size={30} /><h3>没有找到相关作品</h3><p>试试其他关键词，或浏览全部作品。</p><button type="button" onClick={reset}>清除筛选</button></div>}
        {pageCount > 1 && <nav className="ag-pagination" aria-label="作品分页"><button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="上一页作品"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, i) => <button type="button" key={i} aria-current={page === i ? 'page' : undefined} className={page === i ? 'is-active' : ''} onClick={() => setPage(i)}>{i + 1}</button>)}<button type="button" disabled={page === pageCount - 1} onClick={() => setPage(page + 1)} aria-label="下一页作品"><ChevronRight size={17} /></button></nav>}
      </div>
    </div>
    {selected && <MediaDialog title={selected.cat} summary={`${selected.category} · ${selected.by}`} images={isVideo(selected) ? [] : [selected.path]} videos={isVideo(selected) ? [selected.path] : []} coverPath={coverFor(selected)} onClose={() => setSelected(null)} />}
  </section>;
}
