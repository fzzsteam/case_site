import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";
export default function sitemap():MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages: MetadataRoute.Sitemap = ["/"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : .8,
  }));
  return pages;
}
