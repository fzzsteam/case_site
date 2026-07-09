'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import { caseCategories, getCasesByCategory, type CaseCategory, type CaseItem } from '@/data/cases'
import { SiteHeader } from '@/components/site-header'
import { CaseCard } from '@/components/case-card'
import { VideoModal } from '@/components/video-modal'
import { ContactModal } from '@/components/contact-modal'

export function CaseShowcase() {
  const reduceMotion = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState<CaseCategory>('promo')
  const [activeIndex, setActiveIndex] = useState(0)
  const [videoCase, setVideoCase] = useState<CaseItem | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const activeCases = useMemo(() => getCasesByCategory(activeCategory), [activeCategory])
  const activeCase = activeCases[activeIndex] ?? activeCases[0]

  useEffect(() => {
    if (paused || videoCase) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % activeCases.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [activeCases.length, paused, videoCase])

  function chooseCategory(category: CaseCategory) {
    setPaused(true)
    setActiveCategory(category)
    setActiveIndex(0)
    window.setTimeout(() => setPaused(false), 800)
  }

  function move(direction: 1 | -1) {
    setPaused(true)
    setActiveIndex((index) => (index + direction + activeCases.length) % activeCases.length)
    window.setTimeout(() => setPaused(false), 1200)
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    setPointer({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5
    })
  }

  const progressWidth = `${((activeIndex + 1) / activeCases.length) * 100}%`

  return (
    <>
      <SiteHeader onContactClick={() => setContactOpen(true)} />
      <main
        id="case-showcase"
        className="relative min-h-screen overflow-hidden bg-ink-950"
        onPointerMove={onPointerMove}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`${activeCategory}-${activeCase.id}`}
            src={activeCase.background}
            alt={`${activeCase.title} AI 文旅视频案例背景`}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            style={{ objectPosition: activeCase.backgroundPosition ?? 'center center' }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
            animate={{
              opacity: 0.7,
              scale: 1,
              x: reduceMotion ? 0 : pointer.x * 8,
              y: reduceMotion ? 0 : pointer.y * 8
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,20,0.9)_0%,rgba(4,16,20,0.52)_44%,rgba(4,16,20,0.88)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-ink-950 to-transparent" />

        <section className="relative z-10 mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 gap-10 px-6 pb-8 pt-28 md:grid-cols-[42%_58%] md:px-12 md:pt-36">
          <motion.div
            className="flex min-h-[58vh] flex-col justify-center md:min-h-0"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: reduceMotion ? 0 : pointer.x * 2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${activeCase.id}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.32 }}
              >
                <h1 className="max-w-full break-words font-display text-5xl leading-tight text-white md:text-7xl lg:text-8xl">
                  {activeIndex === 0 && activeCategory === 'promo' ? 'AI 文旅视频案例' : activeCase.title}
                </h1>
                <p className="mt-6 max-w-full break-words text-xl tracking-[0.18em] text-white/84 md:text-2xl md:tracking-[0.32em]">
                  {activeIndex === 0 && activeCategory === 'promo' ? '用影像讲好地方故事' : activeCase.subtitle}
                </p>
                <div className="mt-9 h-px w-16 bg-gold-300" />
                <p className="mt-8 max-w-xl text-base leading-8 text-white/66 md:text-lg md:leading-9">
                  {activeIndex === 0 && activeCategory === 'promo'
                    ? '专注于 AI 生成的文旅宣传片与广告片创作，为目的地、博物馆、景区及文化品牌，打造具有感染力的影像内容，让文化与风景被看见，让故事被传递。'
                    : activeCase.description}
                </p>
              </motion.div>
            </AnimatePresence>
            <button
              className="mt-10 inline-flex w-fit items-center gap-5 rounded-full border border-white/20 bg-black/16 px-5 py-3 text-gold-100 transition hover:border-gold-300/60 hover:bg-gold-300/10 md:px-7"
              type="button"
              onClick={() => setVideoCase(activeCase)}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-300 text-ink-950 shadow-glow">
                <Play size={22} fill="currentColor" />
              </span>
              <span className="tracking-[0.18em] md:tracking-[0.24em]">观看作品集</span>
            </button>
            <section id="about" className="mt-14 max-w-lg border-l border-gold-300/70 pl-6 md:mt-auto md:pt-16">
              <h2 className="text-xl font-semibold text-gold-100">关于我们</h2>
              <p className="mt-5 leading-8 text-white/62">
                我们是一支深耕文旅领域的 AI 影像创作团队，用技术与审美连接文化与未来，让每一处风景都被世界记住。
              </p>
              <button className="mt-5 inline-flex text-gold-300" type="button" onClick={() => setContactOpen(true)}>
                了解更多 →
              </button>
            </section>
          </motion.div>

          <motion.div
            id="case-list"
            className="flex flex-col justify-center overflow-hidden"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: reduceMotion ? 0 : pointer.x * 4 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="mb-7 flex items-center gap-12 pl-2 text-lg md:gap-16 md:pl-8 md:text-xl">
              {caseCategories.map((category) => (
                <button
                  key={category.id}
                  className={`relative pb-4 transition ${
                    activeCategory === category.id ? 'text-gold-300' : 'text-white/62 hover:text-gold-100'
                  }`}
                  type="button"
                  onClick={() => chooseCategory(category.id)}
                >
                  {category.label}
                  {activeCategory === category.id ? (
                    <motion.span layoutId="category-line" className="absolute bottom-0 left-0 h-0.5 w-full bg-gold-300" />
                  ) : null}
                </button>
              ))}
            </div>
            <motion.div className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-4 md:overflow-visible" layout>
              {activeCases.map((item, index) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  active={index === activeIndex}
                  compact={index > activeIndex + 1}
                  onSelect={() => setActiveIndex(index)}
                  onPlay={() => setVideoCase(item)}
                />
              ))}
            </motion.div>
            <div className="mt-10 flex items-center gap-4 md:mt-20 md:gap-8">
              <button
                className="grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white/70 transition hover:border-gold-300 hover:bg-gold-300/12 hover:text-gold-100 md:h-14 md:w-14"
                type="button"
                aria-label="上一个案例"
                onClick={() => move(-1)}
              >
                <ArrowLeft />
              </button>
              <button
                className="grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white/70 transition hover:border-gold-300 hover:bg-gold-300/12 hover:text-gold-100 md:h-14 md:w-14"
                type="button"
                aria-label="下一个案例"
                onClick={() => move(1)}
              >
                <ArrowRight />
              </button>
              <div className="ml-1 h-px flex-1 bg-white/16 md:ml-10">
                <motion.div className="h-px bg-gold-300" animate={{ width: progressWidth }} transition={{ duration: 0.35 }} />
              </div>
              <p className="whitespace-nowrap font-display text-4xl text-gold-300 md:text-6xl">
                {String(activeIndex + 1).padStart(2, '0')}{' '}
                <span className="text-xl text-white/28 md:text-3xl">/{String(activeCases.length).padStart(2, '0')}</span>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
      <VideoModal item={videoCase} onClose={() => setVideoCase(null)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
