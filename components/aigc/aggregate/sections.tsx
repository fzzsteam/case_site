import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  Eye,
  Film,
  FlaskConical,
  FolderOpen,
  Gift,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  Link2,
  MessageSquare,
  PenTool,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  CASES,
  CASE_STATS,
  ENDORSE_ADVANTAGES,
  ENDORSE_BADGES,
  ENDORSE_LOCKUP,
  GAINS,
  GAINS_PORTFOLIO,
  GUEST_MENTORS,
  HERO,
  LEAD_COPY,
  JOBS,
  JOBS_DISCLAIMER,
  MENTORS,
  MENTOR_META,
  MODULES,
  PERSONAS,
  WORKS,
  type MentorProfile,
} from '@/components/aigc/content';
import { aigcImageUrl } from '@/components/aigc/media';
import { ParticleArt, SectionHeading } from './primitives';
import { AggregateCtaButton, BrandLockup } from './shell';

const trainingIcons = [Compass, Eye, ImageIcon, Film, ShoppingBag, Scissors, Layers3];
// 关键词仅精简自 MODULES，不添加具体软件、模块天数或额外教学承诺。
const trainingFocus = [
  '商业市场 / 岗位认知',
  '构图 / 光影 / 色彩',
  '提示词 / 商业海报 / IP',
  '脚本 / 数字人 / 视频',
  '电商视觉 / 短视频内容',
  '素材加工 / 商业成片',
  '完整项目 / 个人作品集',
];
const personaIcons = [GraduationCap, BriefcaseBusiness, Compass, PenTool, Layers3];
const personaLabels = ['STUDENTS', 'PRACTITIONERS', 'CAREER CHANGERS', 'CREATORS', 'SIDE PROJECTS'];
const gainIcons = [Gift, FolderOpen, Globe2, Award, Users, MessageSquare];
const jobIcons = [PenTool, Film, BriefcaseBusiness, Sparkles];
const badgeIcons = { shield: ShieldCheck, chip: Cpu, link: Link2, lab: FlaskConical };
const portfolioImages = WORKS.filter((work) => /\.(png|jpe?g|webp)$/i.test(work.path)).slice(0, 3);

