import { handleMessage, SERVER_INSTRUCTIONS, SERVER_NAME } from "@/lib/mcp/protocol";
import { createDraft, createMultiDraft, deleteDraft, getDraft, getPublishStatus, listDrafts, submitPublish, updateDraft } from "@/lib/wechat/draft";
import { deleteMass, getMassSpeed, getMassStatus, massPreview, massSendAll, massSendByOpenids } from "@/lib/wechat/mass";
import { deletePublished, getPublishedArticle, listPublished } from "@/lib/wechat/publish";
import { deleteMaterial, getMaterial, getMaterialCount, listMaterials } from "@/lib/wechat/material";
import { closeComments, deleteComment, deleteCommentReply, listComments, markComment, openComments, replyComment, unmarkComment } from "@/lib/wechat/comment";
import { listTags } from "@/lib/wechat/tag";
import { daysAgoIso, getArticleRead, getArticleStatsDetail, getArticleStatsSummary, getUserCumulate, getUserSummary, yesterdayIso } from "@/lib/wechat/stats";
import { batchGetUserInfo, createTag, deleteTag, getUserInfo, getUserTags, listFollowers, listTagMembers, tagUsers, untagUsers, updateTag } from "@/lib/wechat/user";
import { createMenu, deleteMenu, getMenu } from "@/lib/wechat/menu";
import { listKfAccounts, sendCustomerMessage, sendTyping } from "@/lib/wechat/customer";
import { rewriteContentImages } from "@/lib/wechat/content";
import { fetchRemoteImage, uploadThumbMaterial } from "@/lib/wechat/media";
import { WechatApiError } from "@/lib/wechat/errors";

