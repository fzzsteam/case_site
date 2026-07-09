'use client'

import { ArrowRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CaseItem } from '@/data/cases'

interface CaseCardProps {
  item: CaseItem
  active: boolean
  compact: boolean
  onSelect: () => void
  onPlay: () => void
}

export function CaseCard({ item, active, compact, onSelect, onPlay }: CaseCardProps) {
  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className={`group relative h-[520px] snap-center shrink-0 overflow-hidden rounded-lg border bg-white/5 transition-colors ${
        active
          ? 'w-[350px] border-white/42 shadow-glow'
          : compact
            ? 'w-[220px] border-white/18 md:w-[240px]'
            : 'w-[320px] border-white/22 md:w-[340px]'
      }`}
      onClick={onSelect}
    >
      <img
        src={item.cover}
        alt={`${item.title} AI 文旅视频案例封面`}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
          active ? 'opacity-90' : 'opacity-58'
        }`}
        style={{ objectPosition: item.coverPosition ?? 'center center' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/24 to-transparent" />
      <div className="absolute bottom-8 left-7 right-7">
        <button
          className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-white/62 bg-black/18 text-white transition group-hover:scale-105 group-hover:border-gold-100 group-hover:bg-gold-300 group-hover:text-ink-950"
          type="button"
          aria-label={`播放${item.title}`}
          onClick={(event) => {
            event.stopPropagation()
            onPlay()
          }}
        >
          <Play size={18} fill="currentColor" />
        </button>
        <h3 className="font-display text-3xl text-white md:text-4xl">{item.title}</h3>
        <p className="mt-3 text-base text-white/68 md:text-lg">{item.subtitle}</p>
        <p className="mt-7 inline-flex items-center gap-3 text-gold-300">
          查看案例 <ArrowRight className="transition group-hover:translate-x-1" size={20} />
        </p>
      </div>
    </motion.article>
  )
}
