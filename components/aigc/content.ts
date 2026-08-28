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
  { id: 'works', label: '学员案例' },
  { id: 'cases', label: '就业去向' },
  { id: 'endorsement', label: '企业实力' },
] as const;

export const HERO = {
  title: '方直智胜',
  partner: '深圳电影制片厂',
  sub: '31 天线下 AIGC 影视内容商业实训营',
  tagline: '上市公司方直科技 (300235) AI子公司出品',
  proof: '深影厂行业专家专题授课｜线下沉浸式集训｜商用作品集产出',
};

/** 站内静态插画走 public 直出，不经过 OSS 签名链路。 */
export const EDU_ASSETS = {
  fangzhiLogo: '/edu/fangzhilogo-crop.png',
  fangzhiLockup: '/edu/fangzhi-zhisheng-lockup.png',
  szfsLogo: '/edu/szfs-horizontal-logo.png',
  gainsPortfolio: '/edu/illus/gains-portfolio.webp',
  wechatQr: '/edu/wechat-qr-3.0.jpg',
} as const;

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
    illus: '/edu/illus/module-01.webp',
  },
  {
    no: '02',
    title: 'AI 视觉底层美学训练',
    desc: '钻研构图、光影与色彩，夯实审美根基',
    illus: '/edu/illus/module-02.webp',
  },
  {
    no: '03',
    title: 'AI 商用图像创作实践',
    desc: '精通提示词工程，完成商业海报、IP 形象创作',
    illus: '/edu/illus/module-03.webp',
  },
  {
    no: '04',
    title: 'AI 短视频生成实践',
    desc: '脚本构建、数字人运用，掌握 AI 视频全流程',
    illus: '/edu/illus/module-04.webp',
  },
  {
    no: '05',
    title: 'AIGC 电商商业实践',
    desc: '电商视觉、短视频内容产出，理解商业逻辑',
    illus: '/edu/illus/module-05.webp',
  },
  {
    no: '06',
    title: '后期剪辑与成片输出',
    desc: 'AI 素材二次加工，输出标准化商业作品',
    illus: '/edu/illus/module-06.webp',
  },
  {
    no: '07',
    title: '综合商业项目创作实训',
    desc: '闭环完整项目演练，打磨个人作品集',
    illus: '/edu/illus/module-07.webp',
  },
];

export const PERSONAS = [
  {
    illus: '/edu/illus/persona-01.webp',
    title: '在校学生',
    desc: '用真实商业项目，打造能拿去求职的作品集',
  },
  {
    illus: '/edu/illus/persona-02.webp',
    title: '影视 / 设计从业者',
    desc: '把 AIGC 接入工作流，升级创作效率与交付能力',
  },
  {
    illus: '/edu/illus/persona-03.webp',
    title: '转行求职者',
    desc: '从零建立项目履历，找到进入 AIGC 赛道的切入口',
  },
  {
    illus: '/edu/illus/persona-04.webp',
    title: '自由创作者',
    desc: '承接商业订单，让创意从想法变成可交付作品',
  },
  {
    illus: '/edu/illus/persona-05.webp',
    title: '副业增收人群',
    desc: '掌握 AI 内容生产能力，拓展居家接单与增收路径',
  },
] as const;

export const GAINS = [
  {
    title: 'AI 智能纪念玩具',
    desc: '结业专属实物礼品，实训纪念收藏',
  },
  {
    title: 'AIGC 商业作品集',
    desc: '专业导师全程辅导，打造商用求职作品集',
  },
  {
    title: 'AIGC 个人案例网站',
    desc: '搭建专属线上作品展示站，拓展接单与求职渠道',
  },
  {
    title: 'AIGC 项目结业证书',
    desc: '方直智胜 × 深圳电影制片厂联合颁发实训结业证书',
  },
  {
    title: '纳入大湾区 AIGC 人才库',
    desc: '联合广电共建大湾区 AIGC 人才库，入库存档；优先对接行业机会，定期参与 AIGC 行业沙龙交流',
  },
  {
    title: '大厂负责人一对一面试指导',
    desc: '对接行业大厂负责人，提供求职规划、简历优化等专项指导',
  },
];

