import "server-only";
import { getJson, postJson } from "./client";

type UserInfoResponse = {
  subscribe?: number;
  openid?: string;
  subscribe_time?: number;
  unionid?: string;
  tagid_list?: number[];
  subscribe_scene?: string;
};

export type UserInfo = {
  subscribe: number;
  openid: string;
  subscribeTime: string;
  unionid?: string;
  tagidList: number[];
  subscribeScene?: string;
};

function mapUserInfo(user: UserInfoResponse): UserInfo {
  return {
    subscribe: user.subscribe ?? 0,
    openid: user.openid ?? "",
    subscribeTime: user.subscribe_time ? new Date(user.subscribe_time * 1000).toISOString() : "",
    unionid: user.unionid,
    tagidList: user.tagid_list ?? [],
    subscribeScene: user.subscribe_scene,
  };
}

/** 关注者 openid 列表（分页，游标 nextOpenid 循环拉取直到为空）。 */
export async function listFollowers(nextOpenid?: string): Promise<{ total: number; count: number; openids: string[]; nextOpenid?: string }> {
  const data = await getJson<{ total?: number; count?: number; data?: { openid?: string[] }; next_openid?: string }>("/cgi-bin/user/get", {
    next_openid: nextOpenid,
  });
  return {
    total: data.total ?? 0,
    count: data.count ?? 0,
    openids: data.data?.openid ?? [],
    nextOpenid: data.next_openid,
  };
}

/** 单个用户基本信息（关注时间、来源渠道、标签）。 */
export async function getUserInfo(openid: string, lang: "zh_CN" | "zh_TW" | "en" = "zh_CN"): Promise<UserInfo> {
  const data = await getJson<UserInfoResponse>("/cgi-bin/user/info", { openid, lang });
  return mapUserInfo(data);
}

/** 批量获取用户基本信息，最多 100 个。 */
export async function batchGetUserInfo(openids: string[]): Promise<UserInfo[]> {
  const data = await postJson<{ user_info_list?: UserInfoResponse[] }>("/cgi-bin/user/info/batchget", {
    user_list: openids.map((openid) => ({ openid, lang: "zh_CN" })),
  });
  return (data.user_info_list ?? []).map(mapUserInfo);
}

export async function createTag(name: string): Promise<{ id: number; name: string }> {
  const data = await postJson<{ tag?: { id?: number; name?: string } }>("/cgi-bin/tags/create", { tag: { name } });
  return { id: data.tag?.id ?? 0, name: data.tag?.name ?? "" };
}

export function updateTag(id: number, name: string): Promise<unknown> {
  return postJson("/cgi-bin/tags/update", { tag: { id, name } });
}

export function deleteTag(id: number): Promise<unknown> {
  return postJson("/cgi-bin/tags/delete", { tag: { id } });
}

export function tagUsers(tagId: number, openids: string[]): Promise<unknown> {
  return postJson("/cgi-bin/tags/members/batchtagging", { tagid: tagId, openid_list: openids });
}

export function untagUsers(tagId: number, openids: string[]): Promise<unknown> {
  return postJson("/cgi-bin/tags/members/batchuntagging", { tagid: tagId, openid_list: openids });
}

/** 某标签下的粉丝 openid 列表（分页）。 */
export async function listTagMembers(tagId: number, nextOpenid?: string): Promise<{ count: number; openids: string[]; nextOpenid?: string }> {
  const data = await postJson<{ count?: number; data?: { openid?: string[] }; next_openid?: string }>("/cgi-bin/user/tag/get", {
    tagid: tagId,
    next_openid: nextOpenid,
  });
  return { count: data.count ?? 0, openids: data.data?.openid ?? [], nextOpenid: data.next_openid };
}

/** 某粉丝被打上的标签 id 列表。 */
export async function getUserTags(openid: string): Promise<number[]> {
  const data = await postJson<{ tagid_list?: number[] }>("/cgi-bin/tags/getidlist", { openid });
  return data.tagid_list ?? [];
}
