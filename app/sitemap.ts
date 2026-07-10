import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/cases";
import { siteConfig } from "@/content/site";
export default function sitemap():MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages: MetadataRoute.Sitemap = ["/", "/cases", "/about", "/contact"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : .8,
  }));
  const cases: MetadataRoute.Sitemap = caseStudies.map((item) => ({
    url: `${base}/cases/${item.slug}`,
    lastModified: new Date(item.publishedAt),
    changeFrequency: "yearly",
    priority: .7,
  }));
  return [...pages, ...cases];
}
