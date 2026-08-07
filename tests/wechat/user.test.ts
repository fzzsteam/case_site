import {
  batchGetUserInfo,
  createTag,
  deleteTag,
  getUserInfo,
  getUserTags,
  listFollowers,
  listTagMembers,
  tagUsers,
  untagUsers,
  updateTag,
} from "@/lib/wechat/user";
import { getJson, postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ getJson: vi.fn(), postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("获取关注者列表并映射出 openid 分页", async () => {
  vi.mocked(getJson).mockResolvedValue({ total: 2, count: 1, data: { openid: ["o-1"] }, next_openid: "o-2" } as never);

  await expect(listFollowers("o-2")).resolves.toEqual({ total: 2, count: 1, openids: ["o-1"], nextOpenid: "o-2" });
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/user/get");
  expect(vi.mocked(getJson).mock.calls[0][1]).toEqual({ next_openid: "o-2" });
});

it("获取关注者列表不传游标时只带 access_token", async () => {
  vi.mocked(getJson).mockResolvedValue({ total: 0, count: 0, data: { openid: [] } } as never);

  await listFollowers();
  expect(vi.mocked(getJson).mock.calls[0][1]).toEqual({ next_openid: undefined });
});

it("获取单个用户信息", async () => {
  vi.mocked(getJson).mockResolvedValue({ subscribe: 1, openid: "o-1", subscribe_time: 1700000000, tagid_list: [1, 2], subscribe_scene: "ADD_SCENE_QR_CODE" } as never);

  await expect(getUserInfo("o-1")).resolves.toEqual({
    subscribe: 1,
    openid: "o-1",
    subscribeTime: new Date(1700000000 * 1000).toISOString(),
    unionid: undefined,
    tagidList: [1, 2],
    subscribeScene: "ADD_SCENE_QR_CODE",
  });
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/user/info");
  expect(vi.mocked(getJson).mock.calls[0][1]).toEqual({ openid: "o-1", lang: "zh_CN" });
});

it("批量获取用户信息", async () => {
  vi.mocked(postJson).mockResolvedValue({ user_info_list: [{ openid: "o-1" }] } as never);

  await expect(batchGetUserInfo(["o-1", "o-2"])).resolves.toEqual([
    { subscribe: 0, openid: "o-1", subscribeTime: "", unionid: undefined, tagidList: [], subscribeScene: undefined },
  ]);
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/user/info/batchget");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ user_list: [{ openid: "o-1", lang: "zh_CN" }, { openid: "o-2", lang: "zh_CN" }] });
});

it("创建标签", async () => {
  vi.mocked(postJson).mockResolvedValue({ tag: { id: 101, name: "vip" } } as never);

  await expect(createTag("vip")).resolves.toEqual({ id: 101, name: "vip" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/tags/create");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ tag: { name: "vip" } });
});

it("编辑与删除标签", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await updateTag(101, "vip2");
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/tags/update");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ tag: { id: 101, name: "vip2" } });

  await deleteTag(101);
  expect(vi.mocked(postJson).mock.calls[1][0]).toBe("/cgi-bin/tags/delete");
  expect(vi.mocked(postJson).mock.calls[1][1]).toEqual({ tag: { id: 101 } });
});

it("批量为用户打标签与取消标签", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await tagUsers(101, ["o-1", "o-2"]);
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/tags/members/batchtagging");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ tagid: 101, openid_list: ["o-1", "o-2"] });

  await untagUsers(101, ["o-1"]);
  expect(vi.mocked(postJson).mock.calls[1][0]).toBe("/cgi-bin/tags/members/batchuntagging");
  expect(vi.mocked(postJson).mock.calls[1][1]).toEqual({ tagid: 101, openid_list: ["o-1"] });
});

it("获取标签下粉丝列表", async () => {
  vi.mocked(postJson).mockResolvedValue({ count: 1, data: { openid: ["o-1"] }, next_openid: "o-2" } as never);

  await expect(listTagMembers(101, "o-2")).resolves.toEqual({ count: 1, openids: ["o-1"], nextOpenid: "o-2" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/user/tag/get");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ tagid: 101, next_openid: "o-2" });
});

it("获取某用户的标签列表", async () => {
  vi.mocked(postJson).mockResolvedValue({ tagid_list: [1, 2] } as never);

  await expect(getUserTags("o-1")).resolves.toEqual([1, 2]);
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/tags/getidlist");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ openid: "o-1" });
});
