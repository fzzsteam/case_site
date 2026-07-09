# Case Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-fidelity AI cultural-tourism video case showcase homepage matching `render.png`, implementing the interactions from `uiux.md`, and adding SEO-ready content and metadata.

**Architecture:** Use Next.js App Router for the site shell, metadata, semantic HTML, and structured data. Put animation-heavy showcase behavior in focused client components driven by a typed `cases` data module. Keep styling in Tailwind plus small global CSS utilities for theme, typography, and motion reduction.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, lucide-react.

## Global Constraints

- Use `Next.js + React + Tailwind CSS + Framer Motion`.
- SEO focuses on “文旅宣传片制作”, “景区 AI 视频”, “博物馆宣传片”, “AI 文旅视频创作”, “文旅视界”, “增城文旅视频案例”, and “南阳汉画馆宣传片”.
- The page has only two core content areas: case showcase and about/contact.
- Do not build a backend, real submission service, real video hosting, independent case detail pages, or multilingual pages.
- Contact form submission uses frontend validation and success feedback.
- If a video URL is empty, the video modal displays “视频即将上线”.
- Use semantic `header`, `main`, `section`, `nav`, and `article` elements.
- Use descriptive Chinese alt text for case images.
- Gold is an accent only, not a broad background color.
- Verify `npm run build` and browser layout on desktop and mobile.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `next.config.mjs`: Next.js config.
- Create `tsconfig.json`: TypeScript config.
- Create `postcss.config.mjs`: Tailwind PostCSS config.
- Create `tailwind.config.ts`: theme tokens for gold, ink, and typography.
- Create `app/layout.tsx`: root layout and site metadata.
- Create `app/page.tsx`: server-rendered homepage shell, JSON-LD, and `CaseShowcase`.
- Create `app/globals.css`: global reset, theme background, motion reduction, base typography.
- Create `data/cases.ts`: typed case/category data and SEO keywords.
- Create `components/site-header.tsx`: brand and navigation.
- Create `components/case-showcase.tsx`: client state, carousel, background, tabs, progress, autoplay, parallax.
- Create `components/case-card.tsx`: individual card rendering and interactions.
- Create `components/video-modal.tsx`: video modal and unavailable-video state.
- Create `components/contact-modal.tsx`: contact form modal with frontend validation.

## Task 1: Project Scaffold And Tooling

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/globals.css`

**Interfaces:**
- Produces: `npm run dev`, `npm run lint`, and `npm run build` scripts.
- Produces: Tailwind theme colors `gold`, `ink`, and font families consumed by later components.

- [ ] **Step 1: Create project config files**

Create `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "framer-motion": "^11.2.10",
    "lucide-react": "^0.468.0",
    "next": "^14.2.4",
    "postcss": "^8.4.39",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3"
  },
  "devDependencies": {}
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}

export default nextConfig
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}

export default config
```

Create `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#f7dfac',
          300: '#dfb76a',
          500: '#c99a4d',
          700: '#8e632c'
        },
        ink: {
          950: '#041014',
          900: '#071820',
          800: '#10252b'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Songti SC', 'STSong', 'serif']
      },
      boxShadow: {
        glow: '0 0 32px rgba(223, 183, 106, 0.22)'
      }
    }
  },
  plugins: []
}

export default config
```

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: "PingFang SC", "Microsoft YaHei", Arial;
  --font-display: "Songti SC", "STSong", serif;
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: #041014;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #041014;
  color: rgba(255, 255, 255, 0.88);
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 3: Verify scaffold**

Run:

```bash
npm run build
```

Expected: build fails because `app/layout.tsx` does not exist yet. This confirms scripts are wired before the app shell is created.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json postcss.config.mjs tailwind.config.ts app/globals.css
git commit -m "chore: scaffold next case site"
```

## Task 2: Data Model And SEO Shell

