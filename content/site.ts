import { normalizeSiteUrl } from "@/lib/seo/config";

export const siteConfig = {
  name: "万象元生",
  companyName: "深圳市方直智胜科技有限公司",
  title: "万象元生｜AI 文旅宣传片与 AIGC 影像创作",
  description: "万象元生以 AI 与文化叙事为核心，为城市、景区、博物馆、品牌与乡村非遗创作文旅宣传片、短视频和 AIGC 影像。",
  companyIntro: "深圳市方直智胜科技有限公司系A股上市公司方直科技（股票代码：300235）旗下专注于AI应用落地的核心子公司。公司立足深圳科技创新高地，聚焦“AI+影视内容”垂直赛道，致力于以人工智能技术重构短剧、漫剧等新型内容形态的生产范式。通过深度融合前沿AI技术与专业内容创作体系，方直智胜正持续打造兼具技术壁垒与市场影响力的高品质AI影视作品，推动影视内容产业向智能化、工业化新阶段迈进。",
  companyVision: "以技术为笔，以故事为魂。我们相信 AI 不仅是工具，更是创作伙伴。通过持续的技术创新与内容探索，方直智胜致力于成为 AI 影视内容领域的领先品牌，让更多优质故事以全新的方式触达观众。",
  alternateNames: ["方直智胜", "方直智胜科技"],
  services: ["城市文旅 AI 宣传片", "文旅短视频与微短剧代运营", "博物馆文物数字化", "乡村文旅与非遗数字化"],
  knowsAbout: ["AI 文旅宣传片", "AIGC 影像创作", "文博数字化", "文旅短视频", "微短剧内容制作", "IP 内容开发"],
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  phone: "0755-86336966",
  email: "lanyanfeng@fzzsedu.cn",
  address: "深圳市南山区南头街道马家龙社区大新路198号创新大厦B栋901",
  icp: "粤ICP备2026044251号",
  icpUrl: "https://www.miit.gov.cn/index.html",
};
