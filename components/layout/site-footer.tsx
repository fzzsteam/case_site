import { siteConfig } from "@/content/site";
export function SiteFooter() { return <footer className="site-footer"><div><strong>{siteConfig.name}</strong><p>专注文旅数字化 · 赋能文化新未来</p></div><small>创意 · 科技 · 文化 · 共生</small><small>© 2026 {siteConfig.name}</small></footer>; }
