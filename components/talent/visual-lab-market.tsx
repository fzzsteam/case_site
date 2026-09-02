'use client';

import Link from 'next/link';
import { ArrowUpRight, FileImage, Globe2, Play, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { aigcImageUrl } from '@/components/aigc/media';
import { Reveal } from '@/components/aigc/primitives';
import type { TalentProfile, TalentWork, TalentWorkType } from '@/lib/talent/types';
import { TALENT_SKILLS, TALENT_WORK_TYPES } from '@/lib/talent/types';

type TalentMarketProps = { talents: TalentProfile[] };

const typeLabel = (type: TalentWorkType) => TALENT_WORK_TYPES.find((item) => item.value === type)?.label ?? type;

function WorkTypeIcon({ type, size = 14 }: { type: TalentWorkType; size?: number }) {
  if (type === 'video') return <Play size={size} aria-hidden="true" />;
  if (type === 'image') return <FileImage size={size} aria-hidden="true" />;
  return <Globe2 size={size} aria-hidden="true" />;
}

function FilterButton({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`aigc-filter${active ? ' is-active' : ''}`} aria-pressed={active} onClick={onClick}>
      <span>{label}</span>
      {typeof count === 'number' && <b>{String(count).padStart(2, '0')}</b>}
    </button>
  );
}

