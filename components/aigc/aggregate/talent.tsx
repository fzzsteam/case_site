'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, FileImage, Globe2, LayoutGrid, List, MapPin, Play, Search, Users, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { aigcImageUrl } from '@/components/aigc/media';
import { getStaticSiteUrl, getWorkTypeLabel } from '@/lib/talent/presentation';
import { TALENT_SKILLS, TALENT_WORK_TYPES, type TalentProfile, type TalentWork, type TalentWorkType } from '@/lib/talent/types';
import { AggregateCtaButton } from './shell';
import { ParticleArt, SectionHeading } from './primitives';
import { MediaDialog, MediaVisual } from './media';

const PAGE_SIZE = 6;

function workMediaPaths(work: TalentWork) {
  return [...new Set((work.mediaPaths?.length ? work.mediaPaths : work.mediaPath ? [work.mediaPath] : []).filter(Boolean))];
}

function workImagePaths(work: TalentWork) {
  const images = work.galleryPaths?.length ? work.galleryPaths : work.type === 'image' ? workMediaPaths(work) : [];
  return [...new Set((images.length ? images : work.coverPath ? [work.coverPath] : []).filter(Boolean))];
}

function siteHref(work: TalentWork): string | undefined {
  if (work.source === 'static' && work.siteSlug && process.env.NODE_ENV !== 'production') {
    return '/portfolio-preview/' + encodeURIComponent(work.siteSlug) + '/';
  }
  const href = work.siteUrl?.trim() || (work.siteSlug ? getStaticSiteUrl(work.siteSlug) : undefined);
  if (!href) return undefined;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function WorkTypeIcon({ type, size = 15 }: { type: TalentWorkType; size?: number }) {
  if (type === 'video') return <Play size={size} aria-hidden="true" />;
  if (type === 'image') return <FileImage size={size} aria-hidden="true" />;
  return <Globe2 size={size} aria-hidden="true" />;
}

function TalentAvatar({ talent, className }: { talent: TalentProfile; className: string }) {
  const [failedPath, setFailedPath] = useState<string>();
  return (
    <span className={className}>
      {talent.avatarPath && failedPath !== talent.avatarPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={aigcImageUrl(talent.avatarPath)} alt={talent.name + '头像'} loading="lazy" onError={() => setFailedPath(talent.avatarPath)} />
      ) : <span aria-hidden="true">{Array.from(talent.name)[0] || <Users size={24} />}</span>}
    </span>
  );
}

type WorkVisual = { coverPath?: string; videoPath?: string; title: string; type: TalentWorkType };

function talentVisuals(works: TalentWork[]): WorkVisual[] {
  const seen = new Set<string>();
  const visuals: WorkVisual[] = [];
  const add = (visual: WorkVisual) => {
    const key = visual.coverPath || visual.videoPath;
    if (!key || seen.has(key)) return;
    seen.add(key);
    visuals.push(visual);
  };
  // Show one view of each work first, then additional images from its gallery.
  for (const work of works) {
    add({ coverPath: work.coverPath || workImagePaths(work)[0], videoPath: work.type === 'video' ? workMediaPaths(work)[0] : undefined, title: work.title, type: work.type });
  }
  for (const work of works) {
    if (work.type === 'image') {
      for (const path of workImagePaths(work)) add({ coverPath: path, title: work.title, type: work.type });
    }
  }
  return visuals.slice(0, 4);
}

