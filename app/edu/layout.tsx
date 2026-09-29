import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { AIGC_MEDIA, aigcImageUrl } from "@/components/aigc/media";
import "./aigc.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "方直智胜 × 深圳电影制片厂 · 31 天线下 AIGC 影视内容商业实训营",
  description: "31 天线下 AIGC 影视内容实训，从创意到交付完成真实商业作品。",
  icons: {
    icon: "/edu/fangzhi-zhisheng-logo.png",
    apple: "/edu/fangzhi-zhisheng-logo.png",
  },
  openGraph: {
    title: "方直智胜 × 深圳电影制片厂 · 31 天线下 AIGC 影视内容商业实训营",
    description: "31 天线下 AIGC 影视内容实训，从创意到交付完成真实商业作品。",
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
