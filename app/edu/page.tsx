import { Hero } from '@/components/aigc/Hero';
import { LeadProvider, MobileDock } from '@/components/aigc/LeadProvider';
import { Nav } from '@/components/aigc/Nav';
import {
  Atmosphere,
  CasesSection,
  EndorsementSection,
  FinalCtaSection,
  GainsSection,
  MarqueeStrip,
  MentorsSection,
  ModulesSection,
  PersonasSection,
  PartnershipSection,
  SiteFooter,
  WorksSection,
} from '@/components/aigc/sections';

export default function AigcLandingPage() {
  return (
    <div className="aigc-root">
      <LeadProvider>
        <Atmosphere />
        <Nav />
        <main>
          <Hero />
          <PartnershipSection />
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
        <SiteFooter />
        <MobileDock />
      </LeadProvider>
    </div>
  );
}
