import "server-only";
import { z } from "zod";
import { createDraft, getPublishStatus, listDrafts, submitPublish, updateDraft, type DraftArticle } from "@/lib/wechat/draft";
import { rewriteContentImages } from "@/lib/wechat/content";
import { fetchRemoteImage, uploadThumbMaterial } from "@/lib/wechat/media";
import { buildUploadUrl, UPLOAD_URL_TTL_MS } from "./upload-signature";
import { COVER_HANDLE_PREFIX } from "./refs";

const articleShape = {
  title: z.string().trim().min(1).max(64),
  content: z.string().min(1),
  cover: z.string().trim().min(1),
  author: z.string().trim().max(8).optional(),
  digest: z.string().trim().max(120).optional(),
  content_source_url: z.string().trim().url().optional(),
  need_open_comment: z.boolean().optional(),
  only_fans_can_comment: z.boolean().optional(),
};

const createDraftSchema = z.object(articleShape);
const updateDraftSchema = z.object({ ...articleShape, media_id: z.string().trim().min(1), index: z.number().int().min(0).optional() });

/** 封面既接受上传得到的 wxmedia: 句柄，也接受公网图片地址（由服务端代抓再转投微信）。 */
async function resolveCoverMediaId(cover: string): Promise<string> {
  if (cover.startsWith(COVER_HANDLE_PREFIX)) {
    const mediaId = cover.slice(COVER_HANDLE_PREFIX.length).trim();
    if (!mediaId) throw new Error("封面句柄格式不对，应形如 wxmedia:xxxxx");
    return mediaId;
  }
  if (/^https?:\/\//i.test(cover)) return uploadThumbMaterial(await fetchRemoteImage(cover));
  throw new Error(
    `封面 "${cover}" 既不是 wxmedia: 句柄也不是网址。本地图片请先调用 wechat_create_upload_url（purpose="cover"）拿到上传地址，用 Bash 执行 curl 上传，再把返回的 ref 填到 cover。`,
  );
}

async function buildArticle(input: z.infer<typeof createDraftSchema>): Promise<{ article: DraftArticle; uploadedCount: number }> {
  const [thumbMediaId, rewritten] = await Promise.all([resolveCoverMediaId(input.cover), rewriteContentImages(input.content)]);
  return {
    uploadedCount: rewritten.uploadedCount,
    article: {
      title: input.title,
      content: rewritten.html,
      thumbMediaId,
      author: input.author,
      digest: input.digest,
      contentSourceUrl: input.content_source_url,
      needOpenComment: input.need_open_comment,
      onlyFansCanComment: input.only_fans_can_comment,
    },
  };
}

const ARTICLE_PROPERTIES = {
  title: { type: "string", description: "文章标题，最多 64 个字符。" },
  content: {
    type: "string",
    description:
      "文章正文，必须是 HTML 字符串（不是 Markdown，Markdown 会原样显示成符号）。约束：样式只能写成元素上的 style 内联属性，微信会剥掉 class 和 <style> 标签；script/iframe/表单标签会被剥离；正文里的外链 <a> 在公众号里不可点击。正文图片写成 <img src=\"...\">，src 可以是 wechat_create_upload_url(purpose=\"content\") 上传后返回的 url、或任意公网图片地址（服务端会自动转投微信并回填），但不能是本地文件路径或 data: base64。",
  },
  cover: {
    type: "string",
    description:
      "封面图，微信必填。取值为 wechat_create_upload_url(purpose=\"cover\") 上传后返回的 ref（形如 wxmedia:xxx），或一个公网图片地址。不能是本地文件路径。",
  },
  author: { type: "string", description: "作者署名，可选，最多 8 个字符。" },
  digest: { type: "string", description: "摘要，可选，最多 120 字符；留空时微信会自动截取正文开头。" },
  content_source_url: { type: "string", description: "「阅读原文」跳转的链接，可选。正文里的外链不可点击，需要外链时用这个字段。" },
  need_open_comment: { type: "boolean", description: "是否开启评论，默认 false。" },
  only_fans_can_comment: { type: "boolean", description: "是否仅粉丝可评论，默认 false。" },
} as const;

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: unknown, context: { origin: string }) => Promise<unknown>;
};

