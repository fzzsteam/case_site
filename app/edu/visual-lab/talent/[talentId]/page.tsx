import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { aigcImageUrl } from '@/components/aigc/media';
import { EduShell } from '@/components/aigc/visual-lab/EduShell';
import { Reveal } from '@/components/aigc/primitives';
import { TalentWorksGrid } from '@/components/talent/talent-works-grid';
import { getTalentProfile } from '@/lib/talent/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ talentId: string }> }): Promise<Metadata> {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  return talent ? { title: `${talent.name} · 人才作品集`, description: talent.intro } : {};
}

export default async function VisualLabTalentDetailPage({ params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  if (!talent) notFound();

  return (
    <EduShell className="aigc-talent-root">
      <main id="main-content" className="aigc-profile-page">
        <section className="aigc-profile-hero" aria-labelledby="talent-profile-name">
          <div className="aigc-shell">
            <div className="aigc-profile-hero__topline">
              <Link href="/edu/visual-lab/talent" className="aigc-back-link"><ArrowLeft size={15} aria-hidden="true" />返回人才集市</Link>
              <span className="aigc-section-index">TALENT ARCHIVE / {talent.id.toUpperCase()}</span>
            </div>
            <div className="aigc-profile-hero__grid">
              <Reveal variant="scale" className="aigc-profile-index-card">
                <span className="aigc-profile-index-card__label">ARCHIVE / {String(talent.works.length).padStart(2, '0')}</span>
                {talent.avatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={aigcImageUrl(talent.avatarPath)} alt={`${talent.name}头像`} />
                ) : <span className="aigc-profile-index-card__initial">{talent.name.slice(0, 1)}</span>}
                <span className="aigc-profile-index-card__caption">WORK → TALENT<br />FIELD RECORD</span>
              </Reveal>

              <Reveal className="aigc-profile-hero__copy">
                <span className="aigc-profile-hero__kicker">CREATOR PROFILE / {String(talent.works.length).padStart(2, '0')} WORKS</span>
                <h1 id="talent-profile-name">{talent.name}</h1>
                <p className="aigc-profile-hero__role">{talent.role}</p>
                <p className="aigc-profile-hero__intro">{talent.intro}</p>
                <div className="aigc-profile-meta">
                  {talent.location && <span><MapPin size={15} aria-hidden="true" />{talent.location}</span>}
                  <span><BriefcaseBusiness size={15} aria-hidden="true" />{talent.works.length} 个案例</span>
                </div>
                <div className="aigc-profile-skills">{talent.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </Reveal>
            </div>
          </div>
          <span className="aigc-profile-hero__stamp" aria-hidden="true">TALENT / {talent.id.toUpperCase()}</span>
        </section>

        <section className="aigc-section aigc-profile-note" aria-labelledby="talent-about-title">
          <div className="aigc-shell aigc-profile-note__grid">
            <Reveal>
              <span className="aigc-section-index">01 / PROFILE NOTE</span>
              <h2 id="talent-about-title" className="aigc-h2">把创意变成<br /><em>可交付的作品。</em></h2>
            </Reveal>
            <Reveal variant="right">
              <article className="aigc-profile-note__card">
                <div className="aigc-profile-note__card-topline"><span>CREATOR STATEMENT</span><ArrowUpRight size={16} /></div>
                <p>{talent.bio}</p>
                <div className="aigc-profile-note__line" aria-hidden="true" />
                <small>从创意构思，到视觉制作，再到内容交付。</small>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="aigc-section aigc-profile-works" id="talent-works" aria-labelledby="talent-works-title">
          <div className="aigc-shell">
            <div className="aigc-profile-works__header">
              <div><span className="aigc-section-index">02 / SELECTED WORKS</span><h2 id="talent-works-title" className="aigc-h2">案例<span>作品。</span></h2><p className="aigc-lede">视频、图片与网站作品，按案例记录创作能力。</p></div>
              <div className="aigc-profile-works__count"><span>OPEN PORTFOLIO</span><strong>{String(talent.works.length).padStart(2, '0')}</strong><small>已收录案例</small></div>
            </div>
            <TalentWorksGrid talent={talent} />
          </div>
        </section>
      </main>
    </EduShell>
  );
}
