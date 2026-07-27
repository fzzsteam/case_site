"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CaseCard } from "@/components/cases/case-card";
import { CaseFilterTabs } from "@/components/cases/case-filter-tabs";
import type { CaseCategory, CaseStudy } from "@/lib/cases/types";

export function CaseTeaserSection({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [category, setCategory] = useState<"全部" | CaseCategory>("全部");
  const categories: Array<"全部" | CaseCategory> = ["全部", ...Array.from(new Set(caseStudies.map((item) => item.category)))];
  const filtered = caseStudies.filter((item) => category === "全部" || item.category === category);

  return <>
    <header className="chapter-heading"><span>PROJECTS</span><h2>案例作品</h2></header>
    <CaseFilterTabs className="case-filters story-filters" categories={categories} active={category} onChange={setCategory} />
    <div className="case-editorial-grid">
      {filtered.map((item, index) => <CaseCard key={item.id} item={item} index={index} />)}
    </div>
    <div className="case-teaser-more"><Link href="/cases">查看全部案例 <ArrowUpRight size={16} /></Link></div>
  </>;
}
