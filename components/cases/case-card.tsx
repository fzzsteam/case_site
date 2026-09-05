import Link from "next/link";
import type { CaseStudy } from "@/lib/cases/types";

export const caseCoverUrl = (path: string) => `/api/media/image/${path.split("/").map(encodeURIComponent).join("/")}`;

export function CaseCard({ item, index }: { item: CaseStudy; index: number }) {
  return <article className={`editorial-case editorial-${index % 5}`}>
    <Link href={`/cases/${item.slug}`} className="editorial-cover" aria-label={`${item.title}封面`}>
      <img src={caseCoverUrl(item.coverPath)} alt={`${item.title}封面`} />
      <span className="sr-only">查看{item.title}案例详情</span>
    </Link>
    <div className="editorial-caption">
      <small>{item.category}</small>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </div>
  </article>;
}
