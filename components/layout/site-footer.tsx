import { siteConfig } from "@/content/site";
export function SiteFooter() {
  return <footer className="site-footer">
    <small>© 2026 {siteConfig.companyName} · <a href={siteConfig.icpUrl} target="_blank" rel="noreferrer">{siteConfig.icp}</a></small>
  </footer>;
}
