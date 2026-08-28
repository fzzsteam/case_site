import type { TalentProfile, TalentWork } from "./types";

const ouyangAsset = (file: string) => `/portfolio/site-k7m3x9p/assets/${file}`;

export const DEMO_TALENTS: TalentProfile[] = [
  {
    id: "ouyang",
    name: "欧阳",
    role: "AI视觉创作者 / AIGC内容运营",
    intro: "扎根消费品牌内容赛道，兼具内容审美与业务思维，持续把 AI 视觉与内容运营沉淀成可交付的商业作品。",
    bio: "擅长从选题策划、视觉生成到短视频产出与数据复盘，覆盖文旅宣传、产品广告和新媒体内容运营等方向。",
    avatarPath: ouyangAsset("avatar.webp"),
    location: "深圳",
    skills: ["短视频剪辑", "影视海报", "AIGC插画", "数字人"],
    works: [
      {
        id: "ouyang-portfolio",
        slug: "site-k7m3x9p",
        title: "欧阳 · AI视觉创作者作品集",
        type: "website",
        source: "static",
        summary: "个人案例网站，集中呈现视觉创作、商业短片和品牌内容运营作品。",
        coverPath: ouyangAsset("hero-poster.webp"),
        siteSlug: "site-k7m3x9p",
      },
      {
        id: "ouyang-heyuan",
        slug: "ouyang-heyuan",
        title: "河源城市文旅宣传片",
        type: "video",
        source: "uploaded",
        summary: "以城市文旅为主题的 AI 影像宣传片，完成从场景叙事到成片包装的完整表达。",
        coverPath: ouyangAsset("v-heyuan-poster.webp"),
        mediaPath: ouyangAsset("v-heyuan.mp4"),
      },
      {
        id: "ouyang-orange",
        slug: "ouyang-orange",
        title: "橙汁产品广告",
        type: "video",
        source: "uploaded",
        summary: "围绕卖点展示与产品质感完成的商业短片案例。",
        coverPath: ouyangAsset("v-chengzhi-poster.webp"),
        mediaPath: ouyangAsset("v-chengzhi.mp4"),
      },
      {
        id: "ouyang-visual",
        slug: "ouyang-visual",
        title: "消费品牌视觉物料",
        type: "image",
        source: "uploaded",
        summary: "面向消费品牌的新媒体视觉与商业图像创作。",
        coverPath: ouyangAsset("p1.webp"),
        galleryPaths: [ouyangAsset("p1.webp"), ouyangAsset("p2.webp"), ouyangAsset("p3.webp"), ouyangAsset("p4.webp")],
      },
    ],
  },
  {
    id: "lin-yifan",
    name: "林一凡",
    role: "AI视觉设计师 / 短视频创作者",
    intro: "主攻 AIGC 电商视觉设计，副线 AI 短视频内容运营，用视觉创意服务品牌表达和内容传播。",
    bio: "聚焦电商视觉、短视频内容和 AI 创意策划，形成从创意构思、视觉制作到内容交付的完整工作链路。",
    location: "深圳",
    skills: ["短视频剪辑", "影视海报", "AIGC插画"],
    works: [
      {
        id: "lin-qwenwork",
        slug: "lin-yifan-qwenwork",
        title: "AI视觉创作者作品集",
        type: "website",
        source: "external",
        summary: "AIGC 内容运营、新媒体视觉设计与 AI 创意策划案例。",
        siteUrl: "https://wmy47gmh.qwenwork.host/",
      },
      {
        id: "lin-workbuddy",
        slug: "lin-yifan-workbuddy",
        title: "AI电商视觉与短视频作品集",
        type: "website",
        source: "external",
        summary: "AI 电商视觉设计、短视频创作与品牌内容案例。",
        siteUrl: "https://f5389c591df64575ba7940b74b91b825.app.workbuddy.link/",
      },
    ],
  },
];

export function getDemoTalent(talentId: string) {
  return DEMO_TALENTS.find((talent) => talent.id === talentId) ?? null;
}

export function getDemoWork(talentId: string, workSlug: string): { talent: TalentProfile; work: TalentWork } | null {
  const talent = getDemoTalent(talentId);
  if (!talent) return null;
  const work = talent.works.find((item) => item.slug === workSlug);
  return work ? { talent, work } : null;
}

export function getWorkTypeLabel(type: TalentWork["type"]) {
  return type === "video" ? "视频作品" : type === "image" ? "图片作品" : "网站作品";
}

export function getStaticSiteUrl(siteSlug: string) {
  return `https://${siteSlug}.edu.fzzsai.com/`;
}
