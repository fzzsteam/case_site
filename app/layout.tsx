import type { Metadata } from 'next'
import './globals.css'
import { siteKeywords } from '@/data/cases'

const siteUrl = 'https://example.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
  description:
    '文旅视界展示文旅宣传片制作、景区 AI 视频、博物馆宣传片与城市文旅广告片案例，用 AI 影像讲好地方故事。',
  keywords: siteKeywords,
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: '文旅宣传片制作与 AI 文旅视频案例 | 文旅视界',
    description: '面向目的地、博物馆、景区及文化品牌的 AI 文旅视频案例展示。',
    url: siteUrl,
    siteName: '文旅视界',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/images/hero-reference.png',
        width: 1200,
        height: 630,
        alt: '文旅视界 AI 文旅视频案例展示'
      }
    ]
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
