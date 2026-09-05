import type { Metadata } from "next";
import { listCases } from "@/lib/cases/queries";
import { CaseListSection } from "@/components/cases/case-list-section";
import { caseCoverUrl } from "@/components/cases/case-card";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/content/site";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";

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
    keywords: [...(category ? [category] : []), "AIGC影像案例", "文旅宣传片", "文博数字化", "广告片", "短剧"],
    alternates: { canonical },
    openGraph: {
      title: `${title}｜${siteConfig.name}`,
      description,
      url: `${siteConfig.url}${canonical}`,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${title}｜${siteConfig.name}` }],
    },
    twitter: { card: "summary_large_image", title: `${title}｜${siteConfig.name}`, description, images: ["/opengraph-image"] },
  };
}

export default async function CasesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const caseStudies = await listCases();
  const activeCategory = category && caseStudies.some((item) => item.category === category) ? category : "全部";
  const filtered = activeCategory === "全部" ? caseStudies : caseStudies.filter((item) => item.category === activeCategory);
  const listName = activeCategory === "全部" ? "万象元生案例作品" : `万象元生${activeCategory}案例`;

  return (
    <div className="case-list-page">
      <JsonLd data={breadcrumbJsonLd([{ name: "首页", url: "/" }, { name: "案例作品", url: "/cases" }, ...(activeCategory === "全部" ? [] : [{ name: activeCategory }])])} />
      <JsonLd data={itemListJsonLd(listName, filtered.map((item) => ({ name: item.title, url: `/cases/${item.slug}`, image: caseCoverUrl(item.coverPath) })))} />
      <header className="case-list-header">
        <span>PROJECTS</span>
        <h1>案例作品</h1>
        <p>城市文旅、博物馆与品牌方的 AIGC 影像案例，涵盖宣传片、短剧、广告片与 IP 创造。</p>
      </header>
      <CaseListSection caseStudies={caseStudies} activeCategory={activeCategory} />
    </div>
  );
}
