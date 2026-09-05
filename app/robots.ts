import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

const aiCrawlers = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-User",
  "Google-Extended",
  "Bytespider",
  "DoubaoBot",
  "YisouSpider",
];

export default function robots(): MetadataRoute.Robots {
  const crawlRules = { allow: "/", disallow: ["/api/", "/admin"] };
  return {
    rules: [
      { userAgent: "*", ...crawlRules },
      ...aiCrawlers.map((userAgent) => ({ userAgent, ...crawlRules })),
    ],
    sitemap: `${siteConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
