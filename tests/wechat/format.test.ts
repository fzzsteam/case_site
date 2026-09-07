// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ARTICLE_SAMPLE } from "@/lib/wechat/format/sample";
import { renderWechatArticle } from "@/lib/wechat/format/render";
import { WECHAT_THEMES } from "@/lib/wechat/format/themes";

describe("微信公众号资讯主题渲染器", () => {
  it.each(WECHAT_THEMES.map((theme) => theme.id))("主题 %s 输出微信内联 HTML", (themeId) => {
    const html = renderWechatArticle(ARTICLE_SAMPLE.markdown, themeId, ARTICLE_SAMPLE);

    expect(html).toContain(ARTICLE_SAMPLE.title);
    expect(html).toContain("style=\"");
    expect(html).not.toContain("<style");
    expect(html).not.toContain("class=\"");
    expect(html).not.toContain("<script");
    expect(html).toContain("<table");
    expect(html).toContain("<img");
    expect(html).toContain("<pre");
    expect(html).toContain("<a href=");
    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain("✓");
    expect(html).toContain("text-decoration-thickness:1px");
    expect(html).toContain("font-style:italic");
    expect(html).toContain("编辑部判断");
  });

  it("非法链接不会原样进入 HTML", () => {
    const html = renderWechatArticle("[危险链接](javascript:alert(1))", "editorial", ARTICLE_SAMPLE);
    expect(html).not.toContain("javascript:");
    expect(html).toContain("危险链接");
  });

  it("会转换常见 GFM 扩展", () => {
    const html = renderWechatArticle("- [x] 已完成\n- [ ] 待处理\n\n~~旧信息~~", "briefing", ARTICLE_SAMPLE);
    expect(html).toContain("✓");
    expect(html).toContain("text-decoration-thickness:1px");
    expect(html).toContain("<ul");
  });
});
