export type CaseCategory = "宣传片" | "广告片" | "短剧";
export type VideoOrientation = "landscape" | "portrait";
export type Episode = { title: string; videoPath: string; orientation: VideoOrientation };
export type CaseStudy = { slug: string; title: string; category: CaseCategory; summary: string; coverPath: string; episodes: Episode[] };

const root = "case-site/cases";
const project = (folder: string, data: Omit<CaseStudy, "coverPath" | "episodes">, episodes: string[], orientations: VideoOrientation[], labels?: string[]): CaseStudy => ({
  ...data,
  coverPath: `${root}/${folder}/cover.png`,
  episodes: episodes.map((file, index) => ({ title: labels?.[index] || (episodes.length === 1 ? "正片" : `第 ${index + 1} 集`), videoPath: `${root}/${folder}/${file}`, orientation: orientations[index] })),
});

export const caseStudies: CaseStudy[] = [
  project("深圳南山城市宣传片-南得遇见你", { slug: "meet-nande", title: "南得遇见你", category: "宣传片", summary: "一座城市在山水与人文之间徐徐展开。" }, ["case1.mp4"], ["portrait"]),
  project("疯狂的荔枝", { slug: "crazy-litchi", title: "疯狂的荔枝", category: "短剧", summary: "岭南风物与年轻叙事碰撞出的四集文化短剧。" }, ["case1.mp4", "case2.mp4", "case3.mp4", "case4.mp4"], ["portrait", "portrait", "portrait", "portrait"]),
  project("苏东坡与六榕寺", { slug: "sudongpo-liurong", title: "苏东坡与六榕寺", category: "宣传片", summary: "循着历史人物的足迹重新看见城市文化。" }, ["case1.mp4"], ["landscape"]),
  project("苏东坡带货视频", { slug: "sudongpo-commerce", title: "苏东坡带货视频", category: "广告片", summary: "古典人物走入当代消费语境的创意广告。" }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"], ["竖屏版", "横屏版"]),
  project("苏东坡的荔枝狂想", { slug: "sudongpo-litchi", title: "苏东坡的荔枝狂想", category: "宣传片", summary: "以诗意想象连接苏东坡与岭南荔枝文化。" }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年宣传片", { slug: "homecoming", title: "阳仔 AI 陪伴机新年宣传片", category: "广告片", summary: "用温暖科技讲述春节归家的情感。" }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年TVC", { slug: "yangzai-tvc", title: "阳仔 AI 陪伴机新年 TVC", category: "广告片", summary: "陪伴型产品的新年品牌影像表达。" }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年祝福", { slug: "yangzai-greeting", title: "阳仔 AI 陪伴机新年祝福", category: "广告片", summary: "以 IP 陪伴感传递品牌的新年祝福。" }, ["case.mp4"], ["portrait"]),
  project("阳仔IP动画-阳仔学英语", { slug: "yangzai-english", title: "阳仔学英语", category: "广告片", summary: "通过系列 IP 动画呈现轻松的陪伴学习场景。" }, ["case1.mp4", "case2.mp4", "case3.mp4"], ["landscape", "landscape", "landscape"]),
  project("阳仔IP动画-阳光小镇", { slug: "sunshine-town", title: "阳光小镇", category: "广告片", summary: "以连续动画故事建立产品角色与世界观。" }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"]),
];

export const getCaseBySlug = (slug: string) => caseStudies.find((item) => item.slug === slug);
export const getCaseSlugs = () => caseStudies.map(({ slug }) => slug);
