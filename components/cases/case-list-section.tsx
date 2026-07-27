import Link from "next/link";
import { CaseCard } from "./case-card";
import type { CaseCategory, CaseStudy } from "@/lib/cases/types";

export function CaseListSection({ caseStudies, activeCategory }: { caseStudies: CaseStudy[]; activeCategory: string }) {
  const categories: Array<"全部" | CaseCategory> = ["全部", ...Array.from(new Set(caseStudies.map((item) => item.category)))];
  const filtered = activeCategory === "全部" ? caseStudies : caseStudies.filter((item) => item.category === activeCategory);

  return <>
    <div className="case-filters case-list-filters">
      {categories.map((item) => (
        <Link key={item} href={item === "全部" ? "/cases" : `/cases?category=${encodeURIComponent(item)}`} className={activeCategory === item ? "active" : ""}>{item}</Link>
      ))}
    </div>
    {filtered.length === 0 ? (
      <p className="case-list-empty">该分类下暂无案例</p>
    ) : (
      <div className="case-editorial-grid">{filtered.map((item, index) => <CaseCard key={item.id} item={item} index={index} />)}</div>
    )}
  </>;
}
