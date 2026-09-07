import { marked, Renderer, type Tokens } from "marked";
import { getWechatTheme, type WechatTheme } from "./themes";

export type WechatArticleMeta = {
  title: string;
  kicker?: string;
  deck?: string;
  author?: string;
  date?: string;
  readingTime?: string;
  source?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function safeUrl(value: string): string | null {
  try {
    const parsed = new URL(value, "https://example.invalid");
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.origin === "https://example.invalid" && !value.startsWith("/")) return null;
    return value;
  } catch {
    return null;
  }
}

function style(values: Array<[string, string | undefined]>): string {
  return values
    .filter(([, value]) => value !== undefined)
    .map(([property, value]) => `${property}:${value}`)
    .join(";");
}

function styleAttr(value: string): string {
  return `style="${escapeHtml(value)}"`;
}

function headingStyle(theme: WechatTheme, depth: number): string {
  const { tokens } = theme;
  if (depth === 1) {
    if (theme.treatment === "magazine") {
      return style([
        ["margin", "30px 0 20px"],
        ["padding", "0 0 12px"],
        ["border-bottom", `4px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "27px"],
        ["font-weight", "700"],
        ["line-height", "1.35"],
      ]);
    }
    if (theme.treatment === "signal") {
      return style([
        ["margin", "28px 0 18px"],
        ["padding", "10px 12px"],
        ["border-left", `8px solid ${tokens.accent}`],
        ["background", tokens.accentSoft],
        ["color", tokens.accentStrong],
        ["font-family", tokens.titleFont],
        ["font-size", "25px"],
        ["font-weight", "800"],
        ["line-height", "1.35"],
      ]);
    }
    return style([
      ["margin", "30px 0 18px"],
      ["padding", "0 0 12px"],
      ["border-bottom", `1px solid ${tokens.border}`],
      ["color", theme.treatment === "night" ? tokens.accentStrong : tokens.text],
      ["font-family", tokens.titleFont],
      ["font-size", "25px"],
      ["font-weight", "700"],
      ["line-height", "1.35"],
    ]);
  }
  if (depth === 2) {
    if (theme.treatment === "editorial") {
      return style([
        ["margin", "38px 0 18px"],
        ["padding", "0 0 12px 14px"],
        ["border-left", `4px solid ${tokens.accent}`],
        ["border-bottom", `1px solid ${tokens.border}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "21px"],
        ["font-weight", "700"],
        ["line-height", "1.45"],
      ]);
    }
    if (theme.treatment === "briefing") {
      return style([
        ["margin", "34px 0 18px"],
        ["padding", "10px 12px"],
        ["border-top", `2px solid ${tokens.accent}`],
        ["border-bottom", `1px solid ${tokens.border}`],
        ["background", tokens.accentSoft],
        ["color", tokens.accentStrong],
        ["font-family", tokens.bodyFont],
        ["font-size", "19px"],
        ["font-weight", "700"],
        ["line-height", "1.45"],
      ]);
    }
    if (theme.treatment === "field") {
      return style([
        ["margin", "38px 0 18px"],
        ["padding", "0 0 10px"],
        ["border-bottom", `3px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "22px"],
        ["font-weight", "700"],
        ["line-height", "1.4"],
      ]);
    }
    if (theme.treatment === "financial") {
      return style([
        ["margin", "34px 0 16px"],
        ["padding", "9px 0 10px"],
        ["border-top", `2px solid ${tokens.accent}`],
        ["border-bottom", `1px solid ${tokens.border}`],
        ["color", tokens.accentStrong],
        ["font-family", tokens.titleFont],
        ["font-size", "21px"],
        ["font-weight", "700"],
        ["line-height", "1.45"],
      ]);
    }
    if (theme.treatment === "magazine") {
      return style([
        ["margin", "44px 0 20px"],
        ["padding", "12px 0"],
        ["border-top", `6px solid ${tokens.accent}`],
        ["border-bottom", `1px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "23px"],
        ["font-weight", "700"],
        ["line-height", "1.35"],
      ]);
    }
    if (theme.treatment === "signal") {
      return style([
        ["margin", "34px 0 16px"],
        ["padding", "10px 12px"],
        ["border-left", `8px solid ${tokens.accent}`],
        ["background", tokens.accentSoft],
        ["color", tokens.accentStrong],
        ["font-family", tokens.bodyFont],
        ["font-size", "20px"],
        ["font-weight", "800"],
        ["line-height", "1.4"],
      ]);
    }
    return style([
      ["margin", "38px 0 18px"],
      ["padding", "0 0 12px"],
      ["border-bottom", `1px solid ${tokens.border}`],
      ["color", tokens.accentStrong],
      ["font-family", tokens.titleFont],
      ["font-size", "21px"],
      ["font-weight", "700"],
      ["line-height", "1.45"],
    ]);
  }

  if (depth === 3) {
    if (theme.treatment === "editorial") {
      return style([
        ["margin", "28px 0 12px"],
        ["padding-left", "11px"],
        ["border-left", `2px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.bodyFont],
        ["font-size", "16px"],
        ["font-weight", "700"],
        ["line-height", "1.55"],
      ]);
    }
    if (theme.treatment === "briefing") {
      return style([
        ["margin", "26px 0 12px"],
        ["padding", "0 0 8px"],
        ["border-bottom", `1px dashed ${tokens.border}`],
        ["color", tokens.accentStrong],
        ["font-family", tokens.bodyFont],
        ["font-size", "16px"],
        ["font-weight", "700"],
        ["line-height", "1.55"],
      ]);
    }
    if (theme.treatment === "field") {
      return style([
        ["margin", "30px 0 12px"],
        ["padding", "0 0 8px 12px"],
        ["border-left", `4px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "17px"],
        ["font-weight", "700"],
        ["line-height", "1.5"],
      ]);
    }
    if (theme.treatment === "financial") {
      return style([
        ["margin", "26px 0 12px"],
        ["padding", "0 0 8px"],
        ["border-bottom", `1px solid ${tokens.border}`],
        ["color", tokens.accentStrong],
        ["font-family", tokens.bodyFont],
        ["font-size", "15px"],
        ["font-weight", "700"],
        ["line-height", "1.55"],
      ]);
    }
    if (theme.treatment === "magazine") {
      return style([
        ["margin", "30px 0 14px"],
        ["padding-left", "14px"],
        ["border-left", `3px solid ${tokens.accent}`],
        ["color", tokens.text],
        ["font-family", tokens.titleFont],
        ["font-size", "17px"],
        ["font-weight", "700"],
        ["line-height", "1.5"],
      ]);
    }
    if (theme.treatment === "signal") {
      return style([
        ["margin", "26px 0 12px"],
        ["color", tokens.accentStrong],
        ["font-family", tokens.bodyFont],
        ["font-size", "16px"],
        ["font-weight", "800"],
        ["line-height", "1.55"],
      ]);
    }
    return style([
      ["margin", "28px 0 12px"],
      ["padding", "0 0 8px"],
      ["color", tokens.accentStrong],
      ["font-family", tokens.bodyFont],
      ["font-size", "16px"],
      ["font-weight", "700"],
      ["line-height", "1.55"],
    ]);
  }

  return style([
    ["margin", "28px 0 12px"],
    ["color", tokens.accentStrong],
    ["font-family", tokens.bodyFont],
    ["font-size", "16px"],
    ["font-weight", "700"],
    ["line-height", "1.55"],
  ]);
}