**Files:**
- Create: `data/cases.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Produces: `type CaseCategory = 'promo' | 'ad'`.
- Produces: `interface CaseItem`.
- Produces: `caseCategories`, `cases`, `getCasesByCategory(category)`, `siteKeywords`, and `organizationJsonLd`.
- Consumes: Tailwind/global CSS from Task 1.

- [ ] **Step 1: Create case data**

Create `data/cases.ts`:

```ts
export type CaseCategory = 'promo' | 'ad'

export interface CaseItem {
  id: string
  category: CaseCategory
  title: string
  subtitle: string
  description: string
  cover: string
  background: string
  videoUrl?: string
  seoKeywords: string[]
  status?: 'ready' | 'coming-soon'
}

export const siteKeywords = [
  '文旅宣传片制作',
  '景区 AI 视频',
  '博物馆宣传片',
  'AI 文旅视频创作',
  '文旅视界',
  '增城文旅视频案例',
  '南阳汉画馆宣传片'
]

export const caseCategories: { id: CaseCategory; label: string }[] = [
  { id: 'promo', label: '宣传片' },
  { id: 'ad', label: '广告片' }
]

export const cases: CaseItem[] = [
  {
    id: 'zengcheng-tour',
    category: 'promo',
    title: '增城文旅',
    subtitle: '山水入画 · 诗意岭南',
    description: '以 AI 影像重构山水、古村与城市夜景，呈现岭南文旅的温润层次。',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85',
    videoUrl: '',
    seoKeywords: ['增城文旅视频案例', '文旅宣传片制作', '景区 AI 视频']
  },
  {
    id: 'nanyang-museum',
    category: 'promo',
    title: '南阳汉画馆',
    subtitle: '汉韵千年 · 文化永恒',
    description: '围绕汉画像石、展陈光影和历史纹样，塑造博物馆影像叙事。',
    cover: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=2200&q=85',
    videoUrl: '',
    seoKeywords: ['南阳汉画馆宣传片', '博物馆宣传片', 'AI 文旅视频创作']
  },
  {
    id: 'more-promo',
    category: 'promo',
    title: '更多案例',
    subtitle: '敬请期待',
    description: '更多文旅目的地、景区与文化品牌案例正在整理中。',
    cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85',
    seoKeywords: ['文旅宣传片制作', '景区 AI 视频'],
    status: 'coming-soon'
  },
  {
    id: 'coming-promo',
    category: 'promo',
    title: '即将上线',
    subtitle: '敬请期待',
    description: '新的文旅宣传片案例即将发布。',
    cover: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2200&q=85',
    seoKeywords: ['AI 文旅视频创作'],
    status: 'coming-soon'
  },
  {
    id: 'scenic-campaign',
    category: 'ad',
    title: '景区活动广告',
    subtitle: '节庆声量 · 即刻抵达',
    description: '为景区活动打造短周期、高记忆点的 AI 广告片视觉。',
    cover: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2200&q=85',
    videoUrl: '',
    seoKeywords: ['景区 AI 视频', '城市文旅广告片']
  },
  {
    id: 'city-brand',
    category: 'ad',
    title: '城市品牌广告',
    subtitle: '城市名片 · 影像表达',
    description: '提炼城市地标、产业与生活方式，形成可传播的城市品牌短片。',
    cover: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2200&q=85',
    videoUrl: '',
    seoKeywords: ['文旅宣传片制作', '城市文旅广告片']
  },
  {
    id: 'museum-exhibition',
    category: 'ad',
    title: '博物馆展览广告',
    subtitle: '展览上新 · 文化转译',
    description: '将展览主题转译为具有点击吸引力和文化质感的广告片。',
    cover: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=2200&q=85',
    videoUrl: '',
    seoKeywords: ['博物馆宣传片', 'AI 文旅视频创作']
  },
  {
    id: 'coming-ad',
    category: 'ad',
    title: '即将上线',
    subtitle: '敬请期待',
    description: '更多广告片案例即将发布。',
    cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    background: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=85',
    seoKeywords: ['景区 AI 视频'],
    status: 'coming-soon'
  }
]

