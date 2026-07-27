import type { CaseInput } from "./queries";

const root = "case-site/cases";
const project = (folder: string, data: Omit<CaseInput, "coverPath" | "episodes">, episodes: string[], orientations: CaseInput["episodes"][number]["orientation"][]): CaseInput => ({
  ...data,
  coverPath: `${root}/${folder}/cover.png`,
  episodes: episodes.map((file, index) => ({ videoPath: `${root}/${folder}/${file}`, orientation: orientations[index] })),
});

export const seedCases: CaseInput[] = [
  project("汉生生不息", {
    title: "漢·生生不息", category: "宣传片", summary: "南阳汉画馆合作案例。",
    detail: "南阳市汉画馆始建于1935年，是国内建馆最早、藏品数量最多、规模最大的汉画像石专题博物馆，馆藏汉代画像石逾2500块，涵盖生产劳动、乐舞百戏、天文神话等汉代社会图景。本片以馆藏汉画像石为创作原点，运用 AIGC 技术让静态的石刻画面“活”起来，让沉睡两千年的汉代生活场景重新流动起来，呈现“生生不息”的文明传承主题，服务于南阳汉画馆的文博数字化传播需求。",
  }, ["case2.mp4"], ["landscape"]),
  project("苏东坡的荔枝狂想", {
    title: "苏东坡的荔枝狂想", category: "宣传片", summary: "增城文旅宣传片",
    detail: "增城素有“中国荔枝之乡”美誉，荔枝种植历史可追溯至汉代，已绵延两千余年，孕育出“增城挂绿”“糯米糍”等驰名品种。苏东坡笔下“日啖荔枝三百颗，不辞长作岭南人”的咏荔诗句，早已成为岭南荔枝文化最具代表性的文化意象。本片以这一文化意象为创作灵感，借助 AIGC 影像技术演绎一场穿越古今的“荔枝狂想”，为增城文旅注入兼具历史底蕴与年轻表达的传播内容。",
  }, ["case1.mp4"], ["landscape"]),
  project("苏东坡带货视频", {
    title: "苏东坡带货增城荔枝", category: "广告片", summary: "增城荔枝创意广告。",
    detail: "延续“苏东坡与荔枝”的文化意象，本片以创意广告的形式，让这位岭南荔枝文化的代言人“穿越”到今天为增城荔枝带货，用轻松幽默的叙事和 AIGC 生成的视觉呈现，把增城两千余年的荔枝种植历史与“日啖荔枝三百颗”的诗意联想转化为易于在社交媒体传播的短视频内容，助力增城荔枝的品牌年轻化表达。",
  }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"]),
  project("苏东坡与六榕寺", {
    title: "苏东坡与六榕寺", category: "宣传片", summary: "广州六榕寺文旅宣传片。",
    detail: "公元1100年，苏轼途经广州游览六榕寺，应寺僧之请挥毫题写“六榕”二字，寺庙由此得名，如今山门匾额仍是苏轼手迹，六榕寺也因此成为广州历史最悠久的文化地标之一。本片以这段真实的历史典故为叙事主线，用 AIGC 技术再现千年古寺与东坡题字的场景，为广州文旅呈现一段兼具文化厚度与影像美感的城市宣传内容。",
  }, ["case1.mp4"], ["landscape"]),
  project("疯狂的荔枝", {
    title: "疯狂的荔枝", category: "短剧", summary: "岭南荔枝商路传奇复仇短剧。",
    detail: "以岭南荔枝的千年种植与商贸历史为背景，本片是一部融合古代商路、家族恩怨与传奇复仇的竖屏短剧，用强节奏的剧情与 AIGC 影像制作手法，呼应当下“荔枝+短剧+文旅”融合传播的行业趋势，让地方农产品文化以年轻观众熟悉的短剧语言重新被看见。",
  }, ["case1.mp4", "case2.mp4", "case3.mp4", "case4.mp4"], ["portrait", "portrait", "portrait", "portrait"]),
  project("深圳南山城市宣传片-南得遇见你", {
    title: "南得遇见你", category: "宣传片", summary: "深圳市南山区城市文旅宣传片。",
    detail: "深圳市南山区坐拥深圳湾、蛇口、后海等滨海文化片区，“大运春茧”“深港长虹”“蛇口晨曦”“滨海观潮”等南山新八景勾勒出这座科创之城的另一面。本片以“南得遇见你”为主题，用 AIGC 影像语言串联南山的山海景观与人文气息，呈现一座兼具科技活力与滨海生活方式的城市宣传片。",
  }, ["case1.mp4"], ["portrait"]),
  project("阳仔AI陪伴机-新年宣传片", {
    title: "家无定址，心有归期", category: "广告片", summary: "阳仔 AI 陪伴机新年宣传片。",
    detail: "本片是阳仔 AI 陪伴机的新年主题宣传片，聚焦异乡漂泊者在年节时分的思乡情绪，以“家无定址，心有归期”为情感主线，用 AIGC 影像手法讲述一段关于陪伴与归属感的新年故事，传递阳仔 AI 陪伴机希望在情感层面给用户以陪伴的产品理念。",
  }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年TVC", {
    title: "小小心事也值得被听见", category: "广告片", summary: "阳仔 AI 陪伴机新年 TVC。",
    detail: "本片是阳仔 AI 陪伴机的新年 TVC，聚焦孩子成长过程中那些容易被忽略的“小小心事”，以温情叙事和 AIGC 影像制作呈现陪伴与倾听的产品价值，传递“每一份心事都值得被认真对待”的新年祝福。",
  }, ["case1.mp4"], ["landscape"]),
  project("阳仔AI陪伴机-新年祝福", {
    title: "阳仔，你听见了吗", category: "广告片", summary: "阳仔 AI 陪伴机新年祝福视频。",
    detail: "本片是阳仔 AI 陪伴机的新年祝福短片，以竖屏形式贴合社交媒体传播场景，用 AIGC 影像语言传递新年问候与陪伴主题，延续“阳仔”IP 一贯的温暖基调，是品牌新年营销内容矩阵的重要组成部分。",
  }, ["case.mp4"], ["portrait"]),
  project("阳仔IP动画-阳仔学英语", {
    title: "阳仔学英语", category: "IP创造", summary: "创造衍生IP系列儿童学习短剧。",
    detail: "作为“阳仔”衍生 IP 系列内容之一，本片是面向儿童的英语学习短剧，用 AIGC 技术打造角色形象与故事场景，把英语启蒙知识点融入轻松的剧情中，探索“IP+教育内容”的儿童向短剧创作路径。",
  }, ["case1.mp4", "case2.mp4", "case3.mp4"], ["landscape", "landscape", "landscape"]),
  project("阳仔IP动画-阳光小镇", {
    title: "阳光小镇", category: "IP创造", summary: "创造衍生IP系列儿童短剧。",
    detail: "作为“阳仔”衍生 IP 系列内容之一，本片围绕虚构的“阳光小镇”展开儿童向短剧叙事，用 AIGC 技术搭建角色与场景世界观，延续阳仔 IP 温暖治愈的调性，探索衍生内容 IP 化、系列化的创作路径。",
  }, ["case1.mp4", "case2.mp4"], ["portrait", "landscape"]),
];
