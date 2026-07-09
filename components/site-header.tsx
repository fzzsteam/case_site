'use client'

import { Landmark } from 'lucide-react'

interface SiteHeaderProps {
  onContactClick?: () => void
}

export function SiteHeader({ onContactClick }: SiteHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-6 py-6 md:px-12">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between">
        <a href="#case-showcase" className="group flex items-center gap-4" aria-label="文旅视界首页">
          <span className="grid h-12 w-12 place-items-center text-gold-300">
            <Landmark size={42} strokeWidth={1.5} />
          </span>
          <span>
            <span className="block font-display text-2xl tracking-[0.24em] text-white/88">文旅视界</span>
            <span className="mt-1 block text-xs tracking-[0.32em] text-white/62">AI 文旅视频创作</span>
          </span>
        </a>
        <nav
          className="hidden items-center gap-8 text-sm font-medium tracking-[0.16em] text-white/68 md:flex"
          aria-label="主导航"
        >
          <a className="nav-link" href="#case-showcase">
            案例展示
          </a>
          <span className="h-5 w-px bg-white/18" />
          <a className="nav-link" href="#about">
            关于我们
          </a>
          <span className="h-5 w-px bg-white/18" />
          <button className="nav-link bg-transparent p-0" type="button" onClick={onContactClick}>
            联系合作
          </button>
        </nav>
        <a className="nav-link md:hidden" href="#case-list">
          菜单
        </a>
      </div>
    </header>
  )
}
