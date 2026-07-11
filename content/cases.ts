export type CaseCategory = "宣传片" | "广告片" | "短剧";
export type Episode = { title: string; videoPath: string | null };
export type CaseStudy = {
  slug: string;
  title: string;
  category: CaseCategory;
  summary: string;
  coverPath: string | null;
  episodes: Episode[];
};

export const caseStudies: CaseStudy[] = [
  { slug: "meet-nande", title: "南得遇见你", category: "宣传片", summary: "一座城市在山水与人文之间徐徐展开。", coverPath: null, episodes: [{ title: "正片", videoPath: null }] },
  { slug: "crazy-litchi", title: "疯狂的荔枝", category: "短剧", summary: "岭南风物与年轻叙事碰撞出的文化短剧。", coverPath: null, episodes: [{ title: "第一集", videoPath: null }] },
  { slug: "sudongpo-liurong", title: "苏东坡与六榕寺", category: "宣传片", summary: "循着历史人物的足迹重新看见城市文化。", coverPath: null, episodes: [{ title: "正片", videoPath: null }] },
  { slug: "sudongpo-commerce", title: "苏东坡带货视频", category: "广告片", summary: "古典人物走入当代消费语境的创意广告。", coverPath: null, episodes: [{ title: "横屏版", videoPath: null }, { title: "竖屏版", videoPath: null }] },
  { slug: "sudongpo-litchi", title: "苏东坡的荔枝狂想", category: "宣传片", summary: "以诗意想象连接苏东坡与岭南荔枝文化。", coverPath: null, episodes: [{ title: "正片", videoPath: null }] },
  { slug: "homecoming", title: "阳仔 AI 陪伴机新年宣传片", category: "广告片", summary: "用温暖科技讲述春节归家的情感。", coverPath: null, episodes: [{ title: "回家", videoPath: null }] },
  { slug: "yangzai-tvc", title: "阳仔 AI 陪伴机新年的 TVC", category: "广告片", summary: "陪伴型产品的新年品牌影像表达。", coverPath: null, episodes: [{ title: "新年 TVC", videoPath: null }] },
  { slug: "yangzai-animation", title: "阳仔 IP 动画视频", category: "广告片", summary: "以动画建立更鲜明、更亲近的品牌角色。", coverPath: null, episodes: [{ title: "动画正片", videoPath: null }] },
];

export const getCaseBySlug = (slug: string) => caseStudies.find((item) => item.slug === slug);
export const getCaseSlugs = () => caseStudies.map(({ slug }) => slug);
