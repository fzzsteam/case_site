import type { ReactNode } from 'react';
import { siteConfig } from '@/content/site';
import {
  CASE_STATS,
  EDU_ASSETS,
  ENDORSE_ADVANTAGES,
  ENDORSE_BADGES,
  ENDORSE_LOCKUP,
  GAINS,
  GAINS_PORTFOLIO,
  JOBS,
  JOBS_DISCLAIMER,
  MARQUEE_ITEMS,
  MENTOR_META,
  MENTORS,
  MODULES,
  PERSONAS,
  GUEST_MENTORS,
  type MentorProfile,
} from './content';
import { BADGE_ICONS, IconArrow, IconCheck } from './icons';
import { CountUp, Marquee, Reveal, TiltCard } from './primitives';
import { CtaButton } from './LeadProvider';
import { WorksGrid } from './Works';
import { CaseRail } from './Cases';
import { AIGC_MEDIA, aigcImageUrl } from './media';

export function Atmosphere() {
  return (
    <div className="aigc-atmos" aria-hidden="true">
      <span className="aigc-atmos__glow aigc-atmos__glow--lime" />
      <span className="aigc-atmos__glow aigc-atmos__glow--violet" />
      <span className="aigc-grid" />
      <span className="aigc-noise" />
    </div>
  );
}

function SectionHeader({
  index,
  title,
  copy,
}: {
  index: string;
  title: ReactNode;
  copy?: string;
}) {
  return (
    <div className="aigc-section-header">
      <span className="aigc-section-index">{index}</span>
      <div>
        <h2 className="aigc-h2">{title}</h2>
        {copy && <p className="aigc-lede">{copy}</p>}
      </div>
    </div>
  );
}

export function MarqueeStrip() {
  return <Marquee items={MARQUEE_ITEMS} />;
}

const PATH_STAGES = [
  'INPUT / ORIENT',
  'INPUT / LOOK',
  'MAKE / FRAME',
  'MAKE / CHARACTER',
  'MAKE / STORY',
  'OUTPUT / MARKET',
  'OUTPUT / FINISH',
];

const PATH_OUTPUTS = [
  '市场地图 / 岗位观察',
  '视觉练习册 / 风格采样',
  '商业图像组 / 分镜稿',
  'IP 设定 / 延展规范',
  '动态样片 / 内容脚本',
  '产品内容包 / 商业 KV',
  '交付成片 / 版本清单',
];