function TalentCard({ talent, index }: { talent: TalentProfile; index: number }) {
  const featured = talent.works[0];
  const featuredType = featured?.type ?? 'image';
  const visualPath = talent.avatarPath ?? featured?.coverPath;
  const visualAlt = talent.avatarPath ? `${talent.name}头像` : `${talent.name}的代表作品`;

  return (
    <Reveal delay={index * 70}>
      <article className="aigc-talent-record">
        <Link className="aigc-talent-record__link" href={`/edu/visual-lab/talent/${talent.id}`} aria-label={`查看${talent.name}的人才详情`}>
          <div className="aigc-talent-record__visual">
            {visualPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={aigcImageUrl(visualPath)} alt={visualAlt} loading="lazy" />
            ) : (
              <div className="aigc-talent-record__placeholder" aria-hidden="true"><strong>{talent.name.slice(0, 1)}</strong><small>PORTFOLIO / {String(talent.works.length).padStart(2, '0')}</small></div>
            )}
            <span className="aigc-talent-record__wash" aria-hidden="true" />
            <span className="aigc-talent-record__type"><WorkTypeIcon type={featuredType} />{typeLabel(featuredType)}</span>
            <span className="aigc-talent-record__open" aria-hidden="true"><ArrowUpRight size={18} /></span>
            <div className="aigc-talent-record__visual-meta"><span>{talent.name}</span><small>{talent.location ?? '人才集市'} · {talent.works.length} 个案例</small></div>
          </div>
          <div className="aigc-talent-record__body">
            <div className="aigc-talent-record__heading"><span>TALENT PROFILE / {String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={17} /></div>
            <h2>{talent.name}</h2>
            <p>{talent.role}</p>
            <div className="aigc-talent-record__skills">{talent.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}

export function TalentMarket({ talents }: TalentMarketProps) {
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState<string>('全部');
  const [workType, setWorkType] = useState<'全部' | TalentWorkType>('全部');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextSkill = params.get('skill');
    const nextType = params.get('type') as TalentWorkType | null;
    setQuery(params.get('q') ?? '');
    setSkill(nextSkill && (nextSkill === '全部' || TALENT_SKILLS.includes(nextSkill as (typeof TALENT_SKILLS)[number])) ? nextSkill : '全部');
    setWorkType(nextType && TALENT_WORK_TYPES.some((item) => item.value === nextType) ? nextType : '全部');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (skill !== '全部') params.set('skill', skill);
    if (workType !== '全部') params.set('type', workType);
    const queryString = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`);
  }, [hydrated, query, skill, workType]);

  const filteredTalents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return talents.filter((talent) => {
      const searchable = [talent.name, talent.role, talent.intro, talent.bio, ...talent.skills, ...talent.works.map((work) => `${work.title} ${work.summary}`)].join(' ').toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (skill === '全部' || talent.skills.includes(skill)) && (workType === '全部' || talent.works.some((work) => work.type === workType));
    });
  }, [query, skill, talents, workType]);

  const totalWorks = talents.reduce((sum, talent) => sum + talent.works.length, 0);
  const totalSites = talents.reduce((sum, talent) => sum + talent.works.filter((work) => work.type === 'website').length, 0);
  const activeFilterCount = Number(skill !== '全部') + Number(workType !== '全部');
  const filtersVisible = mobileFiltersOpen || activeFilterCount > 0;
  const clearFilters = () => {
    setQuery('');
    setSkill('全部');
    setWorkType('全部');
    setMobileFiltersOpen(false);
  };

  return (
    <main id="main-content" className="aigc-market-page">
      <section className="aigc-market-hero" aria-labelledby="talent-market-title">
        <div className="aigc-shell">
          <div className="aigc-market-hero__topline"><span className="aigc-section-index">TALENT MARKET / 01</span><span className="aigc-status">ARCHIVE OPEN</span></div>
          <div className="aigc-market-hero__grid">
            <div>
              <p className="aigc-market-hero__kicker">EDU / WORK → TALENT</p>
              <h1 id="talent-market-title">找到合适的<br /><em>创作者。</em></h1>
              <p className="aigc-market-hero__lead">浏览学员作品集，沿着能力、作品类型和真实交付记录，找到下一位合作对象。</p>
            </div>
            <div className="aigc-market-hero__note"><span>MARKET NOTE / 001</span><p>这里不是一份静态名单。每个创作者都从训练作品、项目过程和可合作能力开始建立档案。</p><Link href="/edu/visual-lab#modules">查看训练路径 <ArrowUpRight size={15} /></Link></div>
          </div>
          <div className="aigc-market-stats" aria-label="人才集市统计"><span><strong>{talents.length}</strong>人才档案</span><span><strong>{totalWorks}</strong>已收录作品</span><span><strong>{totalSites}</strong>案例站点</span><span><strong>OPEN</strong>持续更新</span></div>
        </div>
      </section>

      <section className="aigc-section aigc-section--market" id="talent-directory" aria-labelledby="talent-directory-title">
        <div className="aigc-shell">
          <div className="aigc-section-header"><span className="aigc-section-index">02 / CREATOR INDEX</span><div><h2 id="talent-directory-title" className="aigc-h2">按能力筛选，<br /><em>进入作品档案。</em></h2><p className="aigc-lede">搜索名字、技能或作品关键词，再按案例形式缩小范围。</p></div></div>

          <div className="aigc-market-controls">
            <div className="aigc-market-search-row">
              <TalentSearch query={query} onQueryChange={setQuery} />
              <button type="button" className="aigc-market-filter-toggle" aria-expanded={filtersVisible} aria-controls="talent-filter-options" onClick={() => setMobileFiltersOpen((open) => !open)}>
                <SlidersHorizontal size={15} aria-hidden="true" /><span>筛选</span>{activeFilterCount > 0 && <b>{activeFilterCount}</b>}
              </button>
            </div>
            <div id="talent-filter-options" className={`aigc-market-filter-stack${filtersVisible ? ' is-open' : ''}`}>
              <div className="aigc-market-filter-group"><span>能力方向</span><div className="aigc-filter-list" role="group" aria-label="技能分类"><FilterButton label="全部" count={talents.length} active={skill === '全部'} onClick={() => setSkill('全部')} />{TALENT_SKILLS.map((item) => <FilterButton key={item} label={item} count={talents.filter((talent) => talent.skills.includes(item)).length} active={skill === item} onClick={() => setSkill(item)} />)}</div></div>
              <div className="aigc-market-filter-group"><span>案例形式</span><div className="aigc-filter-list" role="group" aria-label="作品类型"><FilterButton label="全部" count={totalWorks} active={workType === '全部'} onClick={() => setWorkType('全部')} />{TALENT_WORK_TYPES.map((item) => <FilterButton key={item.value} label={item.label} count={talents.reduce((sum, talent) => sum + talent.works.filter((work) => work.type === item.value).length, 0)} active={workType === item.value} onClick={() => setWorkType(item.value)} />)}</div></div>
            </div>
          </div>

          <div className="aigc-market-result" aria-live="polite"><span>当前结果：<strong>{String(filteredTalents.length).padStart(2, '0')} / {String(talents.length).padStart(2, '0')}</strong> 位创作者</span>{(query || skill !== '全部' || workType !== '全部') && <button type="button" onClick={clearFilters}>清除筛选</button>}</div>

          {filteredTalents.length > 0 ? <div className="aigc-talent-grid">{filteredTalents.map((talent, index) => <TalentCard key={talent.id} talent={talent} index={index} />)}</div> : <div className="aigc-talent-empty"><Users size={25} aria-hidden="true" /><h3>暂时没有匹配的人才</h3><p>换一个关键词或取消筛选，再看看人才案例。</p><button type="button" onClick={clearFilters}>查看全部人才</button></div>}
          <div className="aigc-market-footer"><span>作品集持续更新中 / LIVE ARCHIVE</span><Link href="/edu/visual-lab#modules">返回训练路径 <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  );
}

export function TalentSearch({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <div className="aigc-market-search">
      <Search size={17} aria-hidden="true" />
      <label className="aigc-visually-hidden" htmlFor="talent-market-search">搜索人才、技能或作品</label>
      <input id="talent-market-search" type="search" value={query} autoComplete="off" onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索人才、技能、作品" />
      {query && <button type="button" className="aigc-market-search__clear" aria-label="清除搜索关键词" onClick={() => onQueryChange('')}><X size={14} aria-hidden="true" /></button>}
    </div>
  );
}

export function getTalentWorkLabel(work: TalentWork) {
  return typeLabel(work.type);
}
