import "server-only";
import { getJson, postJson } from "./client";

export type CustomerMessageInput = {
  touser: string;
  msgtype: string;
  content: Record<string, unknown>;
  customservice?: string;
};

/**
 * 发送客服消息。msgtype 决定 content 的形状：text={content}、image={media_id}、
 * link={title,url,thumb_url}、miniprogrampage={title,pagepath,thumb_media_id} 等。
 * 触发条件：用户发消息后 48 小时内最多 5 条，关注/扫码/点菜单后 1 分钟内 3 条。
 */
export async function sendCustomerMessage(input: CustomerMessageInput): Promise<unknown> {
  return postJson("/cgi-bin/message/custom/send", {
    touser: input.touser,
    msgtype: input.msgtype,
    [input.msgtype]: input.content,
    ...(input.customservice ? { customservice: { kf_account: input.customservice } } : {}),
  });
}

/** 设置客服输入状态，让对方看到"对方正在输入…"。 */
export function sendTyping(openid: string): Promise<unknown> {
  return postJson("/cgi-bin/message/custom/typing", { touser: openid, command: "Typing" });
}

export async function listKfAccounts(): Promise<Array<{ kfAccount: string; kfNick: string; kfId: string }>> {
  const data = await getJson<{ kf_list?: Array<{ kf_account?: string; kf_nick?: string; kf_id?: string }> }>("/cgi-bin/customservice/getkflist");
  return (data.kf_list ?? []).map((item) => ({
    kfAccount: item.kf_account ?? "",
    kfNick: item.kf_nick ?? "",
    kfId: item.kf_id ?? "",
  }));
}
