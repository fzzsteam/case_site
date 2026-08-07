import "server-only";
import { postJson } from "./client";

type CommentResponse = {
  total: number;
  comment?: Array<{
    user_comment_id: number;
    create_time?: number;
    content?: string;
    comment_type?: number;
    openid?: string;
    reply?: { content?: string; create_time?: number };
  }>;
};

export type CommentItem = {
  userCommentId: number;
  createdAt: string;
  content: string;
  commentType: number;
  openid?: string;
  reply?: { content: string; createdAt: string };
};

export type ListCommentsOptions = {
  msgDataId: number;
  index?: number;
  begin: number;
  count: number;
  type: 0 | 1 | 2;
};

/** 查看指定文章的评论。msg_data_id 来自群发或发布（freepublish/submit）的返回。 */
export async function listComments(options: ListCommentsOptions): Promise<{ total: number; comments: CommentItem[] }> {
  const data = await postJson<CommentResponse>("/cgi-bin/comment/list", {
    msg_data_id: options.msgDataId,
    index: options.index ?? 0,
    begin: options.begin,
    count: options.count,
    type: options.type,
  });
  const comments = (data.comment ?? []).map((item) => ({
    userCommentId: item.user_comment_id,
    createdAt: item.create_time ? new Date(item.create_time * 1000).toISOString() : "",
    content: item.content ?? "",
    commentType: item.comment_type ?? 0,
    openid: item.openid,
    reply: item.reply ? { content: item.reply.content ?? "", createdAt: item.reply.create_time ? new Date(item.reply.create_time * 1000).toISOString() : "" } : undefined,
  }));
  return { total: data.total, comments };
}

type CommentTarget = { msgDataId: number; index?: number; userCommentId: number };

function commentTargetBody(target: CommentTarget): Record<string, unknown> {
  return { msg_data_id: target.msgDataId, index: target.index ?? 0, user_comment_id: target.userCommentId };
}

export function replyComment(target: CommentTarget & { content: string }): Promise<unknown> {
  return postJson("/cgi-bin/comment/reply/add", { ...commentTargetBody(target), content: target.content });
}

export function markComment(target: CommentTarget): Promise<unknown> {
  return postJson("/cgi-bin/comment/markelect", commentTargetBody(target));
}

export function unmarkComment(target: CommentTarget): Promise<unknown> {
  return postJson("/cgi-bin/comment/unmarkelect", commentTargetBody(target));
}

export function deleteComment(target: CommentTarget): Promise<unknown> {
  return postJson("/cgi-bin/comment/delete", commentTargetBody(target));
}
