import { listKfAccounts, sendCustomerMessage, sendTyping } from "@/lib/wechat/customer";
import { getJson, postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ getJson: vi.fn(), postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("发送文本客服消息", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await sendCustomerMessage({ touser: "o-1", msgtype: "text", content: { content: "你好" } });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/custom/send");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ touser: "o-1", msgtype: "text", text: { content: "你好" } });
});

it("客服消息可指定客服账号身份发送", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await sendCustomerMessage({ touser: "o-1", msgtype: "text", content: { content: "hi" }, customservice: "kf1@test" });
  expect(vi.mocked(postJson).mock.calls[0][1]).toMatchObject({ customservice: { kf_account: "kf1@test" } });
});

it("设置客服输入状态", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await sendTyping("o-1");
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/message/custom/typing");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ touser: "o-1", command: "Typing" });
});

it("获取客服账号列表", async () => {
  vi.mocked(getJson).mockResolvedValue({
    kf_list: [{ kf_account: "kf1@test", kf_nick: "客服1", kf_id: "1001" }],
  } as never);

  await expect(listKfAccounts()).resolves.toEqual([{ kfAccount: "kf1@test", kfNick: "客服1", kfId: "1001" }]);
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/customservice/getkflist");
});
