import type { Metadata } from "next";
import { listCases } from "@/lib/cases/queries";
import { CaseListSection } from "@/components/cases/case-list-section";
import { siteConfig } from "@/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
  const { category } = await searchParams;
  const canonical = category ? `/cases?category=${encodeURIComponent(category)}` : "/cases";
  const title = category ? `${category}案例` : "案例作品";
  const description = category
    ? `万象元生「${category}」类型的 AIGC 影像案例作品集，涵盖城市文旅、博物馆与品牌方合作项目。`
    : "浏览万象元生服务过的文旅、博物馆与品牌 AIGC 影像案例，涵盖城市宣传片、文旅短剧、广告片与 IP 创造。";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title}｜${siteConfig.name}`, description, url: `${siteConfig.url}${canonical}` },
  };
}

export default async function CasesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const caseStudies = await listCases();
  const activeCategory = category && caseStudies.some((item) => item.category === category) ? category : "全部";

  return (
    <div className="case-list-page">
      <header className="case-list-header">
        <span>PROJECTS</span>
        <h1>案例作品</h1>
        <p>城市文旅、博物馆与品牌方的 AIGC 影像案例，涵盖宣传片、短剧、广告片与 IP 创造。</p>
      </header>
      <CaseListSection caseStudies={caseStudies} activeCategory={activeCategory} />
    </div>
  );
}