vi.mock("@/lib/wechat/draft", () => ({
  createDraft: vi.fn(),
  createMultiDraft: vi.fn(),
  updateDraft: vi.fn(),
  listDrafts: vi.fn(),
  submitPublish: vi.fn(),
  getPublishStatus: vi.fn(),
  getDraft: vi.fn(),
  deleteDraft: vi.fn(),
}));
vi.mock("@/lib/wechat/mass", () => ({
  massPreview: vi.fn(),
  massSendAll: vi.fn(),
  massSendByOpenids: vi.fn(),
  getMassStatus: vi.fn(),
  deleteMass: vi.fn(),
  getMassSpeed: vi.fn(),
}));
vi.mock("@/lib/wechat/publish", () => ({ listPublished: vi.fn(), deletePublished: vi.fn(), getPublishedArticle: vi.fn() }));
vi.mock("@/lib/wechat/material", () => ({ listMaterials: vi.fn(), deleteMaterial: vi.fn(), getMaterial: vi.fn(), getMaterialCount: vi.fn() }));
vi.mock("@/lib/wechat/comment", () => ({
  listComments: vi.fn(),
  replyComment: vi.fn(),
  markComment: vi.fn(),
  unmarkComment: vi.fn(),
  deleteComment: vi.fn(),
  openComments: vi.fn(),
  closeComments: vi.fn(),
  deleteCommentReply: vi.fn(),
}));
vi.mock("@/lib/wechat/tag", () => ({ listTags: vi.fn() }));
vi.mock("@/lib/wechat/stats", () => ({
  getArticleRead: vi.fn(),
  getArticleStatsDetail: vi.fn(),
  getArticleStatsSummary: vi.fn(),
  getUserSummary: vi.fn(),
  getUserCumulate: vi.fn(),
  yesterdayIso: vi.fn(() => "2026-08-06"),
  daysAgoIso: vi.fn(() => "2026-07-31"),
}));
vi.mock("@/lib/wechat/user", () => ({
  listFollowers: vi.fn(),
  getUserInfo: vi.fn(),
  batchGetUserInfo: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  tagUsers: vi.fn(),
  untagUsers: vi.fn(),
  listTagMembers: vi.fn(),
  getUserTags: vi.fn(),
}));
vi.mock("@/lib/wechat/menu", () => ({ createMenu: vi.fn(), getMenu: vi.fn(), deleteMenu: vi.fn() }));
vi.mock("@/lib/wechat/customer", () => ({ sendCustomerMessage: vi.fn(), sendTyping: vi.fn(), listKfAccounts: vi.fn() }));
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
  it("暴露约定的 52 个工具", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }, context);
    const { tools } = response?.result as { tools: Array<{ name: string; inputSchema: unknown }> };

    expect(tools.map((tool) => tool.name)).toEqual([
      "wechat_create_upload_url",
      "wechat_create_draft",
      "wechat_create_multi_draft",
      "wechat_update_draft",
      "wechat_list_drafts",
      "wechat_publish_draft",
      "wechat_get_publish_status",
      "wechat_mass_preview",
      "wechat_mass_send",
      "wechat_mass_send_by_openids",
      "wechat_mass_status",
      "wechat_mass_delete",
      "wechat_get_draft",
      "wechat_delete_draft",
      "wechat_list_published",
      "wechat_delete_published",
      "wechat_get_published_article",
      "wechat_list_materials",
      "wechat_delete_material",
      "wechat_list_comments",
      "wechat_reply_comment",
      "wechat_mark_comment",
      "wechat_unmark_comment",
      "wechat_delete_comment",
      "wechat_list_tags",
      "wechat_get_article_read_stats",
      "wechat_get_article_stats_detail",
      "wechat_get_article_stats_summary",
      "wechat_list_followers",
      "wechat_get_user_info",
      "wechat_batch_get_user_info",
      "wechat_create_tag",
      "wechat_update_tag",
      "wechat_delete_tag",
      "wechat_tag_users",
      "wechat_untag_users",
      "wechat_list_tag_members",
      "wechat_get_user_tags",
      "wechat_get_followers_stats",
      "wechat_get_total_followers",
      "wechat_open_comments",
      "wechat_close_comments",
      "wechat_delete_comment_reply",
      "wechat_get_material",
      "wechat_get_material_count",
      "wechat_get_mass_speed",
      "wechat_create_menu",
      "wechat_get_menu",
      "wechat_delete_menu",
      "wechat_send_customer_message",
      "wechat_send_typing",
      "wechat_list_kf_accounts",
    ]);
    expect(tools.every((tool) => tool.inputSchema)).toBe(true);
  });

  it("提供群发工具", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }, context);
    const { tools } = response?.result as { tools: Array<{ name: string; inputSchema?: { properties?: Record<string, { enum?: string[] }> } }> };
    expect(tools.some((tool) => tool.name === "wechat_mass_send")).toBe(true);
    const massSend = tools.find((tool) => tool.name === "wechat_mass_send");
    expect(massSend?.inputSchema?.properties?.msgtype?.enum).toContain("image");
  });

  it("群发工具向兼容性较弱的客户端暴露平面 JSON Schema", async () => {
    const response = await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }, context);
    const { tools } = response?.result as {
      tools: Array<{
        name: string;
        inputSchema?: { allOf?: unknown; anyOf?: unknown; required?: string[] };
      }>;
    };

    for (const name of ["wechat_mass_preview", "wechat_mass_send", "wechat_mass_send_by_openids"]) {
      const tool = tools.find((item) => item.name === name);
      expect(tool?.inputSchema?.allOf).toBeUndefined();
      expect(tool?.inputSchema?.anyOf).toBeUndefined();
    }

    const massSend = tools.find((tool) => tool.name === "wechat_mass_send");
    expect(massSend?.inputSchema?.required).toEqual(expect.arrayContaining(["clientmsgid", "confirm", "is_to_all"]));
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

