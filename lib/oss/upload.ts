import "server-only";
import { randomUUID } from "node:crypto";
import { getOssClient } from "./client";

const UPLOAD_PREFIX = "case-site/cases/uploads/";

const ALLOWED_EXTENSIONS = {
  cover: { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" },
  video: { ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm" },
} as const;

export type UploadKind = keyof typeof ALLOWED_EXTENSIONS;

function getExtension(fileName: string): string {
  const match = /\.[a-zA-Z0-9]+$/.exec(fileName);
  return match ? match[0].toLowerCase() : "";
}

function sanitizeBaseName(base: string): string {
  const safe = base.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe.slice(-60) || "file";
}

export function prepareUpload(kind: UploadKind, fileName: string): { objectPath: string; contentType: string } {
  const extension = getExtension(fileName);
  const contentType = (ALLOWED_EXTENSIONS[kind] as Record<string, string>)[extension];
  if (!contentType) throw new Error("Unsupported file type");
  const base = sanitizeBaseName(fileName.slice(0, fileName.length - extension.length));
  const objectPath = `${UPLOAD_PREFIX}${randomUUID().slice(0, 8)}-${base}${extension}`;
  return { objectPath, contentType };
}

export async function getSignedUploadUrl(objectPath: string, contentType: string, expires = 900): Promise<string> {
  return getOssClient().signatureUrl(objectPath, { method: "PUT", expires, "Content-Type": contentType });
}
