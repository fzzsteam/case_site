import type { Metadata } from "next";
import { AboutSection } from "@/components/about/about-section";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/content/site";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "关于我们",
  description: siteConfig.companyIntro,
  keywords: ["深圳市方直智胜科技有限公司", "万象元生", "AI影视内容", "AIGC影像", "文旅数字化"],
  alternates: { canonical: "/about" },
  openGraph: {
    title: `关于我们｜${siteConfig.name}`,
    description: siteConfig.companyIntro,
    url: `${siteConfig.url}/about`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${siteConfig.name}企业介绍` }],
  },
  twitter: { card: "summary_large_image", title: `关于我们｜${siteConfig.name}`, description: siteConfig.companyIntro, images: ["/opengraph-image"] },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "首页", url: "/" }, { name: "关于我们", url: "/about" }])} />
      <h1 className="sr-only">关于我们｜{siteConfig.name}</h1>
      <AboutSection />
    </>
  );
}