describe("多图文草稿", () => {
  it("一次建多图文：逐篇处理封面与正文，再一次性提交", async () => {
    vi.mocked(createMultiDraft).mockResolvedValue({ media_id: "multi-1" });

    const { data } = resultPayload(
      await call("wechat_create_multi_draft", {
        articles: [
          { title: "头条", content: "<p>一</p>", cover: "wxmedia:thumb-1" },
          { title: "次条", content: "<p>二</p>", cover: "wxmedia:thumb-2" },
        ],
      }),
    );

    expect(data.media_id).toBe("multi-1");
    expect(data.article_count).toBe(2);
    const submitted = vi.mocked(createMultiDraft).mock.calls[0][0] as Array<{ title: string; thumbMediaId: string }>;
    expect(submitted).toHaveLength(2);
    expect(submitted[0]).toMatchObject({ title: "头条", thumbMediaId: "thumb-1" });
    expect(submitted[1]).toMatchObject({ title: "次条", thumbMediaId: "thumb-2" });
  });

  it("多图文里封面给公网地址时各自转投微信", async () => {
    vi.mocked(fetchRemoteImage).mockResolvedValue({ bytes: new Uint8Array([1]), fileName: "c.png", contentType: "image/png" });
    vi.mocked(uploadThumbMaterial).mockResolvedValue("thumb-remote");
    vi.mocked(createMultiDraft).mockResolvedValue({ media_id: "multi-2" });

    await call("wechat_create_multi_draft", {
      articles: [
        { title: "一", content: "<p>1</p>", cover: "https://cdn.example.com/a.png" },
        { title: "二", content: "<p>2</p>", cover: "https://cdn.example.com/b.png" },
      ],
    });

    expect(uploadThumbMaterial).toHaveBeenCalledTimes(2);
    const submitted = vi.mocked(createMultiDraft).mock.calls[0][0] as Array<{ thumbMediaId: string }>;
    expect(submitted.every((article) => article.thumbMediaId === "thumb-remote")).toBe(true);
  });

  it("少于 2 篇或多于 8 篇返回参数错误", async () => {
    const single = errorText(
      await call("wechat_create_multi_draft", { articles: [{ title: "一", content: "<p>1</p>", cover: "wxmedia:t" }] }),
    );
    expect(single).toContain("参数不合法");

    const many = Array.from({ length: 9 }, (_, i) => ({ title: `标题${i}`, content: "<p>x</p>", cover: "wxmedia:t" }));
    expect(errorText(await call("wechat_create_multi_draft", { articles: many }))).toContain("参数不合法");
    expect(createMultiDraft).not.toHaveBeenCalled();
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
});

describe("群发工具", () => {
  it("兼容模型把 arguments 编码成 JSON 字符串", async () => {
    const message = errorText(
      await call(
        "wechat_mass_send",
        JSON.stringify({ media_id: "draft-1", clientmsgid: "send-json", confirm: false, is_to_all: true }),
      ),
    );

    expect(message).toContain("确认");
    expect(message).not.toContain("Expected object");
  });

  it.each(["arguments", "input"] as const)("兼容单层 %s wrapper，并忽略可选字段的 null/空字符串", async (wrapper) => {
    const message = errorText(
      await call("wechat_mass_send", {
        [wrapper]: {
          msgtype: "",
          media_id: "draft-1",
          title: "",
          description: "",
          tag_id: null,
          send_ignore_reprint: null,
          clientmsgid: `send-${wrapper}`,
          confirm: false,
          is_to_all: true,
        },
      }),
    );

    expect(message).toContain("确认");
    expect(message).not.toContain("Expected");
    expect(message).not.toContain("参数不合法");
  });

  it("按微信号预览草稿", async () => {
    vi.mocked(massPreview).mockResolvedValue({ errcode: 0 });
    await call("wechat_mass_preview", { media_id: "draft-1", to_wxname: "operator-wx" });
    expect(massPreview).toHaveBeenCalledWith({ msgtype: "mpnews", mediaId: "draft-1" }, { wxname: "operator-wx" });
  });

  it("按消息类型预览图片素材", async () => {
    vi.mocked(massPreview).mockResolvedValue({ errcode: 0 });
    await call("wechat_mass_preview", { msgtype: "image", media_id: "image-1", to_openid: "o-1" });
    expect(massPreview).toHaveBeenCalledWith({ msgtype: "image", mediaId: "image-1" }, { openid: "o-1" });
  });

  it("预览必须指定微信号或 openid 之一", async () => {
    const message = errorText(await call("wechat_mass_preview", { media_id: "draft-1" }));
    expect(message).toContain("参数不合法");
    expect(massPreview).not.toHaveBeenCalled();
  });

  it("群发不带 confirm 时被拦截并提示先预览确认", async () => {
    const message = errorText(await call("wechat_mass_send", { media_id: "draft-1", clientmsgid: "send-1", is_to_all: true }));
    expect(message).toContain("确认");
    expect(massSendAll).not.toHaveBeenCalled();
  });

  it("群发非全员时必须带 tag_id", async () => {
    const message = errorText(await call("wechat_mass_send", { media_id: "draft-1", clientmsgid: "send-1", confirm: true }));
    expect(message).toContain("tag_id");
    expect(massSendAll).not.toHaveBeenCalled();
  });

  it("confirm=true 且带 clientmsgid 时才真正群发全员", async () => {
    vi.mocked(massSendAll).mockResolvedValue({ msg_id: 1001 });
    const { data } = resultPayload(await call("wechat_mass_send", { media_id: "draft-1", clientmsgid: "send-1", confirm: true, is_to_all: true }));
    expect(data.msg_id).toBe(1001);
    expect(massSendAll).toHaveBeenCalledWith({ message: { msgtype: "mpnews", mediaId: "draft-1" }, isToAll: true, tagId: undefined, sendIgnoreReprint: undefined, clientmsgid: "send-1" });
  });

  it("图片群发透传 image 消息体", async () => {
    vi.mocked(massSendAll).mockResolvedValue({ msg_id: 1004 });
    const { data } = resultPayload(
      await call("wechat_mass_send", { msgtype: "image", media_id: "wxmedia:image-1", clientmsgid: "send-image", confirm: true, is_to_all: true }),
    );
    expect(data.msg_id).toBe(1004);
    expect(massSendAll).toHaveBeenCalledWith({ message: { msgtype: "image", mediaId: "image-1" }, isToAll: true, tagId: undefined, sendIgnoreReprint: undefined, clientmsgid: "send-image" });
  });

  it("文本群发要求 content 且不要求草稿 media_id", async () => {
    vi.mocked(massSendAll).mockResolvedValue({ msg_id: 1005 });
    await call("wechat_mass_send", { msgtype: "text", content: "通知内容", clientmsgid: "send-text", confirm: true, is_to_all: true });
    expect(massSendAll).toHaveBeenCalledWith({ message: { msgtype: "text", content: "通知内容" }, isToAll: true, tagId: undefined, sendIgnoreReprint: undefined, clientmsgid: "send-text" });
  });

  it("图片群发缺少 media_id 时被工具层拦截", async () => {
    const message = errorText(await call("wechat_mass_send", { msgtype: "image", clientmsgid: "send-image", confirm: true, is_to_all: true }));
    expect(message).toContain("media_id");
    expect(massSendAll).not.toHaveBeenCalled();
  });

  it("按标签群发透传 tag_id", async () => {
    vi.mocked(massSendAll).mockResolvedValue({ msg_id: 1002 });
    await call("wechat_mass_send", { media_id: "draft-1", clientmsgid: "send-2", confirm: true, tag_id: 2 });
    expect(massSendAll).toHaveBeenCalledWith(expect.objectContaining({ isToAll: false, tagId: 2 }));
  });

  it("按 OpenID 群发也要 confirm", async () => {
    const message = errorText(await call("wechat_mass_send_by_openids", { media_id: "draft-1", openids: ["o-1"], clientmsgid: "s" }));
    expect(message).toContain("确认");
    expect(massSendByOpenids).not.toHaveBeenCalled();
  });

  it("按 OpenID 群发成功返回 msg_id", async () => {
    vi.mocked(massSendByOpenids).mockResolvedValue({ msg_id: 1003 });
    const { data } = resultPayload(await call("wechat_mass_send_by_openids", { media_id: "draft-1", openids: ["o-1", "o-2"], clientmsgid: "s", confirm: true }));
    expect(data.msg_id).toBe(1003);
    expect(massSendByOpenids).toHaveBeenCalledWith({ msgtype: "mpnews", mediaId: "draft-1" }, ["o-1", "o-2"], "s");
  });

  it("查询群发状态与删除群发", async () => {
    vi.mocked(getMassStatus).mockResolvedValue({ msgId: 1001, status: "SEND_SUCCESS", statusText: "发送成功", done: true, totalCount: 1, filterCount: 1, sentCount: 1, errorCount: 0, articleUrls: [] });
    vi.mocked(deleteMass).mockResolvedValue({ errcode: 0 });

    await call("wechat_mass_status", { msg_id: 1001 });
    expect(getMassStatus).toHaveBeenCalledWith(1001);

    await call("wechat_mass_delete", { msg_id: 1001 });
    expect(deleteMass).toHaveBeenCalledWith(1001, undefined);
  });
});

describe("草稿与发布补全", () => {
  it("获取草稿详情与删除草稿", async () => {
    vi.mocked(getDraft).mockResolvedValue({ mediaId: "draft-1", articles: [] });
    vi.mocked(deleteDraft).mockResolvedValue({ errcode: 0 });

    await call("wechat_get_draft", { media_id: "draft-1" });
    expect(getDraft).toHaveBeenCalledWith("draft-1");

    await call("wechat_delete_draft", { media_id: "draft-1" });
    expect(deleteDraft).toHaveBeenCalledWith("draft-1");
  });

  it("已发布列表 / 删除 / 详情", async () => {
    vi.mocked(listPublished).mockResolvedValue({ total: 0, items: [] });
    vi.mocked(deletePublished).mockResolvedValue({ errcode: 0 });
    vi.mocked(getPublishedArticle).mockResolvedValue({ article_id: "a-1" });

    await call("wechat_list_published", {});
    expect(listPublished).toHaveBeenCalledWith(0, 10);

    await call("wechat_delete_published", { article_id: "a-1" });
    expect(deletePublished).toHaveBeenCalledWith("a-1");

    await call("wechat_get_published_article", { article_id: "a-1" });
    expect(getPublishedArticle).toHaveBeenCalledWith("a-1");
  });
});

describe("素材 / 留言 / 标签", () => {
  it("素材列表与删除", async () => {
    vi.mocked(listMaterials).mockResolvedValue({ total: 0, items: [] });
    vi.mocked(deleteMaterial).mockResolvedValue({ errcode: 0 });

    await call("wechat_list_materials", { type: "image" });
    expect(listMaterials).toHaveBeenCalledWith("image", 0, 10);

    await call("wechat_delete_material", { media_id: "m-1" });
    expect(deleteMaterial).toHaveBeenCalledWith("m-1");
  });

  it("留言列表 / 回复 / 精选 / 删除", async () => {
    vi.mocked(listComments).mockResolvedValue({ total: 0, comments: [] });
    vi.mocked(replyComment).mockResolvedValue({ errcode: 0 });
    vi.mocked(markComment).mockResolvedValue({ errcode: 0 });
    vi.mocked(unmarkComment).mockResolvedValue({ errcode: 0 });
    vi.mocked(deleteComment).mockResolvedValue({ errcode: 0 });

    await call("wechat_list_comments", { msg_data_id: 1001, begin: 0, count: 20, type: 0 });
    expect(listComments).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, begin: 0, count: 20, type: 0 });

    await call("wechat_reply_comment", { msg_data_id: 1001, user_comment_id: 11, content: "谢谢" });
    expect(replyComment).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, userCommentId: 11, content: "谢谢" });

    await call("wechat_mark_comment", { msg_data_id: 1001, user_comment_id: 11 });
    expect(markComment).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, userCommentId: 11 });

    await call("wechat_unmark_comment", { msg_data_id: 1001, user_comment_id: 11 });
    expect(unmarkComment).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, userCommentId: 11 });

    await call("wechat_delete_comment", { msg_data_id: 1001, user_comment_id: 11 });
    expect(deleteComment).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, userCommentId: 11 });
  });

  it("标签列表", async () => {
    vi.mocked(listTags).mockResolvedValue([{ id: 1, name: "vip", count: 3 }]);
    const { data } = resultPayload(await call("wechat_list_tags", {}));
    expect(data).toEqual([{ id: 1, name: "vip", count: 3 }]);
  });
});

