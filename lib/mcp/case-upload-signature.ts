import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prepareUpload, type UploadKind } from "@/lib/oss/upload";
import { validateMediaPath } from "@/lib/oss/path";

export const CASE_UPLOAD_URL_TTL_SECONDS = 15 * 60;
const CASE_UPLOAD_PREFIX = "case-site/cases/uploads/";
const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);

function sign(objectPath: string, contentType: string, expiresAt: number): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 未配置，无法签发案例上传地址");
  return createHmac("sha256", secret).update(JSON.stringify([objectPath, contentType, expiresAt])).digest("base64url");
}

export function buildCaseUploadUrl(origin: string, kind: UploadKind, fileName: string) {
  const { objectPath, contentType } = prepareUpload(kind, fileName);
  const expiresAt = Date.now() + CASE_UPLOAD_URL_TTL_SECONDS * 1000;
  const url = new URL("/api/mcp/case-upload", origin);
  url.searchParams.set("path", objectPath);
  url.searchParams.set("content_type", contentType);
  url.searchParams.set("exp", String(expiresAt));
  url.searchParams.set("sig", sign(objectPath, contentType, expiresAt));
  return { url: url.toString(), objectPath, contentType, expiresAt };
}

export function verifyCaseUploadUrl(params: URLSearchParams): { objectPath: string; contentType: string } | null {
  const objectPath = params.get("path");
  const contentType = params.get("content_type");
  const expiresAt = Number(params.get("exp"));
  const providedSignature = params.get("sig");
  if (!objectPath || !contentType || !Number.isFinite(expiresAt) || !providedSignature || expiresAt < Date.now()) return null;
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) return null;

  try {
    validateMediaPath(objectPath);
  } catch {
    return null;
  }
  if (!objectPath.startsWith(CASE_UPLOAD_PREFIX)) return null;

  const expected = Buffer.from(sign(objectPath, contentType, expiresAt));
  const provided = Buffer.from(providedSignature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  return { objectPath, contentType };
}
