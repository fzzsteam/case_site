import { Hero } from '@/components/aigc/Hero';
import { EduShell } from '@/components/aigc/EduShell';
import {
  CasesSection,
  EndorsementSection,
  FinalCtaSection,
  GainsSection,
  MarqueeStrip,
  MentorsSection,
  ModulesSection,
  PersonasSection,
  WorksSection,
} from '@/components/aigc/sections';

export default function AigcLandingPage() {
  return (
    <EduShell>
      <main id="main-content" className="aigc-training-page">
        <Hero />
        <MarqueeStrip />
        <ModulesSection />
        <PersonasSection />
        <WorksSection />
        <CasesSection />
        <MentorsSection />
        <GainsSection />
        <EndorsementSection />
        <FinalCtaSection />
      </main>
    </EduShell>
  );
}