describe("数据统计工具", () => {
  it("按指定日期查阅读数", async () => {
    vi.mocked(getArticleRead).mockResolvedValue({ date: "2026-08-06", isDelay: false, articles: [] });
    await call("wechat_get_article_read_stats", { date: "2026-08-06" });
    expect(getArticleRead).toHaveBeenCalledWith("2026-08-06");
  });

  it("不传日期时默认查昨天", async () => {
    vi.mocked(getArticleRead).mockResolvedValue({ date: "2026-08-06", isDelay: false, articles: [] });
    await call("wechat_get_article_read_stats", {});
    expect(yesterdayIso).toHaveBeenCalled();
    expect(getArticleRead).toHaveBeenCalledWith("2026-08-06");
  });

  it("查某天发表文章的详细指标", async () => {
    vi.mocked(getArticleStatsDetail).mockResolvedValue({ date: "2026-08-06", isDelay: false, articles: [] });
    await call("wechat_get_article_stats_detail", { date: "2026-08-06" });
    expect(getArticleStatsDetail).toHaveBeenCalledWith("2026-08-06");
  });

  it("日期格式非法时返回参数错误", async () => {
    const message = errorText(await call("wechat_get_article_read_stats", { date: "2026/08/06" }));
    expect(message).toContain("参数不合法");
    expect(getArticleRead).not.toHaveBeenCalled();
  });

  it("汇总接口支持指定日期范围", async () => {
    vi.mocked(getArticleStatsSummary).mockResolvedValue({ beginDate: "2026-07-31", endDate: "2026-08-06", isDelay: false, days: [] });
    await call("wechat_get_article_stats_summary", { begin_date: "2026-07-31", end_date: "2026-08-06" });
    expect(getArticleStatsSummary).toHaveBeenCalledWith("2026-07-31", "2026-08-06");
  });

  it("汇总接口不传日期时默认最近 7 天", async () => {
    vi.mocked(getArticleStatsSummary).mockResolvedValue({ beginDate: "2026-07-31", endDate: "2026-08-06", isDelay: false, days: [] });
    await call("wechat_get_article_stats_summary", {});
    expect(daysAgoIso).toHaveBeenCalledWith(7);
    expect(getArticleStatsSummary).toHaveBeenCalledWith("2026-07-31", "2026-08-06");
  });
});

