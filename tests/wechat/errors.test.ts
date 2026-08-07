import { describeWechatError, TOKEN_INVALID_ERRCODES } from "@/lib/wechat/errors";

it("把 40164 翻译成带 IP 和处理步骤的说明", () => {
  const message = describeWechatError(40164, "invalid ip 39.108.129.23 ipv6 ::ffff:39.108.129.23, not in whitelist");
  expect(message).toContain("39.108.129.23");
  expect(message).toContain("IP 白名单");
});

it("40164 拿不到 IP 时也给出可执行的指引", () => {
  expect(describeWechatError(40164, "not in whitelist")).toContain("IP 白名单");
});

it("把 48001 翻译成认证资格问题", () => {
  expect(describeWechatError(48001, "api unauthorized")).toContain("微信认证");
});

it("未知错误码保留原始 errcode 和 errmsg", () => {
  expect(describeWechatError(99999, "something odd")).toBe("微信接口返回错误 99999：something odd");
});

it("45065 提示相同 clientmsgid 已有群发记录", () => {
  expect(describeWechatError(45065, "clientmsgid exist")).toContain("clientmsgid");
  expect(describeWechatError(45065, "clientmsgid exist")).toContain("群发");
});

it("40002 提示群发保护超时未确认", () => {
  expect(describeWechatError(40002, "admin not confirm")).toContain("30 分钟");
});

it("88000 提示公众号没有留言功能权限", () => {
  expect(describeWechatError(88000, "without comment privilege")).toContain("留言");
});

it("88010 提示评论分页 count 超范围", () => {
  expect(describeWechatError(88010, "count range error")).toContain("50");
});

it("token 失效类错误码覆盖 40001 / 40014 / 42001", () => {
  expect([...TOKEN_INVALID_ERRCODES].sort()).toEqual([40001, 40014, 42001]);
});
