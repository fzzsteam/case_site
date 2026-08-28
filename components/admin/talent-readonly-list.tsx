"use client";

import Link from "next/link";
import { ExternalLink, FileImage, Globe2, Play, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { aigcImageUrl } from "@/components/aigc/media";
import { getStaticSiteUrl } from "@/lib/talent/presentation";
import { TALENT_SKILLS, TALENT_WORK_TYPES, type TalentProfile, type TalentWork } from "@/lib/talent/types";
import { cn } from "@/lib/utils";

const typeLabel = (type: TalentWork["type"]) => TALENT_WORK_TYPES.find((item) => item.value === type)?.label ?? type;

function TypeIcon({ type }: { type: TalentWork["type"] }) {
  if (type === "video") return <Play size={14} />;
  if (type === "image") return <FileImage size={14} />;
  return <Globe2 size={14} />;
}

function siteHref(work: TalentWork, localStaticPreview: boolean) {
  if (work.source === "static" && work.siteSlug && localStaticPreview) return `/portfolio-preview/${work.siteSlug}/`;
  return work.siteUrl ?? (work.siteSlug ? getStaticSiteUrl(work.siteSlug) : "#");
}

export function TalentReadonlyList({ talents, localStaticPreview = false }: { talents: TalentProfile[]; localStaticPreview?: boolean }) {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("全部");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return talents.filter((talent) => {
      const matchesQuery = !normalized || `${talent.name} ${talent.role} ${talent.intro} ${talent.works.map((work) => `${work.title} ${work.summary}`).join(" ")}`.toLowerCase().includes(normalized);
      return matchesQuery && (skill === "全部" || talent.skills.includes(skill));
    });
  }, [query, skill, talents]);

  const works = talents.reduce((sum, talent) => sum + talent.works.length, 0);
  const sites = talents.reduce((sum, talent) => sum + talent.works.filter((work) => work.type === "website").length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Talent Market</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">人才集市</h1>
          <p className="mt-1 text-sm text-muted-foreground">只读查看人才资料、作品案例与作品集站点。</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">当前为样例数据</div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={<Users size={17} />} label="人才" value={talents.length} />
        <StatCard icon={<FileImage size={17} />} label="作品" value={works} />
        <StatCard icon={<Globe2 size={17} />} label="作品集站点" value={sites} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3 text-muted-foreground md:max-w-sm">
            <Search size={16} />
            <span className="sr-only">搜索人才或作品</span>
            <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索人才、技能或作品" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["全部", ...TALENT_SKILLS] as const).map((item) => (
              <button key={item} type="button" onClick={() => setSkill(item)} className={cn("cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors", skill === item ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground")}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>人才</TableHead>
                <TableHead>技能分类</TableHead>
                <TableHead>作品案例</TableHead>
                <TableHead>作品集站点</TableHead>
                <TableHead className="text-right">查看</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((talent) => <TalentRow key={talent.id} talent={talent} localStaticPreview={localStaticPreview} />)}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && <div className="flex flex-col items-center gap-2 px-6 py-14 text-center text-sm text-muted-foreground"><Users size={23} /><p>没有匹配的人才</p></div>}
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <Card className="flex items-center gap-3 px-4 py-4"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span><span><span className="block text-xs text-muted-foreground">{label}</span><strong className="block text-lg font-semibold text-foreground">{value}</strong></span></Card>;
}

function TalentRow({ talent, localStaticPreview }: { talent: TalentProfile; localStaticPreview: boolean }) {
  const sites = talent.works.filter((work) => work.type === "website");
  return (
    <TableRow>
      <TableCell className="min-w-48">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-900 to-emerald-600 text-sm font-semibold text-white">
            {talent.avatarPath ? <img src={aigcImageUrl(talent.avatarPath)} alt="" className="size-full object-cover" /> : talent.name.slice(0, 1)}
          </div>
          <div className="min-w-0"><p className="truncate font-medium text-foreground">{talent.name}</p><p className="truncate text-xs text-muted-foreground">{talent.role}</p></div>
        </div>
      </TableCell>
      <TableCell><div className="flex max-w-56 flex-wrap gap-1">{talent.skills.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div></TableCell>
      <TableCell className="min-w-64">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">{talent.works.length} 个案例</span>
          {talent.works.map((work) => {
            const href = work.type === "website" ? siteHref(work, localStaticPreview) : `/edu/talent/${talent.id}`;
            return <a key={work.id} href={href} target="_blank" rel="noopener noreferrer" title={work.title} className="inline-flex max-w-72 items-center gap-1.5 truncate text-xs text-foreground hover:text-primary hover:underline"><TypeIcon type={work.type} /><span className="truncate">{work.title}</span><ExternalLink size={12} className="shrink-0 text-muted-foreground" /></a>;
          })}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex max-w-64 flex-col gap-1">
          {sites.map((work) => <a key={work.id} href={siteHref(work, localStaticPreview)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-xs text-primary hover:underline"><TypeIcon type={work.type} /><span className="truncate">{work.title}</span><ExternalLink size={12} className="shrink-0" /></a>)}
          {sites.length === 0 && <span className="text-xs text-muted-foreground">暂无网站</span>}
        </div>
      </TableCell>
      <TableCell className="text-right"><Link href={`/edu/talent/${talent.id}`} target="_blank" className="text-xs font-medium text-primary hover:underline">打开详情</Link></TableCell>
    </TableRow>
  );
}