export function getCasesByCategory(category: CaseCategory) {
  return cases.filter((item) => item.category === category)
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '文旅视界',
  url: 'https://example.com',
  description: '专注文旅宣传片制作、景区 AI 视频与博物馆宣传片的 AI 影像创作团队',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: '合作咨询',
    availableLanguage: 'zh-CN'
  }
}
```

- [ ] **Step 2: Create root layout with metadata**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { siteKeywords } from '@/data/cases'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
  description: '文旅视界展示文旅宣传片制作、景区 AI 视频、博物馆宣传片与城市文旅广告片案例，用 AI 影像讲好地方故事。',
  keywords: siteKeywords,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
    description: '面向目的地、博物馆、景区及文化品牌的 AI 文旅视频案例展示。',
    url: 'https://example.com',
    siteName: '文旅视界',
    locale: 'zh_CN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
    description: '用 AI 影像讲好地方故事。'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create server homepage shell**

Create `app/page.tsx`:

```tsx
import { cases, organizationJsonLd } from '@/data/cases'

export default function HomePage() {
  const creativeWorks = cases.map((item) => ({
    '@type': item.videoUrl ? 'VideoObject' : 'CreativeWork',
    name: item.title,
    description: item.description,
    thumbnailUrl: item.cover,
    keywords: item.seoKeywords.join(','),
    genre: item.category === 'promo' ? '文旅宣传片' : '文旅广告片'
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd, ...creativeWorks]
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section aria-labelledby="showcase-title">
        <h1 id="showcase-title">AI 文旅视频案例</h1>
        <p>用影像讲好地方故事</p>
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: PASS and Next.js reports a successfully compiled app route.

- [ ] **Step 5: Commit**

```bash
git add data/cases.ts app/layout.tsx app/page.tsx
git commit -m "feat: add case data and seo shell"
```

## Task 3: Static Visual Shell

**Files:**
- Create: `components/site-header.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `SiteHeader({ onContactClick?: () => void })`.
- Produces: semantic header/nav branding used by interactive page.
- Consumes: `cases` from Task 2 for static SEO fallback content.

- [ ] **Step 1: Create header component**

Create `components/site-header.tsx`:

```tsx
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
        <nav className="hidden items-center gap-8 text-sm font-medium tracking-[0.16em] text-white/68 md:flex" aria-label="主导航">
          <a className="nav-link" href="#case-showcase">案例展示</a>
          <span className="h-5 w-px bg-white/18" />
          <a className="nav-link" href="#about">关于我们</a>
          <span className="h-5 w-px bg-white/18" />
          <button className="nav-link" type="button" onClick={onContactClick}>
            联系合作
          </button>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Add global nav link style**

Append to `app/globals.css`:

```css
@layer components {
  .nav-link {
    position: relative;
    color: rgba(255, 255, 255, 0.68);
    transition: color 200ms ease;
  }

  .nav-link::after {
    position: absolute;
    left: 50%;
    bottom: -10px;
    width: 18px;
    height: 1px;
    content: "";
    background: #dfb76a;
    opacity: 0;
    transform: translateX(-50%) scaleX(0.5);
    transition: opacity 200ms ease, transform 200ms ease;
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    color: #f7dfac;
  }

  .nav-link:hover::after,
  .nav-link:focus-visible::after {
    opacity: 1;
    transform: translateX(-50%) scaleX(1);
  }
}
```

- [ ] **Step 3: Replace page shell with static high-fidelity layout**

Modify `app/page.tsx` to import `SiteHeader` and render a non-interactive composition using the first promo case as background, card articles for SEO, and the about block.

```tsx
import { cases, getCasesByCategory, organizationJsonLd } from '@/data/cases'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  const promoCases = getCasesByCategory('promo')
  const firstCase = promoCases[0]
  const creativeWorks = cases.map((item) => ({
    '@type': item.videoUrl ? 'VideoObject' : 'CreativeWork',
    name: item.title,
    description: item.description,
    thumbnailUrl: item.cover,
    keywords: item.seoKeywords.join(','),
    genre: item.category === 'promo' ? '文旅宣传片' : '文旅广告片'
  }))
  const jsonLd = { '@context': 'https://schema.org', '@graph': [organizationJsonLd, ...creativeWorks] }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="case-showcase" className="relative min-h-screen overflow-hidden bg-ink-950">
        <img
          src={firstCase.background}
          alt="文旅视界 AI 文旅视频案例背景"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,20,0.88)_0%,rgba(4,16,20,0.52)_45%,rgba(4,16,20,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink-950 to-transparent" />
        <section className="relative z-10 mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 gap-10 px-6 pb-10 pt-32 md:grid-cols-[42%_58%] md:px-12 md:pt-40">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-6xl leading-tight text-white md:text-7xl lg:text-8xl">AI 文旅视频案例</h1>
            <p className="mt-6 text-2xl tracking-[0.42em] text-white/84">用影像讲好地方故事</p>
            <div className="mt-9 h-px w-16 bg-gold-300" />
            <p className="mt-8 max-w-xl text-lg leading-9 text-white/66">
              专注于 AI 生成的文旅宣传片与广告片创作，为目的地、博物馆、景区及文化品牌，打造具有感染力的影像内容，让文化与风景被看见，让故事被传递。
            </p>
            <a href="#case-list" className="mt-10 inline-flex w-fit items-center gap-5 rounded-full border border-white/20 bg-black/16 px-7 py-3 text-gold-100">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-300 text-ink-950">▶</span>
              <span className="tracking-[0.24em]">观看作品集</span>
            </a>
            <section id="about" className="mt-auto max-w-lg border-l border-gold-300/70 pl-6 pt-20">
              <h2 className="text-xl font-semibold text-gold-100">关于我们</h2>
              <p className="mt-5 leading-8 text-white/62">我们是一支深耕文旅领域的 AI 影像创作团队，用技术与审美连接文化与未来，让每一处风景都被世界记住。</p>
              <a className="mt-5 inline-flex text-gold-300" href="#about">了解更多 →</a>
            </section>
          </div>
          <div id="case-list" className="flex flex-col justify-center overflow-hidden">
            <div className="mb-7 flex items-center gap-16 pl-8 text-xl">
              <span className="border-b-2 border-gold-300 pb-4 text-gold-300">宣传片</span>
              <span className="text-white/62">广告片</span>
            </div>
            <div className="flex gap-5">
              {promoCases.map((item, index) => (
                <article key={item.id} className="relative h-[520px] min-w-[320px] overflow-hidden rounded-lg border border-white/20 bg-white/5">
                  <img src={item.cover} alt={`${item.title} AI 文旅视频案例封面`} className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-white/60 text-white">▶</span>
                    <h3 className="font-display text-4xl text-white">{item.title}</h3>
                    <p className="mt-3 text-lg text-white/70">{item.subtitle}</p>
                    <p className="mt-7 text-gold-300">查看案例 →</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-20 flex items-center gap-8">
              <button className="grid h-14 w-14 place-items-center rounded-full border border-white/30 text-2xl text-white/70" type="button">←</button>
              <button className="grid h-14 w-14 place-items-center rounded-full border border-white/30 text-2xl text-white/70" type="button">→</button>
              <div className="ml-10 h-px flex-1 bg-white/16">
                <div className="h-px w-1/4 bg-gold-300" />
              </div>
              <p className="font-display text-6xl text-gold-300">01 <span className="text-3xl text-white/28">/04</span></p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Verify static layout build**

Run:

```bash
npm run build
```

Expected: PASS. The page has static semantic content and visual layout.

- [ ] **Step 5: Commit**

```bash
git add components/site-header.tsx app/page.tsx app/globals.css
git commit -m "feat: add static case site shell"
```

## Task 4: Interactive Showcase Components

**Files:**
- Create: `components/case-card.tsx`
- Create: `components/case-showcase.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `CaseShowcase()`.
- Produces: `CaseCard({ item, active, compact, onSelect, onPlay })`.
- Consumes: `caseCategories`, `getCasesByCategory`, and `CaseItem`.

- [ ] **Step 1: Create card component**

Create `components/case-card.tsx`:

```tsx
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
      className={`group relative h-[520px] shrink-0 overflow-hidden rounded-lg border bg-white/5 transition-colors ${
        active ? 'w-[350px] border-white/42 shadow-glow' : compact ? 'w-[220px] border-white/18' : 'w-[340px] border-white/22'
      }`}
      onClick={onSelect}
    >
      <img
        src={item.cover}
        alt={`${item.title} AI 文旅视频案例封面`}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${active ? 'opacity-90' : 'opacity-58'}`}
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
```

- [ ] **Step 2: Create interactive showcase**

Create `components/case-showcase.tsx` with client state for `activeCategory`, `activeIndex`, modal flags, autoplay pause, background parallax, category switching, and carousel controls. Use `AnimatePresence` for background and text transitions.

```tsx
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
            key={activeCase.id}
            src={activeCase.background}
            alt={`${activeCase.title} AI 文旅视频案例背景`}
            className="absolute inset-0 h-full w-full object-cover opacity-68"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
            animate={{
              opacity: 0.68,
              scale: 1,
              x: reduceMotion ? 0 : pointer.x * 8,
              y: reduceMotion ? 0 : pointer.y * 8
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,20,0.9)_0%,rgba(4,16,20,0.5)_46%,rgba(4,16,20,0.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-ink-950 to-transparent" />

        <section className="relative z-10 mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 gap-10 px-6 pb-8 pt-28 md:grid-cols-[42%_58%] md:px-12 md:pt-36">
          <motion.div
            className="flex min-h-[58vh] flex-col justify-center md:min-h-0"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.32 }}
              >
                <h1 className="font-display text-5xl leading-tight text-white md:text-7xl lg:text-8xl">
                  {activeIndex === 0 && activeCategory === 'promo' ? 'AI 文旅视频案例' : activeCase.title}
                </h1>
                <p className="mt-6 text-xl tracking-[0.32em] text-white/84 md:text-2xl">{activeCase.subtitle}</p>
                <div className="mt-9 h-px w-16 bg-gold-300" />
                <p className="mt-8 max-w-xl text-base leading-8 text-white/66 md:text-lg md:leading-9">{activeCase.description}</p>
              </motion.div>
            </AnimatePresence>
            <button
              className="mt-10 inline-flex w-fit items-center gap-5 rounded-full border border-white/20 bg-black/16 px-7 py-3 text-gold-100 transition hover:border-gold-300/60 hover:bg-gold-300/10"
              type="button"
              onClick={() => setVideoCase(activeCase)}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-300 text-ink-950 shadow-glow">
                <Play size={22} fill="currentColor" />
              </span>
              <span className="tracking-[0.24em]">观看作品集</span>
            </button>
            <section id="about" className="mt-auto max-w-lg border-l border-gold-300/70 pl-6 pt-16">
              <h2 className="text-xl font-semibold text-gold-100">关于我们</h2>
              <p className="mt-5 leading-8 text-white/62">我们是一支深耕文旅领域的 AI 影像创作团队，用技术与审美连接文化与未来，让每一处风景都被世界记住。</p>
              <button className="mt-5 inline-flex text-gold-300" type="button" onClick={() => setContactOpen(true)}>了解更多 →</button>
            </section>
          </motion.div>

          <motion.div
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
                  className={`relative pb-4 transition ${activeCategory === category.id ? 'text-gold-300' : 'text-white/62 hover:text-gold-100'}`}
                  type="button"
                  onClick={() => chooseCategory(category.id)}
                >
                  {category.label}
                  {activeCategory === category.id && <motion.span layoutId="category-line" className="absolute bottom-0 left-0 h-0.5 w-full bg-gold-300" />}
                </button>
              ))}
            </div>
            <motion.div className="flex gap-5" layout>
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
            <div className="mt-12 flex items-center gap-5 md:mt-20 md:gap-8">
              <button className="grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white/70 transition hover:border-gold-300 hover:bg-gold-300/12 hover:text-gold-100 md:h-14 md:w-14" type="button" aria-label="上一个案例" onClick={() => move(-1)}>
                <ArrowLeft />
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white/70 transition hover:border-gold-300 hover:bg-gold-300/12 hover:text-gold-100 md:h-14 md:w-14" type="button" aria-label="下一个案例" onClick={() => move(1)}>
                <ArrowRight />
              </button>
              <div className="ml-3 h-px flex-1 bg-white/16 md:ml-10">
                <motion.div className="h-px bg-gold-300" animate={{ width: progressWidth }} transition={{ duration: 0.35 }} />
              </div>
              <p className="font-display text-5xl text-gold-300 md:text-6xl">
                {String(activeIndex + 1).padStart(2, '0')} <span className="text-2xl text-white/28 md:text-3xl">/{String(activeCases.length).padStart(2, '0')}</span>
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
```

- [ ] **Step 3: Use interactive showcase on homepage**

Modify `app/page.tsx` so it keeps JSON-LD and renders `CaseShowcase`:

```tsx
import { CaseShowcase } from '@/components/case-showcase'
import { cases, organizationJsonLd } from '@/data/cases'

