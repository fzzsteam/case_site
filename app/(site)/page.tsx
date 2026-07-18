import { HomeExperience } from "@/components/home/home-experience";
import { listCases } from "@/lib/cases/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const caseStudies = await listCases();
  return <HomeExperience caseStudies={caseStudies} />;
}
