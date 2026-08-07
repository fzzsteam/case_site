import "server-only";
import { postJson } from "./client";

export type MaterialType = "image" | "video" | "voice" | "news";

type BatchGetResponse = {
  total_count: number;
  item_count: number;
  item?: Array<{ media_id: string; name?: string; update_time?: number; url?: string }>;
};

export type MaterialSummary = { mediaId: string; name: string; updatedAt: string; url?: string };

/** 分类型获取永久素材列表。 */
export async function listMaterials(type: MaterialType, offset: number, count: number): Promise<{ total: number; items: MaterialSummary[] }> {
  const data = await postJson<BatchGetResponse>("/cgi-bin/material/batchget_material", { type, offset, count });
  const items = (data.item ?? []).map((item) => ({
    mediaId: item.media_id,
    name: item.name ?? "",
    updatedAt: item.update_time ? new Date(item.update_time * 1000).toISOString() : "",
    url: item.url,
  }));
  return { total: data.total_count, items };
}

/** 删除永久素材。 */
export function deleteMaterial(mediaId: string): Promise<unknown> {
  return postJson("/cgi-bin/material/del_material", { media_id: mediaId });
}

/** 根据 media_id 获取永久素材详情（图片/视频等返回不同结构）。 */
export function getMaterial(mediaId: string): Promise<unknown> {
  return postJson("/cgi-bin/material/get_material", { media_id: mediaId });
}

export function getMaterialCount(): Promise<unknown> {
  return postJson("/cgi-bin/material/get_materialcount", {});
}
