import "server-only";
import { z } from "zod";
import { createDraft, createMultiDraft, deleteDraft, getDraft, getPublishStatus, listDrafts, submitPublish, updateDraft, type DraftArticle } from "@/lib/wechat/draft";
import { deleteMass, getMassSpeed, getMassStatus, massPreview, massSendAll, massSendByOpenids, type MassMessage } from "@/lib/wechat/mass";
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
const createMultiDraftSchema = z
  .object({
    articles: z.array(z.object(articleShape)).min(2).max(8),
  })
  .strict();

const MASS_CONFIRM_REQUIRED =
  "群发会推送给粉丝且不可逆。必须先调用 wechat_mass_preview 预览，并征得用户明确确认后，才能传 confirm=true 执行群发。";

const massMessageInputSchema = z.object({
  msgtype: z.enum(["mpnews", "text", "image", "voice", "mpvideo", "wxcard", "music"]).optional(),
  media_id: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1).optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  card_id: z.string().trim().min(1).optional(),
  card_ext: z.string().optional(),
  music_url: z.string().trim().url().optional(),
  hq_music_url: z.string().trim().url().optional(),
  thumb_media_id: z.string().trim().min(1).optional(),
});

type MassMessageInput = z.infer<typeof massMessageInputSchema>;

function requiredMassField(value: string | undefined, field: string, msgtype: string): string {
  if (!value) throw new Error(`msgtype=${msgtype} 时必须提供 ${field}。`);
  return value;
}

function requiredMassMediaId(value: string | undefined, msgtype: string): string {
  const mediaId = requiredMassField(value, "media_id", msgtype);
  const normalized = mediaId.startsWith(COVER_HANDLE_PREFIX) ? mediaId.slice(COVER_HANDLE_PREFIX.length).trim() : mediaId;
  if (!normalized) throw new Error(`msgtype=${msgtype} 时 media_id 不能为空。`);
  return normalized;
}

function buildMassMessage(input: MassMessageInput): MassMessage {
  const msgtype = input.msgtype ?? "mpnews";
  switch (msgtype) {
    case "mpnews":
      return { msgtype, mediaId: requiredMassField(input.media_id, "media_id", msgtype) };
    case "text":
      return { msgtype, content: requiredMassField(input.content, "content", msgtype) };
    case "image":
    case "voice":
      return { msgtype, mediaId: requiredMassMediaId(input.media_id, msgtype) };
    case "mpvideo":
      return {
        msgtype,
        mediaId: requiredMassMediaId(input.media_id, msgtype),
        title: input.title,
        description: input.description,
      };
    case "wxcard":
      return { msgtype, cardId: requiredMassField(input.card_id, "card_id", msgtype), cardExt: input.card_ext };
    case "music": {
      const thumbMediaId = requiredMassField(input.thumb_media_id, "thumb_media_id", msgtype);
      const normalizedThumbMediaId = thumbMediaId.startsWith(COVER_HANDLE_PREFIX) ? thumbMediaId.slice(COVER_HANDLE_PREFIX.length).trim() : thumbMediaId;
      if (!normalizedThumbMediaId) throw new Error(`msgtype=${msgtype} 时 thumb_media_id 不能为空。`);
      return {
        msgtype,
        title: input.title,
        description: input.description,
        musicUrl: requiredMassField(input.music_url, "music_url", msgtype),
        hqMusicUrl: requiredMassField(input.hq_music_url, "hq_music_url", msgtype),
        thumbMediaId: normalizedThumbMediaId,
      };
    }
  }
}