export const TOOLS: ToolDefinition[] = [
  {
    name: "wechat_create_upload_url",
    description:
      "获取一个 10 分钟有效的图片上传地址。本地图片无法作为工具参数传输，必须走这里：拿到 upload_url 后用 Bash 执行返回的 curl 命令上传文件，再把响应里的 ref 用到 wechat_create_draft 的 cover（purpose=\"cover\"）或正文 <img src>（purpose=\"content\"）。",
    inputSchema: {
      type: "object",
      properties: {
        purpose: {
          type: "string",
          enum: ["cover", "content"],
          description: "cover=文章封面（上传为永久素材，限 10MB，返回 wxmedia: 句柄）；content=正文内嵌图片（限 1MB 且只支持 jpg/png，返回可直接填进 <img src> 的图片地址）。",
        },
      },
      required: ["purpose"],
      additionalProperties: false,
    },
    handler: async (args, { origin }) => {
      const { purpose } = z.object({ purpose: z.enum(["cover", "content"]) }).parse(args);
      const { url, expiresAt } = buildUploadUrl(origin, purpose);
      return {
        upload_url: url,
        expires_in_seconds: Math.round(UPLOAD_URL_TTL_MS / 1000),
        expires_at: new Date(expiresAt).toISOString(),
        curl_example: `curl -sS -F "file=@/绝对路径/图片.png" '${url}'`,
        next_step:
          purpose === "cover"
            ? "上传成功后响应形如 {\"ref\":\"wxmedia:xxx\"}，把 ref 原样传给 wechat_create_draft 的 cover 参数。"
            : "上传成功后响应形如 {\"ref\":\"https://mmbiz.qpic.cn/...\"}，把 ref 原样填进正文 HTML 的 <img src>。",
      };
    },
  },
  {
    name: "wechat_create_draft",
    description:
      "在公众号草稿箱里新建一篇图文草稿。正文用 HTML；服务端会自动把正文里非微信域名的图片转投到微信并回填地址（否则微信会静默丢弃，读者看到空白）。返回 media_id，后续可用于 wechat_update_draft / wechat_publish_draft。此操作不会推送给粉丝。",
    inputSchema: { type: "object", properties: ARTICLE_PROPERTIES, required: ["title", "content", "cover"], additionalProperties: false },
    handler: async (args) => {
      const input = createDraftSchema.parse(args);
      const { article, uploadedCount } = await buildArticle(input);
      const { media_id } = await createDraft(article);
      return { media_id, uploaded_images: uploadedCount, note: "草稿已创建，可在微信公众平台后台预览。发布需另外调用 wechat_publish_draft。" };
    },
  },
  {
    name: "wechat_update_draft",
    description: "覆盖更新草稿箱里已有的一篇文章。微信没有字段级更新，必须传完整的标题/正文/封面。",
    inputSchema: {
      type: "object",
      properties: {
        media_id: { type: "string", description: "要更新的草稿 media_id，可从 wechat_list_drafts 获取。" },
        index: { type: "number", description: "多图文草稿里第几篇，从 0 开始，默认 0。" },
        ...ARTICLE_PROPERTIES,
      },
      required: ["media_id", "title", "content", "cover"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = updateDraftSchema.parse(args);
      const { article, uploadedCount } = await buildArticle(input);
      await updateDraft(input.media_id, input.index ?? 0, article);
      return { media_id: input.media_id, uploaded_images: uploadedCount, note: "草稿已更新。" };
    },
  },
  {
    name: "wechat_list_drafts",
    description: "列出草稿箱里的文章，用于找回之前创建的草稿 media_id。",
    inputSchema: {
      type: "object",
      properties: {
        offset: { type: "number", description: "从第几条开始，默认 0。" },
        count: { type: "number", description: "返回条数，1-20，默认 10。" },
      },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { offset, count } = z.object({ offset: z.number().int().min(0).optional(), count: z.number().int().min(1).max(20).optional() }).parse(args ?? {});
      return listDrafts(offset ?? 0, count ?? 10);
    },
  },
  {
    name: "wechat_publish_draft",
    description:
      "发布草稿箱里的一篇文章。发布后文章公开可访问、出现在公众号的发表记录里，但不会推送给粉丝（推送是另一套群发接口，本服务不提供）。发布是异步的，返回 publish_id 后用 wechat_get_publish_status 查结果。",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string", description: "要发布的草稿 media_id。" } },
      required: ["media_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { media_id } = z.object({ media_id: z.string().trim().min(1) }).parse(args);
      const result = await submitPublish(media_id);
      return { publish_id: result.publish_id, note: "已提交发布，用 wechat_get_publish_status 查询结果（通常几秒内完成）。" };
    },
  },
  {
    name: "wechat_get_publish_status",
    description: "查询发布结果。status 为 1 表示仍在发布中，可稍后重试；为 0 表示成功并返回文章链接。",
    inputSchema: {
      type: "object",
      properties: { publish_id: { type: "string", description: "wechat_publish_draft 返回的 publish_id。" } },
      required: ["publish_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { publish_id } = z.object({ publish_id: z.string().trim().min(1) }).parse(args);
      return getPublishStatus(publish_id);
    },
  },
];

export const TOOLS_BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));
