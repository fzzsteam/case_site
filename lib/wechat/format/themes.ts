export type WechatThemeId = "editorial" | "briefing" | "field" | "night" | "financial" | "magazine" | "signal";

export type WechatTheme = {
  id: WechatThemeId;
  name: string;
  subtitle: string;
  description: string;
  reference: string;
  category: string;
    treatment: "editorial" | "briefing" | "field" | "night" | "financial" | "magazine" | "signal";
  swatches: [string, string, string];
  tokens: {
    canvas: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    accent: string;
    accentStrong: string;
    accentSoft: string;
    border: string;
    codeBg: string;
    codeText: string;
    titleFont: string;
    bodyFont: string;
    monoFont: string;
  };
};

export const WECHAT_THEMES: readonly WechatTheme[] = [
  {
    id: "editorial",
    name: "社论红线",
    subtitle: "Editorial / 观点资讯",
    description: "米白纸张、衬线标题和一条克制的红线，适合深度资讯、趋势观察与评论文章。",
    reference: "报纸社论 · 纸张感 · 引言拉开阅读",
    category: "深度报道",
    treatment: "editorial",
    swatches: ["#f8f4ec", "#a33a2b", "#28221f"],
    tokens: {
      canvas: "#eee8dd",
      surface: "#fbf8f2",
      surfaceAlt: "#f4eee4",
      text: "#2c2926",
      muted: "#7c746c",
      accent: "#a33a2b",
      accentStrong: "#78271f",
      accentSoft: "#f3e3dd",
      border: "#d8c9b8",
      codeBg: "#282522",
      codeText: "#f7f1e7",
      titleFont: '"Noto Serif SC", "Songti SC", "STSong", serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "briefing",
    name: "蓝色简报",
    subtitle: "Briefing / 快讯资讯",
    description: "冷白底、钴蓝强调和清晰的信息层级，适合行业动态、政策解读与商业简报。",
    reference: "新闻简报 · 模块化 · 快速扫读",
    category: "行业简报",
    treatment: "briefing",
    swatches: ["#f5f8fc", "#2457c5", "#17243a"],
    tokens: {
      canvas: "#e9eef5",
      surface: "#ffffff",
      surfaceAlt: "#f1f5fa",
      text: "#17243a",
      muted: "#637189",
      accent: "#2457c5",
      accentStrong: "#173e96",
      accentSoft: "#e7efff",
      border: "#cbd6e5",
      codeBg: "#17243a",
      codeText: "#edf4ff",
      titleFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "field",
    name: "橙色现场",
    subtitle: "Field Notes / 城市现场",
    description: "暖白底、橙色标记和更强的标题节奏，适合城市观察、人物故事与现场通讯。",
    reference: "杂志特稿 · 现场记录 · 章节节奏",
    category: "现场观察",
    treatment: "field",
    swatches: ["#fff8ed", "#d65d2f", "#25221f"],
    tokens: {
      canvas: "#f1e9dd",
      surface: "#fffaf2",
      surfaceAlt: "#f8ead9",
      text: "#25221f",
      muted: "#766e65",
      accent: "#d65d2f",
      accentStrong: "#9d3d20",
      accentSoft: "#fae4d5",
      border: "#e3cbb7",
      codeBg: "#302923",
      codeText: "#fff6e9",
      titleFont: '"Noto Serif SC", "Songti SC", "STSong", serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "night",
    name: "深夜通讯",
    subtitle: "Night Desk / 夜读资讯",
    description: "深海蓝底、冰蓝高亮和安静的留白，适合长文、科技趋势与需要沉浸感的专题。",
    reference: "夜间编辑部 · 深色阅读 · 长文沉浸",
    category: "专题长文",
    treatment: "night",
    swatches: ["#111c2b", "#74b9ff", "#e8eef6"],
    tokens: {
      canvas: "#dbe2eb",
      surface: "#111c2b",
      surfaceAlt: "#18283b",
      text: "#e8eef6",
      muted: "#9eafc2",
      accent: "#74b9ff",
      accentStrong: "#b9dcff",
      accentSoft: "#1c3855",
      border: "#34506c",
      codeBg: "#0a121d",
      codeText: "#ddecff",
      titleFont: '"Noto Serif SC", "Songti SC", "STSong", serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "financial",
    name: "金融数据室",
    subtitle: "Data Desk / 商业分析",
    description: "暖粉纸张、深紫数据线和紧凑的指标结构，适合商业新闻、市场变化与行业数据解读。",
    reference: "财经日报 · 数据优先 · 紧凑扫读",
    category: "商业分析",
    treatment: "financial",
    swatches: ["#fff1e8", "#8d2146", "#2c1f28"],
    tokens: {
      canvas: "#f1e4de",
      surface: "#fff7f1",
      surfaceAlt: "#f9e8df",
      text: "#2c1f28",
      muted: "#806e72",
      accent: "#8d2146",
      accentStrong: "#651632",
      accentSoft: "#f4dce1",
      border: "#dfc3c4",
      codeBg: "#2c1f28",
      codeText: "#fff0ea",
      titleFont: '"Noto Serif SC", "Songti SC", "STSong", serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "magazine",
    name: "杂志黑框",
    subtitle: "Feature / 文化特稿",
    description: "黑色刊头、粗细分明的衬线层级和大留白，适合文化观察、人物特稿与长篇叙事。",
    reference: "文学杂志 · 黑白网格 · 大标题",
    category: "文化特稿",
    treatment: "magazine",
    swatches: ["#f7f5ef", "#171717", "#d4f34a"],
    tokens: {
      canvas: "#e8e6df",
      surface: "#fcfbf6",
      surfaceAlt: "#efeee8",
      text: "#171717",
      muted: "#6d6b65",
      accent: "#171717",
      accentStrong: "#171717",
      accentSoft: "#e7f5ad",
      border: "#bdbcb5",
      codeBg: "#171717",
      codeText: "#f6f5ef",
      titleFont: '"Noto Serif SC", "Songti SC", "STSong", serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
  {
    id: "signal",
    name: "栏目彩标",
    subtitle: "Channel / 日更资讯",
    description: "高饱和栏目色、醒目的刊头标记和卡片式信息块，适合日更资讯、科技动态与轻量专题。",
    reference: "栏目化新闻 · 彩色刊头 · 高频更新",
    category: "日更资讯",
    treatment: "signal",
    swatches: ["#f4f1ff", "#6c43d9", "#1b1630"],
    tokens: {
      canvas: "#e9e5f4",
      surface: "#fbfaff",
      surfaceAlt: "#eee9ff",
      text: "#1b1630",
      muted: "#716a86",
      accent: "#6c43d9",
      accentStrong: "#4d27a8",
      accentSoft: "#e5ddff",
      border: "#d0c4f1",
      codeBg: "#211642",
      codeText: "#f2edff",
      titleFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      bodyFont: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      monoFont: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
  },
] as const;

export function getWechatTheme(id: string | undefined): WechatTheme {
  return WECHAT_THEMES.find((theme) => theme.id === id) ?? WECHAT_THEMES[0];
}