const massMessageProperties = {
  msgtype: {
    type: "string",
    enum: ["mpnews", "text", "image", "voice", "mpvideo", "wxcard", "music"],
    default: "mpnews",
    description: "消息类型。不传时默认为 mpnews；图片/语音/视频使用素材 media_id，文本使用 content。视频类型使用微信接口名 mpvideo。",
  },
  media_id: { type: "string", description: "mpnews/image/voice/mpvideo 使用的素材 media_id；图文时是草稿 media_id，其他类型可从 wechat_list_materials 获取。" },
  content: { type: "string", description: "msgtype=text 时的文本内容。" },
  title: { type: "string", description: "mpvideo/music 的标题，可选。" },
  description: { type: "string", description: "mpvideo/music 的描述，可选。" },
  card_id: { type: "string", description: "msgtype=wxcard 时的卡券 id。" },
  card_ext: { type: "string", description: "msgtype=wxcard 时的卡券扩展参数 JSON 字符串，可选。" },
  music_url: { type: "string", description: "msgtype=music 时的音乐地址。" },
  hq_music_url: { type: "string", description: "msgtype=music 时的高品质音乐地址。" },
  thumb_media_id: { type: "string", description: "msgtype=music 时的缩略图素材 media_id。" },
} as const;

const massMessageAlternatives = [
  { required: ["media_id"], not: { required: ["msgtype"] } },
  { required: ["msgtype", "media_id"], properties: { msgtype: { enum: ["mpnews", "image", "voice", "mpvideo"] } } },
  { required: ["msgtype", "content"], properties: { msgtype: { const: "text" } } },
  { required: ["msgtype", "card_id"], properties: { msgtype: { const: "wxcard" } } },
  {
    required: ["msgtype", "music_url", "hq_music_url", "thumb_media_id"],
    properties: { msgtype: { const: "music" } },
  },
];

const massSendSchema = massMessageInputSchema.extend({
  is_to_all: z.boolean().optional(),
  tag_id: z.number().int().optional(),
  clientmsgid: z.string().trim().min(1).max(32),
  send_ignore_reprint: z.union([z.literal(0), z.literal(1)]).optional(),
  confirm: z.unknown().optional(),
});

const massSendByOpenidsSchema = massMessageInputSchema.extend({
  openids: z.array(z.string().trim().min(1)).min(1),
  clientmsgid: z.string().trim().min(1).max(32),
  confirm: z.unknown().optional(),
});

const commentTargetSchema = z.object({
  msg_data_id: z.number(),
  index: z.number().int().min(0).optional(),
  user_comment_id: z.number(),
});

const statsDateSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD").optional() });

const statsRangeSchema = z.object({
  begin_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD").optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD").optional(),
});

const commentOpenCloseSchema = z.object({
  msg_data_id: z.number(),
  index: z.number().int().min(0).optional(),
});

