import type { Metadata } from 'next';
import { siteConfig } from '@/content/site';
import './aigc.css';

export const metadata: Metadata = {
  // 没有根 layout 兜底，这里不给 metadataBase 的话 openGraph 里的相对图片路径会被 Next 丢掉
  metadataBase: new URL(siteConfig.url),
  title: '万象元生 · AIGC 商业实践实训',
  description:
    '从认知到商业落地，贯通 AIGC 创作全链路。七大实践模块、真实商业项目实训、个人作品集打磨。方直科技（300235）全资子公司方直智胜运营。',
  openGraph: {
    title: '万象元生 · AIGC 商业实践实训',
    description: '从认知到商业落地，贯通 AIGC 创作全链路。',
    images: ['/aigc/video/hero-poster.jpg'],
  },
};

// 本站没有 app/layout.tsx，每个顶层分支自己吐 <html>/<body>；
// 招生站不引 globals.css，样式全部由 aigc.css 挂在 .aigc-root 下，与案例站互不影响。
export default function AigcLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="aigc-body">{children}</body>
    </html>
  );
}
