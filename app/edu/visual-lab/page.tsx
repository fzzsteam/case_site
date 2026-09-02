import { Hero } from '@/components/aigc/visual-lab/Hero';
import { EduShell } from '@/components/aigc/visual-lab/EduShell';
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
} from '@/components/aigc/visual-lab/sections';

export default function VisualLabLandingPage() {
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
