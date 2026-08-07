import "server-only";
import { postJson } from "./client";

export type MassPreviewTarget = { wxname?: string; openid?: string };

/** 预览文章（草稿 media_id），真推送到指定一人的微信里看排版，不计入群发次数。 */
export async function massPreview(mediaId: string, target: MassPreviewTarget): Promise<unknown> {
  if (!target.wxname && !target.openid) throw new Error("预览必须指定 to_wxname（运营者微信号）或 to_openid 之一。");
  const receiver = target.wxname ? { towxname: target.wxname } : { touser: target.openid };
  return postJson("/cgi-bin/message/mass/preview", { msgtype: "mpnews", mpnews: { media_id: mediaId }, ...receiver });
}

export type MassSendAllOptions = {
  mediaId: string;
  /** true=群发全员；false=按标签群发（必须带 tagId）。 */
  isToAll: boolean;
  tagId?: number;
  sendIgnoreReprint?: 0 | 1;
  clientmsgid: string;
};

/** 按标签/全员群发文章。会推送给粉丝，不可逆；confirm 校验在工具层完成。 */
export async function massSendAll(options: MassSendAllOptions): Promise<{ msg_id: number; msg_data_id?: string }> {
  const filter = options.isToAll ? { is_to_all: true } : { is_to_all: false, tag_id: options.tagId };
  return postJson<{ msg_id: number; msg_data_id?: string }>("/cgi-bin/message/mass/sendall", {
    filter,
    mpnews: { media_id: options.mediaId },
    msgtype: "mpnews",
    send_ignore_reprint: options.sendIgnoreReprint ?? 0,
    clientmsgid: options.clientmsgid,
  });
}

/** 按 OpenID 列表群发（仅服务号）。 */
export async function massSendByOpenids(mediaId: string, openids: string[], clientmsgid: string): Promise<{ msg_id: number; msg_data_id?: string }> {
  return postJson<{ msg_id: number; msg_data_id?: string }>("/cgi-bin/message/mass/send", {
    touser: openids,
    mpnews: { media_id: mediaId },
    msgtype: "mpnews",
    clientmsgid,
  });
}

type MassStatusResponse = {
  msg_id: number;
  msg_status?: string;
  totalcount?: number;
  filtercount?: number;
  sentcount?: number;
  errorcount?: number;
};

const MASS_STATUS_TEXT: Record<string, string> = {
  SEND_SUCCESS: "发送成功",
  SENDING: "发送中，请稍后再查询",
  "send success": "发送成功",
  sending: "发送中，请稍后再查询",
};

export type MassStatus = {
  msgId: number;
  status: string;
  statusText: string;
  done: boolean;
  totalCount: number;
  sentCount: number;
  errorCount: number;
};

export async function getMassStatus(msgId: number): Promise<MassStatus> {
  const data = await postJson<MassStatusResponse>("/cgi-bin/message/mass/get", { msg_id: msgId });
  const status = data.msg_status ?? "";
  return {
    msgId: data.msg_id,
    status,
    statusText: MASS_STATUS_TEXT[status] ?? (status ? `未知状态 ${status}` : "状态缺失"),
    done: status !== "SENDING" && status !== "sending",
    totalCount: data.totalcount ?? 0,
    sentCount: data.sentcount ?? 0,
    errorCount: data.errorcount ?? 0,
  };
}

/** 删除群发（仅文章/视频消息可删）。articleIdx 用于多图文删单篇，从 1 开始。 */
export async function deleteMass(msgId: number, articleIdx?: number): Promise<unknown> {
  return postJson("/cgi-bin/message/mass/delete", articleIdx === undefined ? { msg_id: msgId } : { msg_id: msgId, article_idx: articleIdx });
}

/** 当前群发速度等级（0-3，数字越大越快）。 */
export function getMassSpeed(): Promise<{ speed?: number }> {
  return postJson<{ speed?: number }>("/cgi-bin/message/mass/speed/get", {});
}