describe("粉丝与标签工具", () => {
  it("关注者列表支持游标", async () => {
    vi.mocked(listFollowers).mockResolvedValue({ total: 1, count: 1, openids: ["o-1"], nextOpenid: "o-2" });
    await call("wechat_list_followers", { next_openid: "o-2" });
    expect(listFollowers).toHaveBeenCalledWith("o-2");
  });

  it("获取用户信息与批量获取", async () => {
    vi.mocked(getUserInfo).mockResolvedValue({ subscribe: 1, openid: "o-1", subscribeTime: "", tagidList: [] });
    vi.mocked(batchGetUserInfo).mockResolvedValue([]);

    await call("wechat_get_user_info", { openid: "o-1" });
    expect(getUserInfo).toHaveBeenCalledWith("o-1", "zh_CN");

    await call("wechat_batch_get_user_info", { openids: ["o-1", "o-2"] });
    expect(batchGetUserInfo).toHaveBeenCalledWith(["o-1", "o-2"]);
  });

  it("标签增删改", async () => {
    vi.mocked(createTag).mockResolvedValue({ id: 101, name: "vip" });
    vi.mocked(updateTag).mockResolvedValue({ errcode: 0 });
    vi.mocked(deleteTag).mockResolvedValue({ errcode: 0 });

    await call("wechat_create_tag", { name: "vip" });
    expect(createTag).toHaveBeenCalledWith("vip");

    await call("wechat_update_tag", { id: 101, name: "vip2" });
    expect(updateTag).toHaveBeenCalledWith(101, "vip2");

    await call("wechat_delete_tag", { id: 101 });
    expect(deleteTag).toHaveBeenCalledWith(101);
  });

  it("打标签与取消标签", async () => {
    vi.mocked(tagUsers).mockResolvedValue({ errcode: 0 });
    vi.mocked(untagUsers).mockResolvedValue({ errcode: 0 });

    await call("wechat_tag_users", { tag_id: 101, openids: ["o-1"] });
    expect(tagUsers).toHaveBeenCalledWith(101, ["o-1"]);

    await call("wechat_untag_users", { tag_id: 101, openids: ["o-1"] });
    expect(untagUsers).toHaveBeenCalledWith(101, ["o-1"]);
  });

  it("标签下粉丝列表与用户标签", async () => {
    vi.mocked(listTagMembers).mockResolvedValue({ count: 1, openids: ["o-1"], nextOpenid: "o-2" });
    vi.mocked(getUserTags).mockResolvedValue([1, 2]);

    await call("wechat_list_tag_members", { tag_id: 101, next_openid: "o-2" });
    expect(listTagMembers).toHaveBeenCalledWith(101, "o-2");

    await call("wechat_get_user_tags", { openid: "o-1" });
    expect(getUserTags).toHaveBeenCalledWith("o-1");
  });
});

