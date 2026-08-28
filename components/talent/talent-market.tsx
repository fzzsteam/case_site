'use client';

import Link from 'next/link';
import { ArrowUpRight, FileImage, Globe2, Play, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Reveal } from '@/components/aigc/primitives';
import type { TalentProfile, TalentWork, TalentWorkType } from '@/lib/talent/types';
import { TALENT_SKILLS, TALENT_WORK_TYPES } from '@/lib/talent/types';

type TalentMarketProps = {
  talents: TalentProfile[];
};

const typeLabel = (type: TalentWorkType) => TALENT_WORK_TYPES.find((item) => item.value === type)?.label ?? type;

function WorkTypeIcon({ type, size = 14 }: { type: TalentWorkType; size?: number }) {
  if (type === 'video') return <Play size={size} aria-hidden="true" />;
  if (type === 'image') return <FileImage size={size} aria-hidden="true" />;
  return <Globe2 size={size} aria-hidden="true" />;
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`aigc-work-filter ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={onClick}>
      <span className="aigc-work-filter__label">{label}</span>
      {typeof count === 'number' && <span className="aigc-work-filter__count">{count}</span>}
    </button>
  );
}

function TalentCard({ talent }: { talent: TalentProfile }) {
  const featured = talent.works[0];
  const featuredType = featured?.type ?? 'image';

  return (
    <Reveal variant="scale" className="aigc-talent-grid__item">
      <Link className="aigc-card aigc-talent-card" href={`/edu/talent/${talent.id}`} aria-label={`查看${talent.name}的人才详情`}>
        <div className="aigc-talent-card__visual">
          {featured?.coverPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured.coverPath} alt={`${talent.name}的代表作品`} loading="lazy" />
          ) : (
            <div className="aigc-talent-card__placeholder" aria-hidden="true">
              <span>{talent.name.slice(0, 1)}</span>
              <small>PORTFOLIO / {String(talent.works.length).padStart(2, '0')}</small>
            </div>
          )}
          <span className="aigc-talent-card__visual-wash" aria-hidden="true" />
          <span className="aigc-talent-card__type">
            <WorkTypeIcon type={featuredType} />
            {typeLabel(featuredType)}
          </span>
          <span className="aigc-talent-card__open" aria-hidden="true"><ArrowUpRight size={17} /></span>
          <div className="aigc-work__meta">
            <span className="aigc-work__cat">{talent.name}</span>
            <span className="aigc-work__by">
              <span className="aigc-work__tag">{talent.location ?? '人才集市'}</span>
              <span className="aigc-work__author">{talent.works.length} 个案例</span>
            </span>
          </div>
        </div>

        <div className="aigc-talent-card__footer">
          <div className="aigc-talent-card__heading">
            <div>
              <p className="aigc-talent-card__eyebrow">TALENT PROFILE</p>
              <h3>{talent.name}</h3>
            </div>
            <span className="aigc-talent-card__arrow"><ArrowUpRight size={17} /></span>
          </div>
          <p className="aigc-talent-card__role">{talent.role}</p>
          <div className="aigc-talent-card__skills">
            {talent.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function TalentMarket({ talents }: TalentMarketProps) {
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState<string>('全部');
  const [workType, setWorkType] = useState<'全部' | TalentWorkType>('全部');

  const filteredTalents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return talents.filter((talent) => {
      const searchable = [
        talent.name,
        talent.role,
        talent.intro,
        talent.bio,
        ...talent.skills,
        ...talent.works.map((work) => `${work.title} ${work.summary}`),
      ].join(' ').toLowerCase();
      const matchesQuery = !normalized || searchable.includes(normalized);
      const matchesSkill = skill === '全部' || talent.skills.includes(skill);
      const matchesType = workType === '全部' || talent.works.some((work) => work.type === workType);
      return matchesQuery && matchesSkill && matchesType;
    });
  }, [query, skill, talents, workType]);

  const totalWorks = talents.reduce((sum, talent) => sum + talent.works.length, 0);
  const clearFilters = () => {
    setQuery('');
    setSkill('全部');
    setWorkType('全部');
  };

  return (
    <main>
      <section className="aigc-section aigc-talent-directory" id="talent-directory" aria-labelledby="talent-directory-title">
        <div className="aigc-shell">
          <div className="aigc-talent-directory__top">
            <Reveal>
              <span className="aigc-eyebrow">人才集市 / TALENT MARKET</span>
              <h1 id="talent-directory-title" className="aigc-h2">找到合适的<em>创作者</em></h1>
              <p className="aigc-lede">浏览学员作品集，按能力和作品类型查看人才案例。</p>
            </Reveal>
            <Reveal variant="right" className="aigc-talent-directory__stats" aria-label="人才集市统计">
              <span><strong>{talents.length}</strong>人才</span>
              <span><strong>{totalWorks}</strong>作品</span>
              <span><strong>{talents.reduce((sum, talent) => sum + talent.works.filter((work) => work.type === 'website').length, 0)}</strong>站点</span>
            </Reveal>
          </div>

          <div className="aigc-talent-controls">
            <TalentSearch query={query} onQueryChange={setQuery} />
            <div className="aigc-talent-filter-stack">
              <div className="aigc-talent-filter-line">
                <span className="aigc-talent-filter-label">能力方向</span>
                <div className="aigc-work-filters" role="group" aria-label="技能分类">
                  <FilterButton label="全部" count={talents.length} active={skill === '全部'} onClick={() => setSkill('全部')} />
                  {TALENT_SKILLS.map((item) => (
                    <FilterButton
                      key={item}
                      label={item}
                      count={talents.filter((talent) => talent.skills.includes(item)).length}
                      active={skill === item}
                      onClick={() => setSkill(item)}
                    />
                  ))}
                </div>
              </div>
              <div className="aigc-talent-filter-line">
                <span className="aigc-talent-filter-label">案例形式</span>
                <div className="aigc-work-filters" role="group" aria-label="作品类型">
                  <FilterButton label="全部" count={totalWorks} active={workType === '全部'} onClick={() => setWorkType('全部')} />
                  {TALENT_WORK_TYPES.map((item) => (
                    <FilterButton
                      key={item.value}
                      label={item.label}
                      count={talents.reduce((sum, talent) => sum + talent.works.filter((work) => work.type === item.value).length, 0)}
                      active={workType === item.value}
                      onClick={() => setWorkType(item.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="aigc-talent-result" aria-live="polite">
            <span>当前展示 <strong>{filteredTalents.length}</strong> 位人才</span>
            {(query || skill !== '全部' || workType !== '全部') && (
              <button type="button" onClick={clearFilters}>清除筛选</button>
            )}
          </div>

          {filteredTalents.length > 0 ? (
            <div className="aigc-talent-grid">
              {filteredTalents.map((talent) => <TalentCard key={talent.id} talent={talent} />)}
            </div>
          ) : (
            <div className="aigc-talent-empty">
              <Users size={26} aria-hidden="true" />
              <h3>暂时没有匹配的人才</h3>
              <p>换一个关键词或取消筛选，再看看人才案例。</p>
              <button type="button" onClick={clearFilters}>查看全部人才</button>
            </div>
          )}

          <div className="aigc-talent-directory__foot">
            <span>作品集持续更新中</span>
            <Link href="/edu#modules">返回实训体系 <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function TalentSearch({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <label className="aigc-talent-search">
      <Search size={17} aria-hidden="true" />
      <span className="sr-only">搜索人才、技能或作品</span>
      <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索人才、技能、作品" />
    </label>
  );
}

export function getTalentWorkLabel(work: TalentWork) {
  return typeLabel(work.type);
}