function AggregateTalentCard({ talent, workType }: { talent: TalentProfile; workType: '全部' | TalentWorkType }) {
  const works = workType === '全部' ? talent.works : talent.works.filter((work) => work.type === workType);
  const visuals = talentVisuals(works);
  const featured = visuals[0];
  const types = TALENT_WORK_TYPES.filter(({ value }) => talent.works.some((work) => work.type === value));

  return (
    <article className="ag-talent-card">
      <Link className="ag-talent-card-link" href={'/edu/aggregate/talent/' + encodeURIComponent(talent.id)} aria-label={'查看' + talent.name + '的人才详情'}>
        <div className={'ag-talent-mosaic' + (visuals.length > 1 ? ' ag-talent-mosaic-multiple' : '')}>
          <div className="ag-talent-featured">
            {featured ? <MediaVisual coverPath={featured.coverPath} videoPath={featured.videoPath} alt={featured.title} className="ag-talent-visual" /> : (
              <div className="ag-talent-artwork-empty"><FileImage size={30} strokeWidth={1} /><span>{works[0]?.title || '创作者档案'}</span></div>
            )}
            {featured && <div className="ag-talent-work-caption"><span>{featured.title}</span><WorkTypeIcon type={featured.type} /></div>}
          </div>
          {visuals.length > 1 && <div className="ag-talent-thumbnails">{visuals.slice(1).map((visual) => (
            <MediaVisual key={visual.coverPath || visual.videoPath} coverPath={visual.coverPath} videoPath={visual.videoPath} alt={visual.title} className="ag-talent-thumbnail" />
          ))}</div>}
        </div>
        <div className="ag-talent-card-info">
          <TalentAvatar talent={talent} className="ag-talent-avatar" />
          <div className="ag-talent-identity"><h2>{talent.name}</h2><p title={talent.role}>{talent.role}</p></div>
          <div className="ag-talent-card-skills"><p>{talent.skills.slice(0, 2).join(' / ') || talent.location}</p><span>{types.map(({ label }) => label).join(' / ')}{types.length > 0 && ' · '}{talent.works.length} 件作品</span></div>
          <span className="ag-talent-card-enter"><span>人才详情</span><ArrowRight size={15} aria-hidden="true" /></span>
          {talent.intro && <p className="ag-talent-card-intro">{talent.intro}</p>}
        </div>
      </Link>
    </article>
  );
}

