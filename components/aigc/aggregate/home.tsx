import { AggregateShell } from './shell';
import { AggregateHero } from './hero';
import { WorksArchive } from './works';
import { AudienceSection, FacultySection, FinalSection, ResultsSection, TrainingSection } from './sections';

export function AggregateHome() {
  return <AggregateShell><main id="aggregate-main">
    <AggregateHero /><TrainingSection /><AudienceSection /><WorksArchive />
    <ResultsSection /><FacultySection /><FinalSection />
  </main></AggregateShell>;
}
