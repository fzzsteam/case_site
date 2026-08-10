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
  PARTNERSHIP,
  PERSONAS,
} from './content';
import { BADGE_ICONS, IconCheck } from './icons';
import { CountUp, Marquee, Reveal, TiltCard } from './primitives';
import { CtaButton } from './LeadProvider';
import { WorksGrid } from './Works';
import { CaseRail } from './Cases';
import { AIGC_MEDIA, aigcImageUrl } from './media';

/** 固定在视口后方的氛围层：极光光斑 + 网格 + 噪点。 */
export function Atmosphere() {
  return (
    <div className="aigc-atmos" aria-hidden>
      <span className="aigc-blob aigc-blob--a" />
      <span className="aigc-blob aigc-blob--b" />
      <span className="aigc-blob aigc-blob--c" />
      <span className="aigc-grid" />
      <span className="aigc-noise" />
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <Reveal>
      <span className="aigc-eyebrow">{eyebrow}</span>
      <h2 className="aigc-h2">{title}</h2>
      {lede && <p className="aigc-lede">{lede}</p>}
    </Reveal>
  );
}

export function MarqueeStrip() {
  return <Marquee items={MARQUEE_ITEMS} />;
}

/**
 * 首屏下方的合作矮条：只声明「合作关系成立」，配双品牌标识 + 三个关键词。
 * 合作内容的展开叙述在页尾「企业实力」，此处刻意不重复。
 */
