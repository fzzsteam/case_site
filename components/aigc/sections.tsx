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

/* 板块一：实训体系 */
export function ModulesSection() {
  return (
    <section className="aigc-section" id="modules">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="实训体系"
          title={
            <>
              七大模块，覆盖 <em>AIGC 创作全流程</em>
            </>
          }
          lede="从行业认知到项目交付，每个模块都有明确产出。"
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
              适合哪些人<em>加入</em>
            </>
          }
          lede="按目标选择学习路径，最终沉淀为可展示作品。"
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
              顺利结业，<em>尊享六大实训权益</em>
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
function MentorCard({
  mentor,
  index,
  label,
  delay,
}: {
  mentor: MentorProfile;
  index: number;
  label: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <TiltCard className="aigc-mentor">
        <div className="aigc-mentor__head">
          <span className="aigc-mentor__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="aigc-mentor__head-label">{label}</span>
        </div>
        <div className="aigc-mentor__body">
          <p className="aigc-mentor__role">{mentor.role}</p>
          <p className="aigc-mentor__name">{mentor.name}</p>
          <div className="aigc-mentor__bio">
            {mentor.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="aigc-mentor__footer">
          <span>REAL-WORLD METHOD</span>
          <i aria-hidden="true" />
        </div>
      </TiltCard>
    </Reveal>
  );
}

export function MentorsSection() {
  return (
    <section className="aigc-section" id="mentors">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="导师阵容"
          title={
            <>
              教研导师与<em>产业导师</em>
            </>
          }
          lede={MENTOR_META.sub}
        />

        <Reveal>
          <p className="aigc-mentor-group">{MENTOR_META.eyebrow}</p>
        </Reveal>

        <div className="aigc-grid-4 aigc-mentor-grid aigc-mentor-grid--team">
          {MENTORS.map((m, i) => (
            <MentorCard
              key={m.name}
              mentor={m}
              index={i}
              label="TEACHING TEAM"
              delay={i * 100}
            />
          ))}
        </div>

        <Reveal>
          <p className="aigc-mentor-group aigc-mentor-group--guest">{MENTOR_META.guestTitle}</p>
        </Reveal>

        <div className="aigc-grid-4 aigc-mentor-grid aigc-mentor-grid--guest">
          {GUEST_MENTORS.map((m, i) => (
            <MentorCard
              key={m.name}
              mentor={m}
              index={i}
              label="SPECIAL EXPERT"
              delay={i * 100}
            />
          ))}
        </div>

        <div className="aigc-mentor-notes aigc-mentor-notes--single">
          <Reveal variant="right" delay={100}>
            <div className="aigc-mentor-note aigc-mentor-note--model">
              <span className="aigc-mentor-note__mark" aria-hidden>01</span>
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
              <em>真实商业案例</em>作品
            </>
          }
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
              学员<em>就业去向</em>
            </>
          }
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
            相关创作岗位
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
              企业主体与<em>影视产业合作</em>
            </>
          }
        />

        <Reveal>
          <div className="aigc-endorse__lockup">
            <div className="aigc-endorse__party aigc-endorse__party--company">
              <span className="aigc-endorse__party-kicker">上市公司主体</span>
              <div className="aigc-endorse__company-logo-plate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="aigc-endorse__company-logo"
                  src={EDU_ASSETS.fangzhiLogo}
                  alt={`${ENDORSE_LOCKUP.fangzhi.name}，${ENDORSE_LOCKUP.fangzhi.meta.join('，')}`}
                />
              </div>
            </div>

            <span className="aigc-endorse__divider" aria-hidden />

            <div className="aigc-endorse__party aigc-endorse__party--studio">
              <span className="aigc-endorse__party-kicker">影视产业合作方</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-endorse__studio-logo"
                src={EDU_ASSETS.szfsLogo}
                alt={ENDORSE_LOCKUP.szfs.name}
              />
            </div>
          </div>
        </Reveal>

        <div className="aigc-endorse__advantages">
          {ENDORSE_ADVANTAGES.map((a, i) => (
            <Reveal key={a} delay={i * 45}>
              <div className="aigc-adv">
                <span className="aigc-adv__mark"><IconCheck size={14} /></span>
                <span className="aigc-adv__text">{a}</span>
              </div>
            </Reveal>
          ))}
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
          <span className="aigc-eyebrow">预约公开课</span>
          <h2 className="aigc-final__title">
            了解课程安排，<em style={{ fontStyle: 'normal', color: 'var(--acid)' }}>提前锁定名额</em>
          </h2>

          <div className="aigc-final__cta">
            <CtaButton source="kit">免费领取实训资料包</CtaButton>
            <CtaButton source="openclass">预约公开课</CtaButton>
            <CtaButton source="advisor" variant="ghost">
              添加顾问 1v1 咨询
            </CtaButton>
          </div>

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
            <div className="aigc-footer__brand">方直智胜</div>
            <p className="aigc-footer__co">
              方直智胜 © 2026 版权所有
              <br />
              运营主体：深圳市方直智胜科技有限公司（方直科技［300235］旗下 AI 子公司）
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