export default function HomePage() {
  const creativeWorks = cases.map((item) => ({
    '@type': item.videoUrl ? 'VideoObject' : 'CreativeWork',
    name: item.title,
    description: item.description,
    thumbnailUrl: item.cover,
    keywords: item.seoKeywords.join(','),
    genre: item.category === 'promo' ? '文旅宣传片' : '文旅广告片'
  }))
  const jsonLd = { '@context': 'https://schema.org', '@graph': [organizationJsonLd, ...creativeWorks] }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CaseShowcase />
    </>
  )
}
```

- [ ] **Step 4: Run type/build check**

Run:

```bash
npm run build
```

Expected: build fails because `VideoModal` and `ContactModal` imports do not exist yet. This is the expected boundary before Task 5.

- [ ] **Step 5: Commit**

Do not commit at this boundary because the app intentionally does not build. Continue to Task 5 before committing.

## Task 5: Video And Contact Modals

**Files:**
- Create: `components/video-modal.tsx`
- Create: `components/contact-modal.tsx`

**Interfaces:**
- Produces: `VideoModal({ item, onClose })`.
- Produces: `ContactModal({ open, onClose })`.
- Consumes: `CaseItem` from `data/cases.ts`.

- [ ] **Step 1: Create video modal**

Create `components/video-modal.tsx`:

```tsx
'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CaseItem } from '@/data/cases'

