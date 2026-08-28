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
      <main>
        <Hero />
        <MarqueeStrip />
        <ModulesSection />
        <PersonasSection />
        <GainsSection />
        <MentorsSection />
        <WorksSection />
        <CasesSection />
        <EndorsementSection />
        <FinalCtaSection />
      </main>
    </EduShell>
  );
}