export function PartnershipSection() {
  return (
    <section className="aigc-partnership" aria-label="万象元生与深圳电影制片厂产业资源合作">
      <div className="aigc-shell">
        <Reveal>
          <div className="aigc-partnership__bar">
            <div className="aigc-partnership__lockup">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-partnership__fz"
                src={EDU_ASSETS.fangzhiLogo}
                alt="方直科技 · 万象元生"
              />
              <span className="aigc-partnership__cross" aria-hidden>
                ×
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-partnership__szfs"
                src={EDU_ASSETS.szfsLogo}
                alt="深圳电影制片厂有限公司"
              />
            </div>

            <div className="aigc-partnership__copy">
              <span className="aigc-partnership__eyebrow">{PARTNERSHIP.eyebrow}</span>
              <div className="aigc-partnership__items">
                {PARTNERSHIP.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* 板块一：实训体系 */
export function ModulesSection() {
  return (
    <section className="aigc-section" id="modules">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="实训体系"
          title={
            <>
              七大实践模块，贯通 <em>AIGC 商业创作全链路</em>
            </>
          }
          lede="从行业认知到综合项目闭环，每个模块都对应一段可交付的商业产出，而不是孤立的工具教学。"
        />

        <div className="aigc-modules">
          {MODULES.map((m, i) => (
            <Reveal key={m.no} delay={i * 60}>
              <TiltCard className="aigc-module">
                <span className="aigc-module__glow" aria-hidden />
                <div className="aigc-module__art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.illus} alt="" loading="lazy" aria-hidden="true" />
                </div>
                <span className="aigc-module__no">MODULE {m.no}</span>
                <h3 className="aigc-module__title">{m.title}</h3>
                <p className="aigc-module__desc">{m.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 板块二：面向人群 */
export function PersonasSection() {
  return (
    <section className="aigc-section" id="personas">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="面向人群"
          title={
            <>
              谁适合参与<em>本次商业实践实训</em>
            </>
          }
          lede="无论此刻的起点在哪里，实训都围绕「能拿出手的商业作品」这一条主线展开。"
        />

        <div className="aigc-grid-5">
          {PERSONAS.map((p, i) => {
            return (
              <Reveal key={p.title} delay={i * 80}>
                <TiltCard className="aigc-persona">
                  <div className="aigc-persona__art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.illus} alt="" loading="lazy" aria-hidden="true" />
                  </div>
                  <h3 className="aigc-persona__title">{p.title}</h3>
                  <p className="aigc-persona__desc">{p.desc}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 板块三：实践收获 */
export function GainsSection() {
  return (
    <section className="aigc-section" id="gains">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="实践收获"
          title={
            <>
              完成全部实践，<em>你将收获</em>
            </>
          }
        />

        <div className="aigc-gains">
          <Reveal variant="left">
            <div className="aigc-gains__list">
              {GAINS.map((g) => (
                <div className="aigc-gain" key={g.title}>
                  <span className="aigc-gain__tick">
                    <IconCheck />
                  </span>
                  <div className="aigc-gain__body">
                    <p className="aigc-gain__text">{g.title}</p>
                    <p className="aigc-gain__desc">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="aigc-gains__visual">
              <span className="aigc-gains__eyebrow">{GAINS_PORTFOLIO.eyebrow}</span>
              <h3 className="aigc-gains__title">{GAINS_PORTFOLIO.title}</h3>
              <p className="aigc-gains__desc">{GAINS_PORTFOLIO.desc}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-gains__illustration"
                src={EDU_ASSETS.gainsPortfolio}
                alt="AIGC 项目作品集、设计源文件、项目过程文档、成片视频与结业证书"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* 板块四：导师阵容 */
export function MentorsSection() {
  return (
    <section className="aigc-section" id="mentors">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="导师阵容"
          title={
            <>
              实战派导师天团，<em>手把手带你落地</em>
            </>
          }
          lede={MENTOR_META.sub}
        />

        <Reveal>
          <p className="aigc-mentor-group">{MENTOR_META.eyebrow}</p>
        </Reveal>

        <div className="aigc-grid-4 aigc-mentor-grid">
          {MENTORS.map((m, i) => (
            <Reveal key={m.name} delay={i * 100}>
              <TiltCard className="aigc-mentor">
                <div className="aigc-mentor__portrait">
                  <span className="aigc-mentor__ring" aria-hidden />
                  <span className="aigc-mentor__mock">{m.title}</span>
                </div>
                <div className="aigc-mentor__body">
                  <p className="aigc-mentor__name">{m.name}</p>
                  <p className="aigc-mentor__role">{m.role}</p>
                  <p className="aigc-mentor__skill">擅长：{m.skill}</p>
                  <p className="aigc-mentor__quote">「{m.quote}」</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="aigc-mentor-notes">
          <Reveal variant="left">
            <div className="aigc-mentor-note aigc-mentor-note--guest">
              <span className="aigc-mentor-note__mark" aria-hidden>01</span>
              <div>
                <h3>{MENTOR_META.guestTitle}</h3>
                <p>{MENTOR_META.guestDesc}</p>
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" delay={100}>
            <div className="aigc-mentor-note aigc-mentor-note--model">
              <span className="aigc-mentor-note__mark" aria-hidden>02</span>
              <div>
                <h3>{MENTOR_META.modelTitle}</h3>
                <p>{MENTOR_META.modelDesc}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* 板块五：学员作品 */
export function WorksSection() {
  return (
    <section className="aigc-section" id="works">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="学员案例"
          title={
            <>
              <em>万象元生 × 深圳电影制片厂</em>线下实训营项目作品
            </>
          }
          lede="按项目分类浏览实训营产出的真实商业案例，每次只展示两行，支持翻页查看与点击放大。"
        />
        <WorksGrid />
      </div>
    </section>
  );
}

/* 板块六：就业案例 + 岗位图谱 */
export function CasesSection() {
  return (
    <section className="aigc-section" id="cases">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="就业去向"
          title={
            <>
              学员<em>实践就业去向</em>
            </>
          }
          lede="按住卡片可左右拖动查看更多。"
        />

        <CaseRail />

        <Reveal>
          <div className="aigc-stats">
            {CASE_STATS.map((s) => (
              <div className="aigc-stat" key={s.label}>
                <p className="aigc-stat__num">
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="aigc-stat__label">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h3
            style={{
              marginTop: 72,
              fontSize: 'clamp(19px, 2.6vw, 24px)',
              fontWeight: 900,
            }}
          >
            AIGC 商业创作岗位图谱
          </h3>
        </Reveal>

        <div className="aigc-grid-4">
          {JOBS.map((j, i) => (
            <Reveal key={j.name} delay={i * 80}>
              <TiltCard className="aigc-job">
                <p className="aigc-job__name">{j.name}</p>
                <p className="aigc-job__pay">
                  {j.pay} <span className="aigc-job__paylabel">{j.payLabel}</span>
                </p>
                <span className="aigc-job__bar">
                  <i style={{ ['--w' as string]: j.width }} />
                </span>
                <p className="aigc-job__dir">{j.dir}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="aigc-disclaimer">{JOBS_DISCLAIMER}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* 板块七：企业实力（全站唯一暖金区） */
export function EndorsementSection() {
  return (
    <section className="aigc-section aigc-endorse" id="endorsement">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="企业实力"
          title={
            <>
              方直科技旗下<em>专注 AIGC 商业实践</em>
            </>
          }
        />

        <Reveal>
          <p className="aigc-endorse__lockup-eyebrow">{ENDORSE_LOCKUP.eyebrow}</p>
          <div className="aigc-endorse__lockup">
            <div className="aigc-endorse__party">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-endorse__party-logo"
                src={EDU_ASSETS.fangzhiLogo}
                alt="方直科技 · 万象元生"
              />
              <p className="aigc-endorse__party-name">{ENDORSE_LOCKUP.fangzhi.name}</p>
              {ENDORSE_LOCKUP.fangzhi.meta.map((line) => (
                <p className="aigc-endorse__party-meta" key={line}>
                  {line}
                </p>
              ))}
            </div>

            <span className="aigc-endorse__divider" aria-hidden />

            <div className="aigc-endorse__party">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-endorse__party-logo aigc-endorse__party-logo--szfs"
                src={EDU_ASSETS.szfsLogo}
                alt="深圳电影制片厂有限公司"
              />
              <p className="aigc-endorse__party-name">{ENDORSE_LOCKUP.szfs.name}</p>
              {ENDORSE_LOCKUP.szfs.meta.map((line) => (
                <p className="aigc-endorse__party-meta" key={line}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <p className="aigc-endorse__summary">{ENDORSE_LOCKUP.summary}</p>
        </Reveal>

        <div className="aigc-endorse__grid">
          <Reveal variant="left">
            <div className="aigc-endorse__id">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="aigc-endorse__logo" src={aigcImageUrl(AIGC_MEDIA.brandFangzhiPath)} alt="方直科技" />
              <p className="aigc-endorse__codelabel" style={{ marginTop: 22 }}>
                股票代码
              </p>
              <p className="aigc-endorse__code">300235</p>
              <p className="aigc-endorse__slogan">AIGC 商业人才培育战略级项目</p>
              <p className="aigc-endorse__intro">
                1993 年成立｜深交所 A 股上市教育科技企业，
                全资子公司方直智胜负责万象元生项目运营。
              </p>
            </div>
          </Reveal>

          <Reveal variant="right" delay={110}>
            <div>
              {ENDORSE_ADVANTAGES.map((a) => (
                <div className="aigc-adv" key={a}>
                  <span className="aigc-adv__mark"><IconCheck size={14} /></span>
                  <span className="aigc-adv__text">{a}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="aigc-badges">
          {ENDORSE_BADGES.map((b, i) => {
            const Icon = BADGE_ICONS[b.icon];
            return (
              <Reveal key={b.label} delay={i * 90}>
                <div className="aigc-badge">
                  <Icon className="aigc-badge__ico" />
                  {b.label}
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={80}>
          <div className="aigc-endorse__shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aigcImageUrl(AIGC_MEDIA.brandPlaquesPath)}
              alt="鲲鹏应用联合实验室、博士后创新实践基地、广东省智能教学工程技术研究中心牌匾"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* 板块八：核心转化区 */
export function FinalCtaSection() {
  return (
    <section className="aigc-section aigc-final" id="join">
      <span className="aigc-final__halo" aria-hidden />
      <div className="aigc-shell">
        <Reveal>
          <span className="aigc-eyebrow">开启你的 AIGC 创作实践之路</span>
          <h2 className="aigc-final__title">
            立即预约免费公开课，<em style={{ fontStyle: 'normal', color: 'var(--acid)' }}>提前锁定实训名额</em>
          </h2>
          <p className="aigc-final__sub">
            深入了解课程全貌，获取专属学习规划，与导师直接沟通。
          </p>

          <div className="aigc-final__cta">
            <CtaButton source="kit">免费领取实训资料包</CtaButton>
            <CtaButton source="openclass">预约公开课</CtaButton>
            <CtaButton source="advisor" variant="ghost">
              添加顾问 1v1 咨询
            </CtaButton>
          </div>

          <p className="aigc-final__note">
            2026 秋季实训营 · 小班教学 ｜ 名额有限，预约从速
            <br />
            预约公开课即赠：《AIGC 商业实训项目大纲》+ 专属学习规划 · 免费辅导
          </p>
        </Reveal>
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
            <div className="aigc-nav__brand" style={{ marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aigcImageUrl(AIGC_MEDIA.brandMarkPath)} alt="" width={24} height={24} />
              万象元生
            </div>
            <p className="aigc-footer__co">
              万象元生 © 2026 版权所有
              <br />
              运营主体：深圳市方直智胜科技有限公司（方直科技［300235］旗下全资子公司）
            </p>
          </div>

          <div className="aigc-footer__links">
            <a href={siteConfig.icpUrl} target="_blank" rel="noreferrer">
              {siteConfig.icp}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