export const GAINS_PORTFOLIO = {
  eyebrow: 'PORTFOLIO',
  title: '作品集 · 商业交付',
  desc: '每个模块的产出都会沉淀进同一套作品集，结业时你带走的是完整的商业交付物。',
};

export type MentorProfile = {
  name: string;
  role: string;
  bio: readonly string[];
};

export const MENTORS: MentorProfile[] = [
  {
    name: '蔡欣莹',
    role: 'AIGC 影像导师',
    bio: [
      '深耕 AI 影像全流程创作，精通 AI 短剧与成片全流程制作。',
      '将专业片场实操经验，梳理为创作者可直接落地的标准化工作流。',
    ],
  },
  {
    name: '陈思敏',
    role: '电商内容导师',
    bio: [
      '拥有多品类爆款内容操盘经验，熟悉内容创意、流量获取至店铺转化的完整链路。',
      '助力创作者将内容能力转化为可持续的商业收益。',
    ],
  },
  {
    name: '郑泽维',
    role: 'AI 音频导师',
    bio: [
      '音乐科班背景，专注 AI 配乐与配音实战应用。',
      '依托专业听觉体系把控 AI 声音输出品质，以音乐素养构筑 AI 时代声音竞争力。',
    ],
  },
  {
    name: '马文森',
    role: 'AI 绘图导师',
    bio: [
      '数字媒体专业，长期深耕 AI 视觉生成领域，积累大量 Midjourney 商业绘图实战案例。',
      '以成熟审美逻辑驱动 AI，稳定输出贴合需求的高质量视觉画面。',
    ],
  },
  {
    name: '肖慧',
    role: 'AI 视觉导师',
    bio: [
      '工业设计背景，兼具扎实美学功底与产品思维。',
      '主导多个品牌级 AI 视觉项目，可完整把控需求拆解至方案交付全流程。',
    ],
  },
];

export const GUEST_MENTORS: MentorProfile[] = [
  {
    name: '刘山',
    role: '导演（代表作《只此青绿》）',
    bio: [
      '深耕专业级电影美术指导与视觉特效领域，擅长融合东方美学与电影视觉语言。',
      '把控整体视觉审美基调，依托专业美术指导经验，打造多领域顶级视觉作品。',
    ],
  },
  {
    name: '朱文婕',
    role: '深圳电影厂内容创制总监',
    bio: [
      '长期深耕影视产业内容孵化，专注行业趋势研判、优质影视项目开发。',
      '洞察市场风向，挖掘具备生命力的故事，实现创意到项目落地的商业化转化。',
    ],
  },
  {
    name: '李森',
    role: '深圳电影厂制片人',
    bio: [
      '擅长优质影视剧目全周期开发，精通项目立项、摄制及落地统筹，拥有完整影视制片实操经验。',
      '深耕内容打磨，将优质剧本落地为适配市场的成熟影视作品。',
    ],
  },
  {
    name: '倪文雯',
    role: '深圳电影厂编剧工作室主理人',
    bio: [
      '立足市场挖掘优质选题，擅长运用 AI 赋能剧本开发。',
      '深谙市场逻辑，借力 AI 高效创作，打通创意到剧本的落地路径。',
    ],
  },
];

export const MENTOR_META = {
  eyebrow: '一、教研团队',
  sub: '全职教研团队负责日常带班，产业导师带来影视行业方法。',
  guestTitle: '二、特邀专家',
  guestDesc: '聚焦影视生产流程、真实项目案例与行业人才标准。',
  modelTitle: '教学模式说明',
  modelDesc: '教研团队贯穿 31 天实训周期，产业导师提供专题课程。',
};

