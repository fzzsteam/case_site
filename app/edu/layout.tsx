import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { AIGC_MEDIA, aigcImageUrl } from "@/components/aigc/media";
import "./aigc.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "万象元生 × 深圳电影制片厂 · 31 天线下 AIGC 影视内容商业实训营",
  description:
    "上市公司方直科技（300235）全资子公司出品。深影厂行业专家专题授课、线下沉浸式集训、商用作品集产出——七大实践模块贯通 AIGC 商业创作全链路。",
  icons: {
    icon: aigcImageUrl(AIGC_MEDIA.mainFaviconPath),
    apple: aigcImageUrl(AIGC_MEDIA.mainFaviconPath),
  },
  openGraph: {
    title: "万象元生 × 深圳电影制片厂 · 31 天线下 AIGC 影视内容商业实训营",
    description: "深影厂行业专家专题授课｜线下沉浸式集训｜商用作品集产出。",
    images: [aigcImageUrl(AIGC_MEDIA.heroPosterPath)],
  },
};

export default function AigcLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
