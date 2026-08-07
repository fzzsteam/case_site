import "server-only";
import { getWechatConfig } from "./config";
import { TOKEN_INVALID_ERRCODES, WechatApiError } from "./errors";

const API_BASE = "https://api.weixin.qq.com";
/** 提前 5 分钟过期，避免临界点上用到一个刚好失效的 token。 */
const EXPIRY_SKEW_MS = 5 * 60 * 1000;

type CachedToken = { token: string; expiresAt: number };

let cached: CachedToken | undefined;
/** 冷启动时并发请求会同时来取 token，用 in-flight Promise 去重，只真正调一次微信。 */
let inFlight: Promise<CachedToken> | undefined;

export function resetAccessTokenCache(): void {
  cached = undefined;
  inFlight = undefined;
}

/**
 * 用稳定版接口取 access_token。它在有效期内重复调用返回同一个 token，不会让上一个失效，
 * 因此多个实例各自在内存里缓存也不会互相顶掉——这正是不用传统 cgi-bin/token 的原因。
 */
async function fetchStableToken(forceRefresh: boolean): Promise<CachedToken> {
  const { appId, appSecret } = getWechatConfig();
  const response = await fetch(`${API_BASE}/cgi-bin/stable_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credential", appid: appId, secret: appSecret, force_refresh: forceRefresh }),
  });
  const data = (await response.json()) as { access_token?: string; expires_in?: number; errcode?: number; errmsg?: string };
  if (!data.access_token) throw new WechatApiError(data.errcode ?? -1, data.errmsg ?? "获取 access_token 失败");
  return { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - EXPIRY_SKEW_MS };
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.token;
  if (!forceRefresh && inFlight) return (await inFlight).token;

  const pending = fetchStableToken(forceRefresh);
  if (!forceRefresh) inFlight = pending;
  try {
    cached = await pending;
    return cached.token;
  } finally {
    if (inFlight === pending) inFlight = undefined;
  }
}

/** 微信部分接口返回 Content-Type: text/plain，不能直接用 response.json()。 */
async function parseBody<T>(response: Response): Promise<T & { errcode?: number; errmsg?: string }> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T & { errcode?: number; errmsg?: string };
  } catch {
    throw new Error(`微信接口返回了无法解析的内容：${text.slice(0, 200)}`);
  }
}

async function request<T>(path: string, build: (token: string) => RequestInit, attempt = 0): Promise<T> {
  const token = await getAccessToken(attempt > 0);
  const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
  const data = await parseBody<T>(await fetch(url, build(token)));

  if (typeof data.errcode === "number" && data.errcode !== 0) {
    // token 可能被别处顶掉或后台重置过 AppSecret，强制刷新后重试一次再放弃。
    if (attempt === 0 && TOKEN_INVALID_ERRCODES.has(data.errcode)) return request<T>(path, build, attempt + 1);
    throw new WechatApiError(data.errcode, data.errmsg ?? "");
  }
  return data as T;
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, () => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

export function getJson<T>(path: string): Promise<T> {
  return request<T>(path, () => ({ method: "GET" }));
}

export function postForm<T>(path: string, buildForm: () => FormData): Promise<T> {
  return request<T>(path, () => ({ method: "POST", body: buildForm() }));
}