export const WORKS = [
  {
    path: 'case-site/cases/aigc-student-works/drama-01-zhoudao-zhugelang-poster.png',
    cat: '《周道与诸葛浪》仙侠轻喜剧海报',
    category: '剧情短剧',
    by: '周道与诸葛浪',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-02-lengmian-xianjun-poster.png',
    cat: '《醉后撩到冷面仙君》人物海报',
    category: '剧情短剧',
    by: '冷面仙君',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-01-hami-melon-scene-harvest.png',
    cat: '新疆哈密瓜 · 采摘场景',
    category: '电商产品视觉',
    by: '哈密瓜项目',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-01-hami-melon-scene-farmland.png',
    cat: '新疆哈密瓜 · 农业场景',
    category: '电商产品视觉',
    by: '哈密瓜项目',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-01-hami-melon-kv-poster.png',
    cat: '新疆哈密瓜 · 电商主图',
    category: '电商产品视觉',
    by: '哈密瓜项目',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-01-hami-melon-detail-page.png',
    cat: '新疆哈密瓜 · 详情页',
    category: '电商产品视觉',
    by: '哈密瓜项目',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-02-circulation-fan-scene.png',
    cat: '循环扇 · 客厅场景',
    category: '电商产品视觉',
    by: '家电视觉',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-03-soymilk-maker-scene.png',
    cat: '破壁豆浆机 · 厨房场景',
    category: '电商产品视觉',
    by: '家电视觉',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-04-floral-fragrance-scene.png',
    cat: '香氛方瓶 · 静物主视觉',
    category: '电商产品视觉',
    by: '香氛视觉',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-05-yaoyitang-tea-kv.png',
    cat: '藏经茶 · 礼盒主视觉',
    category: '电商产品视觉',
    by: '茶饮礼盒',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-06-lumiere-serum-poster.png',
    cat: 'LUMIÈRE · 抗老精华广告',
    category: '电商产品视觉',
    by: '美妆广告',
  },
  {
    path: 'case-site/cases/aigc-student-works/ecom-07-florence-perfume-kv.png',
    cat: 'FLORENCE · 香水主视觉',
    category: '电商产品视觉',
    by: '香氛视觉',
  },
  {
    path: 'case-site/cases/aigc-student-works/art-04-forest-elf-archer-cg.png',
    cat: '森林精灵弓手 · 游戏原画',
    category: '概念美术',
    by: '角色设定',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-01-zhoudao-zhugelang-film-01.mp4',
    cat: '《周道与诸葛浪》仙侠轻喜剧片段',
    category: '剧情短剧',
    by: '周道与诸葛浪',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-02-lengmian-xianjun-film-01.mp4',
    cat: '《醉后撩到冷面仙君》仙侠言情片段',
    category: '剧情短剧',
    by: '冷面仙君',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-03-subway-dragon-film-01.mp4',
    cat: '都市玄幻 · 青龙觉醒',
    category: '剧情短剧',
    by: '地铁青龙',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-04-rooftop-noir-film-01.mp4',
    cat: '都市悬疑 · 天台群像',
    category: '剧情短剧',
    by: '都市悬疑',
  },
  {
    path: 'case-site/cases/aigc-student-works/drama-05-hanfu-ghost-film-01.mp4',
    cat: '国风志怪 · 汉服仕女',
    category: '剧情短剧',
    by: '国风志怪',
  },
  {
    path: 'case-site/cases/aigc-student-works/brand-01-superhard-materials-film-01.mp4',
    cat: '超硬材料科技产品片',
    category: '品牌 / 工业片',
    by: '工业产品',
  },
  {
    path: 'case-site/cases/aigc-student-works/culture-01-nanyang-han-film-01-opening.mp4',
    cat: '《汉·南阳》 · 开篇',
    category: '文旅文博',
    by: '汉代城郭',
  },
  {
    path: 'case-site/cases/aigc-student-works/culture-01-nanyang-han-film-02-hanzi.mp4',
    cat: '《汉·南阳》 · 汉字篇',
    category: '文旅文博',
    by: '汉画像石',
  },
  {
    path: 'case-site/cases/aigc-student-works/culture-01-nanyang-han-film-03-relief.mp4',
    cat: '《汉·南阳》 · 画像石篇',
    category: '文旅文博',
    by: '汉画像石',
  },
  {
    path: 'case-site/cases/aigc-student-works/culture-02-lychee-orchard-film-01.mp4',
    cat: '助农文旅 · 古荔枝林',
    category: '文旅文博',
    by: '荔枝文旅',
  },
  {
    path: 'case-site/cases/aigc-student-works/music-01-live-concert-film-01.mp4',
    cat: '现场演出 · 电吉他人声',
    category: '音乐 MV',
    by: '现场演出',
  },
  {
    path: 'case-site/cases/aigc-student-works/music-02-mira-mira-mv-01.mp4',
    cat: 'Mira Mira · 音乐 MV',
    category: '音乐 MV',
    by: 'Mira Mira',
  },
  {
    path: 'case-site/cases/aigc-student-works/ip-01-guochao-baby-dance-01.mp4',
    cat: '国潮宝宝 · 舞蹈短片',
    category: '形象 IP',
    by: '国潮形象',
  },
  {
    path: 'case-site/cases/aigc-student-works/ip-02-bear-bunny-baby-01.mp4',
    cat: '熊耳 / 兔耳萌娃 · 互动短片',
    category: '形象 IP',
    by: '萌娃形象',
  },
  {
    path: 'case-site/cases/aigc-student-works/art-01-skycity-ascension-film-01.mp4',
    cat: '天空之城 · 飞升概念片',
    category: '概念美术',
    by: '世界观概念',
  },
  {
    path: 'case-site/cases/aigc-student-works/art-02-xianxia-night-market-pov-film-01.mp4',
    cat: '仙侠夜市 · 第一视角概念片',
    category: '概念美术',
    by: '运镜概念',
  },
  {
    path: 'case-site/cases/aigc-student-works/art-03-apocalypse-tentacle-film-01.mp4',
    cat: '末日触手 · 科幻概念片',
    category: '概念美术',
    by: '科幻概念',
  },
];

