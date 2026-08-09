import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { AIGC_MEDIA, aigcImageUrl } from "@/components/aigc/media";
import "./aigc.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "万象元生 · AIGC 商业实践实训",
  description:
    "从认知到商业落地，贯通 AIGC 创作全链路。七大实践模块、真实商业项目实训、个人作品集打磨。方直科技（300235）全资子公司方直智胜运营。",
  icons: {
    icon: aigcImageUrl(AIGC_MEDIA.mainFaviconPath),
    apple: aigcImageUrl(AIGC_MEDIA.mainFaviconPath),
  },
  openGraph: {
    title: "万象元生 · AIGC 商业实践实训",
    description: "从认知到商业落地，贯通 AIGC 创作全链路。",
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
