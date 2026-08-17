import "server-only";
import { postJson } from "./client";

export type MassPreviewTarget = { wxname?: string; openid?: string };

export type MassMessageType = "mpnews" | "text" | "image" | "voice" | "mpvideo" | "wxcard" | "music";

export type MassMessage =
  | { msgtype: "mpnews"; mediaId: string }
  | { msgtype: "text"; content: string }
  | { msgtype: "image"; mediaId: string }
  | { msgtype: "voice"; mediaId: string }
  | { msgtype: "mpvideo"; mediaId: string; title?: string; description?: string }
  | { msgtype: "wxcard"; cardId: string; cardExt?: string }
  | { msgtype: "music"; title?: string; description?: string; musicUrl: string; hqMusicUrl: string; thumbMediaId: string };

function normalizeMassMessage(message: MassMessage | string | undefined): MassMessage {
  if (typeof message === "string") return { msgtype: "mpnews", mediaId: message };
  if (message) return message;
  throw new Error("群发消息不能为空。");
}

function messagePayload(message: MassMessage): Record<string, unknown> {
  switch (message.msgtype) {
    case "mpnews":
      return { msgtype: "mpnews", mpnews: { media_id: message.mediaId } };
    case "text":
      return { msgtype: "text", text: { content: message.content } };
    case "image":
      return { msgtype: "image", image: { media_id: message.mediaId } };
    case "voice":
      return { msgtype: "voice", voice: { media_id: message.mediaId } };
    case "mpvideo":
      return {
        msgtype: "mpvideo",
        mpvideo: {
          media_id: message.mediaId,
          ...(message.title === undefined ? {} : { title: message.title }),
          ...(message.description === undefined ? {} : { description: message.description }),
        },
      };
    case "wxcard":
      return { msgtype: "wxcard", wxcard: { card_id: message.cardId, ...(message.cardExt === undefined ? {} : { card_ext: message.cardExt }) } };
    case "music":
      return {
        msgtype: "music",
        music: {
          ...(message.title === undefined ? {} : { title: message.title }),
          ...(message.description === undefined ? {} : { description: message.description }),
          musicurl: message.musicUrl,
          hqmusicurl: message.hqMusicUrl,
          thumb_media_id: message.thumbMediaId,
        },
      };
  }
}

/** 预览任意支持的群发消息，真推送到指定一人的微信里查看效果，不计入群发次数。字符串参数兼容旧的 mpnews 调用。 */
export async function massPreview(message: MassMessage | string, target: MassPreviewTarget): Promise<unknown> {
  if (!target.wxname && !target.openid) throw new Error("预览必须指定 to_wxname（运营者微信号）或 to_openid 之一。");
  const receiver = target.wxname ? { towxname: target.wxname } : { touser: target.openid };
  return postJson("/cgi-bin/message/mass/preview", { ...messagePayload(normalizeMassMessage(message)), ...receiver });
}

export type MassSendAllOptions = {
  /** 新消息结构。 */
  message?: MassMessage;
  /** 旧调用兼容：按 mpnews 发送草稿 media_id。 */
  mediaId?: string;
  /** true=群发全员；false=按标签群发（必须带 tagId）。 */
  isToAll: boolean;
  tagId?: number;
  sendIgnoreReprint?: 0 | 1;
  clientmsgid: string;
};

/** 按标签/全员群发消息。会推送给粉丝，不可逆；confirm 校验在工具层完成。 */
export async function massSendAll(options: MassSendAllOptions): Promise<{ msg_id: number; msg_data_id?: string }> {
  const filter = options.isToAll ? { is_to_all: true } : { is_to_all: false, tag_id: options.tagId };
  const message = normalizeMassMessage(options.message ?? options.mediaId);
  const body: Record<string, unknown> = {
    filter,
    ...messagePayload(message),
    clientmsgid: options.clientmsgid,
  };
  if (message.msgtype === "mpnews") body.send_ignore_reprint = options.sendIgnoreReprint ?? 0;
  return postJson<{ msg_id: number; msg_data_id?: string }>("/cgi-bin/message/mass/sendall", body);
}

/** 按 OpenID 列表群发消息（仅服务号）。字符串参数兼容旧的 mpnews 调用。 */
export async function massSendByOpenids(message: MassMessage | string, openids: string[], clientmsgid: string): Promise<{ msg_id: number; msg_data_id?: string }> {
  return postJson<{ msg_id: number; msg_data_id?: string }>("/cgi-bin/message/mass/send", {
    touser: openids,
    ...messagePayload(normalizeMassMessage(message)),
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
  article_url?: string[];
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
  filterCount: number;
  sentCount: number;
  errorCount: number;
  articleUrls: string[];
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
    filterCount: data.filtercount ?? 0,
    sentCount: data.sentcount ?? 0,
    errorCount: data.errorcount ?? 0,
    articleUrls: data.article_url ?? [],
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
