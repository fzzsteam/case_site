import "server-only";
import { getOssClient } from "./client";
import { validateMediaPath } from "./path";

export async function getSignedVideoUrl(path: string, expires = 900) {
  return getOssClient().signatureUrl(validateMediaPath(path), {
    expires,
    response: { "content-disposition": "inline" },
  });
}
export async function getPrivateImage(path: string) {
  const safePath = validateMediaPath(path);
  const result = await getOssClient().get(safePath);
  const headers = result.res.headers as Record<string, unknown>;
  const contentType = String(headers["content-type"] || "application/octet-stream");
  return { body: result.content, contentType };
}