function ProfileBio({ profile }: { profile: MentorProfile }) {
  return (
    <details className="ag-faculty-bio">
      <summary aria-label={`查看${profile.name}的完整简介`}>
        <span>查看导师简介</span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="ag-faculty-bio-copy">
        {profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </details>
  );
}

export function TrainingSection() {
  return (
    <section id="paths" className="ag-training-section" aria-labelledby="ag-training-title">
      <div className="aggregate-container">
        <div className="ag-training-heading">
          <div className="ag-training-art" aria-hidden="true"><ParticleArt variant="wave" /></div>
          <SectionHeading
            number="02"
            id="ag-training-title"
            eyebrow="THE TRAINING PATH"
            title="训练路径"
            description="从认知到创作，再到完整商业项目。31 天，把每一步学习沉淀为作品。"
          />
          <p className="ag-training-heading-note">从想象到现实<br />从学习到作品</p>
        </div>

        <div className="ag-training-index" aria-label="实训概览">
          <span><b>31</b> 天线下实训</span>
          <span><b>07</b> 个循序进阶模块</span>
          <span><FolderOpen size={17} aria-hidden="true" /> 完整商业作品集</span>
          <span className="ag-training-index-note">LEARN → CREATE → DELIVER</span>
        </div>

        <ol className="ag-training-path">
          {MODULES.map((module, index) => {
            const Icon = trainingIcons[index];
            return (
              <li key={module.no} className="ag-training-step">
                <span className="ag-training-number">{module.no}</span>
                <span className="ag-training-node" aria-hidden="true" />
                <div className="ag-training-module">
                  <h3>{module.title}</h3>
                  <p>{module.desc}</p>
                </div>
                <div className="ag-training-focus">
                  <Icon size={24} strokeWidth={1.3} aria-hidden="true" />
                  <div><span>训练重点</span><p>{trainingFocus[index]}</p></div>
                </div>
                <ArrowDown className="ag-training-direction" size={19} strokeWidth={1.2} aria-hidden="true" />
              </li>
            );
          })}
        </ol>

        <div className="ag-training-bottom">
          <div className="ag-training-actions">
            <AggregateCtaButton source="kit">免费领取实训资料包</AggregateCtaButton>
            <AggregateCtaButton source="openclass" variant="outline">预约公开课</AggregateCtaButton>
          </div>
          <p>了解项目大纲，梳理适合你的学习路径。<br /><span>从第一步开始，走向完整作品。</span></p>
        </div>
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <section id="audience" className="ag-audience-section" aria-labelledby="ag-audience-title">
      <div className="aggregate-container">
        <SectionHeading
          number="03"
          id="ag-audience-title"
          eyebrow="YOUR STARTING POINT. YOUR NEXT CHAPTER."
          title="适合人群与实践收获"
          description="不同的起点，一样可以用作品讲述自己的下一步。"
        />
        <div className="ag-audience-layout">
          <div className="ag-audience-personas">
            <div className="ag-audience-subheading"><h3>从你出发</h3><span>FOR WHOM / 05</span></div>
            <ol className="ag-audience-persona-list">
              {PERSONAS.map((persona, index) => {
                const Icon = personaIcons[index];
                return (
                  <li key={persona.title} className="ag-audience-persona">
                    <span className="ag-audience-persona-number">0{index + 1}</span>
                    <Icon size={31} strokeWidth={1.15} aria-hidden="true" />
                    <div><h4>{persona.title}</h4><p>{persona.desc}</p><span>{personaLabels[index]}</span></div>
                  </li>
                );
              })}
            </ol>
            <div className="ag-audience-advice">
              <p>让你的背景，成为创作的起点。</p>
              <AggregateCtaButton source="advisor" variant="quiet">咨询适合我的学习方向</AggregateCtaButton>
            </div>
          </div>

          <div className="ag-audience-gains">
            <div className="ag-audience-subheading"><h3>带着成果离开</h3><span>TAKEAWAYS / 06</span></div>
            <div className="ag-audience-featured-gains">
              <article className="ag-audience-portfolio">
                <span className="ag-audience-gain-label">01 / PORTFOLIO</span>
                <h4>{GAINS[1].title}</h4>
                <p>{GAINS[1].desc}</p>
                <div className="ag-audience-portfolio-art">
                  <div className="ag-audience-portfolio-type" aria-hidden="true">AI FILM<br /><span>PORTFOLIO</span></div>
                  <div className="ag-audience-portfolio-images">
                    {portfolioImages.map((work) => (
                      // 已有学员作品仅用于呈现作品集内容，不冒充证书或个人网站截图。
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={work.path} src={aigcImageUrl(work.path)} alt={work.cat} width={200} height={250} loading="lazy" decoding="async" />
                    ))}
                  </div>
                  <span className="ag-audience-portfolio-caption">学员作品选辑</span>
                </div>
              </article>
              <article className="ag-audience-website">
                <span className="ag-audience-gain-label">02 / CASE WEBSITE</span>
                <h4>{GAINS[2].title}</h4>
                <p>{GAINS[2].desc}</p>
                <div className="ag-audience-website-art" aria-hidden="true">
                  <Globe2 size={66} strokeWidth={0.6} />
                  <span>YOUR WORK.<br /><b>YOUR SPACE.</b></span>
                  <div><i /><i /><i /></div>
                </div>
                <Link href="/edu/aggregate/talent" className="ag-audience-website-link">探索人才与作品档案 <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </article>
            </div>
            <div className="ag-audience-other-gains">
              {[3, 4, 5, 0].map((gainIndex, index) => {
                const gain = GAINS[gainIndex];
                const Icon = gainIcons[gainIndex];
                return (
                  <article className="ag-audience-gain" key={gain.title}>
                    <div className="ag-audience-gain-top"><span>0{index + 3}</span><Icon size={24} strokeWidth={1.2} aria-hidden="true" /></div>
                    <h4>{gain.title}</h4>
                    <p>{gain.desc}</p>
                  </article>
                );
              })}
            </div>
            <p className="ag-audience-portfolio-note"><FolderOpen size={18} aria-hidden="true" />{GAINS_PORTFOLIO.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResultsSection() {
  return (
    <section id="results" className="ag-results-section" aria-labelledby="ag-results-title">
      <div className="aggregate-container">
        <div className="ag-results-heading">
          <div className="ag-results-art" aria-hidden="true"><ParticleArt variant="cloud" /></div>
          <SectionHeading
            number="05"
            id="ag-results-title"
            eyebrow="RESULTS & CAREER REFERENCE"
            title="让作品，连接下一步"
            description="看看不同背景的学员如何走向新的创作方向，找到值得探索的岗位路径。"
          />
        </div>

        <div className="ag-results-stats" aria-label="学员结果统计">
          {CASE_STATS.map((stat) => (
            <div key={stat.label} className="ag-results-stat"><p>{stat.to}<span>{stat.suffix}</span></p><span>{stat.label}</span></div>
          ))}
          <p className="ag-results-stats-note">每一条路径，<br />从自己的作品开始。<ArrowDown size={24} strokeWidth={1} aria-hidden="true" /></p>
        </div>

        <div className="ag-results-subheading"><h3>学习之后，他们去了哪里</h3><span>CASE ROUTES / 04</span></div>
        <div className="ag-results-cases">
          {CASES.map((item, index) => (
            <article className="ag-results-case" key={item.dest}>
              <div className="ag-results-case-top"><span>0{index + 1}</span><span>{item.tags[1]}</span></div>
              <h4>{item.tags[0]}</h4>
              <div className="ag-results-case-route"><ArrowDown size={22} strokeWidth={1} aria-hidden="true" /><p>{item.dest}</p></div>
              <blockquote>“{item.quote}”</blockquote>
            </article>
          ))}
        </div>

        <div className="ag-results-subheading ag-results-jobs-heading"><h3>岗位与收入参考</h3><span>ROLE REFERENCE / 04</span></div>
        <div className="ag-results-jobs">
          {JOBS.map((job, index) => {
            const Icon = jobIcons[index];
            return (
              <article className="ag-results-job" key={job.name}>
                <div className="ag-results-job-title"><Icon size={31} strokeWidth={1.25} aria-hidden="true" /><h4>{job.name}</h4></div>
                <p>{job.dir}</p>
                <div className="ag-results-job-pay"><span>{job.payLabel}</span><strong>{job.pay}</strong></div>
              </article>
            );
          })}
        </div>
        <p className="ag-results-disclaimer">{JOBS_DISCLAIMER}</p>

        <div className="ag-results-next">
          <div><span>FIND YOUR DIRECTION</span><h3>你的下一步，从哪里开始？</h3><p>结合你的背景与目标，聊聊学习方向和职业规划。</p></div>
          <AggregateCtaButton source="advisor" variant="outline">获取专属学习建议</AggregateCtaButton>
        </div>
      </div>
    </section>
  );
}

export function FacultySection() {
  return (
    <section id="mentors" className="ag-faculty-section" aria-labelledby="ag-faculty-title">
      <div className="aggregate-container">
        <SectionHeading
          number="06"
          id="ag-faculty-title"
          eyebrow="PEOPLE & INDUSTRY"
          title="和创作者一起，走进产业"
          description={MENTOR_META.modelDesc}
        />

        <div className="ag-faculty-block ag-faculty-block-teaching">
          <div className="ag-faculty-aside"><span>01 / TEACHING TEAM</span><h3><em>教研</em>团队<br />导师阵容</h3><p>{MENTOR_META.sub}</p><span className="ag-faculty-count">05 <i>MENTORS</i></span></div>
          <div className="ag-faculty-mentors">
            {MENTORS.map((mentor, index) => (
              <article className="ag-faculty-mentor" key={mentor.name}>
                <div className="ag-faculty-name-art" aria-hidden="true"><span>0{index + 1}</span><b>{mentor.name.slice(0, 1)}</b><i>CREATIVE<br />FACULTY</i></div>
                <div className="ag-faculty-mentor-info"><h4>{mentor.name}</h4><p>{mentor.role}</p><ProfileBio profile={mentor} /></div>
              </article>
            ))}
          </div>
        </div>

        <div className="ag-faculty-block">
          <div className="ag-faculty-aside"><span>02 / INDUSTRY EXPERTS</span><h3>特邀<br /><em>影视</em>专家</h3><p>{MENTOR_META.guestDesc}</p></div>
          <div className="ag-faculty-experts">
            {GUEST_MENTORS.map((mentor, index) => (
              <article className="ag-faculty-expert" key={mentor.name}>
                <span className="ag-faculty-expert-index">EXPERT / 0{index + 1}</span>
                <h4>{mentor.name}</h4><p>{mentor.role}</p>
                <ProfileBio profile={mentor} />
              </article>
            ))}
          </div>
        </div>

        <div className="ag-faculty-company">
          <div className="ag-faculty-company-brand">
            <div className="ag-faculty-aside"><span>03 / INDUSTRY CONNECTION</span><h3><em>教育科技</em><br />与影视产业相遇</h3></div>
            <BrandLockup />
            <div className="ag-faculty-brand-meta"><p>{ENDORSE_LOCKUP.fangzhi.name}<span>{ENDORSE_LOCKUP.fangzhi.meta.join(' · ')}</span></p><p>{ENDORSE_LOCKUP.szfs.name}</p></div>
            <p className="ag-faculty-company-proof">{HERO.tagline}</p>
          </div>
          <ol className="ag-faculty-advantages">
            {ENDORSE_ADVANTAGES.map((advantage, index) => <li key={advantage}><span>0{index + 1}</span><p>{advantage}</p></li>)}
          </ol>
        </div>
        <ul className="ag-faculty-badges" aria-label="企业与产教融合资质">
          {ENDORSE_BADGES.map((badge) => {
            const Icon = badgeIcons[badge.icon];
            return <li key={badge.label}><Icon size={26} strokeWidth={1.2} aria-hidden="true" /><span>{badge.label}</span></li>;
          })}
        </ul>
      </div>
    </section>
  );
}

export function FinalSection() {
  return (
    <section id="contact" className="ag-final-section" aria-labelledby="ag-final-title">
      <div className="ag-final-art" aria-hidden="true"><ParticleArt variant="wave" /></div>
      <div className="aggregate-container ag-final-inner">
        <div className="ag-final-intro">
          <p className="ag-final-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2 id="ag-final-title">让下一份作品，<br />成为你的<em>新起点。</em></h2>
          <p className="ag-final-description">{HERO.sub}</p>
          <p className="ag-final-proof">线下沉浸式集训 / 商用作品集产出</p>
          <Link className="ag-final-talent-link" href="/edu/aggregate/talent">先看看创作者的作品档案<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="ag-final-conversion">
          <span className="ag-final-conversion-label">START WITH A CONVERSATION</span>
          <h3>先了解，再出发。</h3>
          <p>领取实训资料包，和课程顾问聊聊你的创作目标。</p>
          <ul>{LEAD_COPY.kit.benefits.map((benefit) => <li key={benefit}><Check size={15} aria-hidden="true" />{benefit}</li>)}</ul>
          <div className="ag-final-actions">
            <AggregateCtaButton source="kit">免费领取实训资料包</AggregateCtaButton>
            <div><AggregateCtaButton source="openclass" variant="outline">预约免费公开课</AggregateCtaButton><AggregateCtaButton source="advisor" variant="quiet">专属顾问咨询</AggregateCtaButton></div>
          </div>
        </div>
        <div className="ag-final-bottom"><span>AI × FILM × BUSINESS</span><p>把想象变成作品，把作品带向真实世界。</p><a href="#paths" aria-label="返回训练路径"><ArrowRight size={17} aria-hidden="true" />回看训练路径</a></div>
      </div>
    </section>
  );
}