export function AggregateTalentMarket({ talents }: { talents: TalentProfile[] }) {
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('全部');
  const [workType, setWorkType] = useState<'全部' | TalentWorkType>('全部');
  const [sort, setSort] = useState<'default' | 'works' | 'name'>('default');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const skills = useMemo(() => {
    const available = new Set(talents.flatMap((talent) => talent.skills).filter(Boolean));
    return [...new Set([...TALENT_SKILLS.filter((item) => available.has(item)), ...available])];
  }, [talents]);
  const filtered = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = talents.filter((talent) => {
      const searchable = [talent.name, talent.role, talent.location, talent.intro, talent.bio, ...talent.skills, ...talent.works.map((work) => work.title + ' ' + work.summary)].join(' ').toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term)) && (skill === '全部' || talent.skills.includes(skill)) && (workType === '全部' || talent.works.some((work) => work.type === workType));
    });
    if (sort === 'works') matches.sort((a, b) => b.works.length - a.works.length);
    if (sort === 'name') matches.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    return matches;
  }, [query, skill, sort, talents, workType]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleTalents = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const isFiltered = Boolean(query.trim()) || skill !== '全部' || workType !== '全部';
  const clearFilters = () => { setQuery(''); setSkill('全部'); setWorkType('全部'); setPage(1); };
  const changePage = (next: number) => {
    setPage(next);
    resultsRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1).filter((item) => item === 1 || item === pageCount || Math.abs(item - currentPage) <= 1);

  return (
    <main id="aggregate-main" className="ag-talent-main">
      <div className="aggregate-container">
        <section className="ag-talent-hero" aria-labelledby="ag-talent-title">
          <ParticleArt className="ag-talent-particles" variant="wave" />
          <div className="ag-talent-hero-copy">
            <p className="ag-talent-eyebrow">AI × FILM × BUSINESS</p>
            <div className="ag-talent-title-row"><span aria-hidden="true">07 /</span><h1 id="ag-talent-title">人才集市</h1></div>
            <p className="ag-talent-subtitle">先看作品，再看人</p>
            <p className="ag-talent-description">从影像、视觉到创意表达，发现作品背后的创作者。<br />浏览真实作品，找到与你的创作方向相契合的人。</p>
          </div>
          <div className="ag-talent-hero-note"><p>连接产业<br />寻找下一位影像内容创作者<br />让好作品被看见</p><span>FROM IMAGINATION<br />TO REALITY</span></div>
        </section>

        <section className="ag-talent-directory" aria-label="创作者目录">
          <div className="ag-talent-filters">
            <div className="ag-talent-search">
              <label className="ag-talent-sr-only" htmlFor="ag-talent-search-input">搜索创作者、技能或作品</label>
              <input id="ag-talent-search-input" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="搜索创作者、技能或作品" />
              {query ? <button type="button" aria-label="清除搜索" onClick={() => { setQuery(''); setPage(1); }}><X size={20} /></button> : <Search size={21} strokeWidth={1.4} aria-hidden="true" />}
            </div>
            <div className="ag-talent-filter-groups">
              <fieldset className="ag-talent-filter"><legend>能力筛选</legend><div>{['全部', ...skills].map((item) => <button type="button" key={item} aria-pressed={skill === item} onClick={() => { setSkill(item); setPage(1); }}>{item}</button>)}</div></fieldset>
              <fieldset className="ag-talent-filter"><legend>作品形式</legend><div><button type="button" aria-pressed={workType === '全部'} onClick={() => { setWorkType('全部'); setPage(1); }}>全部</button>{TALENT_WORK_TYPES.map(({ value, label }) => <button type="button" key={value} aria-pressed={workType === value} onClick={() => { setWorkType(value); setPage(1); }}>{label}</button>)}</div></fieldset>
            </div>
          </div>
          <div className="ag-talent-toolbar" ref={resultsRef}>
            <p className="ag-talent-count" role="status">找到 <strong>{filtered.length}</strong> 位创作者{isFiltered && <button type="button" onClick={clearFilters}>重置筛选 <X size={12} /></button>}</p>
            <div className="ag-talent-sort" role="group" aria-label="创作者排序">{([{ value: 'default', label: '默认排序' }, { value: 'works', label: '作品数量' }, { value: 'name', label: '姓名排序' }] as const).map((item) => <button type="button" key={item.value} aria-pressed={sort === item.value} onClick={() => { setSort(item.value); setPage(1); }}>{item.label}</button>)}</div>
            <div className="ag-talent-view" role="group" aria-label="目录展示方式"><button type="button" aria-label="网格视图" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={20} /></button><button type="button" aria-label="列表视图" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={20} /></button></div>
          </div>
          {visibleTalents.length ? <div className={'ag-talent-grid' + (view === 'list' ? ' ag-talent-grid-list' : '')}>{visibleTalents.map((talent) => <AggregateTalentCard key={talent.id} talent={talent} workType={workType} />)}</div> : (
            <div className="ag-talent-empty"><Users size={30} strokeWidth={1.2} /><h2>{isFiltered ? '没有找到匹配的创作者' : '暂无公开人才档案'}</h2><p>{isFiltered ? '试试其他关键词，或减少筛选条件。' : '欢迎先浏览学员作品，了解不同的创作方向。'}</p>{isFiltered ? <button type="button" onClick={clearFilters}>查看全部创作者 <ArrowRight size={15} /></button> : <Link href="/edu/aggregate#archive">浏览学员作品 <ArrowRight size={15} /></Link>}</div>
          )}
          {pageCount > 1 && <nav className="ag-talent-pagination" aria-label="人才目录分页"><button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="上一页"><ChevronLeft size={17} /></button>{pageNumbers.map((item, index) => <span key={item}>{index > 0 && item - pageNumbers[index - 1] > 1 && <span className="ag-talent-page-gap" aria-hidden="true">…</span>}<button type="button" aria-label={'第 ' + item + ' 页'} aria-current={currentPage === item ? 'page' : undefined} onClick={() => changePage(item)}>{item}</button></span>)}<button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="下一页"><ChevronRight size={17} /></button><span className="ag-talent-sr-only" aria-live="polite">第 {currentPage} 页，共 {pageCount} 页</span></nav>}
        </section>
        <footer className="ag-talent-footer"><span>每一份作品，都是认识创作者的开始。</span><Link href="/edu/aggregate">了解 AIGC 商业实训 <ArrowUpRight size={15} /></Link></footer>
      </div>
    </main>
  );
}