const customerMessageSchema = z.object({
  openid: z.string().trim().min(1),
  msgtype: z.string().trim().min(1),
  content: z.record(z.string(), z.unknown()),
  customservice: z.string().trim().min(1).optional(),
});

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
    name: "wechat_create_multi_draft",
    description:
      "一次创建多图文草稿（2-8 篇）。多图文=一篇草稿含多篇文章，发布或群发时粉丝收到一条带头条+次条的多图文消息。每篇的标题/正文/封面处理与 wechat_create_draft 一致（正文 HTML、封面 wxmedia: 句柄或公网地址、外链图片自动转投）。单篇请用 wechat_create_draft。多图文模式下微信会忽略每篇的 digest（摘要）。",
    inputSchema: {
      type: "object",
      properties: {
        articles: {
          type: "array",
          minItems: 2,
          maxItems: 8,
          items: { type: "object", properties: ARTICLE_PROPERTIES, required: ["title", "content", "cover"], additionalProperties: false },
          description: "多图文文章数组，2-8 篇；每篇字段与单篇 wechat_create_draft 完全一致。",
        },
      },
      required: ["articles"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { articles } = createMultiDraftSchema.parse(args);
      const built = await Promise.all(articles.map(buildArticle));
      const uploadedCount = built.reduce((sum, item) => sum + item.uploadedCount, 0);
      const { media_id } = await createMultiDraft(built.map((item) => item.article));
      return {
        media_id,
        article_count: built.length,
        uploaded_images: uploadedCount,
        note: "多图文草稿已创建，可在微信公众平台后台预览。发布需调用 wechat_publish_draft；群发需先 wechat_mass_preview 并征得用户确认后调 wechat_mass_send。",
      };
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
  {
    name: "wechat_mass_preview",
    description:
      "把群发消息预览推送到指定一人的微信（运营者本人），手机端核对内容。支持 mpnews（默认，使用草稿 media_id）、text、image、voice、mpvideo、wxcard、music；预览不计入群发次数，按微信号预览每日限 100 次。群发前必须先预览并征得用户明确同意。",
    inputSchema: {
      type: "object",
      properties: {
        ...massMessageProperties,
        to_wxname: { type: "string", description: "接收预览的微信号（运营者本人），与 to_openid 二选一。" },
        to_openid: { type: "string", description: "接收预览的粉丝 openid，与 to_wxname 二选一。" },
      },
      allOf: [
        { anyOf: massMessageAlternatives },
        { anyOf: [{ required: ["to_wxname"] }, { required: ["to_openid"] }] },
      ],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = massMessageInputSchema
        .extend({
          to_wxname: z.string().trim().min(1).optional(),
          to_openid: z.string().trim().min(1).optional(),
        })
        .refine((value) => Boolean(value.to_wxname) !== Boolean(value.to_openid), {
          message: "必须且只能提供 to_wxname（运营者微信号）或 to_openid 之一",
        })
        .parse(args);
      await massPreview(buildMassMessage(input), input.to_wxname ? { wxname: input.to_wxname } : { openid: input.to_openid });
      return { note: "预览已发送到指定微信，请对方在手机上确认内容无误后，再执行群发（wechat_mass_send 需要 confirm=true）。" };
    },
  },
  {
    name: "wechat_mass_send",
    description:
      "把消息群发给粉丝（全员或某个标签）。支持 mpnews（默认，media_id 为草稿）、text、image、voice、mpvideo、wxcard、music。会推送给粉丝、不可逆；必须先用相同消息调用 wechat_mass_preview，并征得用户明确同意后传 confirm=true 和 clientmsgid。",
    inputSchema: {
      type: "object",
      properties: {
        ...massMessageProperties,
        is_to_all: { type: "boolean", description: "true=群发全员；false=按标签群发（默认 false）。群发全员会进入历史消息列表，且每天最多一次。" },
        tag_id: { type: "number", description: "is_to_all=false 时必填，标签 id 可从 wechat_list_tags 获取。" },
        clientmsgid: { type: "string", description: "自定义群发 id，最长 32 字节，24 小时内相同值会被微信拒绝（防重复推送）。建议用本次操作的唯一标识。" },
        send_ignore_reprint: { type: "number", enum: [0, 1], description: "仅 mpnews 有效：文章被判定为转载时是否继续群发。0=停止（默认），1=继续。" },
        confirm: { type: "boolean", description: "必须为 true 才执行。群发不可逆，必须在用户明确同意后传 true。" },
      },
      required: ["clientmsgid", "confirm"],
      anyOf: massMessageAlternatives,
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = massSendSchema.parse(args);
      if (input.confirm !== true) throw new Error(MASS_CONFIRM_REQUIRED);
      const message = buildMassMessage(input);
      if (input.send_ignore_reprint !== undefined && message.msgtype !== "mpnews") {
        throw new Error("send_ignore_reprint 仅适用于 mpnews 图文消息。");
      }
      const isToAll = input.is_to_all ?? false;
      if (!isToAll && input.tag_id === undefined) {
        throw new Error("is_to_all=false 时必须提供 tag_id（可用 wechat_list_tags 查看标签）；要群发全员请显式传 is_to_all=true。");
      }
      const result = await massSendAll({
        message,
        isToAll,
        tagId: input.tag_id,
        sendIgnoreReprint: input.send_ignore_reprint,
        clientmsgid: input.clientmsgid,
      });
      return { ...result, note: "群发任务已提交，用 wechat_mass_status 轮询结果。认证公众号每天可群发 1 次；服务号每月每用户最多收到 4 条，超额部分微信会自动过滤。" };
    },
  },
  {
    name: "wechat_mass_send_by_openids",
    description:
      "按指定 OpenID 列表群发消息（仅认证服务号可用，不进入历史消息列表）。支持 mpnews（默认，media_id 为草稿）、text、image、voice、mpvideo、wxcard、music。同样不可逆：必须先用相同消息预览并征得用户明确同意，传 confirm=true 和 clientmsgid。",
    inputSchema: {
      type: "object",
      properties: {
        ...massMessageProperties,
        openids: { type: "array", items: { type: "string" }, description: "接收群发的粉丝 openid 列表。" },
        clientmsgid: { type: "string", description: "自定义群发 id，防重复推送。" },
        confirm: { type: "boolean", description: "必须为 true 才执行。" },
      },
      required: ["openids", "clientmsgid", "confirm"],
      anyOf: massMessageAlternatives,
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = massSendByOpenidsSchema.parse(args);
      if (input.confirm !== true) throw new Error(MASS_CONFIRM_REQUIRED);
      const result = await massSendByOpenids(buildMassMessage(input), input.openids, input.clientmsgid);
      return { ...result, note: "群发任务已提交，用 wechat_mass_status 轮询结果。" };
    },
  },
  {
    name: "wechat_mass_status",
    description: "查询群发消息发送状态。done 为 true 表示结束，可看到发送成功/失败人数。",
    inputSchema: {
      type: "object",
      properties: { msg_id: { type: "number", description: "wechat_mass_send 返回的 msg_id。" } },
      required: ["msg_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { msg_id } = z.object({ msg_id: z.union([z.number(), z.string()]) }).parse(args);
      return getMassStatus(Number(msg_id));
    },
  },
  {
    name: "wechat_mass_delete",
    description: "删除已群发的消息（仅文章/视频可删）。删除后已收到的用户仍能看到消息卡片，但打不开图文详情页。",
    inputSchema: {
      type: "object",
      properties: {
        msg_id: { type: "number", description: "群发的 msg_id。" },
        article_idx: { type: "number", description: "多图文时删第几篇，从 1 开始，默认整条群发都删。" },
      },
      required: ["msg_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ msg_id: z.union([z.number(), z.string()]), article_idx: z.number().int().min(1).optional() }).parse(args);
      await deleteMass(Number(input.msg_id), input.article_idx);
      return { note: "已删除群发消息。" };
    },
  },
  {
    name: "wechat_get_draft",
    description: "获取草稿详情，含正文 HTML 和封面 media_id，用于找回之前创建的草稿内容。",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string", description: "草稿 media_id。" } },
      required: ["media_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { media_id } = z.object({ media_id: z.string().trim().min(1) }).parse(args);
      return getDraft(media_id);
    },
  },
  {
    name: "wechat_delete_draft",
    description: "删除草稿箱里的一篇草稿。已发布的文章不受影响。",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string", description: "要删除的草稿 media_id。" } },
      required: ["media_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { media_id } = z.object({ media_id: z.string().trim().min(1) }).parse(args);
      await deleteDraft(media_id);
      return { note: "草稿已删除。" };
    },
  },
  {
    name: "wechat_list_published",
    description: "列出已成功发布（公开可访问）的文章，用于找回 article_id。",
    inputSchema: {
      type: "object",
      properties: {
        offset: { type: "number", description: "从第几条开始，默认 0。" },
        count: { type: "number", description: "返回条数，默认 10。" },
      },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { offset, count } = z.object({ offset: z.number().int().min(0).optional(), count: z.number().int().min(1).max(20).optional() }).parse(args ?? {});
      return listPublished(offset ?? 0, count ?? 10);
    },
  },
  {
    name: "wechat_delete_published",
    description: "删除已发布的文章。此操作不可逆，删除后文章链接会失效，请谨慎。",
    inputSchema: {
      type: "object",
      properties: { article_id: { type: "string", description: "wechat_list_published 返回的 article_id。" } },
      required: ["article_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { article_id } = z.object({ article_id: z.string().trim().min(1) }).parse(args);
      await deletePublished(article_id);
      return { note: "已删除发布文章（不可逆）。" };
    },
  },
  {
    name: "wechat_get_published_article",
    description: "获取已发布图文的详情，含正文内容。",
    inputSchema: {
      type: "object",
      properties: { article_id: { type: "string", description: "已发布文章的 article_id。" } },
      required: ["article_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { article_id } = z.object({ article_id: z.string().trim().min(1) }).parse(args);
      return getPublishedArticle(article_id);
    },
  },
  {
    name: "wechat_list_materials",
    description: "分类型列出永久素材（图片/视频/语音/图文），用于找回 media_id 或确认素材占用。",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["image", "video", "voice", "news"], description: "素材类型：image=图片、video=视频、voice=语音、news=图文。" },
        offset: { type: "number", description: "从第几条开始，默认 0。" },
        count: { type: "number", description: "返回条数，默认 10，最大 20。" },
      },
      required: ["type"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z
        .object({
          type: z.enum(["image", "video", "voice", "news"]),
          offset: z.number().int().min(0).optional(),
          count: z.number().int().min(1).max(20).optional(),
        })
        .parse(args);
      return listMaterials(input.type, input.offset ?? 0, input.count ?? 10);
    },
  },
  {
    name: "wechat_delete_material",
    description: "删除永久素材。删除后引用该素材的草稿/群发会受影响，请谨慎。",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string", description: "永久素材 media_id，从 wechat_list_materials 获取。" } },
      required: ["media_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { media_id } = z.object({ media_id: z.string().trim().min(1) }).parse(args);
      await deleteMaterial(media_id);
      return { note: "永久素材已删除。" };
    },
  },
  {
    name: "wechat_list_comments",
    description: "查看指定文章的留言。msg_data_id 来自群发或发布（wechat_publish_draft）的返回。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        begin: { type: "number", description: "起始位置，默认 0。" },
        count: { type: "number", description: "获取数目，默认 20，超过 50 会被微信拒绝。" },
        type: { type: "number", enum: [0, 1, 2], description: "0=全部评论，1=普通评论，2=精选评论，默认 0。" },
      },
      required: ["msg_data_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z
        .object({
          msg_data_id: z.number(),
          index: z.number().int().min(0).optional(),
          begin: z.number().int().min(0).optional(),
          count: z.number().int().min(1).max(50).optional(),
          type: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
        })
        .parse(args);
      return listComments({ msgDataId: input.msg_data_id, index: input.index, begin: input.begin ?? 0, count: input.count ?? 20, type: input.type ?? 0 });
    },
  },
  {
    name: "wechat_reply_comment",
    description: "回复某条留言。回复后读者能在留言下看到。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        user_comment_id: { type: "number", description: "wechat_list_comments 返回的 user_comment_id。" },
        content: { type: "string", description: "回复内容。" },
      },
      required: ["msg_data_id", "user_comment_id", "content"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentTargetSchema.extend({ content: z.string().trim().min(1) }).parse(args);
      await replyComment({ msgDataId: input.msg_data_id, index: input.index, userCommentId: input.user_comment_id, content: input.content });
      return { note: "已回复留言。" };
    },
  },
  {
    name: "wechat_mark_comment",
    description: "把一条留言标记为精选（读者可见）。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        user_comment_id: { type: "number", description: "wechat_list_comments 返回的 user_comment_id。" },
      },
      required: ["msg_data_id", "user_comment_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentTargetSchema.parse(args);
      await markComment({ msgDataId: input.msg_data_id, index: input.index, userCommentId: input.user_comment_id });
      return { note: "已标记精选。" };
    },
  },
  {
    name: "wechat_unmark_comment",
    description: "取消一条留言的精选状态。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        user_comment_id: { type: "number", description: "wechat_list_comments 返回的 user_comment_id。" },
      },
      required: ["msg_data_id", "user_comment_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentTargetSchema.parse(args);
      await unmarkComment({ msgDataId: input.msg_data_id, index: input.index, userCommentId: input.user_comment_id });
      return { note: "已取消精选。" };
    },
  },
  {
    name: "wechat_delete_comment",
    description: "删除一条留言。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        user_comment_id: { type: "number", description: "wechat_list_comments 返回的 user_comment_id。" },
      },
      required: ["msg_data_id", "user_comment_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentTargetSchema.parse(args);
      await deleteComment({ msgDataId: input.msg_data_id, index: input.index, userCommentId: input.user_comment_id });
      return { note: "留言已删除。" };
    },
  },
  {
    name: "wechat_list_tags",
    description: "列出公众号的粉丝标签（id/名称/人数），供 wechat_mass_send 按标签群发时选 tag_id。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => listTags(),
  },
  {
    name: "wechat_get_article_read_stats",
    description:
      "查某一天所有被阅读过的发表内容的阅读人数和来源（公众号消息/朋友圈/搜一搜等）。返回的是当天所有文章，不是单篇；要某篇的数据按返回的 msgid（群发/发布返回的 msg_data_id_序号）或标题过滤。数据从 2025-11-01 起有效，且只能查 1 天，最大到昨天（建议每天 8 点后查前一天）。",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", description: "要查询的日期 YYYY-MM-DD，默认昨天。" } },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { date } = statsDateSchema.parse(args ?? {});
      return getArticleRead(date ?? yesterdayIso());
    },
  },
  {
    name: "wechat_get_article_stats_detail",
    description:
      "查某一天发表的所有文章的详细数据：标题、链接、阅读/分享/在看/点赞/留言/收藏/赞赏、阅读完成率、平均阅读时长、阅读来源。每篇只统计发表后 30 天。想确认某篇文章的阅读数时用这个，按标题或链接对号。数据从 2025-11-01 起有效，只能查 1 天，最大到昨天。",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", description: "要查询的日期 YYYY-MM-DD，默认昨天。" } },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { date } = statsDateSchema.parse(args ?? {});
      return getArticleStatsDetail(date ?? yesterdayIso());
    },
  },
  {
    name: "wechat_get_article_stats_summary",
    description:
      "查一段日期内账号发表内容的汇总概览（阅读/分享/在看/点赞/留言/收藏/跳转原文人数/发布篇数），最长 30 天，适合看整体表现。数据从 2025-11-01 起有效，结束日期最大到昨天。",
    inputSchema: {
      type: "object",
      properties: {
        begin_date: { type: "string", description: "开始日期 YYYY-MM-DD，默认最近 7 天。" },
        end_date: { type: "string", description: "结束日期 YYYY-MM-DD，默认昨天。" },
      },
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = statsRangeSchema.parse(args ?? {});
      const endDate = input.end_date ?? yesterdayIso();
      const beginDate = input.begin_date ?? daysAgoIso(7);
      return getArticleStatsSummary(beginDate, endDate);
    },
  },
  {
    name: "wechat_list_followers",
    description: "获取公众号的关注者 openid 列表（分页）。返回 next_openid 时用同样的参数继续拉下一页，直到 next_openid 为空。",
    inputSchema: {
      type: "object",
      properties: { next_openid: { type: "string", description: "上一页返回的游标，第一页不传。" } },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { next_openid } = z.object({ next_openid: z.string().trim().min(1).optional() }).parse(args ?? {});
      return listFollowers(next_openid);
    },
  },
  {
    name: "wechat_get_user_info",
    description: "获取单个粉丝的基本信息：是否关注、关注时间、关注来源渠道、标签。",
    inputSchema: {
      type: "object",
      properties: {
        openid: { type: "string", description: "粉丝的 openid。" },
        lang: { type: "string", enum: ["zh_CN", "zh_TW", "en"], description: "返回语言，默认 zh_CN。" },
      },
      required: ["openid"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ openid: z.string().trim().min(1), lang: z.enum(["zh_CN", "zh_TW", "en"]).optional() }).parse(args);
      return getUserInfo(input.openid, input.lang ?? "zh_CN");
    },
  },
  {
    name: "wechat_batch_get_user_info",
    description: "批量获取粉丝基本信息，一次最多 100 个。",
    inputSchema: {
      type: "object",
      properties: { openids: { type: "array", items: { type: "string" }, description: "粉丝 openid 列表，最多 100 个。" } },
      required: ["openids"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { openids } = z.object({ openids: z.array(z.string().trim().min(1)).min(1).max(100) }).parse(args);
      return batchGetUserInfo(openids);
    },
  },
  {
    name: "wechat_create_tag",
    description: "创建粉丝标签（最多 100 个），创建后可用于按标签群发。",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "标签名，最多 30 个字符。" } },
      required: ["name"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { name } = z.object({ name: z.string().trim().min(1).max(30) }).parse(args);
      return createTag(name);
    },
  },
  {
    name: "wechat_update_tag",
    description: "修改粉丝标签名称。",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "标签 id，从 wechat_list_tags 获取。" },
        name: { type: "string", description: "新标签名，最多 30 个字符。" },
      },
      required: ["id", "name"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ id: z.number().int(), name: z.string().trim().min(1).max(30) }).parse(args);
      return updateTag(input.id, input.name);
    },
  },
  {
    name: "wechat_delete_tag",
    description: "删除粉丝标签，标签下的粉丝不会被删除，只是去掉该标签。",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "标签 id。" } },
      required: ["id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { id } = z.object({ id: z.number().int() }).parse(args);
      return deleteTag(id);
    },
  },
  {
    name: "wechat_tag_users",
    description: "给一批粉丝打标签。",
    inputSchema: {
      type: "object",
      properties: {
        tag_id: { type: "number", description: "标签 id。" },
        openids: { type: "array", items: { type: "string" }, description: "要打标签的粉丝 openid 列表。" },
      },
      required: ["tag_id", "openids"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ tag_id: z.number().int(), openids: z.array(z.string().trim().min(1)).min(1) }).parse(args);
      return tagUsers(input.tag_id, input.openids);
    },
  },
  {
    name: "wechat_untag_users",
    description: "给一批粉丝取消标签。",
    inputSchema: {
      type: "object",
      properties: {
        tag_id: { type: "number", description: "标签 id。" },
        openids: { type: "array", items: { type: "string" }, description: "要取消标签的粉丝 openid 列表。" },
      },
      required: ["tag_id", "openids"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ tag_id: z.number().int(), openids: z.array(z.string().trim().min(1)).min(1) }).parse(args);
      return untagUsers(input.tag_id, input.openids);
    },
  },
  {
    name: "wechat_list_tag_members",
    description: "获取某标签下的粉丝 openid 列表（分页，用 next_openid 翻页）。",
    inputSchema: {
      type: "object",
      properties: {
        tag_id: { type: "number", description: "标签 id。" },
        next_openid: { type: "string", description: "上一页返回的游标，第一页不传。" },
      },
      required: ["tag_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = z.object({ tag_id: z.number().int(), next_openid: z.string().trim().min(1).optional() }).parse(args);
      return listTagMembers(input.tag_id, input.next_openid);
    },
  },
  {
    name: "wechat_get_user_tags",
    description: "获取某个粉丝被打上的标签 id 列表。",
    inputSchema: {
      type: "object",
      properties: { openid: { type: "string", description: "粉丝 openid。" } },
      required: ["openid"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { openid } = z.object({ openid: z.string().trim().min(1) }).parse(args);
      return getUserTags(openid);
    },
  },
  {
    name: "wechat_get_followers_stats",
    description: "查某天的粉丝增减数据（新增/取消关注，按来源渠道区分）。数据从 2014-12-01 起有效，只能查 1 天，最大到昨天，建议每天 8 点后查询。",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", description: "要查询的日期 YYYY-MM-DD，默认昨天。" } },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { date } = statsDateSchema.parse(args ?? {});
      return getUserSummary(date ?? yesterdayIso());
    },
  },
  {
    name: "wechat_get_total_followers",
    description: "查某天的累计关注用户数。数据从 2014-12-01 起有效，只能查 1 天，最大到昨天。",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", description: "要查询的日期 YYYY-MM-DD，默认昨天。" } },
      additionalProperties: false,
    },
    handler: async (args) => {
      const { date } = statsDateSchema.parse(args ?? {});
      return getUserCumulate(date ?? yesterdayIso());
    },
  },
  {
    name: "wechat_open_comments",
    description: "打开已发布文章的留言功能（公众号需具备留言功能权限）。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
      },
      required: ["msg_data_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentOpenCloseSchema.parse(args);
      return openComments({ msgDataId: input.msg_data_id, index: input.index });
    },
  },
  {
    name: "wechat_close_comments",
    description: "关闭已发布文章的留言功能。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
      },
      required: ["msg_data_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentOpenCloseSchema.parse(args);
      return closeComments({ msgDataId: input.msg_data_id, index: input.index });
    },
  },
  {
    name: "wechat_delete_comment_reply",
    description: "删除某条留言下的回复。",
    inputSchema: {
      type: "object",
      properties: {
        msg_data_id: { type: "number", description: "群发或发布返回的 msg_data_id。" },
        index: { type: "number", description: "多图文时指定第几篇，从 0 开始，默认 0。" },
        user_comment_id: { type: "number", description: "wechat_list_comments 返回的 user_comment_id。" },
      },
      required: ["msg_data_id", "user_comment_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = commentTargetSchema.parse(args);
      return deleteCommentReply({ msgDataId: input.msg_data_id, index: input.index, userCommentId: input.user_comment_id });
    },
  },
  {
    name: "wechat_get_material",
    description: "根据 media_id 获取永久素材详情（图片返回 URL，视频返回视频信息）。",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string", description: "永久素材 media_id。" } },
      required: ["media_id"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { media_id } = z.object({ media_id: z.string().trim().min(1) }).parse(args);
      return getMaterial(media_id);
    },
  },
  {
    name: "wechat_get_material_count",
    description: "获取永久素材总数（图片/视频/语音/图文分别计数）。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => getMaterialCount(),
  },
  {
    name: "wechat_get_mass_speed",
    description: "查询当前群发速度等级（0-3，数字越大越快），只读。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => getMassSpeed(),
  },
  {
    name: "wechat_create_menu",
    description:
      "创建公众号自定义菜单。button 是微信菜单结构数组（最多 3 个一级菜单，每个最多 5 个二级菜单），元素形如 {type, name, url/key}，type 常用 view（网页，配 url）或 click（点击事件，配 key）。会整体替换现有菜单。",
    inputSchema: {
      type: "object",
      properties: { button: { type: "array", items: { type: "object" }, description: "菜单结构数组。" } },
      required: ["button"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { button } = z.object({ button: z.array(z.record(z.string(), z.unknown())).min(1).max(3) }).parse(args);
      return createMenu(button);
    },
  },
  {
    name: "wechat_get_menu",
    description: "查询当前自定义菜单的配置结构。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => getMenu(),
  },
  {
    name: "wechat_delete_menu",
    description: "删除当前自定义菜单（默认菜单和全部个性化菜单一起删），删除后粉丝看不到菜单，需重新创建。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => deleteMenu(),
  },
  {
    name: "wechat_send_customer_message",
    description:
      "给某个粉丝发送客服消息。有触发条件：用户发消息后 48 小时内最多 5 条、关注/扫码/点菜单后 1 分钟内 3 条，超窗口会被微信拒绝。msgtype 决定 content 结构：text={content}、image={media_id}、link={title,url,thumb_url}、miniprogrampage={title,pagepath,thumb_media_id} 等。",
    inputSchema: {
      type: "object",
      properties: {
        openid: { type: "string", description: "接收消息的粉丝 openid。" },
        msgtype: { type: "string", description: "消息类型：text/image/voice/video/music/link/miniprogrampage 等。" },
        content: { type: "object", description: "按 msgtype 对应的内容结构，如 text 传 {content: \"你好\"}。" },
        customservice: { type: "string", description: "可选，用某个客服账号身份发送（wechat_list_kf_accounts 查）。" },
      },
      required: ["openid", "msgtype", "content"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const input = customerMessageSchema.parse(args);
      return sendCustomerMessage({ touser: input.openid, msgtype: input.msgtype, content: input.content, customservice: input.customservice });
    },
  },
  {
    name: "wechat_send_typing",
    description: "给某粉丝设置客服输入状态（让对方看到“对方正在输入…”）。",
    inputSchema: {
      type: "object",
      properties: { openid: { type: "string", description: "粉丝 openid。" } },
      required: ["openid"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { openid } = z.object({ openid: z.string().trim().min(1) }).parse(args);
      return sendTyping(openid);
    },
  },
  {
    name: "wechat_list_kf_accounts",
    description: "列出公众号的客服账号（发送客服消息时可指定用哪个客服身份）。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => listKfAccounts(),
  },
];

export const TOOLS_BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));
