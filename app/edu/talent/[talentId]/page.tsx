import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { aigcImageUrl } from '@/components/aigc/media';
import { EduShell } from '@/components/aigc/EduShell';
import { Reveal } from '@/components/aigc/primitives';
import { TalentWorksGrid } from '@/components/talent/talent-works-grid';
import { getTalentProfile } from '@/lib/talent/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ talentId: string }> }): Promise<Metadata> {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  return talent ? { title: `${talent.name} · 人才作品集`, description: talent.intro } : {};
}

export default async function TalentDetailPage({ params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  if (!talent) notFound();

  return (
    <EduShell className="aigc-talent-root">
      <main className="aigc-talent-profile-page">
        <section className="aigc-talent-profile-hero" aria-labelledby="talent-profile-name">
          <div className="aigc-shell">
            <Link href="/edu/talent" className="aigc-talent-back">
              <ArrowLeft size={15} aria-hidden="true" />
              返回人才集市
            </Link>

            <div className="aigc-talent-profile-hero__layout">
              <Reveal variant="scale" className="aigc-talent-profile__avatar">
                {talent.avatarPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={aigcImageUrl(talent.avatarPath)} alt={`${talent.name}头像`} />
                ) : (
                  <span aria-hidden="true">{talent.name.slice(0, 1)}</span>
                )}
              </Reveal>

              <Reveal className="aigc-talent-profile__copy">
                <span className="aigc-eyebrow">TALENT PROFILE / {String(talent.works.length).padStart(2, '0')}</span>
                <h1 id="talent-profile-name">{talent.name}</h1>
                <p className="aigc-talent-profile__role">{talent.role}</p>
                <p className="aigc-talent-profile__intro">{talent.intro}</p>
                <div className="aigc-talent-profile__meta">
                  {talent.location && <span><MapPin size={15} aria-hidden="true" />{talent.location}</span>}
                  <span><BriefcaseBusiness size={15} aria-hidden="true" />{talent.works.length} 个案例</span>
                </div>
                <div className="aigc-talent-profile__skills">
                  {talent.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </Reveal>
            </div>
          </div>
          <span className="aigc-talent-profile-hero__mark" aria-hidden="true">TALENT / {talent.id.toUpperCase()}</span>
        </section>

        <section className="aigc-section aigc-talent-about" aria-labelledby="talent-about-title">
          <div className="aigc-shell aigc-talent-about__layout">
            <Reveal>
              <span className="aigc-eyebrow">ABOUT THE CREATOR</span>
              <h2 id="talent-about-title" className="aigc-h2">把创意变成<br /><em>可交付的作品</em></h2>
            </Reveal>
            <Reveal variant="right" className="aigc-card aigc-talent-about__card">
              <span className="aigc-talent-about__index">PROFILE NOTE / 01</span>
              <p>{talent.bio}</p>
              <span className="aigc-talent-about__line" aria-hidden="true" />
              <span className="aigc-talent-about__caption">从创意构思，到视觉制作，再到内容交付。</span>
            </Reveal>
          </div>
        </section>

        <section className="aigc-section aigc-talent-profile-works" id="talent-works" aria-labelledby="talent-works-title">
          <div className="aigc-shell">
            <div className="aigc-talent-profile-works__heading">
              <Reveal>
                <span className="aigc-eyebrow">SELECTED WORKS / {String(talent.works.length).padStart(2, '0')}</span>
                <h2 id="talent-works-title" className="aigc-h2">案例<em>作品</em></h2>
                <p className="aigc-lede">视频、图片与网站作品，按案例记录创作能力。</p>
              </Reveal>
            </div>
            <TalentWorksGrid talent={talent} />
          </div>
        </section>
      </main>
    </EduShell>
  );
}
