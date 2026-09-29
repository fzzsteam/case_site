import type { CaseFaq, CaseStudy } from "@/lib/cases/types";

export type CaseSeoProfile = {
  description: string;
  keywords: string[];
};

export type LegacyCasePresentation = {
  detailIntro: string;
  client: string;
  region: string;
  deliverable: string;
  method: string;
  value: string;
  faq: CaseFaq[];
};

type LegacyCaseProfile = Omit<LegacyCasePresentation, "detailIntro"> & {
  description: string;
  keywords: string[];
};

const profiles: Record<string, LegacyCaseProfile> = {
  "han-sheng-sheng-bu-xi": {
    description: "万象元生为南阳市汉画馆创作的 AIGC 文博宣传片，以汉画像石为视觉原点，呈现两千年文明的生生不息。",
    client: "南阳市汉画馆",
    region: "河南南阳",
    deliverable: "横屏 AIGC 文博宣传片",
    keywords: ["南阳汉画馆", "汉画像石", "文博数字化", "AIGC宣传片", "文化遗产影像"],
    method: "创作以汉画像石的线刻质感和历史叙事为核心，通过 AIGC 影像生成重新组织静态石刻中的人物、动作与场景关系，再用镜头运动和节奏设计让沉睡的历史场景重新流动起来。",
    value: "本案将博物馆馆藏、地方历史与当代视觉技术连接起来，为文博机构提供一种适合展陈传播、城市文化传播和线上内容分发的影像表达方式。",
    faq: [
      { question: "《漢·生生不息》的合作方是谁？", answer: "本案合作方为南阳市汉画馆，项目服务于汉画像石专题博物馆的文博数字化传播需求。" },
      { question: "作品围绕什么文化内容展开？", answer: "作品围绕汉画像石中的生产劳动、乐舞百戏、天文神话等汉代社会图景展开，主题是文明传承与生生不息。" },
      { question: "万象元生可以制作类似的文博影像吗？", answer: "可以。万象元生提供博物馆文物数字化、文博动态影像与文化内容创作服务，可根据馆藏和传播目标定制方案。" },
    ],
  },
  "su-dong-po-de-li-zhi-kuang-xiang": {
    description: "增城文旅 AIGC 宣传片案例，以苏东坡与岭南荔枝文化为创意线索，演绎穿越古今的文化影像。",
    client: "增城文旅项目",
    region: "广东广州增城",
    deliverable: "横屏 AIGC 城市文旅宣传片",
    keywords: ["增城文旅", "苏东坡", "岭南荔枝", "城市宣传片", "AIGC影像"],
    method: "创作以苏东坡这一具有高识别度的文化人物为叙事入口，把增城挂绿、糯米糍等地方荔枝文化转化为视觉线索，并通过 AIGC 生成连接古代诗意与现代城市文旅表达。",
    value: "本案为地方文旅提供了从历史文化资产到年轻化传播内容的转译思路，适合用于目的地品牌传播、城市文旅宣传和社交媒体内容矩阵。",
    faq: [
      { question: "《苏东坡的荔枝狂想》是哪里的文旅案例？", answer: "这是增城文旅项目的 AIGC 宣传片案例，内容围绕广州增城的荔枝文化与地方历史展开。" },
      { question: "作品为什么选择苏东坡作为创意线索？", answer: "苏东坡的咏荔诗句与岭南荔枝文化关联紧密，具有较高的文化辨识度，适合连接历史故事与年轻化传播。" },
      { question: "万象元生能做城市文旅宣传片吗？", answer: "可以。万象元生为城市、景区和乡村文旅提供 AIGC 宣传片、短视频与内容策划服务。" },
    ],
  },
  "su-dong-po-dai-huo-zeng-cheng-li-zhi": {
    description: "增城荔枝 AIGC 创意广告案例，让苏东坡穿越到当代为地方物产带货，探索岭南文化的年轻化表达。",
    client: "增城荔枝品牌内容项目",
    region: "广东广州增城",
    deliverable: "竖屏与横屏 AIGC 创意广告",
    keywords: ["增城荔枝广告", "苏东坡带货", "地方物产营销", "AIGC广告片", "岭南文化"],
    method: "创作将古代人物、岭南荔枝历史和当代带货语境放在同一条叙事线上，以 AIGC 生成视觉完成古今场景转换，再结合竖屏和横屏两种内容形态适配不同传播触点。",
    value: "本案展示了地方特产如何借助文化 IP 和 AI 影像获得更年轻的品牌表达，也说明文旅内容与产品营销可以在同一套创意叙事中互相转化。",
    faq: [
      { question: "这支广告推广的是什么产品？", answer: "作品围绕增城荔枝展开，把增城的荔枝种植历史和苏东坡的文化意象转化为创意广告内容。" },
      { question: "作品适合哪些传播渠道？", answer: "项目同时包含竖屏与横屏视频形态，适合社交媒体短视频、品牌账号和地方文旅内容矩阵等场景。" },
      { question: "万象元生可以做地方特产广告吗？", answer: "可以。团队可以从地方文化、产品卖点和传播渠道出发，策划 AIGC 创意广告与品牌短视频。" },
    ],
  },
  "su-dong-po-yu-liu-rong-si": {
    description: "广州六榕寺 AIGC 文旅宣传片案例，以苏轼题写“六榕”的历史典故串联古寺、城市与岭南文化。",
    client: "广州六榕寺",
    region: "广东广州",
    deliverable: "横屏 AIGC 文旅宣传片",
    keywords: ["广州六榕寺", "苏东坡题字", "广州文旅", "历史文化影像", "AIGC宣传片"],
    method: "创作围绕真实历史典故建立叙事顺序，以六榕寺、东坡题字和千年古寺空间为核心视觉元素，借助 AIGC 技术进行历史场景再现，并以电影化镜头组织文化信息。",
    value: "本案把城市地标、历史人物与地方故事合并为一支具有识别度的文旅内容，适合景区宣传、城市文化传播和历史建筑的数字化表达。",
    faq: [
      { question: "《苏东坡与六榕寺》服务的对象是谁？", answer: "本案服务对象为广州六榕寺，内容聚焦寺庙历史、苏轼题字典故与广州文化地标。" },
      { question: "宣传片采用了什么创作方式？", answer: "作品以真实历史典故为叙事主线，结合 AIGC 影像技术再现千年古寺和东坡题字相关场景。" },
      { question: "万象元生能为历史建筑制作宣传内容吗？", answer: "可以。团队可围绕历史建筑、地方人物和文化典故策划文旅宣传片与系列短视频。" },
    ],
  },
  "feng-kuang-de-li-zhi": {
    description: "《疯狂的荔枝》是融合岭南荔枝商路、家族恩怨与传奇复仇的 AIGC 竖屏短剧案例。",
    client: "岭南荔枝文化内容项目",
    region: "岭南地区",
    deliverable: "4 集竖屏 AIGC 短剧片段",
    keywords: ["疯狂的荔枝", "AIGC短剧", "竖屏短剧", "岭南文化", "文旅短剧"],
    method: "创作采用竖屏短剧的观看习惯组织人物冲突和情节推进，再以 AIGC 影像完成古代商路、人物关系与场景氛围的视觉搭建，让地方文化在更贴近年轻观众的内容形态中被重新讲述。",
    value: "本案的价值在于把地方物产从静态介绍转化为连续剧情内容，为“荔枝+短剧+文旅”的内容开发提供了可视化样本，也适合延展为系列化 IP。",
    faq: [
      { question: "《疯狂的荔枝》是什么类型的作品？", answer: "这是融合古代商路、家族恩怨与传奇复仇元素的竖屏 AIGC 短剧案例，目前站内展示 4 个视频片段。" },
      { question: "短剧与文旅内容有什么关系？", answer: "作品以岭南荔枝的种植和商贸历史为背景，用剧情化方式承载地方文化信息，探索文旅内容的年轻化传播。" },
      { question: "万象元生能做 AIGC 微短剧吗？", answer: "可以。万象元生聚焦 AI+影视内容，提供短剧、漫剧及文旅内容的创意策划和 AIGC 影像制作。" },
    ],
  },
  "nan-de-yu-jian-ni": {
    description: "深圳南山区城市文旅 AIGC 宣传片案例，以山海景观、人文片区和科创气质呈现南山的城市体验。",
    client: "深圳市南山区",
    region: "广东深圳南山",
    deliverable: "竖屏 AIGC 城市文旅宣传片",
    keywords: ["深圳南山宣传片", "南山文旅", "城市文旅影像", "深圳城市宣传", "AIGC视频"],
    method: "创作以“南得遇见你”为主题，通过山海、街区和城市生活的镜头切换建立目的地印象，再以 AIGC 影像统一不同空间的视觉风格，兼顾城市信息和情绪感染力。",
    value: "本案为城市文旅宣传提供了短视频化、情绪化的表达方式，把目的地的地理信息、人文场景和科技气质转化为适合传播的城市内容。",
    faq: [
      { question: "《南得遇见你》介绍的是哪里？", answer: "作品介绍深圳市南山区，内容涉及深圳湾、蛇口、后海及南山新八景等城市文旅场景。" },
      { question: "这支片子的核心主题是什么？", answer: "作品以“南得遇见你”为主题，强调南山兼具科技活力、滨海景观与城市人文的一面。" },
      { question: "城市文旅宣传片可以用 AIGC 制作吗？", answer: "可以。AIGC 适合在前期概念、历史场景、想象性镜头和内容矩阵中提升城市文旅的表达效率。" },
    ],
  },
  "jia-wu-ding-zhi-xin-you-gui-qi": {
    description: "阳仔 AI 陪伴机新年主题 AIGC 宣传片，以异乡漂泊者的思乡情绪讲述陪伴与归属感。",
    client: "阳仔 AI 陪伴机",
    region: "品牌新年内容项目",
    deliverable: "横屏 AIGC 新年品牌宣传片",
    keywords: ["阳仔AI陪伴机", "新年宣传片", "品牌广告片", "AI陪伴", "AIGC品牌内容"],
    method: "创作从“家”的情绪切入，把节日、远方与陪伴关系转化为连续的故事场景，再使用 AIGC 影像完成具有温度的画面构建，让产品理念自然进入人物情感而非停留在功能介绍。",
    value: "本案体现了 AIGC 在品牌节日营销中的应用：通过情绪先行的叙事，帮助陪伴类产品建立更清晰的情感联想，并形成可用于品牌内容矩阵的视觉资产。",
    faq: [
      { question: "《家无定址，心有归期》为哪个品牌创作？", answer: "作品为阳仔 AI 陪伴机创作，是一支围绕新年、陪伴与归属感展开的品牌宣传片。" },
      { question: "作品主要表达什么情绪？", answer: "作品聚焦异乡漂泊者在年节时分的思乡情绪，表达陪伴和对归属感的向往。" },
      { question: "品牌可以委托万象元生制作节日内容吗？", answer: "可以。团队可围绕品牌产品、节日节点和用户情绪，策划 AIGC 宣传片、TVC 与社交媒体短视频。" },
    ],
  },
  "xiao-xiao-xin-shi-ye-zhi-de-bei-ting-jian": {
    description: "阳仔 AI 陪伴机新年 TVC 案例，以孩子成长中的小小心事表达陪伴、倾听与情感连接。",
    client: "阳仔 AI 陪伴机",
    region: "品牌新年内容项目",
    deliverable: "横屏 AIGC 新年 TVC",
    keywords: ["阳仔AI陪伴机", "新年TVC", "陪伴广告", "儿童情感内容", "AIGC广告"],
    method: "创作将儿童日常中的细节和情绪作为故事入口，通过人物关系、生活化场景与节日氛围建立共情，再用 AIGC 技术完成柔和、统一的品牌视觉表达。",
    value: "本案适合需要建立情感认知的陪伴类产品和家庭品牌，展示了品牌如何借助 AI 影像把抽象的产品理念转化为观众能够理解的故事。",
    faq: [
      { question: "这支 TVC 的品牌客户是谁？", answer: "本案客户为阳仔 AI 陪伴机，主题是新年场景下的陪伴与倾听。" },
      { question: "TVC 如何表达陪伴价值？", answer: "作品从孩子成长中容易被忽略的小小心事出发，通过温情故事表达每一份心事都值得被认真对待。" },
      { question: "万象元生可以制作品牌 TVC 吗？", answer: "可以。团队提供品牌创意、AIGC 影像制作和成片交付，适用于节日营销、产品传播和品牌内容建设。" },
    ],
  },
  "yang-zai-ni-ting-jian-le-ma": {
    description: "阳仔 AI 陪伴机新年祝福 AIGC 短片案例，以竖屏形式传递陪伴、倾听和新年问候。",
    client: "阳仔 AI 陪伴机",
    region: "品牌新年内容项目",
    deliverable: "竖屏 AIGC 新年祝福视频",
    keywords: ["阳仔AI陪伴机", "新年祝福视频", "竖屏广告", "品牌短视频", "AIGC影像"],
    method: "创作以短时长、竖屏观看和节日祝福为内容约束，集中提炼品牌角色与情绪信息，用简洁的镜头节奏和 AIGC 视觉完成适合移动端分享的祝福内容。",
    value: "本案适合品牌在节日节点快速建立社交传播触点，也体现了同一品牌可以通过宣传片、TVC 和祝福短片形成层次清晰的内容矩阵。",
    faq: [
      { question: "《阳仔，你听见了吗》是什么形式？", answer: "这是阳仔 AI 陪伴机的新年祝福视频，采用竖屏形式，适合移动端和社交媒体场景。" },
      { question: "这支片子延续了什么品牌调性？", answer: "作品延续阳仔 IP 温暖、陪伴和倾听的表达方向，用新年问候连接品牌与用户。" },
      { question: "万象元生能批量制作品牌短视频吗？", answer: "可以。团队可根据品牌节点、产品卖点和平台规格，规划并制作系列化 AIGC 短视频内容。" },
    ],
  },
  "yang-zai-xue-ying-yu": {
    description: "阳仔衍生 IP 儿童英语学习短剧案例，用 AIGC 打造角色与场景，探索 IP 与教育内容的结合。",
    client: "阳仔 IP 内容项目",
    region: "儿童教育内容项目",
    deliverable: "横屏 AIGC 儿童学习短剧系列",
    keywords: ["阳仔学英语", "儿童学习短剧", "IP内容创作", "AIGC教育内容", "儿童动画"],
    method: "创作以儿童易理解的角色关系和短剧情节为基础，将知识点拆解为可观看、可重复的内容单元，再通过 AIGC 统一角色、场景和视觉风格，支持系列化延展。",
    value: "本案展示了品牌 IP 从陪伴类产品向教育内容延展的可能性，也为儿童内容创作提供了角色资产、故事场景和知识表达协同开发的方向。",
    faq: [
      { question: "《阳仔学英语》面向什么人群？", answer: "作品面向儿童受众，将英语启蒙知识点融入轻松的短剧剧情中。" },
      { question: "作品与阳仔 IP 的关系是什么？", answer: "这是阳仔衍生 IP 系列内容之一，在既有角色和品牌调性的基础上延展儿童教育内容。" },
      { question: "AIGC 适合制作儿童教育内容吗？", answer: "AIGC 可以用于角色、场景和系列内容的视觉开发，但具体知识内容仍需结合专业策划与审核。" },
    ],
  },
  "yang-guang-xiao-zhen": {
    description: "阳仔衍生 IP 儿童短剧案例，以 AIGC 搭建“阳光小镇”世界观，探索温暖治愈的系列化内容。",
    client: "阳仔 IP 内容项目",
    region: "儿童内容 IP 项目",
    deliverable: "竖屏与横屏 AIGC 儿童短剧",
    keywords: ["阳光小镇", "阳仔IP", "儿童短剧", "AIGC动画", "系列化内容"],
    method: "创作先建立小镇的空间关系、角色设定和叙事氛围，再根据短剧节奏拆分故事片段，并用 AIGC 统一不同画面的角色识别度和场景风格。",
    value: "本案适合需要持续运营 IP 的品牌和内容团队，重点不只是单支视频，而是通过可复用的角色、场景与主题，为后续儿童内容生产留下延展空间。",
    faq: [
      { question: "《阳光小镇》属于哪个 IP 系列？", answer: "作品属于阳仔衍生 IP 系列内容，围绕“阳光小镇”这一虚构世界展开儿童向短剧叙事。" },
      { question: "作品采用了哪些视频形态？", answer: "站内展示包含竖屏与横屏视频片段，适合不同的移动端和内容传播场景。" },
      { question: "万象元生可以帮助品牌做系列化 IP 内容吗？", answer: "可以。团队可从角色设定、世界观、故事开发到 AIGC 成片，协助品牌建立可持续延展的内容资产。" },
    ],
  },
};

export function getLegacyCasePresentation(slug: string): LegacyCasePresentation | undefined {
  const profile = profiles[slug];
  if (!profile) return undefined;
  return {
    detailIntro: profile.description,
    client: profile.client,
    region: profile.region,
    deliverable: profile.deliverable,
    method: profile.method,
    value: profile.value,
    faq: profile.faq,
  };
}

export function getCaseSeoProfile(caseStudy: Pick<CaseStudy, "slug" | "category" | "summary" | "detailIntro">): CaseSeoProfile {
  const legacyProfile = profiles[caseStudy.slug];
  return {
    description: caseStudy.detailIntro?.trim() || caseStudy.summary,
    keywords: legacyProfile?.keywords ?? [caseStudy.category, "AIGC影像", "万象元生"],
  };
}