export const WORK_CATEGORIES = [
  '全部',
  '剧情短剧',
  '电商产品视觉',
  '品牌 / 工业片',
  '文旅文博',
  '音乐 MV',
  '形象 IP',
  '概念美术',
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

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
  '深交所 A 股上市公司，规范化运营与合规体系完备',
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

/** 企业实力区的合作主体信息。 */
export const ENDORSE_LOCKUP = {
  fangzhi: {
    name: '方直科技',
    meta: ['股票代码：300235'],
  },
  szfs: {
    name: '深圳电影制片厂有限公司',
  },
};

/** CTA 弹窗的来源标识，用于区分三个入口 */
export type LeadSource = 'kit' | 'openclass' | 'advisor';

export const LEAD_COPY: Record<
  LeadSource,
  { eyebrow: string; title: string; desc: string; benefits: string[] }
> = {
  kit: {
    eyebrow: '资料包领取',
    title: '扫码添加微信，领取实训资料包',
    desc: '添加课程顾问微信，获取《AIGC 商业实训项目大纲》与专属学习规划。',
    benefits: ['AIGC 商业实训项目大纲', '适合你的学习路径建议', '课程顾问答疑与后续安排'],
  },
  openclass: {
    eyebrow: '公开课预约',
    title: '扫码添加微信，预约免费公开课',
    desc: '添加课程顾问微信，确认公开课场次并了解实训营安排。',
    benefits: ['免费公开课场次与直播提醒', '实训营课程内容抢先了解', '课程顾问答疑与后续安排'],
  },
  advisor: {
    eyebrow: '专属咨询',
    title: '扫码添加微信，进行 1v1 咨询',
    desc: '添加课程顾问微信，直接沟通你的学习规划。',
    benefits: ['结合目标梳理学习方向', '了解实训模块与参与方式', '课程顾问 1v1 沟通答疑'],
  },
};
