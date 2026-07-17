export type CaseCategory = "宣传片" | "广告片" | "短剧" | "IP创造";
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
  project("汉生生不息", { slug: "han-shengsheng", title: "漢·生生不息", category: "宣传片", summary: "南阳汉画馆合作案例。" }, ["case2.mp4"], ["landscape"]),
  project("苏东坡的荔枝狂想", { slug: "sudongpo-litchi", title: "苏东坡的荔枝狂想", category: "宣传片", summary: "增城文旅宣传片" }, ["case1.mp4"], ["landscape"]),
  project("苏东坡带货视频", { slug: "sudongpo-commerce", title: "苏东坡带货增城荔枝", category: "广告片", summary: "增城荔枝创意广告。" }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"], ["竖屏版", "横屏版"]),
  project("苏东坡与六榕寺", { slug: "sudongpo-liurong", title: "苏东坡与六榕寺", category: "宣传片", summary: "广州六榕寺文旅宣传片。" }, ["case1.mp4"], ["landscape"]),
  project("疯狂的荔枝", { slug: "crazy-litchi", title: "疯狂的荔枝", category: "短剧", summary: "岭南荔枝商路传奇复仇短剧。" }, ["case1.mp4", "case2.mp4", "case3.mp4", "case4.mp4"], ["portrait", "portrait", "portrait", "portrait"]),
  project("深圳南山城市宣传片-南得遇见你", { slug: "meet-nande", title: "南得遇见你", category: "宣传片", summary: "深圳市南山区城市文旅宣传片。" }, ["case1.mp4"], ["portrait"]),
  project("阳仔AI陪伴机-新年宣传片", { slug: "homecoming", title: "家无定址，心有归期", category: "广告片", summary: "阳仔 AI 陪伴机新年宣传片。" }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年TVC", { slug: "yangzai-tvc", title: "小小心事也值得被听见", category: "广告片", summary: "阳仔 AI 陪伴机新年 TVC。" }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年祝福", { slug: "yangzai-greeting", title: "阳仔，你听见了吗", category: "广告片", summary: "阳仔 AI 陪伴机新年祝福视频。" }, ["case.mp4"], ["portrait"]),
  project("阳仔IP动画-阳仔学英语", { slug: "yangzai-english", title: "阳仔学英语", category: "IP创造", summary: "创造衍生IP系列儿童学习短剧。" }, ["case1.mp4", "case2.mp4", "case3.mp4"], ["landscape", "landscape", "landscape"]),
  project("阳仔IP动画-阳光小镇", { slug: "sunshine-town", title: "阳光小镇", category: "IP创造", summary: "创造衍生IP系列儿童短剧。" }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"]),
];

export const getCaseBySlug = (slug: string) => caseStudies.find((item) => item.slug === slug);
export const getCaseSlugs = () => caseStudies.map(({ slug }) => slug);
export const caseVideos = caseStudies.flatMap((item) => item.episodes.map((episode) => ({
  ...episode,
  projectSlug: item.slug,
  projectTitle: item.title,
  category: item.category,
  coverPath: item.coverPath,
})));
