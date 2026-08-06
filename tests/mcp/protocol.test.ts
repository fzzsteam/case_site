import { handleMessage, SERVER_INSTRUCTIONS, SERVER_NAME } from "@/lib/mcp/protocol";
import { createDraft, getPublishStatus, listDrafts, submitPublish, updateDraft } from "@/lib/wechat/draft";
import { rewriteContentImages } from "@/lib/wechat/content";
import { fetchRemoteImage, uploadThumbMaterial } from "@/lib/wechat/media";
import { WechatApiError } from "@/lib/wechat/errors";

vi.mock("@/lib/wechat/draft", () => ({
  createDraft: vi.fn(),
  updateDraft: vi.fn(),
  listDrafts: vi.fn(),
  submitPublish: vi.fn(),
  getPublishStatus: vi.fn(),
}));
vi.mock("@/lib/wechat/content", () => ({ rewriteContentImages: vi.fn() }));
vi.mock("@/lib/wechat/media", () => ({ fetchRemoteImage: vi.fn(), uploadThumbMaterial: vi.fn() }));

const context = { origin: "https://video.example.com" };
const call = (name: string, args: unknown) => handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }, context);

/** tools/call 成功时把结果 JSON 塞在 content[0].text 里。 */
function resultPayload(response: Awaited<ReturnType<typeof handleMessage>>) {
  const result = response?.result as { content: Array<{ text: string }>; isError: boolean };
  return { isError: result.isError, data: JSON.parse(result.content[0].text) };
}

function errorText(response: Awaited<ReturnType<typeof handleMessage>>) {
  const result = response?.result as { content: Array<{ text: string }>; isError: boolean };
  expect(result.isError).toBe(true);
  return result.content[0].text;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SESSION_SECRET = "test-secret";
  vi.mocked(rewriteContentImages).mockImplementation(async (html: string) => ({ html, uploadedCount: 0 }));
});

describe("协议握手", () => {
  it("initialize 返回服务器信息和注入模型的使用说明", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } }, context);
    const result = response?.result as { protocolVersion: string; serverInfo: { name: string }; instructions: string };

    expect(result.protocolVersion).toBe("2025-06-18");
    expect(result.serverInfo.name).toBe(SERVER_NAME);
    expect(result.instructions).toBe(SERVER_INSTRUCTIONS);
  });

  it("客户端请求不认识的协议版本时回落到服务端默认版本", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "1999-01-01" } }, context);
    expect((response?.result as { protocolVersion: string }).protocolVersion).toBe("2025-06-18");
  });

  it("通知类消息不产生响应", async () => {
    expect(await handleMessage({ jsonrpc: "2.0", method: "notifications/initialized" }, context)).toBeNull();
  });

  it("ping 返回空结果", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 7, method: "ping" }, context);
    expect(response).toEqual({ jsonrpc: "2.0", id: 7, result: {} });
  });

  it("未知方法返回 -32601", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "resources/list" }, context);
    expect(response?.error?.code).toBe(-32601);
  });

  it("不合法的 JSON-RPC 消息返回 -32600", async () => {
    const response = await handleMessage({ method: "initialize" }, context);
    expect(response?.error?.code).toBe(-32600);
  });
});

describe("tools/list", () => {
  it("暴露约定的 6 个工具", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }, context);
    const { tools } = response?.result as { tools: Array<{ name: string; inputSchema: unknown }> };

    expect(tools.map((tool) => tool.name)).toEqual([
      "wechat_create_upload_url",
      "wechat_create_draft",
      "wechat_update_draft",
      "wechat_list_drafts",
      "wechat_publish_draft",
      "wechat_get_publish_status",
    ]);
    expect(tools.every((tool) => tool.inputSchema)).toBe(true);
  });

  it("不提供群发工具", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }, context);
    const { tools } = response?.result as { tools: Array<{ name: string }> };
    expect(tools.some((tool) => /mass|群发/.test(tool.name))).toBe(false);
  });
});

describe("wechat_create_upload_url", () => {
  it("返回带签名的上传地址和可直接执行的 curl 命令", async () => {
    const { data } = resultPayload(await call("wechat_create_upload_url", { purpose: "cover" }));

    expect(data.upload_url).toContain("https://video.example.com/api/mcp/upload");
    expect(data.upload_url).toContain("sig=");
    expect(data.curl_example).toContain('curl -sS -F "file=@');
    expect(data.expires_in_seconds).toBe(600);
  });

  it("purpose 非法时返回参数错误而不是崩溃", async () => {
    expect(errorText(await call("wechat_create_upload_url", { purpose: "video" }))).toContain("参数不合法");
  });
});

