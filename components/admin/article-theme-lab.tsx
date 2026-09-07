"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, FileText, LayoutPanelLeft, Smartphone } from "lucide-react";
import type { WechatArticleMeta } from "@/lib/wechat/format/render";
import type { WechatTheme } from "@/lib/wechat/format/themes";
import { cn } from "@/lib/utils";

function ThemeSwatch({ theme, index }: { theme: WechatTheme; index: number }) {
  const edition = String(index + 1).padStart(2, "0");

  if (theme.id === "briefing") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
          <span style={{ color: theme.swatches[1] }}>NEWS / BRIEF</span>
          <span className="opacity-40">{edition}</span>
        </div>
        <div>
          <div className="mb-1 h-2 w-4/5 rounded-sm" style={{ background: theme.swatches[2] }} />
          <div className="mb-2 h-1.5 w-2/5 rounded-sm opacity-35" style={{ background: theme.swatches[2] }} />
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-3 rounded-sm opacity-25" style={{ background: theme.swatches[1] }} />
            <div className="h-5 rounded-sm opacity-55" style={{ background: theme.swatches[1] }} />
            <div className="h-7 rounded-sm opacity-85" style={{ background: theme.swatches[1] }} />
          </div>
        </div>
      </div>
    );
  }

  if (theme.id === "field") {
    return (
      <div className="relative flex h-full items-stretch gap-3 overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="w-1.5" style={{ background: theme.swatches[1] }} />
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
            <span style={{ color: theme.swatches[1] }}>FIELD NOTE</span>
            <span className="opacity-35">{edition}</span>
          </div>
          <div>
            <div className="mb-1 h-2.5 w-4/5 rounded-sm opacity-80" style={{ background: theme.swatches[2] }} />
            <div className="mb-2 h-1.5 w-2/5 rounded-sm opacity-35" style={{ background: theme.swatches[2] }} />
            <div className="h-2 w-1/2 border-y" style={{ borderColor: `${theme.swatches[1]}88` }} />
          </div>
        </div>
      </div>
    );
  }

  if (theme.id === "financial") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="flex items-center justify-between border-b pb-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: `${theme.swatches[1]}55` }}>
          <span style={{ color: theme.swatches[1] }}>DATA DESK</span>
          <span className="opacity-45">{edition} / 09</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[16px] font-bold" style={{ color: theme.swatches[1] }}>42.8</div>
            <div className="mt-1 h-1 w-12 rounded-sm opacity-35" style={{ background: theme.swatches[2] }} />
          </div>
          <div className="flex h-8 items-end gap-1">
            <div className="h-3 w-2 opacity-35" style={{ background: theme.swatches[1] }} />
            <div className="h-5 w-2 opacity-55" style={{ background: theme.swatches[1] }} />
            <div className="h-8 w-2" style={{ background: theme.swatches[1] }} />
          </div>
        </div>
      </div>
    );
  }

  if (theme.id === "magazine") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
          <span>FEATURE</span>
          <span className="px-1" style={{ background: theme.swatches[2], color: theme.swatches[0] }}>{edition}</span>
        </div>
        <div>
          <div className="mb-1 font-serif text-[18px] font-bold leading-none">A CITY<br />AFTER DARK</div>
          <div className="h-1.5 w-3/5" style={{ background: theme.swatches[2] }} />
        </div>
        <div className="absolute -bottom-5 -right-3 size-16 rounded-full" style={{ background: theme.swatches[1] }} />
      </div>
    );
  }

  if (theme.id === "signal") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
          <span className="px-1.5 py-0.5 text-white" style={{ background: theme.swatches[1] }}>CHANNEL</span>
          <span className="opacity-40">LIVE / {edition}</span>
        </div>
        <div className="grid grid-cols-[1fr_24px] gap-2">
          <div className="rounded-sm p-2" style={{ background: `${theme.swatches[1]}20` }}>
            <div className="mb-1 h-2 w-4/5 rounded-sm" style={{ background: theme.swatches[2] }} />
            <div className="h-1.5 w-2/5 rounded-sm opacity-35" style={{ background: theme.swatches[2] }} />
          </div>
          <div className="rounded-sm" style={{ background: theme.swatches[1] }} />
        </div>
      </div>
    );
  }

  if (theme.id === "night") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
        <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
          <span style={{ color: theme.swatches[1] }}>NIGHT DESK</span>
          <span className="opacity-40">LATE / {edition}</span>
        </div>
        <div>
          <div className="mb-1 font-serif text-[17px] font-bold leading-none" style={{ color: theme.swatches[2] }}>AFTER<br />DARK</div>
          <div className="h-1 w-8 rounded-full" style={{ background: theme.swatches[1] }} />
        </div>
        <div className="absolute -right-3 -top-5 size-14 rounded-full border" style={{ borderColor: `${theme.swatches[1]}88` }} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={{ background: theme.swatches[0], color: theme.swatches[2] }}>
      <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-[0.16em]">
        <span style={{ color: theme.swatches[1] }}>THE EDITORIAL DESK</span>
        <span className="opacity-40">VOL. {edition}</span>
      </div>
      <div>
        <div className="mb-1 font-serif text-[16px] font-bold leading-none">A CITY<br />AFTER DARK</div>
        <div className="h-1 w-10" style={{ background: theme.swatches[1] }} />
      </div>
      <div className="absolute -bottom-5 -right-3 h-16 w-1" style={{ background: theme.swatches[1] }} />
    </div>
  );
}

