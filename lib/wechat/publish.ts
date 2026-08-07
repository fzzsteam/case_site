import "server-only";
import { postJson } from "./client";

type BatchGetResponse = {
  total_count: number;
  item_count: number;
  item?: Array<{
    article_id: string;
    update_time?: number;
    content?: { news_item?: Array<{ title?: string }> };
  }>;
};

export type PublishedSummary = { articleId: string; title: string; updatedAt: string };

/** 已成功发布的消息列表。no_content=1 不拉正文，列表更轻。 */
export async function listPublished(offset: number, count: number): Promise<{ total: number; items: PublishedSummary[] }> {
  const data = await postJson<BatchGetResponse>("/cgi-bin/freepublish/batchget", { offset, count, no_content: 1 });
  const items = (data.item ?? []).map((item) => ({
    articleId: item.article_id,
    title: item.content?.news_item?.[0]?.title ?? "(无标题)",
    updatedAt: item.update_time ? new Date(item.update_time * 1000).toISOString() : "",
  }));
  return { total: data.total_count, items };
}

/** 删除已发布文章，不可逆。 */
export function deletePublished(articleId: string): Promise<unknown> {
  return postJson("/cgi-bin/freepublish/delete", { article_id: articleId });
}

/** 已发布图文详情，含正文。 */
export function getPublishedArticle(articleId: string): Promise<unknown> {
  return postJson("/cgi-bin/freepublish/getarticle", { article_id: articleId });
}
