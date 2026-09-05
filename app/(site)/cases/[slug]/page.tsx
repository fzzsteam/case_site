import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCaseBySlug, listCases } from "@/lib/cases/queries";
import { caseCoverUrl } from "@/components/cases/case-card";
import { CaseDetailPlayer } from "@/components/cases/case-detail-player";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/content/site";
import { getCaseSeoProfile } from "@/lib/seo/case-content";
import { breadcrumbJsonLd, faqPageJsonLd, videoObjectJsonLd } from "@/lib/seo/jsonld";
import type { CaseStudy } from "@/lib/cases/types";

// 不使用 generateStaticParams：构建镜像时数据库不可达（见 Dockerfile），
// 详情页改为首次访问时按需渲染并缓存（ISR），避免构建阶段连接数据库。
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseBySlug(slug);
  if (!caseStudy) return {};
  const profile = getCaseSeoProfile(caseStudy);
  const canonical = `/cases/${caseStudy.slug}`;
  return {
    title: caseStudy.title,
    description: profile.description,
    keywords: profile.keywords,
    alternates: { canonical },
    openGraph: {
      type: "video.other",
      title: `${caseStudy.title}｜${siteConfig.name}`,
      description: profile.description,
      url: `${siteConfig.url}${canonical}`,
      images: [{ url: caseCoverUrl(caseStudy.coverPath), alt: `${caseStudy.title}案例封面` }],
    },
    twitter: { card: "summary_large_image", title: `${caseStudy.title}｜${siteConfig.name}`, description: profile.description, images: [caseCoverUrl(caseStudy.coverPath)] },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [caseStudy, caseStudies] = await Promise.all([getCaseBySlug(slug), listCases()]);
  if (!caseStudy) notFound();

  const profile = getCaseSeoProfile(caseStudy);
  const canonical = `${siteConfig.url}/cases/${caseStudy.slug}`;
  const cover = `${siteConfig.url}${caseCoverUrl(caseStudy.coverPath)}`;
  const relatedCases = profile.relatedSlugs
    .map((relatedSlug) => caseStudies.find((item) => item.slug === relatedSlug))
    .filter((item): item is CaseStudy => item !== undefined && item.id !== caseStudy.id);
  const fallbackRelatedCases = caseStudies.filter((item) => item.id !== caseStudy.id && item.category === caseStudy.category).slice(0, 3);
  const visibleRelatedCases = relatedCases.length > 0 ? relatedCases : fallbackRelatedCases;

  return (
    <div className="case-detail-page">
      <JsonLd data={breadcrumbJsonLd([{ name: "首页", url: "/" }, { name: "案例作品", url: "/cases" }, { name: caseStudy.title, url: canonical }])} />
      <JsonLd data={videoObjectJsonLd({ caseStudy, canonical, thumbnail: cover, description: profile.description, keywords: profile.keywords, sourceOrganization: profile.client })} />
      <JsonLd data={faqPageJsonLd(profile.faq)} />
      <Link href="/cases" className="case-detail-back"><ArrowLeft size={16} /> 返回案例列表</Link>
      <div className="case-detail-layout">
        <div className="case-detail-info">
          <span className="eyebrow">PROJECT</span>
          <h1>{caseStudy.title}</h1>
          <span className="case-detail-category">{caseStudy.category}</span>
          <p className="case-detail-summary">{profile.description}</p>
          <dl className="case-detail-facts">
            <div><dt>合作方 / 主题</dt><dd>{profile.client}</dd></div>
            <div><dt>项目地区</dt><dd>{profile.region}</dd></div>
            <div><dt>交付内容</dt><dd>{profile.deliverable}</dd></div>
            <div><dt>站内视频</dt><dd>{caseStudy.episodes.length} 条，可在线预览</dd></div>
          </dl>
          <article className="case-detail-body">
            <h2>项目概览</h2>
            <p>{profile.overview}</p>
            <h2>创作说明</h2>
            {caseStudy.detail.split(/\n\s*\n/).map((paragraph, index) => <p key={`${caseStudy.id}-detail-${index}`}>{paragraph}</p>)}
            <h2>创作方法</h2>
            <p>{profile.method}</p>
            <h2>项目价值</h2>
            <p>{profile.value}</p>
            <section className="case-detail-faq" aria-labelledby="case-faq-title">
              <h2 id="case-faq-title">常见问题</h2>
              <dl>
                {profile.faq.map((faq) => <div key={faq.question}><dt>{faq.question}</dt><dd>{faq.answer}</dd></div>)}
              </dl>
            </section>
            {visibleRelatedCases.length > 0 && (
              <section className="case-detail-related" aria-labelledby="case-related-title">
                <h2 id="case-related-title">相关案例</h2>
                <div>
                  {visibleRelatedCases.map((related) => <Link key={related.id} href={`/cases/${related.slug}`}><strong>{related.title}</strong><span>{related.category} · {related.summary}</span></Link>)}
                </div>
              </section>
            )}
          </article>
        </div>
        <CaseDetailPlayer caseStudy={caseStudy} />
      </div>
    </div>
  );
}
