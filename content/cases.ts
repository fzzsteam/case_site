export type CaseCategory = "城市文旅" | "文博数字化" | "文化短片" | "品牌宣传";

export type CaseStudy = {
  slug: string; title: string; summary: string; description: string; category: CaseCategory;
  services: string[]; coverPath: string; videoPath: string; publishedAt: string; featured: boolean;
};

export const caseStudies: CaseStudy[] = [
  { slug: "nanyang-museum", title: "南阳汉画馆", summary: "让千年汉画在数字光影中重新苏醒。", description: "以汉画像石的视觉语言为原点，通过 AIGC 动态重构历史场景，让文物故事更容易被当代观众理解与传播。", category: "文博数字化", services: ["脚本策划", "AI 影像", "后期制作"], coverPath: "cases/nanyang/cover.webp", videoPath: "cases/nanyang/film.mp4", publishedAt: "2026-04-18", featured: true },
  { slug: "sudongpo-litchi", title: "苏东坡的荔枝狂想", summary: "传统人物与岭南风物的轻叙事碰撞。", description: "围绕苏东坡与岭南荔枝展开系列创意短片，用年轻化表达连接古典文化和城市旅游场景。", category: "文化短片", services: ["创意策划", "角色生成", "系列短片"], coverPath: "cases/sudongpo/cover.webp", videoPath: "cases/sudongpo/film.mp4", publishedAt: "2026-03-12", featured: true },
  { slug: "homecoming", title: "回家", summary: "以温暖科技讲述春节归家的情感。", description: "为智能陪伴产品打造的新年品牌影片，以家庭情绪为主线，将产品能力自然融入叙事。", category: "品牌宣传", services: ["TVC 策划", "AI 制作", "声音设计"], coverPath: "cases/homecoming/cover.webp", videoPath: "cases/homecoming/film.mp4", publishedAt: "2026-02-01", featured: true },
  { slug: "meet-nande", title: "南得遇见你", summary: "一座城市在山水和人文之间徐徐展开。", description: "以城市漫游视角建立文旅形象，用诗意镜头串联地标、风物与生活现场。", category: "城市文旅", services: ["城市宣传", "AI 视觉", "剪辑包装"], coverPath: "cases/nande/cover.webp", videoPath: "cases/nande/film.mp4", publishedAt: "2026-01-15", featured: false },
];

export const getCaseBySlug = (slug: string) => caseStudies.find((item) => item.slug === slug);
export const getCaseSlugs = () => caseStudies.map(({ slug }) => slug);
