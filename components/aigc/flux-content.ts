import type { FluxChapter, FluxState } from "./flux-types";

export const AIGC_SITE = {
  name: "万象元生",
  initials: "万",
  role: "AIGC 商业实践实训",
  description: "从认知到商业落地，贯通 AIGC 创作全链路。",
} as const;

/** 六章内容顺序与最新 FluxField 的六种形态一一对应。 */
export const AIGC_CHAPTERS: FluxChapter[] = [
  {
    id: "training",
    index: "//00",
    eyebrow: "实训体系 / 商业创作全链路",
    title: "把 AI 变成可交付的商业能力",
    description:
      "从行业认知、视觉美学到图像、视频、电商与综合项目，七大实践模块沿着同一条作品集主线推进。",
    meta: "七大实践模块 / 真实商业命题 / 作品集闭环",
    state: "letters",
  },
  {
    id: "path",
    index: "//01",
    eyebrow: "面向人群 / 实践收获",
    title: "从任何起点，走到能交付",
    description:
      "无论你正在转型、创作、做内容还是寻找商业接单路径，实训都把工具学习落到看得见的作品和能力上。",
    meta: "转型探索 / 创意从业 / 内容创作 / 独立实践",
    state: "noise",
  },
  {
    id: "mentors",
    index: "//02",
    eyebrow: "导师阵容 / 一线商业经验",
    title: "实战派导师，带你把想法落地",
    description:
      "导师来自广告、MCN 和商业插画一线，带的是正在发生的项目，让每一次反馈都直接指向作品完成度。",
    meta: "广告创意 / MCN 内容 / 商业插画",
    state: "emerge",
  },
  {
    id: "works",
    index: "//03",
    eyebrow: "学员作品 / 商业命题产出",
    title: "每一个模块，都沉淀成作品",
    description:
      "从品牌主视觉、电商物料到 IP 角色与场景内容，作品不是作业的终点，而是你下一次面试和接单的起点。",
    meta: "品牌视觉 / 电商内容 / IP 创作 / 作品集",
    state: "network",
  },
  {
    id: "business",
    index: "//04",
    eyebrow: "就业去向 / 商业创作岗位图谱",
    title: "把创作能力带到真实市场",
    description:
      "实训连接岗位、项目和商业接单场景，帮助你看清能力如何变成职业选择、作品表达与收入路径。",
    meta: "视觉设计 / AI 视频 / 内容策划 / 商业接单",
    state: "manifold",
  },
  {
    id: "trust",
    index: "//05",
    eyebrow: "品牌背书 / 方直科技 300235",
    title: "有长期主义的学习与实践",
    description:
      "上市公司品牌、教育科技积累与真实企业资源，共同支撑从项目实训、作品集打磨到商业连接的完整路径。",
    meta: "上市公司背书 / 产教融合 / 企业资源 / 持续社群",
    state: "wordmark",
  },
] as const;

/** R G B 三元组，供 CSS 与章节状态共享。 */
export const STATE_COLORS: Record<FluxState, string> = {
  letters: "112 122 245",
  noise: "108 118 138",
  emerge: "52 219 184",
  network: "56 179 252",
  manifold: "250 189 51",
  wordmark: "232 120 250",
};
