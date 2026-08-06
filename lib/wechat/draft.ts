import "server-only";
import { postJson } from "./client";

export type DraftArticle = {
  title: string;
  content: string;
  thumbMediaId: string;
  author?: string;
  digest?: string;
  contentSourceUrl?: string;
  needOpenComment?: boolean;
  onlyFansCanComment?: boolean;
};

function toWechatArticle(article: DraftArticle) {
  return {
    title: article.title,
    author: article.author ?? "",
    digest: article.digest ?? "",
    content: article.content,
    content_source_url: article.contentSourceUrl ?? "",
    thumb_media_id: article.thumbMediaId,
    need_open_comment: article.needOpenComment ? 1 : 0,
    only_fans_can_comment: article.onlyFansCanComment ? 1 : 0,
  };
}

export function createDraft(article: DraftArticle): Promise<{ media_id: string }> {
  return postJson<{ media_id: string }>("/cgi-bin/draft/add", { articles: [toWechatArticle(article)] });
}

/** 微信的更新是整篇替换指定 index 的文章，没有字段级 patch。 */
export function updateDraft(mediaId: string, index: number, article: DraftArticle): Promise<unknown> {
  return postJson("/cgi-bin/draft/update", { media_id: mediaId, index, articles: toWechatArticle(article) });
}

export type DraftSummary = { mediaId: string; title: string; updatedAt: string; articleCount: number };

type BatchGetResponse = {
  total_count: number;
  item_count: number;
  item?: Array<{ media_id: string; update_time: number; content?: { news_item?: Array<{ title?: string }> } }>;
};

export async function listDrafts(offset: number, count: number): Promise<{ total: number; drafts: DraftSummary[] }> {
  const data = await postJson<BatchGetResponse>("/cgi-bin/draft/batchget", { offset, count, no_content: 1 });
  const drafts = (data.item ?? []).map((item) => ({
    mediaId: item.media_id,
    title: item.content?.news_item?.[0]?.title ?? "(无标题)",
    updatedAt: new Date(item.update_time * 1000).toISOString(),
    articleCount: item.content?.news_item?.length ?? 0,
  }));
  return { total: data.total_count, drafts };
}

export function submitPublish(mediaId: string): Promise<{ publish_id: string; msg_data_id?: string }> {
  return postJson<{ publish_id: string; msg_data_id?: string }>("/cgi-bin/freepublish/submit", { media_id: mediaId });
}

const PUBLISH_STATUS_TEXT: Record<number, string> = {
  0: "发布成功",
  1: "发布中，请稍后再查询",
  2: "原创校验不通过，发布失败",
  3: "常规失败",
  4: "平台审核不通过",
  5: "成功后已被用户删除所有文章",
  6: "成功后已被系统封禁所有文章",
};

export type PublishStatus = {
  publishId: string;
  status: number;
  statusText: string;
  done: boolean;
  articleId?: string;
  articleUrls: string[];
};

type PublishGetResponse = {
  publish_id: string | number;
  publish_status: number;
  article_id?: string;
  article_detail?: { item?: Array<{ article_url?: string }> };
};

export async function getPublishStatus(publishId: string): Promise<PublishStatus> {
  const data = await postJson<PublishGetResponse>("/cgi-bin/freepublish/get", { publish_id: publishId });
  return {
    publishId: String(data.publish_id),
    status: data.publish_status,
    statusText: PUBLISH_STATUS_TEXT[data.publish_status] ?? `未知状态 ${data.publish_status}`,
    done: data.publish_status !== 1,
    articleId: data.article_id,
    articleUrls: (data.article_detail?.item ?? []).map((item) => item.article_url).filter((url): url is string => Boolean(url)),
  };
}
