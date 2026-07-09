export type CaseCategory = 'promo' | 'ad'

export interface CaseItem {
  id: string
  category: CaseCategory
  title: string
  subtitle: string
  description: string
  cover: string
  background: string
  coverPosition?: string
  backgroundPosition?: string
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
    cover: '/images/promo-zengcheng.png',
    background: '/images/hero-reference.png',
    coverPosition: '48% center',
    backgroundPosition: 'center center',
    videoUrl: '',
    seoKeywords: ['增城文旅视频案例', '文旅宣传片制作', '景区 AI 视频']
  },
  {
    id: 'nanyang-museum',
    category: 'promo',
    title: '南阳汉画馆',
    subtitle: '汉韵千年 · 文化永恒',
    description: '围绕汉画像石、展陈光影和历史纹样，塑造博物馆影像叙事。',
    cover: '/images/promo-nanyang.png',
    background: '/images/hero-reference.png',
    coverPosition: '72% center',
    backgroundPosition: '68% center',
    videoUrl: '',
    seoKeywords: ['南阳汉画馆宣传片', '博物馆宣传片', 'AI 文旅视频创作']
  },
  {
    id: 'more-promo',
    category: 'promo',
    title: '更多案例',
    subtitle: '敬请期待',
    description: '更多文旅目的地、景区与文化品牌案例正在整理中。',
    cover: '/images/promo-more.png',
    background: '/images/hero-reference.png',
    coverPosition: '82% center',
    backgroundPosition: '80% center',
    seoKeywords: ['文旅宣传片制作', '景区 AI 视频'],
    status: 'coming-soon'
  },
  {
    id: 'coming-promo',
    category: 'promo',
    title: '即将上线',
    subtitle: '敬请期待',
    description: '新的文旅宣传片案例即将发布。',
    cover: '/images/promo-coming.png',
    background: '/images/hero-reference.png',
    coverPosition: '93% center',
    backgroundPosition: '86% center',
    seoKeywords: ['AI 文旅视频创作'],
    status: 'coming-soon'
  },
  {
    id: 'scenic-campaign',
    category: 'ad',
    title: '景区活动广告',
    subtitle: '节庆声量 · 即刻抵达',
    description: '为景区活动打造短周期、高记忆点的 AI 广告片视觉。',
    cover: '/images/ad-scenic.png',
    background: '/images/hero-reference.png',
    coverPosition: '40% center',
    backgroundPosition: '40% center',
    videoUrl: '',
    seoKeywords: ['景区 AI 视频', '城市文旅广告片']
  },
  {
    id: 'city-brand',
    category: 'ad',
    title: '城市品牌广告',
    subtitle: '城市名片 · 影像表达',
    description: '提炼城市地标、产业与生活方式，形成可传播的城市品牌短片。',
    cover: '/images/ad-city.png',
    background: '/images/hero-reference.png',
    coverPosition: '58% center',
    backgroundPosition: '58% center',
    videoUrl: '',
    seoKeywords: ['文旅宣传片制作', '城市文旅广告片']
  },
  {
    id: 'museum-exhibition',
    category: 'ad',
    title: '博物馆展览广告',
    subtitle: '展览上新 · 文化转译',
    description: '将展览主题转译为具有点击吸引力和文化质感的广告片。',
    cover: '/images/ad-museum.png',
    background: '/images/hero-reference.png',
    coverPosition: '72% center',
    backgroundPosition: '72% center',
    videoUrl: '',
    seoKeywords: ['博物馆宣传片', 'AI 文旅视频创作']
  },
  {
    id: 'coming-ad',
    category: 'ad',
    title: '即将上线',
    subtitle: '敬请期待',
    description: '更多广告片案例即将发布。',
    cover: '/images/ad-coming.png',
    background: '/images/hero-reference.png',
    coverPosition: '90% center',
    backgroundPosition: '84% center',
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
