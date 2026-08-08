/**
 * 万象元生 · AIGC 商业实践实训官网 —— 全站文案数据源。
 * 内容口径以产品 spec 为准；本页定位为品牌官网 + 招生获客页，
 * 不展示任何课程价格与优惠信息。
 */

export const NAV_LINKS = [
  { id: 'modules', label: '实训体系' },
  { id: 'personas', label: '面向人群' },
  { id: 'gains', label: '实践收获' },
  { id: 'mentors', label: '导师阵容' },
  { id: 'works', label: '学员作品' },
  { id: 'cases', label: '就业去向' },
  { id: 'endorsement', label: '品牌背书' },
] as const;

export const HERO = {
  title: '万象元生',
  sub: 'AIGC 商业实践实训',
  tagline: '从认知到商业落地，贯通 AIGC 创作全链路',
  chips: ['七大实践模块', '真实商业项目', '个人作品集打磨', '实训结业证明'],
  video: '/aigc/video/hero-origin.mp4',
};

export const MARQUEE_ITEMS = [
  'AI 商用图像',
  '提示词工程',
  'IP 形象创作',
  'AI 短视频',
  '数字人成片',
  '电商视觉',
  '脚本分镜',
  '后期剪辑',
  '成片包装',
  '品牌全案',
  '作品集打磨',
  '商业接单',
];

export const MODULES = [
  {
    no: '01',
    title: 'AIGC 行业认知与创作启蒙',
    desc: '读懂 AIGC 商业市场，建立岗位能力认知',
  },
  {
    no: '02',
    title: 'AI 视觉底层美学训练',
    desc: '钻研构图、光影与色彩，夯实审美根基',
  },
  {
    no: '03',
    title: 'AI 商用图像创作实践',
    desc: '精通提示词工程，完成商业海报、IP 形象创作',
  },
  {
    no: '04',
    title: 'AI 短视频生成实践',
    desc: '脚本构建、数字人运用，掌握 AI 视频全流程',
  },
  {
    no: '05',
    title: 'AIGC 电商商业实践',
    desc: '电商视觉、短视频内容产出，理解商业逻辑',
  },
  {
    no: '06',
    title: '后期剪辑与成片输出',
    desc: 'AI 素材二次加工，输出标准化商业作品',
  },
  {
    no: '07',
    title: '综合商业项目创作实训',
    desc: '闭环完整项目演练，打磨个人作品集',
  },
];

export const PERSONAS = [
  {
    icon: 'compass',
    title: '转型探索者',
    desc: '期望踏入 AIGC 赛道，从零开启全新创作职业路径',
  },
  {
    icon: 'pen',
    title: '创意从业者',
    desc: '设计师、创作者，借助 AI 拓展边界，提升产出效率',
  },
  {
    icon: 'play',
    title: '内容创作者',
    desc: '深耕短视频，掌握 AI 赋能的图像与视频生产能力',
  },
  {
    icon: 'spark',
    title: '独立实践者',
    desc: '希望拓展商业接单渠道，将创意转化为实际收益',
  },
] as const;

export const GAINS = [
  '七大模块完整 AIGC 商用创作实战能力',
  '经过真实商业打磨的个人作品集',
  '万象元生实训结业证明',
  '职业方向规划指导，商业项目对接渠道',
  '长期创作者社群交流，持续行业信息同步',
];

export const MENTORS = [
  {
    initial: '陈',
    name: '陈某某',
    role: '前 4A 广告公司创意总监',
    skill: 'AI 视觉合成与品牌创意落地',
    quote: 'AI 不是替代创意，是让好创意跑得更快',
  },
  {
    initial: '李',
    name: '李某某',
    role: '头部 MCN 机构内容合伙人',
    skill: 'AI 短视频全流程制作与账号变现',
    quote: '用 AI 把短视频生产效率放大 10 倍',
  },
  {
    initial: '王',
    name: '王某某',
    role: '资深商业插画师 / AIGC 培训专家',
    skill: 'AI 绘画底层逻辑与商业接单指导',
    quote: '听懂提示词的每一层含义，才算真正驾驭 AI',
  },
];

export const WORKS = [
  { src: '/aigc/works/w1.webp', cat: '新中式香氛主视觉', by: '转型探索者' },
  { src: '/aigc/works/w2.webp', cat: '美妆精华电商主图', by: '创意从业者' },
  { src: '/aigc/works/w3.webp', cat: '游戏 IP 角色设定', by: '在校学生' },
  { src: '/aigc/works/w4.webp', cat: '生鲜电商推广海报', by: '独立实践者' },
  { src: '/aigc/works/w5.webp', cat: '家电场景植入图', by: '内容创作者' },
  { src: '/aigc/works/w6.webp', cat: '香氛品牌广告图', by: '转型探索者' },
];

