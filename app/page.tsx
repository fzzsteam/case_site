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
    </>
  )
}