interface VideoModalProps {
  item: CaseItem | null
  onClose: () => void
}

export function VideoModal({ item, onClose }: VideoModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} 视频播放`}
        >
          <motion.div
            className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/16 bg-ink-950 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28 }}
          >
            <button
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-gold-300 hover:text-gold-100"
              type="button"
              aria-label="关闭视频弹窗"
              onClick={onClose}
            >
              <X size={18} />
            </button>
            {item.videoUrl ? (
              <video className="aspect-video w-full bg-black" src={item.videoUrl} controls autoPlay />
            ) : (
              <div className="grid aspect-video place-items-center bg-[radial-gradient(circle_at_center,rgba(223,183,106,0.16),rgba(4,16,20,1)_58%)] px-8 text-center">
                <div>
                  <p className="font-display text-4xl text-white">{item.title}</p>
                  <p className="mt-5 text-lg text-white/62">视频即将上线</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create contact modal**

Create `components/contact-modal.tsx`:

```tsx
'use client'

import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const need = String(form.get('need') ?? '').trim()

    if (!name || !phone || !need) {
      setError('请填写姓名、手机号和需求描述')
      return
    }

    setError('')
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="联系合作"
        >
          <motion.div
            className="relative w-full max-w-xl rounded-lg border border-white/16 bg-ink-950 p-8 shadow-2xl"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35 }}
          >
            <button className="absolute right-4 top-4 text-white/66 hover:text-gold-100" type="button" aria-label="关闭联系弹窗" onClick={onClose}>
              <X size={20} />
            </button>
            <h2 className="font-display text-4xl text-white">联系合作</h2>
            <p className="mt-4 leading-7 text-white/62">告诉我们你的项目需求，我们将为你提供文旅影像解决方案。</p>
            {submitted ? (
              <div className="mt-8 rounded border border-gold-300/30 bg-gold-300/10 p-5 text-gold-100">需求已记录，我们会尽快与你联系。</div>
            ) : (
              <form className="mt-8 grid gap-4" onSubmit={submit}>
                <label className="grid gap-2 text-sm text-white/70">
                  姓名
                  <input className="rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300" name="name" />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  手机号
                  <input className="rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300" name="phone" inputMode="tel" />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  项目类型
                  <select className="rounded border border-white/14 bg-ink-900 px-4 py-3 text-white outline-none focus:border-gold-300" name="type" defaultValue="文旅宣传片">
                    <option>文旅宣传片</option>
                    <option>景区广告片</option>
                    <option>博物馆宣传片</option>
                    <option>城市品牌视频</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  需求描述
                  <textarea className="min-h-28 rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300" name="need" />
                </label>
                {error && <p className="text-sm text-gold-100">{error}</p>}
                <button className="mt-2 rounded bg-gold-300 px-5 py-3 font-semibold text-ink-950 transition hover:bg-gold-100" type="submit">提交需求</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Verify app builds with interactions**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/case-card.tsx components/case-showcase.tsx components/video-modal.tsx components/contact-modal.tsx app/page.tsx
git commit -m "feat: add interactive case showcase"
```

## Task 6: Responsive Polish And Visual Accuracy

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `components/case-showcase.tsx`
- Modify: `components/case-card.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: components from Tasks 3-5.
- Produces: mobile-friendly layout and desktop proportions that better match `render.png`.

- [ ] **Step 1: Add mobile nav button and compact header behavior**

Modify `components/site-header.tsx` to show a compact “菜单” button on mobile and keep desktop text navigation unchanged. The mobile button anchors to `#case-list`.

```tsx
<a className="nav-link md:hidden" href="#case-list">菜单</a>
```

Place it after the desktop `nav` element inside the header flex container.

- [ ] **Step 2: Make carousel horizontally scrollable on mobile**

In `components/case-showcase.tsx`, change the card list container class:

```tsx
<motion.div className="flex snap-x gap-5 overflow-x-auto pb-4 md:overflow-visible" layout>
```

In `components/case-card.tsx`, add `snap-center` to the article class string:

```tsx
className={`group relative h-[520px] snap-center shrink-0 overflow-hidden rounded-lg border bg-white/5 transition-colors ...`}
```

- [ ] **Step 3: Prevent text overflow on small screens**

In `components/case-showcase.tsx`, update the hero title class:

```tsx
className="max-w-full break-words font-display text-5xl leading-tight text-white md:text-7xl lg:text-8xl"
```

Update the subtitle class:

```tsx
className="mt-6 max-w-full break-words text-xl tracking-[0.18em] text-white/84 md:text-2xl md:tracking-[0.32em]"
```

- [ ] **Step 4: Add scrollbar and selection polish**

Append to `app/globals.css`:

```css
::selection {
  background: rgba(223, 183, 106, 0.32);
}

@layer utilities {
  .no-scrollbar {
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

Add `no-scrollbar` to the mobile scroll container in `components/case-showcase.tsx`.

- [ ] **Step 5: Verify desktop and mobile visually**

Run:

```bash
npm run dev
```

Expected: dev server starts, usually at `http://localhost:3000`.

Open desktop viewport `1440x900` and mobile viewport `390x844`. Confirm:

- Header does not overlap hero text.
- Hero title and subtitle fit.
- Cards are visible and scrollable on mobile.
- Bottom progress/page number does not overlap cards.
- About block is readable.

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/site-header.tsx components/case-showcase.tsx components/case-card.tsx app/globals.css
git commit -m "fix: polish responsive case showcase"
```

## Task 7: SEO And Accessibility Verification

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `data/cases.ts`

**Interfaces:**
- Consumes: metadata and JSON-LD from Task 2.
- Produces: final SEO metadata and accessible page structure.

- [ ] **Step 1: Confirm metadata domain value**

Keep `https://example.com` until a production domain is provided. Add a named constant in `app/layout.tsx`:

```tsx
const siteUrl = 'https://example.com'
```

Use it in `metadataBase`, `openGraph.url`, and `alternates.canonical`.

- [ ] **Step 2: Add Open Graph image from the first case**

In `app/layout.tsx`, add:

```tsx
openGraph: {
  title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
  description: '面向目的地、博物馆、景区及文化品牌的 AI 文旅视频案例展示。',
  url: siteUrl,
  siteName: '文旅视界',
  locale: 'zh_CN',
  type: 'website',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      width: 1200,
      height: 630,
      alt: '文旅视界 AI 文旅视频案例展示'
    }
  ]
}
```

- [ ] **Step 3: Add hidden SEO content for all cases**

In `app/page.tsx`, after `<CaseShowcase />`, add a visually hidden case list so all case content exists in server HTML:

```tsx
<section className="sr-only" aria-label="AI 文旅视频案例列表">
  {cases.map((item) => (
    <article key={item.id}>
      <h2>{item.title}</h2>
      <p>{item.subtitle}</p>
      <p>{item.description}</p>
      <p>{item.seoKeywords.join('，')}</p>
    </article>
  ))}
</section>
```

- [ ] **Step 4: Add screen-reader utility**

If Tailwind `sr-only` works through Tailwind utilities, no change is required. If build reports `sr-only` unavailable, add this to `app/globals.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Build and inspect HTML**

Run:

```bash
npm run build
```

Expected: PASS.

Run:

```bash
npm run dev
```

Open page source and verify the HTML includes:

- `文旅宣传片制作与 AI 文旅视频案例`
- `增城文旅`
- `南阳汉画馆`
- `application/ld+json`

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx data/cases.ts app/globals.css
git commit -m "feat: improve seo content"
```

## Task 8: Final Browser Verification

**Files:**
- Modify only files required by verification fixes.

**Interfaces:**
- Consumes: full app from Tasks 1-7.
- Produces: verified running site URL.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected: dev server stays running and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Verify interactions manually**

In browser, confirm:

- First load animates background, nav, hero, cards, and bottom controls.
- Clicking right arrow changes case and page number.
- Clicking left arrow loops from first to last.
- Clicking “广告片” changes cards and resets page number to `01 / 04`.
- Clicking a card updates the background and left copy.
- Clicking play opens the video modal.
- Closing video modal returns to the same active case.
- Clicking “联系合作” opens contact modal.
- Submitting empty contact form shows “请填写姓名、手机号和需求描述”.
- Filling required fields shows success feedback.

- [ ] **Step 4: Verify responsive layout**

Check desktop `1440x900` and mobile `390x844`:

- No text overlaps.
- Header remains readable.
- Case cards remain usable.
- Progress and page number fit their container.
- Contact modal fits the viewport.

- [ ] **Step 5: Commit final fixes**

If verification required code changes:

```bash
git add app components data tailwind.config.ts
git commit -m "fix: address final showcase verification issues"
```

If no code changes were required, do not create an empty commit.

## Self-Review Notes

- Spec coverage: scaffold, SEO shell, visual shell, interactions, modals, responsive behavior, and verification are all covered by Tasks 1-8.
- Placeholder scan: no incomplete requirement markers remain in this plan.
- Type consistency: `CaseCategory`, `CaseItem`, `CaseShowcase`, `CaseCard`, `VideoModal`, and `ContactModal` signatures are defined before use.
