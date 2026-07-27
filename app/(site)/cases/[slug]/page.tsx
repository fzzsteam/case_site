import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCaseBySlug } from "@/lib/cases/queries";
import { caseCoverUrl } from "@/components/cases/case-card";
import { CaseDetailPlayer } from "@/components/cases/case-detail-player";
import { siteConfig } from "@/content/site";

// 不使用 generateStaticParams：构建镜像时数据库不可达（见 Dockerfile），
// 详情页改为首次访问时按需渲染并缓存（ISR），避免构建阶段连接数据库。
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseBySlug(slug);
  if (!caseStudy) return {};
  const canonical = `/cases/${caseStudy.slug}`;
  const description = caseStudy.summary;
  return {
    title: caseStudy.title,
    description,
    alternates: { canonical },
    openGraph: { type: "video.other", title: `${caseStudy.title}｜${siteConfig.name}`, description, url: `${siteConfig.url}${canonical}`, images: [caseCoverUrl(caseStudy.coverPath)] },
  };
}

function toIsoDuration(seconds: number | null): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `PT${minutes}M${remainder}S`;
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseStudy = await getCaseBySlug(slug);
  if (!caseStudy) notFound();

  const canonical = `${siteConfig.url}/cases/${caseStudy.slug}`;
  const cover = `${siteConfig.url}${caseCoverUrl(caseStudy.coverPath)}`;
  const primaryEpisode = caseStudy.episodes[0];
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: caseStudy.title,
    description: caseStudy.summary,
    thumbnailUrl: [cover],
    uploadDate: caseStudy.createdAt.toISOString(),
    duration: toIsoDuration(primaryEpisode?.durationSeconds ?? null),
    embedUrl: canonical,
  };

  return (
    <div className="case-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <Link href="/cases" className="case-detail-back"><ArrowLeft size={16} /> 返回案例列表</Link>
      <div className="case-detail-layout">
        <div className="case-detail-info">
          <span className="eyebrow">PROJECT</span>
          <h1>{caseStudy.title}</h1>
          <span className="case-detail-category">{caseStudy.category}</span>
          <p className="case-detail-summary">{caseStudy.summary}</p>
          <div className="case-detail-body">{caseStudy.detail}</div>
        </div>
        <CaseDetailPlayer caseStudy={caseStudy} />
      </div>
    </div>
  );
}