describe("wechat_create_draft", () => {
  it("用封面句柄建草稿时不再重复上传封面", async () => {
    vi.mocked(createDraft).mockResolvedValue({ media_id: "draft-1" });

    const { data } = resultPayload(await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>", cover: "wxmedia:thumb-1" }));

    expect(data.media_id).toBe("draft-1");
    expect(uploadThumbMaterial).not.toHaveBeenCalled();
    expect(vi.mocked(createDraft).mock.calls[0][0]).toMatchObject({ title: "标题", content: "<p>正文</p>", thumbMediaId: "thumb-1" });
  });

  it("封面给网址时由服务端代抓再转投微信", async () => {
    vi.mocked(fetchRemoteImage).mockResolvedValue({ bytes: new Uint8Array([1]), fileName: "c.png", contentType: "image/png" });
    vi.mocked(uploadThumbMaterial).mockResolvedValue("thumb-remote");
    vi.mocked(createDraft).mockResolvedValue({ media_id: "draft-2" });

    await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>", cover: "https://cdn.example.com/c.png" });

    expect(fetchRemoteImage).toHaveBeenCalledWith("https://cdn.example.com/c.png");
    expect(vi.mocked(createDraft).mock.calls[0][0]).toMatchObject({ thumbMediaId: "thumb-remote" });
  });

  it("正文图片被改写后才提交给微信", async () => {
    vi.mocked(rewriteContentImages).mockResolvedValue({ html: '<img src="https://mmbiz.qpic.cn/x">', uploadedCount: 1 });
    vi.mocked(createDraft).mockResolvedValue({ media_id: "draft-3" });

    const { data } = resultPayload(await call("wechat_create_draft", { title: "标题", content: '<img src="https://cdn.example.com/a.png">', cover: "wxmedia:t" }));

    expect(data.uploaded_images).toBe(1);
    expect(vi.mocked(createDraft).mock.calls[0][0]).toMatchObject({ content: '<img src="https://mmbiz.qpic.cn/x">' });
  });

  it("封面传本地路径时引导 agent 走上传流程", async () => {
    const message = errorText(await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>", cover: "./cover.png" }));

    expect(message).toContain("wechat_create_upload_url");
    expect(createDraft).not.toHaveBeenCalled();
  });

  it("缺少封面时返回参数错误", async () => {
    expect(errorText(await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>" }))).toContain("参数不合法");
  });

  it("微信报错时把错误码翻译成人话交给模型", async () => {
    vi.mocked(createDraft).mockRejectedValue(new WechatApiError(40164, "invalid ip 1.2.3.4, not in whitelist"));

    const message = errorText(await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>", cover: "wxmedia:t" }));

    expect(message).toContain("1.2.3.4");
    expect(message).toContain("IP 白名单");
  });

  it("建草稿不会顺带发布", async () => {
    vi.mocked(createDraft).mockResolvedValue({ media_id: "draft-4" });
    await call("wechat_create_draft", { title: "标题", content: "<p>正文</p>", cover: "wxmedia:t" });
    expect(submitPublish).not.toHaveBeenCalled();
  });
});

describe("草稿与发布", () => {
  it("更新草稿默认改第 0 篇", async () => {
    vi.mocked(updateDraft).mockResolvedValue(undefined);
    await call("wechat_update_draft", { media_id: "draft-1", title: "新标题", content: "<p>新</p>", cover: "wxmedia:t" });
    expect(updateDraft).toHaveBeenCalledWith("draft-1", 0, expect.objectContaining({ title: "新标题" }));
  });

  it("列草稿有默认分页", async () => {
    vi.mocked(listDrafts).mockResolvedValue({ total: 0, drafts: [] });
    await call("wechat_list_drafts", {});
    expect(listDrafts).toHaveBeenCalledWith(0, 10);
  });

  it("发布返回 publish_id 并提示去查状态", async () => {
    vi.mocked(submitPublish).mockResolvedValue({ publish_id: "p-1" });
    const { data } = resultPayload(await call("wechat_publish_draft", { media_id: "draft-1" }));
    expect(data.publish_id).toBe("p-1");
    expect(data.note).toContain("wechat_get_publish_status");
  });

  it("查询发布状态透出文章链接", async () => {
    vi.mocked(getPublishStatus).mockResolvedValue({ publishId: "p-1", status: 0, statusText: "发布成功", done: true, articleUrls: ["https://mp.weixin.qq.com/s/abc"] });
    const { data } = resultPayload(await call("wechat_get_publish_status", { publish_id: "p-1" }));
    expect(data.articleUrls).toEqual(["https://mp.weixin.qq.com/s/abc"]);
  });

  it("调用不存在的工具返回 -32602", async () => {
    const response = await call("wechat_mass_send", {});
    expect(response?.error?.code).toBe(-32602);
  });
});
