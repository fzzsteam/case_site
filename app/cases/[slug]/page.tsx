import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { caseStudies, getCaseBySlug, getCaseSlugs } from "@/content/cases";
import { siteConfig } from "@/content/site";
export function generateStaticParams(){return getCaseSlugs().map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const item=getCaseBySlug((await params).slug);if(!item)return{};return{title:item.title,description:item.summary,alternates:{canonical:`/cases/${item.slug}`},openGraph:{title:item.title,description:item.summary,images:[`/api/media/image/${item.coverPath}`]}}}
export default async function CaseDetail({params}:{params:Promise<{slug:string}>}){const item=getCaseBySlug((await params).slug);if(!item)notFound();const jsonLd={"@context":"https://schema.org","@type":"VideoObject",name:item.title,description:item.description,thumbnailUrl:`${siteConfig.url}/api/media/image/${item.coverPath}`,uploadDate:item.publishedAt,embedUrl:`${siteConfig.url}/cases/${item.slug}`};return <article className="case-detail"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><Link className="back-link" href="/cases"><ArrowLeft size={17}/>返回案例</Link><div className="detail-cover"><img src={`/api/media/image/${item.coverPath}`} alt={`${item.title}封面`}/><span><Play fill="currentColor"/></span></div><header><span>{item.category}</span><h1>{item.title}</h1><p>{item.summary}</p></header><div className="detail-body"><h2>项目表达</h2><p>{item.description}</p><div>{item.services.map(s=><span key={s}>{s}</span>)}</div></div></article>}