function ProfileWorkSection({ works, type, number, onPreview }: { works: TalentWork[]; type: 'image' | 'video'; number: string; onPreview: (work: TalentWork) => void }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? works : works.slice(0, 4);
  return (
    <section className="ag-profile-work-section" aria-labelledby={'ag-profile-' + type + '-title'}>
      <div className="ag-profile-section-head"><SectionHeading number={number} title={type === 'image' ? '作品图片' : '作品视频'} eyebrow={type === 'image' ? 'IMAGE WORKS' : 'VIDEO WORKS'} id={'ag-profile-' + type + '-title'} /><span>{works.length} 件作品</span></div>
      <div className={'ag-profile-work-grid' + (works.length <= 2 ? ' ag-profile-work-grid-small' : '')}>
        {visible.map((work) => {
          const count = type === 'image' ? workImagePaths(work).length : workMediaPaths(work).length;
          const previewable = count > 0 || workImagePaths(work).length > 0;
          return (
            <article key={work.id} className="ag-profile-work">
              <button type="button" className="ag-profile-work-button" disabled={!previewable} onClick={() => onPreview(work)} aria-label={'预览' + work.title + (count > 1 ? '，共 ' + count + (type === 'image' ? ' 张图片' : ' 段视频') : '')}>
                <MediaVisual coverPath={work.coverPath || workImagePaths(work)[0]} videoPath={type === 'video' ? workMediaPaths(work)[0] : undefined} alt={work.title} className="ag-profile-work-visual" />
                {type === 'video' && count > 0 ? <span className="ag-profile-play"><Play size={19} fill="currentColor" strokeWidth={1} /></span> : <span className="ag-profile-image-icon"><FileImage size={16} /></span>}
                {count > 1 && <span className="ag-profile-media-count">{count} {type === 'image' ? '张图片' : '段视频'}</span>}
              </button>
              <h3>{work.title}</h3><p>{work.summary || getWorkTypeLabel(type)}</p>
            </article>
          );
        })}
      </div>
      {works.length > 4 && <button className="ag-profile-show-all" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? '收起作品' : '查看全部' + (type === 'image' ? '图片' : '视频') + '作品（' + works.length + '）'}<ArrowRight size={15} /></button>}
    </section>
  );
}

function PortfolioSection({ works, number }: { works: TalentWork[]; number: string }) {
  return (
    <section className="ag-profile-portfolios" aria-labelledby="ag-profile-portfolio-title">
      <div className="ag-profile-section-head"><SectionHeading number={number} title="案例网站 / 作品集" eyebrow="PORTFOLIO" id="ag-profile-portfolio-title" /></div>
      <div className="ag-profile-site-grid">{works.map((work) => {
        const href = siteHref(work);
        const visual = <>{work.coverPath && <MediaVisual coverPath={work.coverPath} alt={work.title} className="ag-profile-site-visual" />}<div className="ag-profile-site-copy"><Globe2 size={25} strokeWidth={1.2} aria-hidden="true" /><h3>{work.title}</h3>{work.summary && <p>{work.summary}</p>}{href && <span>打开作品集 <ExternalLink size={13} aria-hidden="true" /></span>}</div></>;
        return href ? <a key={work.id} className="ag-profile-site" href={href} target="_blank" rel="noopener noreferrer" aria-label={'新窗口打开' + work.title}>{visual}</a> : <article key={work.id} className="ag-profile-site">{visual}</article>;
      })}</div>
    </section>
  );
}

