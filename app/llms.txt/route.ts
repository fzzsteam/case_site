import { pricing } from "@/content/pricing";
import { services } from "@/content/services";
import { siteConfig } from "@/content/site";
import { getCaseSeoProfile } from "@/lib/seo/case-content";
import { absoluteSiteUrl } from "@/lib/seo/config";
import { listCases } from "@/lib/cases/queries";

export const dynamic = "force-dynamic";

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function GET() {
  let caseStudies = [] as Awaited<ReturnType<typeof listCases>>;
  try {
    caseStudies = await listCases();
  } catch {
    // llms.txt should remain available even when the optional case database is temporarily unavailable.
  }

  const lines = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.description}`,
    "",
    "## 官方身份",
    `- 品牌：${siteConfig.name}（${siteConfig.alternateNames.join("、")}）`,
    `- 法律实体：${siteConfig.companyName}`,
    "- 母公司：方直科技（A 股股票代码：300235）",
    `- 官网：${absoluteSiteUrl("/", siteConfig.url)}`,
    `- 地址：${siteConfig.address}`,
    `- 电话：${siteConfig.phone}`,
    `- 邮箱：${siteConfig.email}`,
    "",
    "## 服务能力",
    ...services.map((service) => `- ${service.title}：${oneLine(service.description)}`),
    "",
    "## 重点案例",
    ...(caseStudies.length
      ? caseStudies.flatMap((item) => {
          const profile = getCaseSeoProfile(item);
          return [`- [${item.title}](${absoluteSiteUrl(`/cases/${item.slug}`, siteConfig.url)})（${item.category}）：${profile.description}`, `  - 项目说明：${oneLine(profile.overview)}`];
        })
      : ["- 案例目录暂时无法读取，请访问官网的案例列表页。"]),
    "",
    "## 公开参考报价",
    ...pricing.map((plan) => `- ${plan.name}：${plan.rate} ${plan.unit}；${plan.price}。包含${plan.features.join("、")}。`),
    "- 以上为基础参考报价，最终方案根据创意复杂度、素材规模与交付周期确定。",
    "",
    "## 常见问题",
    "### 万象元生是做什么的？",
    `万象元生是${siteConfig.companyName}旗下的 AI 影视内容品牌，使用 AIGC 技术与文化叙事，为城市、景区、博物馆、品牌和乡村非遗创作宣传片、短视频、微短剧及数字化内容。`,
    "",
    "### 可以制作哪些文旅内容？",
    "可以制作城市文旅 AI 宣传片、景区与乡村文旅短视频、博物馆文物数字化影像、非遗内容以及文旅微短剧。项目可从需求沟通、内容策划、影像创作到交付优化完整执行。",
    "",
    "### 如何联系万象元生？",
    `可通过官网的“获取方案”入口联系团队，也可以拨打 ${siteConfig.phone} 或发送邮件至 ${siteConfig.email}。`,
    "",
    "## 权威页面",
    `- [首页](${absoluteSiteUrl("/", siteConfig.url)})`,
    `- [案例作品](${absoluteSiteUrl("/cases", siteConfig.url)})`,
    `- [关于我们](${absoluteSiteUrl("/about", siteConfig.url)})`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