export function ModulesSection() {
  return (
    <section className="aigc-section aigc-section--paths" id="modules" aria-labelledby="training-paths-title">
      <div className="aigc-shell">
        <SectionHeader
          index="01 / TRAINING PATHS"
          title={<>先选一条路径，<br /><em>再进入作品现场。</em></>}
          copy="每个训练节点都对应一项能力与一份可回看的交付物。沿着输入、创作与交付，逐步建立完整作品链路。"
        />
        <h2 id="training-paths-title" className="aigc-visually-hidden">七大 AIGC 实训模块</h2>

        <div className="aigc-path-toolbar">
          <span className="aigc-path-toolbar__label">07 / DELIVERY MODULES</span>
          <span className="aigc-path-toolbar__line" aria-hidden="true" />
          <span className="aigc-path-toolbar__note">输入 → 练习 → 交付</span>
        </div>

        <div className="aigc-path-grid">
          {MODULES.map((module, index) => (
            <Reveal key={module.no} delay={index * 55}>
              <TiltCard className="aigc-path-card" tilt={false}>
                <div className="aigc-path-card__topline">
                  <span className="aigc-path-card__number">{module.no}</span>
                  <span className="aigc-path-card__stage">{PATH_STAGES[index]}</span>
                  <IconArrow className="aigc-path-card__arrow" size={18} />
                </div>
                <div className="aigc-path-card__body">
                  <div className="aigc-path-card__visual">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={module.illus} alt="" loading="lazy" aria-hidden="true" />
                  </div>
                  <h3>{module.title}</h3>
                  <p>{module.desc}</p>
                </div>
                <div className="aigc-path-card__output">
                  <span>OUTPUT</span>
                  <strong>{PATH_OUTPUTS[index]}</strong>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PersonasSection() {
  return (
    <section className="aigc-section aigc-section--audience" id="personas" aria-labelledby="audience-title">
      <div className="aigc-shell">
        <SectionHeader
          index="02 / AUDIENCE MAP"
          title={<>找到与你现在位置<br /><em>最接近的入口。</em></>}
          copy="不同起点，共同指向一套可展示、可复盘、可交付的商业作品集。"
        />
        <h2 id="audience-title" className="aigc-visually-hidden">适合参加实训的人群</h2>

        <div className="aigc-audience-list">
          {PERSONAS.map((persona, index) => (
            <Reveal key={persona.title} delay={index * 60}>
              <article className="aigc-audience-row">
                <span className="aigc-audience-row__number">0{index + 1}</span>
                <div className="aigc-audience-row__visual">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={persona.illus} alt="" loading="lazy" aria-hidden="true" />
                </div>
                <div className="aigc-audience-row__copy">
                  <h3>{persona.title}</h3>
                  <p>{persona.desc}</p>
                </div>
                <span className="aigc-audience-row__mark">ENTRY POINT</span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorksSection() {
  return (
    <section className="aigc-section aigc-section--archive" id="works" aria-labelledby="works-title">
      <div className="aigc-shell">
        <SectionHeader
          index="03 / WORKS INDEX"
          title={<>作品不是终点，<br /><em>是过程留下的证据。</em></>}
          copy="按交付现场索引静帧、动态、品牌和人物，让每一项训练成果都成为下一次合作可以调用的线索。"
        />
        <h2 id="works-title" className="aigc-visually-hidden">学员真实商业案例</h2>
        <WorksGrid />
      </div>
    </section>
  );
}

export function CasesSection() {
  return (
    <section className="aigc-section aigc-section--outcomes" id="cases" aria-labelledby="outcomes-title">
      <div className="aigc-shell">
        <SectionHeader
          index="04 / OUTCOME LOG"
          title={<>把作品交给<br /><em>下一次机会。</em></>}
          copy="真实的训练结果不只停留在课堂里，也会进入岗位、项目与独立接单的现场。"
        />
        <h2 id="outcomes-title" className="aigc-visually-hidden">学员就业去向与岗位</h2>

        <CaseRail />

        <div className="aigc-job-heading">
          <span className="aigc-section-index">ROLE INDEX / 04A</span>
          <h3>相关创作岗位</h3>
          <p>能力可以被翻译成岗位，也可以继续成为独立创作的商业基础。</p>
        </div>

        <div className="aigc-job-grid">
          {JOBS.map((job, index) => (
            <Reveal key={job.name} delay={index * 65}>
              <TiltCard className="aigc-job" tilt={false}>
                <div className="aigc-job__topline">
                  <span>ROLE / 0{index + 1}</span>
                  <IconArrow size={17} />
                </div>
                <h3>{job.name}</h3>
                <p className="aigc-job__pay"><strong>{job.pay}</strong><span>{job.payLabel}</span></p>
                <span className="aigc-job__bar"><i style={{ ['--w' as string]: job.width }} /></span>
                <p className="aigc-job__dir">{job.dir}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <p className="aigc-disclaimer">{JOBS_DISCLAIMER}</p>
      </div>
    </section>
  );
}

function MentorCard({ mentor, index, label }: { mentor: MentorProfile; index: number; label: string }) {
  return (
    <Reveal delay={index * 70}>
      <article className="aigc-mentor-card">
        <div className="aigc-mentor-card__topline">
          <span className="aigc-mentor-card__number">{String(index + 1).padStart(2, '0')}</span>
          <span>{label}</span>
          <IconArrow size={16} />
        </div>
        <div className="aigc-mentor-card__identity">
          <p>{mentor.role}</p>
          <h3>{mentor.name}</h3>
        </div>
        <div className="aigc-mentor-card__bio">
          {mentor.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="aigc-mentor-card__footer"><span>REAL-WORLD METHOD</span><i aria-hidden="true" /></div>
      </article>
    </Reveal>
  );
}

export function MentorsSection() {
  return (
    <section className="aigc-section aigc-section--mentors" id="mentors" aria-labelledby="mentors-title">
      <div className="aigc-shell">
        <SectionHeader
          index="05 / MENTOR ARCHIVE"
          title={<>让行业经验<br /><em>进入训练现场。</em></>}
          copy={MENTOR_META.sub}
        />
        <h2 id="mentors-title" className="aigc-visually-hidden">教研导师与产业导师</h2>

        <div className="aigc-mentor-group-heading">
          <span>{MENTOR_META.eyebrow}</span>
          <p>全职教研团队负责日常带班，贯穿 31 天实训周期。</p>
        </div>
        <div className="aigc-mentor-grid">
          {MENTORS.map((mentor, index) => <MentorCard key={mentor.name} mentor={mentor} index={index} label="TEACHING TEAM" />)}
        </div>

        <div className="aigc-mentor-group-heading aigc-mentor-group-heading--guest">
          <span>{MENTOR_META.guestTitle}</span>
          <p>{MENTOR_META.guestDesc}</p>
        </div>
        <div className="aigc-mentor-grid aigc-mentor-grid--guest">
          {GUEST_MENTORS.map((mentor, index) => <MentorCard key={mentor.name} mentor={mentor} index={index} label="SPECIAL EXPERT" />)}
        </div>

        <div className="aigc-mentor-method">
          <span>01 / METHOD</span>
          <div><h3>{MENTOR_META.modelTitle}</h3><p>{MENTOR_META.modelDesc}</p></div>
        </div>
      </div>
    </section>
  );
}

export function GainsSection() {
  return (
    <section className="aigc-section aigc-section--gains" id="gains" aria-labelledby="gains-title">
      <div className="aigc-shell">
        <SectionHeader
          index="06 / STATS + GAINS"
          title={<>每个模块的产出，<br /><em>都会进入同一套作品集。</em></>}
          copy="结业时带走的不是一张证书，而是一套可以继续被观看、被使用、被合作的完整商业交付物。"
        />
        <h2 id="gains-title" className="aigc-visually-hidden">实训收获与结业权益</h2>

        <div className="aigc-stats-strip" aria-label="实训统计">
          {CASE_STATS.map((stat) => (
            <div className="aigc-stat" key={stat.label}>
              <strong><CountUp to={stat.to} suffix={stat.suffix} /></strong>
              <span>{stat.label}</span>
            </div>
          ))}
          <div className="aigc-stat"><strong>∞</strong><span>下一次合作 / NEXT BRIEF</span></div>
        </div>

        <div className="aigc-gains-layout">
          <div className="aigc-gains-list">
            {GAINS.map((gain, index) => (
              <Reveal key={gain.title} delay={index * 45}>
                <article className="aigc-gain-row">
                  <span className="aigc-gain-row__number">0{index + 1}</span>
                  <span className="aigc-gain-row__mark"><IconCheck size={13} /></span>
                  <div><h3>{gain.title}</h3><p>{gain.desc}</p></div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal variant="right">
            <aside className="aigc-gains-visual">
              <div className="aigc-gains-visual__meta"><span>{GAINS_PORTFOLIO.eyebrow}</span><span>OUTPUT / 01</span></div>
              <h3>{GAINS_PORTFOLIO.title}</h3>
              <p>{GAINS_PORTFOLIO.desc}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={EDU_ASSETS.gainsPortfolio} alt="AIGC 项目作品集、设计源文件、项目过程文档、成片视频与结业证书" loading="lazy" />
              <span className="aigc-gains-visual__corner" aria-hidden="true">ARCHIVE / 06</span>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function EndorsementSection() {
  return (
    <section className="aigc-section aigc-section--proof" id="endorsement" aria-labelledby="endorsement-title">
      <div className="aigc-shell">
        <SectionHeader
          index="07 / PROOF OF PRACTICE"
          title={<>企业主体与<br /><em>影视产业合作。</em></>}
          copy="从上市公司主体到影视产业合作方，训练被放在真实行业标准与交付语境中。"
        />
        <h2 id="endorsement-title" className="aigc-visually-hidden">企业实力与影视产业合作</h2>

        <div className="aigc-proof-lockup">
          <div className="aigc-proof-party">
            <span>上市公司主体 / PUBLIC COMPANY</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EDU_ASSETS.fangzhiLogo} alt={`${ENDORSE_LOCKUP.fangzhi.name}，${ENDORSE_LOCKUP.fangzhi.meta.join('，')}`} />
            <strong>{ENDORSE_LOCKUP.fangzhi.name}</strong>
            <small>{ENDORSE_LOCKUP.fangzhi.meta.join(' · ')}</small>
          </div>
          <div className="aigc-proof-symbol" aria-hidden="true">×</div>
          <div className="aigc-proof-party aigc-proof-party--partner">
            <span>影视产业合作方 / FILM PARTNER</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EDU_ASSETS.szfsLogo} alt={ENDORSE_LOCKUP.szfs.name} />
            <strong>深圳电影制片厂</strong>
            <small>行业专家专题授课</small>
          </div>
        </div>

        <div className="aigc-proof-grid">
          <div className="aigc-proof-advantages">
            {ENDORSE_ADVANTAGES.map((advantage, index) => (
              <Reveal key={advantage} delay={index * 35}>
                <div className="aigc-proof-advantage"><span>0{index + 1}</span><IconCheck size={13} /><p>{advantage}</p></div>
              </Reveal>
            ))}
          </div>
          <div>
            <div className="aigc-proof-badges">
              {ENDORSE_BADGES.map((badge, index) => {
                const Icon = BADGE_ICONS[badge.icon];
                return <Reveal key={badge.label} delay={index * 70}><div className="aigc-proof-badge"><Icon size={22} /><span>{badge.label}</span></div></Reveal>;
              })}
            </div>
            <Reveal>
              <div className="aigc-proof-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aigcImageUrl(AIGC_MEDIA.brandPlaquesPath)} alt="鲲鹏应用联合实验室、博士后创新实践基地、广东省智能教学工程技术研究中心牌匾" loading="lazy" />
                <span>FIELD EVIDENCE / 07</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="aigc-section aigc-final" id="join" aria-labelledby="join-title">
      <div className="aigc-shell">
        <div className="aigc-final__grid">
          <div>
            <span className="aigc-section-index">08 / NEXT STOP</span>
            <h2 id="join-title">从训练现场，<br /><span>走进下一次机会。</span></h2>
          </div>
          <div className="aigc-final__copy">
            <p>打开资料、预约公开课或直接与课程顾问沟通，沿着你的目标进入完整的 AIGC 商业实训路径。</p>
            <div className="aigc-final__cta">
              <CtaButton source="kit">免费领取实训资料包</CtaButton>
              <CtaButton source="openclass" variant="ghost">预约公开课</CtaButton>
              <CtaButton source="advisor" variant="ghost">添加顾问 1v1 咨询</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="aigc-footer">
      <div className="aigc-shell">
        <div className="aigc-footer__row">
          <div>
            <div className="aigc-footer__brand">FANGZHI / EDU</div>
            <p>方直智胜 © 2026 版权所有<br />运营主体：深圳市方直智胜科技有限公司（方直科技［300235］旗下 AI 子公司）</p>
          </div>
          <div className="aigc-footer__links">
            <a href="/edu#modules">训练路径</a>
            <a href="/edu#works">作品索引</a>
            <a href="/edu/talent">人才集市</a>
            <a href={siteConfig.icpUrl} target="_blank" rel="noreferrer">{siteConfig.icp}</a>
          </div>
          <span className="aigc-footer__code">ARCHIVE 00<br />STATIC / LOCAL FIRST</span>
        </div>
      </div>
    </footer>
  );
}
