import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export type UploadPurpose = "cover" | "content";

export const UPLOAD_URL_TTL_MS = 10 * 60 * 1000;

function sign(purpose: UploadPurpose, expiresAt: number): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 未配置，无法签发上传地址");
  return createHmac("sha256", secret).update(`${purpose}.${expiresAt}`).digest("base64url");
}

export function buildUploadUrl(origin: string, purpose: UploadPurpose): { url: string; expiresAt: number } {
  const expiresAt = Date.now() + UPLOAD_URL_TTL_MS;
  const url = new URL("/api/mcp/upload", origin);
  url.searchParams.set("purpose", purpose);
  url.searchParams.set("exp", String(expiresAt));
  url.searchParams.set("sig", sign(purpose, expiresAt));
  return { url: url.toString(), expiresAt };
}

/**
 * 校验上传地址的签名与有效期。
 * 注意：这里不做一次性核销——那需要跨实例共享已用 nonce，SAE 多副本下不可靠。
 * 10 分钟有效期 + 地址只在 agent 手里，风险敞口是可接受的。
 */
export function verifyUploadUrl(params: URLSearchParams): { purpose: UploadPurpose } | null {
  const purpose = params.get("purpose");
  const exp = Number(params.get("exp"));
  const sig = params.get("sig");
  if ((purpose !== "cover" && purpose !== "content") || !Number.isFinite(exp) || !sig) return null;
  if (exp < Date.now()) return null;

  const expected = Buffer.from(sign(purpose, exp));
  const provided = Buffer.from(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  return { purpose };
}
