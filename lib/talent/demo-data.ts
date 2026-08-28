import type { TalentProfile } from "./types";

const talentAsset = (folder: string, file: string) => `case-site/cases/aigc-talent/${folder}/${file}`;

/**
 * 人才集市的初始数据。
 * 媒体文件先上传 OSS，再由这里写入稳定对象路径；应用启动时会把这份数据迁移到人才表。
 */
export const DEMO_TALENTS: TalentProfile[] = [
  {
    id: "ouyang",
    name: "欧阳",
    role: "AI视觉创作者 / AIGC内容运营",
    intro: "扎根消费品牌内容赛道，兼具内容审美与业务思维，持续把 AI 视觉与内容运营沉淀成可交付的商业作品。",
    bio: "擅长从选题策划、视觉生成到短视频产出与数据复盘，覆盖文旅宣传、产品广告和新媒体内容运营等方向。",
    avatarPath: talentAsset("avatars", "ouyang.webp"),
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
        coverPath: talentAsset("covers", "ouyang-portfolio.webp"),
        siteSlug: "site-k7m3x9p",
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
        coverPath: talentAsset("covers", "lin-qwenwork.webp"),
        siteUrl: "https://wmy47gmh.qwenwork.host/",
      },
      {
        id: "lin-workbuddy",
        slug: "lin-yifan-workbuddy",
        title: "AI电商视觉与短视频作品集",
        type: "website",
        source: "external",
        summary: "AI 电商视觉设计、短视频创作与品牌内容案例。",
        coverPath: talentAsset("covers", "lin-workbuddy.webp"),
        siteUrl: "https://f5389c591df64575ba7940b74b91b825.app.workbuddy.link/",
      },
    ],
  },
  {
    id: "gu-qinghe",
    name: "顾清禾",
    role: "AI短剧导演 / 影视内容创作者",
    intro: "专注古装剧情与人物叙事，用 AI 完成从分镜构思到短片成片的完整表达。",
    bio: "擅长以东方场景、人物关系和轻喜剧节奏构建 AI 短剧，把视觉生成素材组织成有情节、有记忆点的内容。",
    avatarPath: talentAsset("avatars", "gu-qinghe.webp"),
    location: "深圳",
    skills: ["AI影视分镜", "短视频剪辑", "数字人"],
    works: [
      {
        id: "gu-qinghe-ancient-drama",
        slug: "gu-qinghe-ancient-drama",
        title: "古装轻喜剧剧情短片",
        type: "video",
        source: "uploaded",
        summary: "围绕古装人物、东方场景与轻喜剧节奏完成的 AI 剧情短片合集。",
        coverPath: talentAsset("covers", "ancient-drama.webp"),
        mediaPaths: [
          talentAsset("videos", "01-ancient-drama-washing.mp4"),
          talentAsset("videos", "05-ancient-drama-palace.mp4"),
          talentAsset("videos", "06-ancient-drama-journey.mp4"),
        ],
      },
    ],
  },
  {
    id: "xu-zhixing",
    name: "许知行",
    role: "AI文旅影像创作者 / 视觉导演",
    intro: "以山水、人文与地方气质为创作线索，探索 AI 文旅宣传片的镜头语言和情绪表达。",
    bio: "擅长从目的地特征提炼视觉主题，将航拍山水、传统建筑和花田意象组织成具有传播力的文旅影像。",
    avatarPath: talentAsset("avatars", "xu-zhixing.webp"),
    location: "深圳",
    skills: ["AI影视分镜", "短视频剪辑", "AIGC插画"],
    works: [
      {
        id: "xu-zhixing-cultural-tourism",
        slug: "xu-zhixing-cultural-tourism",
        title: "东方文旅影像短片",
        type: "video",
        source: "uploaded",
        summary: "融合传统建筑、万绿湖山水与花田景观的 AI 文旅影像合集。",
        coverPath: talentAsset("covers", "cultural-tourism.webp"),
        mediaPaths: [
          talentAsset("videos", "02-cultural-site.mp4"),
          talentAsset("videos", "03-wanlv-lake.mp4"),
          talentAsset("videos", "04-flower-field.mp4"),
        ],
      },
    ],
  },
  {
    id: "shen-wanqing",
    name: "沈晚晴",
    role: "AI商业视觉设计师 / 产品内容创作者",
    intro: "聚焦消费品牌与产品广告，用 AI 视觉把产品卖点、材质质感和生活方式转化为有吸引力的短片。",
    bio: "擅长拆解产品卖点，结合摄影式布光、动态镜头和场景化叙事，完成从商业创意到成片包装的视觉交付。",
    avatarPath: talentAsset("avatars", "shen-wanqing.webp"),
    location: "深圳",
    skills: ["短视频剪辑", "影视海报", "数字人"],
    works: [
      {
        id: "shen-wanqing-commercial-visual",
        slug: "shen-wanqing-commercial-visual",
        title: "消费品牌产品广告合集",
        type: "video",
        source: "uploaded",
        summary: "覆盖鲜橙、香氛洗衣、腕表与骑行产品的 AI 商业视觉短片合集。",
        coverPath: talentAsset("covers", "commercial-visual.webp"),
        mediaPaths: [
          talentAsset("videos", "07-orange-ad.mp4"),
          talentAsset("videos", "08-laundry-ad.mp4"),
          talentAsset("videos", "09-watch-ad.mp4"),
          talentAsset("videos", "10-bike-ad.mp4"),
        ],
      },
    ],
  },
];

export function getDemoTalent(talentId: string) {
  return DEMO_TALENTS.find((talent) => talent.id === talentId) ?? null;
}

export function getDemoWork(talentId: string, workSlug: string) {
  const talent = getDemoTalent(talentId);
  if (!talent) return null;
  const work = talent.works.find((item) => item.slug === workSlug);
  return work ? { talent, work } : null;
}
