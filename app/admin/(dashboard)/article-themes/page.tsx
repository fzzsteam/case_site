import { ArticleThemeLab } from "@/components/admin/article-theme-lab";
import { ARTICLE_SAMPLE } from "@/lib/wechat/format/sample";
import { renderWechatArticle } from "@/lib/wechat/format/render";
import { WECHAT_THEMES } from "@/lib/wechat/format/themes";

export default function ArticleThemesPage() {
  const previews = Object.fromEntries(WECHAT_THEMES.map((theme) => [theme.id, renderWechatArticle(ARTICLE_SAMPLE.markdown, theme, ARTICLE_SAMPLE)]));
  return <ArticleThemeLab themes={WECHAT_THEMES} previews={previews} article={ARTICLE_SAMPLE} />;
}