describe("粉丝统计与补全工具", () => {
  it("粉丝增减与累计关注支持默认昨天", async () => {
    vi.mocked(getUserSummary).mockResolvedValue({ date: "2026-08-06", isDelay: false, items: [] });
    vi.mocked(getUserCumulate).mockResolvedValue({ date: "2026-08-06", isDelay: false, items: [] });

    await call("wechat_get_followers_stats", {});
    expect(getUserSummary).toHaveBeenCalledWith("2026-08-06");

    await call("wechat_get_total_followers", {});
    expect(getUserCumulate).toHaveBeenCalledWith("2026-08-06");
  });

  it("开/关留言与删除回复", async () => {
    vi.mocked(openComments).mockResolvedValue({ errcode: 0 });
    vi.mocked(closeComments).mockResolvedValue({ errcode: 0 });
    vi.mocked(deleteCommentReply).mockResolvedValue({ errcode: 0 });

    await call("wechat_open_comments", { msg_data_id: 1001 });
    expect(openComments).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined });

    await call("wechat_close_comments", { msg_data_id: 1001 });
    expect(closeComments).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined });

    await call("wechat_delete_comment_reply", { msg_data_id: 1001, user_comment_id: 11 });
    expect(deleteCommentReply).toHaveBeenCalledWith({ msgDataId: 1001, index: undefined, userCommentId: 11 });
  });

  it("素材详情 / 素材总数 / 群发速度", async () => {
    vi.mocked(getMaterial).mockResolvedValue({ media_id: "m-1" });
    vi.mocked(getMaterialCount).mockResolvedValue({ image_count: 3 });
    vi.mocked(getMassSpeed).mockResolvedValue({ speed: 1 });

    await call("wechat_get_material", { media_id: "m-1" });
    expect(getMaterial).toHaveBeenCalledWith("m-1");

    await call("wechat_get_material_count", {});
    expect(getMaterialCount).toHaveBeenCalled();

    await call("wechat_get_mass_speed", {});
    expect(getMassSpeed).toHaveBeenCalled();
  });
});

