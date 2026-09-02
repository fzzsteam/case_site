import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";
import { listCases } from "@/lib/cases/queries";
import { listTalentProfiles } from "@/lib/talent/queries";

// 数据库在构建镜像阶段不可达（见 Dockerfile），站点地图必须在请求时生成，不能在构建时静态化。
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/cases",
    "/about",
    "/edu",
    "/edu/talent",
    "/edu/visual-lab",
    "/edu/visual-lab/talent",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : .8,
  }));
  const caseStudies = await listCases();
  const talents = await listTalentProfiles();
  const casePages: MetadataRoute.Sitemap = caseStudies.map((item) => ({
    url: `${base}/cases/${item.slug}`,
    lastModified: item.createdAt,
    changeFrequency: "monthly",
    priority: .7,
  }));
  const talentPages: MetadataRoute.Sitemap = talents.flatMap((talent) => [
    {
      url: `${base}/edu/talent/${talent.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/edu/visual-lab/talent/${talent.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);
  return [...staticPages, ...casePages, ...talentPages];
}
