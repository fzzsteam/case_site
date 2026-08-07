import "server-only";
import { getJson } from "./client";

export type WechatTag = { id: number; name: string; count: number };

/** 公众号已创建的标签列表，供按标签群发（sendall）时选 tag_id。 */
export async function listTags(): Promise<WechatTag[]> {
  const data = await getJson<{ tags?: WechatTag[] }>("/cgi-bin/tags/get");
  return data.tags ?? [];
}