describe("自定义菜单工具", () => {
  it("创建 / 查询 / 删除菜单", async () => {
    vi.mocked(createMenu).mockResolvedValue({ errcode: 0 });
    vi.mocked(getMenu).mockResolvedValue({ menu: {} });
    vi.mocked(deleteMenu).mockResolvedValue({ errcode: 0 });
    const button = [{ type: "view", name: "官网", url: "https://example.com" }];

    await call("wechat_create_menu", { button });
    expect(createMenu).toHaveBeenCalledWith(button);

    await call("wechat_get_menu", {});
    expect(getMenu).toHaveBeenCalled();

    await call("wechat_delete_menu", {});
    expect(deleteMenu).toHaveBeenCalled();
  });
});

describe("客服消息工具", () => {
  it("发送客服消息 / 输入状态 / 客服列表", async () => {
    vi.mocked(sendCustomerMessage).mockResolvedValue({ errcode: 0 });
    vi.mocked(sendTyping).mockResolvedValue({ errcode: 0 });
    vi.mocked(listKfAccounts).mockResolvedValue([]);

    await call("wechat_send_customer_message", { openid: "o-1", msgtype: "text", content: { content: "你好" } });
    expect(sendCustomerMessage).toHaveBeenCalledWith({ touser: "o-1", msgtype: "text", content: { content: "你好" } });

    await call("wechat_send_typing", { openid: "o-1" });
    expect(sendTyping).toHaveBeenCalledWith("o-1");

    await call("wechat_list_kf_accounts", {});
    expect(listKfAccounts).toHaveBeenCalled();
  });
});

it("调用不存在的工具返回 -32602", async () => {
  const response = await call("wechat_nonexistent", {});
  expect(response?.error?.code).toBe(-32602);
});