export function ArticleThemeLab({ themes, previews, article }: { themes: readonly WechatTheme[]; previews: Record<string, string>; article: WechatArticleMeta }) {
  const [selectedId, setSelectedId] = useState(themes[0]?.id ?? "editorial");
  const [copied, setCopied] = useState(false);
  const selected = useMemo(() => themes.find((theme) => theme.id === selectedId) ?? themes[0], [selectedId, themes]);

  async function copyHtml() {
    const html = previews[selected.id];
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden border border-zinc-950 bg-zinc-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-pink-500" />
        <div className="grid gap-8 px-6 pb-7 pt-8 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:pb-8 md:pt-10">
          <div>
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
              <FileText size={14} aria-hidden="true" />
              Article Theme Atlas
              <span className="text-white/35">/</span>
              WeChat Edition
            </div>
            <h1 className="max-w-2xl font-serif text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">同一份原稿，七种编辑立场。</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">固定 Markdown，不改变内容，只改变阅读的节奏、信息的权重和文章的气质。左侧选主题，右侧看最终内联 HTML。</p>
          </div>
          <div className="grid grid-cols-2 gap-x-7 gap-y-5 border-l border-white/15 pl-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Theme set</p>
              <p className="mt-1 font-serif text-3xl">0{themes.length}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Source</p>
              <p className="mt-1 font-serif text-3xl">01</p>
            </div>
            <div className="col-span-2 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-pink-200">Markdown → inline HTML → WeChat ready</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.04] px-6 py-3 text-xs text-white/55 md:px-8">
          <span><span className="mr-2 text-pink-300">●</span>正在查看：{article.title}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">All syntax in one sample</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[286px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Theme index</p>
              <p className="mt-1 font-serif text-xl font-semibold text-foreground">选择编辑立场</p>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">{String(themes.length).padStart(2, "0")} styles</span>
          </div>

          <div role="tablist" aria-label="文章主题" className="grid gap-2">
            {themes.map((theme, index) => {
              const active = theme.id === selected.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedId(theme.id)}
                  className={cn(
                    "group cursor-pointer border p-2.5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active ? "border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_25px_rgba(15,23,42,0.12)]" : "border-zinc-200 bg-white/60 hover:border-zinc-400 hover:bg-white",
                  )}
                >
                  <div className="mb-3 h-[92px] overflow-hidden border border-black/5" style={{ background: theme.swatches[0] }}><ThemeSwatch theme={theme} index={index} /></div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={cn("text-sm font-semibold", active ? "text-white" : "text-foreground")}>{theme.name}</p>
                      <p className={cn("mt-1 text-[11px]", active ? "text-white/55" : "text-muted-foreground")}>{theme.subtitle}</p>
                    </div>
                    <span className={cn("font-mono text-[10px]", active ? "text-pink-300" : "text-zinc-400")}>
                      {active ? <Check size={15} aria-label="当前主题" /> : String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: active ? "#f9a8d4" : theme.swatches[1] }}>{theme.reference}</p>
                  <p className={cn("mt-3 text-xs leading-5", active ? "text-white/60" : "text-muted-foreground")}>{theme.description}</p>
                </button>
              );
            })}
          </div>

          <div className="border-l-2 border-zinc-950 bg-zinc-100 p-4 text-xs leading-5 text-muted-foreground">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950">Agent contract</p>
              <LayoutPanelLeft size={14} className="text-zinc-500" aria-hidden="true" />
            </div>
            <p>Agent 提交 Markdown 原文并选择主题 ID，渲染器输出可直接复制到公众号的内联 HTML。</p>
            <p className="mt-2 text-[11px]">右侧样稿已包含：标题、强调、引用、列表、任务清单、表格、链接、图片、代码和分隔线。</p>
            <p className="mt-2 text-[11px]">安全边界：原始 HTML 会被转义，不会直接执行。</p>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden border border-zinc-900 bg-[#deddd8] shadow-[0_18px_45px_rgba(15,23,42,0.12)]" aria-label="文章预览">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950 px-4 py-3 text-white md:px-5">
            <div className="flex items-center gap-3">
              <div className="grid size-7 place-items-center border border-white/20 text-pink-300">
                <Eye size={14} aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-pink-200">Live preview / {selected.category}</p>
                <p className="mt-0.5 text-sm font-semibold">{selected.name}<span className="ml-2 text-xs font-normal text-white/45">{selected.reference}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/45 sm:flex"><Smartphone size={13} aria-hidden="true" />677px canvas</span>
              <button type="button" onClick={copyHtml} className="inline-flex cursor-pointer items-center gap-1.5 border border-white/20 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? "已复制 HTML" : "复制 HTML"}
              </button>
            </div>
          </div>

          <div className="border-t border-black/10 p-3 md:p-6" style={{ background: selected.tokens.canvas }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
              <span>Render output / inline styles</span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full" style={{ background: selected.swatches[1] }} />
                {selected.id} / source locked
              </span>
            </div>
            <div className="mx-auto min-w-[320px] max-w-[677px] overflow-hidden border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div dangerouslySetInnerHTML={{ __html: previews[selected.id] }} />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
