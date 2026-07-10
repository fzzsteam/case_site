import Link from "next/link";
import { siteConfig } from "@/content/site";
export function SiteFooter() { return <footer className="site-footer"><div><strong>{siteConfig.name}</strong><p>专注文旅数字化 · 赋能文化新未来</p></div><div className="footer-links"><Link href="/cases">案例</Link><Link href="/about">关于</Link><Link href="/contact">合作咨询</Link></div><small>© 2026 {siteConfig.name}</small></footer>; }