export function AggregateTalentDetail({ talent }: { talent: TalentProfile }) {
  const [current, setCurrent] = useState<TalentWork | null>(null);
  const images = talent.works.filter((work) => work.type === 'image');
  const videos = talent.works.filter((work) => work.type === 'video');
  const websites = talent.works.filter((work) => work.type === 'website');
  const hasMedia = images.length > 0 || videos.length > 0;
  const mediaSections = Number(images.length > 0) + Number(videos.length > 0);
  const contactNumber = String(mediaSections + Number(websites.length > 0) + 1).padStart(2, '0');
  const showNote = Boolean(talent.bio && talent.intro && talent.bio !== talent.intro);

  return (
    <main id="aggregate-main" className="ag-profile-main">
      <div className="aggregate-container">
        <nav className="ag-profile-breadcrumb" aria-label="面包屑"><Link href="/edu/aggregate/talent">人才集市</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">人才详情</span></nav>
        <section className="ag-profile-hero" aria-labelledby="ag-profile-title">
          <ParticleArt className="ag-profile-particles" variant="cloud" />
          <div className="ag-profile-identity">
            <TalentAvatar key={talent.id} talent={talent} className="ag-profile-avatar" />
            <div className="ag-profile-introduction"><span className="ag-profile-badge">创作者</span><h1 id="ag-profile-title">{talent.name}</h1><div className="ag-profile-role">{talent.role && <p>{talent.role}</p>}{talent.location && <span><MapPin size={14} aria-hidden="true" />{talent.location}</span>}</div>
              {talent.skills.length > 0 && <div className="ag-profile-skills"><h2>能力标签</h2><ul>{talent.skills.map((item) => <li key={item}>{item}</li>)}</ul></div>}
              {(talent.intro || talent.bio) && <div className="ag-profile-bio"><h2>个人介绍</h2><p>{talent.intro || talent.bio}</p></div>}
            </div>
          </div>
          <div className="ag-profile-facts"><dl><div><dt>作品数量</dt><dd>{talent.works.length} 件</dd></div>{TALENT_WORK_TYPES.filter(({ value }) => talent.works.some((work) => work.type === value)).map(({ value }) => <div key={value}><dt>{getWorkTypeLabel(value)}</dt><dd>{talent.works.filter((work) => work.type === value).length} 件</dd></div>)}{talent.location && <div><dt>所在地区</dt><dd>{talent.location}</dd></div>}</dl><p><span>ID</span> {talent.id}</p></div>
        </section>

        <div className="ag-profile-content">
          <div className="ag-profile-works">
            {images.length > 0 && <ProfileWorkSection key={talent.id + '-images'} works={images} type="image" number="01" onPreview={setCurrent} />}
            {videos.length > 0 && <ProfileWorkSection key={talent.id + '-videos'} works={videos} type="video" number={images.length ? '02' : '01'} onPreview={setCurrent} />}
            {!hasMedia && websites.length > 0 && <PortfolioSection works={websites} number="01" />}
            {talent.works.length === 0 && <div className="ag-profile-empty"><FileImage size={32} strokeWidth={1.2} /><h2>暂无公开作品</h2><p>浏览更多创作者，发现不同的创作方向。</p><Link href="/edu/aggregate/talent">返回人才集市 <ArrowRight size={15} /></Link></div>}
          </div>
          <aside className="ag-profile-sidebar" aria-label="作品集与咨询">
            {hasMedia && websites.length > 0 && <PortfolioSection works={websites} number={String(mediaSections + 1).padStart(2, '0')} />}
            <section className="ag-profile-contact" aria-labelledby="ag-profile-contact-title"><div className="ag-profile-section-head"><SectionHeading number={contactNumber} title="联系与咨询" eyebrow="CONTACT" id="ag-profile-contact-title" /></div><p>想进一步了解这位创作者的作品？</p><AggregateCtaButton source="advisor">联系 EDU 顾问</AggregateCtaButton><AggregateCtaButton source="openclass" variant="outline">预约公开课</AggregateCtaButton></section>
            {showNote && <section className="ag-profile-note" aria-labelledby="ag-profile-note-title"><div className="ag-profile-section-head"><SectionHeading number={String(Number(contactNumber) + 1).padStart(2, '0')} title="创作方向" eyebrow="CREATOR NOTES" id="ag-profile-note-title" /></div><p>{talent.bio}</p></section>}
          </aside>
        </div>
        <footer className="ag-profile-footer"><Link href="/edu/aggregate/talent"><ArrowLeft size={15} />返回人才集市</Link><p>用 AI，打开影像内容的新可能。</p><Link href="/edu/aggregate">探索 EDU 实训 <ArrowUpRight size={15} /></Link></footer>
      </div>
      {current && <MediaDialog title={current.title} summary={current.summary} images={current.type === 'video' && workMediaPaths(current).length ? current.galleryPaths : workImagePaths(current)} videos={current.type === 'video' ? workMediaPaths(current) : undefined} coverPath={current.coverPath} onClose={() => setCurrent(null)} />}
    </main>
  );
}
