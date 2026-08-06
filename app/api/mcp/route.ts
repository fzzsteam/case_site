import { handleMessage } from "@/lib/mcp/protocol";
import { extractBearerToken, verifyToken } from "@/lib/mcp/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAUTHORIZED = { error: "Unauthorized" };

/** 服务部署在网关后面，request.url 里是内网地址，对外地址以站点配置为准。 */
function resolveOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
}

export async function POST(request: Request) {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!(await verifyToken(token))) {
    return Response.json(UNAUTHORIZED, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }

  let message: unknown;
  try {
    message = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  // MCP 2025-06-18 起不再支持 JSON-RPC 批量请求。
  if (Array.isArray(message)) {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Batch requests are not supported" } }, { status: 400 });
  }

  const response = await handleMessage(message, { origin: resolveOrigin(request) });
  if (!response) return new Response(null, { status: 202 });
  return Response.json(response);
}

/** 只支持无状态的 POST，不提供 SSE 流。 */
export function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405, headers: { Allow: "POST" } });
}