function createRenderer(theme: WechatTheme): Renderer {
  const renderer = new Renderer();
  const { tokens } = theme;
  let paragraphCount = 0;

  renderer.heading = function (this: Renderer, { tokens: headingTokens, depth }: Tokens.Heading) {
    const content = this.parser.parseInline(headingTokens);
    return `<h${depth} ${styleAttr(headingStyle(theme, depth))}>${content}</h${depth}>`;
  };

  renderer.paragraph = function (this: Renderer, { tokens: paragraphTokens }: Tokens.Paragraph) {
    paragraphCount += 1;
    const isLead = paragraphCount === 1;
    return `<p ${styleAttr(style([
      ["margin", "0 0 18px"],
      ["color", tokens.text],
      ["font-family", tokens.bodyFont],
      ["font-size", isLead && theme.treatment === "editorial" ? "16px" : "15px"],
      ["line-height", isLead && theme.treatment === "field" ? "2.02" : "1.95"],
      ["letter-spacing", theme.treatment === "briefing" ? "0.01em" : "0.015em"],
      ["text-align", theme.treatment === "editorial" ? "justify" : undefined],
    ]))}>${this.parser.parseInline(paragraphTokens)}</p>`;
  };

  renderer.blockquote = function (this: Renderer, { tokens: quoteTokens }: Tokens.Blockquote) {
    const quoteStyle = theme.treatment === "editorial"
      ? style([["margin", "28px 0"], ["padding", "16px 18px 4px"], ["border-top", `1px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.border}`], ["background", tokens.surfaceAlt], ["color", tokens.accentStrong]])
      : theme.treatment === "field"
        ? style([["margin", "28px 0"], ["padding", "18px 18px 4px"], ["border-left", `5px solid ${tokens.accent}`], ["background", tokens.accentSoft], ["color", tokens.text]])
        : theme.treatment === "night"
          ? style([["margin", "26px 0"], ["padding", "18px 18px 16px"], ["border-left", `3px solid ${tokens.accent}`], ["background", tokens.accentSoft], ["color", tokens.text]])
          : theme.treatment === "financial"
            ? style([["margin", "26px 0"], ["padding", "15px 18px 4px"], ["border-left", `4px solid ${tokens.accent}`], ["background", tokens.surfaceAlt], ["color", tokens.text]])
            : theme.treatment === "magazine"
              ? style([["margin", "32px 0"], ["padding", "17px 0 5px"], ["border-top", `1px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.accent}`], ["background", "transparent"], ["color", tokens.text]])
              : theme.treatment === "signal"
                ? style([["margin", "26px 0"], ["padding", "18px 18px 4px"], ["border-left", `6px solid ${tokens.accent}`], ["background", tokens.accentSoft], ["color", tokens.accentStrong]])
                : style([["margin", "26px 0"], ["padding", "18px 18px 4px"], ["border-left", `3px solid ${tokens.accent}`], ["background", tokens.accentSoft], ["color", tokens.accentStrong]]);
    const quoteLabel = theme.treatment === "briefing"
      ? `<div ${styleAttr(style([["margin", "0 0 10px"], ["color", tokens.accent], ["font-family", tokens.monoFont], ["font-size", "10px"], ["font-weight", "700"], ["letter-spacing", "0.12em"], ["text-transform", "uppercase"]]))}>KEY TAKEAWAY</div>`
      : theme.treatment === "financial"
        ? `<div ${styleAttr(style([["margin", "0 0 8px"], ["color", tokens.accent], ["font-family", tokens.monoFont], ["font-size", "10px"], ["font-weight", "700"], ["letter-spacing", "0.12em"], ["text-transform", "uppercase"]]))}>EDITORIAL NOTE</div>`
        : "";
    return `<blockquote ${styleAttr(quoteStyle)}>${quoteLabel}<div ${styleAttr(style([["margin", "0 0 4px"], ["font-family", tokens.titleFont], ["font-size", "30px"], ["line-height", "0.7"], ["color", tokens.accent]]))}>“</div>${this.parser.parse(quoteTokens)}</blockquote>`;
  };

  renderer.list = function (this: Renderer, token: Tokens.List) {
    const tag = token.ordered ? "ol" : "ul";
    const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : "";
    const listStyle = theme.treatment === "night"
      ? style([["margin", "8px 0 24px"], ["padding", "14px 18px 8px 34px"], ["border", `1px solid ${tokens.border}`], ["background", tokens.surfaceAlt], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.9"]])
      : theme.treatment === "field"
        ? style([["margin", "8px 0 24px"], ["padding", "6px 0 2px 28px"], ["border-left", `2px solid ${tokens.border}`], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.9"]])
        : theme.treatment === "financial"
          ? style([["margin", "8px 0 22px"], ["padding", "10px 14px 4px 30px"], ["border-top", `1px solid ${tokens.border}`], ["border-bottom", `1px solid ${tokens.border}`], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "14px"], ["line-height", "1.85"]])
          : theme.treatment === "magazine"
            ? style([["margin", "8px 0 24px"], ["padding-left", "28px"], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.95"]])
            : theme.treatment === "signal"
              ? style([["margin", "8px 0 24px"], ["padding", "10px 14px 4px 30px"], ["background", tokens.accentSoft], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.9"]])
              : style([["margin", "6px 0 22px"], ["padding-left", "24px"], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.9"]]);
    return `<${tag} ${styleAttr(listStyle)}${start}>${token.items.map((item) => this.listitem(item)).join("")}</${tag}>`;
  };

  renderer.listitem = function (this: Renderer, item: Tokens.ListItem) {
    const checkbox = item.task ? this.checkbox({ checked: Boolean(item.checked) }) : "";
    return `<li ${styleAttr(style([["margin", "0 0 6px"], ["padding-left", "4px"]]))}>${checkbox}${this.parser.parse(item.tokens)}</li>`;
  };

  renderer.checkbox = function ({ checked }: Tokens.Checkbox) {
    return `<span ${styleAttr(style([["display", "inline-block"], ["width", "14px"], ["height", "14px"], ["margin", "0 5px 0 -2px"], ["border", `1px solid ${tokens.accent}`], ["border-radius", "2px"], ["background", checked ? tokens.accent : "transparent"], ["color", checked ? tokens.surface : "transparent"], ["font-family", tokens.bodyFont], ["font-size", "10px"], ["font-weight", "700"], ["line-height", "13px"], ["text-align", "center"], ["vertical-align", "-2px"]]))}>✓</span>`;
  };

  renderer.strong = function (this: Renderer, { tokens: strongTokens }: Tokens.Strong) {
    return `<strong ${styleAttr(style([["color", tokens.accentStrong], ["font-weight", "700"]]))}>${this.parser.parseInline(strongTokens)}</strong>`;
  };

  renderer.em = function (this: Renderer, { tokens: emphasisTokens }: Tokens.Em) {
    return `<em ${styleAttr(style([["color", tokens.muted], ["font-style", "italic"]]))}>${this.parser.parseInline(emphasisTokens)}</em>`;
  };

  renderer.del = function (this: Renderer, { tokens: deletedTokens }: Tokens.Del) {
    return `<del ${styleAttr(style([["color", tokens.muted], ["text-decoration-line", "line-through"], ["text-decoration-color", tokens.accent], ["text-decoration-thickness", "1px"]]))}>${this.parser.parseInline(deletedTokens)}</del>`;
  };

  renderer.br = function () {
    return `<br ${styleAttr(style([["line-height", "1.9"]]))}>`;
  };

  renderer.codespan = function ({ text }: Tokens.Codespan) {
    return `<code ${styleAttr(style([["padding", "2px 5px"], ["border-radius", "3px"], ["background", tokens.accentSoft], ["color", tokens.accentStrong], ["font-family", tokens.monoFont], ["font-size", "0.9em"]]))}>${escapeHtml(text)}</code>`;
  };

  renderer.code = function ({ text, lang }: Tokens.Code) {
    const label = lang ? `<span ${styleAttr(style([["display", "block"], ["margin-bottom", "8px"], ["color", tokens.accent], ["font-family", tokens.monoFont], ["font-size", "11px"], ["letter-spacing", "0.08em"], ["text-transform", "uppercase"]]))}>${escapeHtml(lang)}</span>` : "";
    return `<pre ${styleAttr(style([["margin", "24px 0"], ["padding", "16px"], ["overflow-x", "auto"], ["border-radius", "4px"], ["background", tokens.codeBg], ["color", tokens.codeText], ["font-family", tokens.monoFont], ["font-size", "12px"], ["line-height", "1.7"], ["white-space", "pre-wrap"], ["word-break", "break-word"]]))}>${label}<code>${escapeHtml(text)}</code></pre>`;
  };

  renderer.table = function (this: Renderer, token: Tokens.Table) {
    const tableStyle = style([["width", "100%"], ["border-collapse", "collapse"], ["margin", "24px 0 28px"], ["border-top", `2px solid ${tokens.accent}`], ["font-family", tokens.bodyFont], ["font-size", "12px"], ["line-height", "1.65"]]);
    const head = `<thead><tr>${token.header.map((cell) => this.tablecell(cell)).join("")}</tr></thead>`;
    const body = `<tbody>${token.rows.map((row) => `<tr>${row.map((cell) => this.tablecell(cell)).join("")}</tr>`).join("")}</tbody>`;
    return `<div ${styleAttr(style([["overflow-x", "auto"], ["margin", "0"]]))}><table ${styleAttr(tableStyle)}>${head}${body}</table></div>`;
  };

  renderer.tablecell = function (this: Renderer, cell: Tokens.TableCell) {
    const tag = cell.header ? "th" : "td";
    const cellStyle = style([
      ["padding", cell.header ? "9px 8px" : "8px"],
      ["border-bottom", `1px solid ${tokens.border}`],
      ["background", cell.header ? tokens.surfaceAlt : "transparent"],
      ["color", cell.header ? tokens.accentStrong : tokens.text],
      ["font-weight", cell.header ? "700" : "400"],
      ["vertical-align", "top"],
      ["text-align", cell.align ?? "left"],
    ]);
    return `<${tag} ${styleAttr(cellStyle)}>${this.parser.parseInline(cell.tokens)}</${tag}>`;
  };

  renderer.hr = function () {
    return `<div ${styleAttr(style([["height", "1px"], ["margin", "34px auto"], ["width", theme.treatment === "editorial" ? "34px" : "100%"], ["background", tokens.accent]]))}></div>`;
  };

  renderer.link = function (this: Renderer, { href, title, tokens: linkTokens }: Tokens.Link) {
    const url = safeUrl(href);
    if (!url) return this.parser.parseInline(linkTokens);
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    return `<a href="${escapeHtml(url)}"${titleAttr} ${styleAttr(style([["color", tokens.accentStrong], ["text-decoration", "underline"], ["text-decoration-color", tokens.accent], ["text-underline-offset", "3px"]]))}>${this.parser.parseInline(linkTokens)}</a>`;
  };

  renderer.image = function ({ href, title, text }: Tokens.Image) {
    const url = safeUrl(href);
    if (!url) return `<span ${styleAttr(style([["display", "block"], ["padding", "16px"], ["border", `1px dashed ${tokens.border}`], ["color", tokens.muted], ["text-align", "center"]]))}>图片地址不可用：${escapeHtml(text)}</span>`;
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    return `<figure ${styleAttr(style([["margin", "24px 0"], ["text-align", "center"]]))}><img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr} ${styleAttr(style([["display", "block"], ["width", "100%"], ["height", "auto"], ["border-radius", theme.treatment === "field" ? "0" : "3px"]]))}><figcaption ${styleAttr(style([["margin-top", "8px"], ["color", tokens.muted], ["font-size", "12px"], ["line-height", "1.5"]]))}>${escapeHtml(text)}</figcaption></figure>`;
  };

  renderer.html = function ({ text }: Tokens.HTML | Tokens.Tag) {
    return escapeHtml(text);
  };

  return renderer;
}

function headerStyle(theme: WechatTheme): string {
  const { tokens } = theme;
  if (theme.treatment === "editorial") return style([["padding", "26px 0 24px"], ["border-top", `7px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.border}`]]);
  if (theme.treatment === "briefing") return style([["padding", "20px 0 22px"], ["border-top", `1px solid ${tokens.border}`], ["border-bottom", `2px solid ${tokens.accent}`]]);
  if (theme.treatment === "field") return style([["padding", "20px 17px 24px"], ["border-left", `5px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.border}`], ["background", tokens.surfaceAlt]]);
  if (theme.treatment === "financial") return style([["padding", "18px 0 22px"], ["border-top", `5px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.border}`]]);
  if (theme.treatment === "magazine") return style([["padding", "18px 0 26px"], ["border-top", `9px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.accent}`]]);
  if (theme.treatment === "signal") return style([["padding", "20px 16px 22px"], ["border-left", `9px solid ${tokens.accent}`], ["border-bottom", `1px solid ${tokens.border}`], ["background", tokens.surfaceAlt]]);
  return style([["padding", "22px 18px 24px"], ["border", `1px solid ${tokens.border}`], ["background", tokens.surfaceAlt]]);
}

function headerStamp(theme: WechatTheme): string {
  const { tokens } = theme;
  const [label, edition] = theme.treatment === "editorial"
      ? ["THE EDITORIAL DESK", "VOL. 09"]
      : theme.treatment === "briefing"
        ? ["NEWS BRIEFING", "UPDATE  /  09.07"]
      : theme.treatment === "field"
        ? ["FIELD NOTE", "NO. 01"]
        : theme.treatment === "financial"
          ? ["DATA DESK", "MARKET NOTE  /  09.07"]
          : theme.treatment === "magazine"
            ? ["FEATURE EDITION", "ISSUE  /  09"]
            : theme.treatment === "signal"
              ? ["CHANNEL  /  CITY", "LIVE  /  09.07"]
              : ["NIGHT DESK", "LATE EDITION"];
  return `<div ${styleAttr(style([["display", "flex"], ["align-items", "center"], ["justify-content", "space-between"], ["gap", "12px"], ["margin", "0 0 16px"], ["color", tokens.accent], ["font-family", tokens.monoFont], ["font-size", "10px"], ["font-weight", "700"], ["letter-spacing", "0.12em"], ["line-height", "1.4"], ["text-transform", "uppercase"]]))}><span>${label}</span><span ${styleAttr(style([["color", tokens.muted], ["font-weight", "500"], ["letter-spacing", "0.08em"]]))}>${edition}</span></div>`;
}

export function renderWechatArticle(markdown: string, themeInput: WechatTheme | string, meta: WechatArticleMeta): string {
  const theme = typeof themeInput === "string" ? getWechatTheme(themeInput) : themeInput;
  const { tokens } = theme;
  const renderer = createRenderer(theme);
  const body = marked.parse(markdown, { gfm: true, breaks: false, renderer }) as string;
  const metaLine = [meta.date, meta.author, meta.readingTime].filter((value): value is string => Boolean(value)).map(escapeHtml).join("  ·  ");
  const kicker = meta.kicker ? `<div ${styleAttr(style([["margin", "0 0 15px"], ["color", tokens.accent], ["font-family", tokens.bodyFont], ["font-size", "11px"], ["font-weight", "700"], ["letter-spacing", "0.12em"], ["line-height", "1.5"], ["text-transform", "uppercase"]]))}>${escapeHtml(meta.kicker)}</div>` : "";
  const deck = meta.deck ? `<p ${styleAttr(style([["margin", "18px 0 0"], ["padding-left", theme.treatment === "field" ? "12px" : undefined], ["border-left", theme.treatment === "field" ? `2px solid ${tokens.border}` : undefined], ["color", tokens.muted], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.75"]]))}>${escapeHtml(meta.deck)}</p>` : "";
  const metaBlock = metaLine ? `<div ${styleAttr(style([["margin", "17px 0 0"], ["color", tokens.muted], ["font-family", tokens.bodyFont], ["font-size", "11px"], ["letter-spacing", "0.04em"], ["line-height", "1.5"]]))}>${metaLine}</div>` : "";
  const footer = meta.source ? `<footer ${styleAttr(style([["margin", "38px 0 0"], ["padding-top", "16px"], ["border-top", `1px solid ${tokens.border}`], ["color", tokens.muted], ["font-family", tokens.bodyFont], ["font-size", "11px"], ["line-height", "1.7"]]))}>${escapeHtml(meta.source)}</footer>` : "";

  const titleSize = theme.treatment === "briefing" ? "27px" : theme.treatment === "magazine" ? "32px" : theme.treatment === "signal" ? "30px" : "29px";
  return `<section ${styleAttr(style([["width", "100%"], ["max-width", "677px"], ["margin", "0 auto"], ["padding", "30px 24px 42px"], ["box-sizing", "border-box"], ["background", tokens.surface], ["color", tokens.text], ["font-family", tokens.bodyFont], ["font-size", "15px"], ["line-height", "1.9"], ["word-break", "break-word"]]))}><header ${styleAttr(headerStyle(theme))}>${headerStamp(theme)}${kicker}<h1 ${styleAttr(style([["margin", "0"], ["color", tokens.text], ["font-family", tokens.titleFont], ["font-size", titleSize], ["font-weight", "700"], ["letter-spacing", theme.treatment === "night" ? "0.01em" : "0.02em"], ["line-height", "1.28"]]))}>${escapeHtml(meta.title)}</h1>${deck}${metaBlock}</header><main ${styleAttr(style([["padding-top", "26px"]]))}>${body}</main>${footer}</section>`;
}
