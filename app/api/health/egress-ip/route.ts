import { extractBearerToken, verifyToken } from "@/lib/mcp/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 回显本服务访问公网时的出口 IP —— 微信的 IP 白名单校验的正是这个地址（不是域名解析到的入站 IP）。
 * 部署后连打几次确认它恒定，再把结果填进公众号后台的 IP 白名单。
 */
const ECHO_ENDPOINTS = ["https://myip.ipip.net", "https://api.ipify.org", "https://ipinfo.io/ip"];
const IPV4_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

async function probe(endpoint: string): Promise<string | null> {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!response.ok) return null;
    return IPV4_PATTERN.exec(await response.text())?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  if (!(await verifyToken(extractBearerToken(request.headers.get("authorization"))))) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }

  for (const endpoint of ECHO_ENDPOINTS) {
    const ip = await probe(endpoint);
    if (ip) return Response.json({ egressIp: ip, source: endpoint, checkedAt: new Date().toISOString() });
  }
  return Response.json({ error: "所有回显服务都不可达，服务器可能没有公网出口" }, { status: 502 });
}