export const CASES = [
  {
    tags: ['零基础转行', '实训结业'],
    dest: '某电商公司 · AIGC 视觉设计师',
    quote: '从零基础入门，完整掌握 AI 商业出图，成功转型视觉岗位。',
  },
  {
    tags: ['原平面设计师', '实训结业'],
    dest: '文创品牌 · AI 内容创作主管',
    quote: '学会 AI 视频 + 图像全链路，大幅提升团队内容产出效率。',
  },
  {
    tags: ['全职宝妈', '实训结业'],
    dest: '独立接单 · 短视频 AI 内容创作者',
    quote: '带娃间隙完成实训，靠 AI 接单实现自我价值，不再手心向上。',
  },
  {
    tags: ['在校设计专业学生', '实训结业'],
    dest: '科技公司 · IP 设计助理',
    quote: '依靠实训作品集拿到面试机会，顺利拿到实习 offer。',
  },
];

export const CASE_STATS = [
  { to: 82, suffix: '%', label: '学员实现能力转型' },
  { to: 60, suffix: '+', label: '学员入职相关岗位' },
  { to: 45, suffix: '+', label: '学员开启商业接单' },
];

export const JOBS = [
  {
    name: 'AIGC 视觉设计师',
    payLabel: '参考月薪',
    pay: '8K–22K',
    /** 条形填充比例，按各岗位薪资上限归一化，仅作视觉参考 */
    width: '88%',
    dir: '电商视觉、品牌海报、IP 形象创作、商业物料输出',
  },
  {
    name: 'AI 短视频内容创作师',
    payLabel: '参考月薪',
    pay: '8K–18K',
    width: '72%',
    dir: 'AI 短剧、营销短视频、数字人成片、账号内容生产',
  },
  {
    name: 'AIGC 内容策划 / 主管',
    payLabel: '参考月薪',
    pay: '12K–25K',
    width: '100%',
    dir: 'AI 内容团队管理、项目策划、商业方案落地',
  },
  {
    name: '独立 AI 商业创作者',
    payLabel: '单项目收入',
    pay: '500–5000 元',
    width: '60%',
    dir: '商业接单、自媒体 IP、个人工作室',
  },
];

export const JOBS_DISCLAIMER =
  '薪资数据来源于 BOSS 直聘、猎聘、职友集公开招聘平台，为行业市场参考区间，不代表实训结业后实际收入保证，具体收入因个人能力、地区、岗位等因素存在差异。';

export const ENDORSE_ADVANTAGES = [
  '深交所 A 股上市公司，规范化运营与合规体系完备，全资子公司专项承载万象元生项目',
  '30+ 年教育科技行业深耕，深度理解人才成长轨迹与商业实训底层逻辑',
  '产学研协同共建单位：与深圳大学、河南师范大学、暨南大学等高校共建 AIGC 人才联合培养项目，落地产教融合实训机制',
  '华为鲲鹏生态核心伙伴，深度对接国产 AI 算力与多模态大模型技术底座，确保课程技术始终同步行业一线',
  '链接 100+ 文创、电商、数字内容企业资源，打通「项目实训 → 作品集打磨 → 商业接单」全链路',
  '拥有博士后创新实践基地、省级智能教学工程技术研究中心，百项专利与软著支撑课程体系持续迭代更新',
];

export const ENDORSE_BADGES = [
  { icon: 'shield', label: '国家高新技术企业' },
  { icon: 'chip', label: '华为鲲鹏生态合作伙伴' },
  { icon: 'link', label: 'AIGC 产教融合共建实践基地' },
  { icon: 'lab', label: '广东省智能教学工程技术研究中心共建单位' },
] as const;

/** 留资弹窗的来源标识，用于区分三个 CTA 入口 */
export type LeadSource = 'kit' | 'openclass' | 'advisor';

export const LEAD_COPY: Record<LeadSource, { title: string; desc: string }> = {
  kit: {
    title: '免费领取实训资料包',
    desc: '留下联系方式，我们将发送《AIGC 商业实训项目大纲》与专属学习规划。',
  },
  openclass: {
    title: '预约免费公开课',
    desc: '留下联系方式，课程顾问会与你确认开课场次，并同步实训营名额情况。',
  },
  advisor: {
    title: '添加顾问 1v1 咨询',
    desc: '留下联系方式，或直接扫码添加课程顾问，深入沟通你的学习规划。',
  },
};
