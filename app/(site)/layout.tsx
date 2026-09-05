import type { Metadata } from "next";
import "../globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { QuotePanel } from "@/components/home/quote-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/content/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

const sans = Noto_Sans_SC({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Noto_Serif_SC({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s｜${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["AI文旅宣传片", "AIGC影像创作", "文博数字化", "文旅短视频", "微短剧制作", "万象元生"],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.companyName }],
  creator: siteConfig.companyName,
  publisher: siteConfig.companyName,
  icons: { icon: "/brand/logo_tiny.png", apple: "/brand/logo_tiny.png" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "万象元生 AI 文旅宣传片与 AIGC 影像创作" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className={`${sans.variable} ${serif.variable}`}><body><JsonLd data={organizationJsonLd()} /><JsonLd data={websiteJsonLd()} /><SiteHeader /><main>{children}</main><SiteFooter /><QuotePanel /></body></html>;
}
