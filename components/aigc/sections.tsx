import type { ReactNode } from 'react';
import {
  CASE_STATS,
  ENDORSE_ADVANTAGES,
  ENDORSE_BADGES,
  GAINS,
  JOBS,
  JOBS_DISCLAIMER,
  MARQUEE_ITEMS,
  MENTORS,
  MODULES,
  PERSONAS,
} from './content';
import { BADGE_ICONS, IconCheck, PERSONA_ICONS } from './icons';
import { CountUp, Marquee, Reveal, TiltCard } from './primitives';
import { CtaButton } from './LeadProvider';
import { WorksGrid } from './Works';
import { CaseRail } from './Cases';

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

        <div className="aigc-grid-4">
          {PERSONAS.map((p, i) => {
            const Icon = PERSONA_ICONS[p.icon];
            return (
              <Reveal key={p.title} delay={i * 80}>
                <TiltCard className="aigc-persona">
                  <span className="aigc-persona__icon">
                    <Icon />
                  </span>
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
            <div>
              {GAINS.map((g) => (
                <div className="aigc-gain" key={g}>
                  <span className="aigc-gain__tick">
                    <IconCheck />
                  </span>
                  <span className="aigc-gain__text">{g}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="aigc-gains__visual">
              <div className="aigc-gains__visual-inner">
                <div>
                  <p style={{ fontSize: 13, letterSpacing: '0.2em', color: 'var(--fg-3)' }}>
                    PORTFOLIO
                  </p>
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 'clamp(20px, 3.4vw, 30px)',
                      fontWeight: 900,
                      lineHeight: 1.4,
                    }}
                  >
                    实力提升 · 作品集打造
                    <br />
                    商业变现
                  </p>
                  <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--fg-2)' }}>
                    每个模块的产出都会沉淀进同一套作品集，
                    <br />
                    结业时你带走的是完整的商业交付物。
                  </p>
                </div>
              </div>
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
          lede="导师均来自广告、MCN 与商业插画一线，带的是自己正在做的项目，不是教材案例。"
        />

        <div className="aigc-grid-3">
          {MENTORS.map((m, i) => (
            <Reveal key={m.name} delay={i * 100}>
              <TiltCard className="aigc-mentor">
                <div className="aigc-mentor__portrait">
                  <span className="aigc-mentor__mock">占位形象</span>
                  <span className="aigc-mentor__ring" aria-hidden />
                  <span className="aigc-mentor__initial">{m.initial}</span>
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
          eyebrow="学员作品"
          title={
            <>
              学员<em>优秀作品集锦</em>
            </>
          }
          lede="以下作品均由学员在实训期间基于真实商业命题产出，点击可放大查看。"
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

/* 板块七：方直科技品牌背书（全站唯一暖金区） */
export function EndorsementSection() {
  return (
    <section className="aigc-section aigc-endorse" id="endorsement">
      <div className="aigc-shell">
        <SectionHead
          eyebrow="品牌背书"
          title={
            <>
              上市公司品牌背书，<em>品质与信任有保障</em>
            </>
          }
        />

        <div className="aigc-endorse__grid">
          <Reveal variant="left">
            <div className="aigc-endorse__id">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="aigc-endorse__logo" src="/aigc/brand/fangzhi.webp" alt="方直科技" />
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
                  <span className="aigc-adv__mark">✦</span>
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
              src="/aigc/brand/plaques.webp"
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
              <img src="/aigc/brand/mark.webp" alt="" width={24} height={24} />
              万象元生
            </div>
            <p className="aigc-footer__co">
              万象元生 © 2026 版权所有
              <br />
              深圳市方直智胜科技有限公司｜方直科技（300235）全资子公司
            </p>
          </div>

          <div className="aigc-footer__links">
            <a href="/privacy">隐私政策</a>
            <a href="/terms">服务条款</a>
            {/* TODO: 上线前替换为真实备案号 */}
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
              粤ICP备XXXXXXXX号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
