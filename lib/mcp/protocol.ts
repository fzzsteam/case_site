import "server-only";
import { z } from "zod";
import { WechatApiError } from "@/lib/wechat/errors";
import { TOOLS, TOOLS_BY_NAME } from "./tools";

export const SERVER_NAME = "wechat-mp";
export const SERVER_VERSION = "1.0.0";
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = new Set(["2024-11-05", "2025-03-26", DEFAULT_PROTOCOL_VERSION]);

/**
 * MCP 的 initialize 响应里带的 instructions 会被客户端注入到模型的 system prompt，
 * 是唯一不依赖模型"自己想起来"的引导手段——图片上传必须走 Bash 这条规则就靠它。
 */
export const SERVER_INSTRUCTIONS = `通过本服务可以把文章发到微信公众号。

工作流：建草稿 → （人工或直接）发布 → 查发布状态。发布后的文章公开可访问，但**不会推送给粉丝**（群发接口本服务不提供）。

**正文格式**：wechat_create_draft 的 content 必须是 HTML，不是 Markdown——传 Markdown 进去，读者看到的就是字面的 ## 和 ** 符号。微信只认内联样式：
- 样式写成元素上的 style="..."，class 和 <style> 标签会被微信剥掉
- script / iframe / 表单标签会被剥离
- 正文里的外链 <a> 在公众号内不可点击，需要外链请用 content_source_url（阅读原文）

**图片必须走 Bash 上传，不能作为工具参数传输**（图片数据无法由模型生成）。三步：
1. 调 wechat_create_upload_url，purpose 传 "cover"（封面）或 "content"（正文图）
2. 用 Bash 执行返回的 curl_example，把本地图片文件传上去，响应形如 {"ref":"..."}
3. 封面把 ref（wxmedia:xxx）传给 cover 参数；正文图把 ref（图片地址）填进 <img src>

封面是微信的必填项，没有封面建不了草稿。如果图片本来就有公网地址，也可以直接把地址填给 cover 或 <img src>，服务端会代为转投微信。`;

export type JsonRpcRequest = { jsonrpc?: string; id?: string | number | null; method?: string; params?: unknown };

const requestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.unknown().optional(),
});

export type JsonRpcResponse = { jsonrpc: "2.0"; id: string | number | null; result?: unknown; error?: { code: number; message: string } };

function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function fail(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** 工具执行失败要返回 isError 结果而不是 JSON-RPC error，这样模型能读到错误文本并自行纠正。 */
function toolError(id: string | number | null, message: string): JsonRpcResponse {
  return ok(id, { content: [{ type: "text", text: message }], isError: true });
}

function describeToolFailure(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `参数不合法：${error.issues.map((issue) => `${issue.path.join(".") || "(根)"} ${issue.message}`).join("；")}`;
  }
  if (error instanceof WechatApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "工具执行失败";
}

/**
 * 处理单条 JSON-RPC 消息。返回 null 表示这是通知（没有 id），HTTP 层应答 202 空响应。
 */
export async function handleMessage(message: unknown, context: { origin: string }): Promise<JsonRpcResponse | null> {
  const parsed = requestSchema.safeParse(message);
  if (!parsed.success) {
    const id = (message as JsonRpcRequest | null)?.id ?? null;
    return fail(typeof id === "string" || typeof id === "number" ? id : null, -32600, "Invalid Request");
  }

  const { id, method, params } = parsed.data;
  const isNotification = id === undefined;
  const responseId = id ?? null;

  switch (method) {
    case "initialize": {
      const requested = (params as { protocolVersion?: string } | undefined)?.protocolVersion;
      return ok(responseId, {
        protocolVersion: requested && SUPPORTED_PROTOCOL_VERSIONS.has(requested) ? requested : DEFAULT_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions: SERVER_INSTRUCTIONS,
      });
    }
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;
    case "ping":
      return isNotification ? null : ok(responseId, {});
    case "tools/list":
      return ok(responseId, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const call = z.object({ name: z.string(), arguments: z.unknown().optional() }).safeParse(params);
      if (!call.success) return fail(responseId, -32602, "Invalid params");

      const tool = TOOLS_BY_NAME.get(call.data.name);
      if (!tool) return fail(responseId, -32602, `Unknown tool: ${call.data.name}`);

      const startedAt = Date.now();
      try {
        const result = await tool.handler(call.data.arguments ?? {}, context);
        console.log(`[mcp] ${tool.name} ok ${Date.now() - startedAt}ms`);
        return ok(responseId, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: false });
      } catch (error) {
        const message = describeToolFailure(error);
        const errcode = error instanceof WechatApiError ? ` errcode=${error.errcode}` : "";
        console.error(`[mcp] ${tool.name} failed ${Date.now() - startedAt}ms${errcode}: ${message}`);
        return toolError(responseId, message);
      }
    }
    default:
      return isNotification ? null : fail(responseId, -32601, `Method not found: ${method}`);
  }
}
