import { deleteMass, getMassStatus, massPreview, massSendAll, massSendByOpenids } from "@/lib/wechat/mass";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("按微信号预览文章草稿", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await massPreview("draft-1", { wxname: "operator-wx" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/mass/preview");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msgtype: "mpnews", mpnews: { media_id: "draft-1" }, towxname: "operator-wx" });
});

it("按 openid 预览文章草稿", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await massPreview("draft-1", { openid: "o-1" });
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msgtype: "mpnews", mpnews: { media_id: "draft-1" }, touser: "o-1" });
});

it("预览必须指定微信号或 openid 之一", async () => {
  await expect(massPreview("draft-1", {})).rejects.toThrow(/微信号.*openid/);
  expect(postJson).not.toHaveBeenCalled();
});

it("群发全员携带 clientmsgid 与防转载参数", async () => {
  vi.mocked(postJson).mockResolvedValue({ msg_id: 1001, msg_data_id: "md-1" } as never);

  await expect(massSendAll({ mediaId: "draft-1", isToAll: true, clientmsgid: "send-1", sendIgnoreReprint: 1 })).resolves.toMatchObject({ msg_id: 1001 });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/mass/sendall");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({
    filter: { is_to_all: true },
    mpnews: { media_id: "draft-1" },
    msgtype: "mpnews",
    send_ignore_reprint: 1,
    clientmsgid: "send-1",
  });
});

it("按标签群发携带 tag_id", async () => {
  vi.mocked(postJson).mockResolvedValue({ msg_id: 1002 } as never);

  await massSendAll({ mediaId: "draft-1", isToAll: false, tagId: 2, clientmsgid: "send-2" });
  expect(vi.mocked(postJson).mock.calls[0][1]).toMatchObject({ filter: { is_to_all: false, tag_id: 2 } });
});

it("按 OpenID 列表群发", async () => {
  vi.mocked(postJson).mockResolvedValue({ msg_id: 1003, msg_data_id: "md-3" } as never);

  await expect(massSendByOpenids("draft-1", ["o-1", "o-2"], "send-3")).resolves.toMatchObject({ msg_id: 1003 });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/mass/send");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({
    touser: ["o-1", "o-2"],
    mpnews: { media_id: "draft-1" },
    msgtype: "mpnews",
    clientmsgid: "send-3",
  });
});

it("查询群发状态并映射成可读结果", async () => {
  vi.mocked(postJson).mockResolvedValue({
    msg_id: 1001,
    msg_status: "SEND_SUCCESS",
    totalcount: 100,
    filtercount: 95,
    sentcount: 93,
    errorcount: 2,
  } as never);

  await expect(getMassStatus(1001)).resolves.toEqual({
    msgId: 1001,
    status: "SEND_SUCCESS",
    statusText: "发送成功",
    done: true,
    totalCount: 100,
    sentCount: 93,
    errorCount: 2,
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/mass/get");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_id: 1001 });
});

it("群发还在进行中时 done 为 false", async () => {
  vi.mocked(postJson).mockResolvedValue({ msg_id: 1001, msg_status: "SENDING" } as never);

  const result = await getMassStatus(1001);
  expect(result.done).toBe(false);
  expect(result.statusText).toContain("发送中");
});

it("删除群发消息", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await deleteMass(1001, 1);
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/mass/delete");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_id: 1001, article_idx: 1 });
});

it("删除群发不带 article_idx 时只传 msg_id", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await deleteMass(1001);
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_id: 1001 });
});
