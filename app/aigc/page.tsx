import { AigcFooter } from '@/components/aigc/AigcFooter';
import { FluxReel } from '@/components/aigc/FluxReel';
import { LeadProvider, MobileDock } from '@/components/aigc/LeadProvider';
import { VideoHero } from '@/components/aigc/VideoHero';

export default function AigcLandingPage() {
  return (
    <LeadProvider>
      <div className="aigc-root">
        <VideoHero />
        <FluxReel />
        <AigcFooter />
        <MobileDock />
      </div>
    </LeadProvider>
  );
}
