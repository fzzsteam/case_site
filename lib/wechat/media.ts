import "server-only";
import { postForm } from "./client";

/** 正文内嵌图片：微信限制 1MB，且只收 jpg/png。 */
const CONTENT_IMAGE_MAX_BYTES = 1024 * 1024;
/** 永久素材图片（用作封面）：微信限制 10MB。 */
const MATERIAL_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const REMOTE_FETCH_MAX_BYTES = MATERIAL_IMAGE_MAX_BYTES;

export type ImageFile = { bytes: Uint8Array; fileName: string; contentType: string };

type SniffedFormat = { extension: string; contentType: string } | null;

/** 文件名和 Content-Type 都由调用方给，不可信；按魔数判断真实格式。 */
function sniffImageFormat(bytes: Uint8Array): SniffedFormat {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (startsWith(0xff, 0xd8, 0xff)) return { extension: "jpg", contentType: "image/jpeg" };
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return { extension: "png", contentType: "image/png" };
  if (startsWith(0x47, 0x49, 0x46)) return { extension: "gif", contentType: "image/gif" };
  if (startsWith(0x42, 0x4d)) return { extension: "bmp", contentType: "image/bmp" };
  return null;
}

function describeUnsupported(bytes: Uint8Array): string {
  const isWebp =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (isWebp) return "这是一张 webp 图片，微信不支持。请先转成 jpg 或 png 再上传（AI 生成的图常常是 webp，注意检查）。";
  return "无法识别的图片格式。微信只接受 jpg / png / gif / bmp。";
}

function toFormData(file: ImageFile, extension: string, contentType: string): FormData {
  const form = new FormData();
  // 微信按上传文件名的扩展名做二次校验，用嗅探出的真实扩展名兜底。
  const baseName = file.fileName.replace(/\.[^.]*$/, "") || "image";
  const buffer = file.bytes.buffer.slice(file.bytes.byteOffset, file.bytes.byteOffset + file.bytes.byteLength) as ArrayBuffer;
  form.append("media", new Blob([buffer], { type: contentType }), `${baseName}.${extension}`);
  return form;
}

/** 上传正文内嵌图片，返回 mp.weixin.qq.com 域名的图片 URL。不占用永久素材配额。 */
export async function uploadContentImage(file: ImageFile): Promise<string> {
  const format = sniffImageFormat(file.bytes);
  if (!format) throw new Error(describeUnsupported(file.bytes));
  if (format.extension !== "jpg" && format.extension !== "png") {
    throw new Error(`正文内嵌图片只支持 jpg 和 png，当前是 ${format.extension}。请转换格式后重试。`);
  }
  if (file.bytes.byteLength > CONTENT_IMAGE_MAX_BYTES) {
    throw new Error(`正文内嵌图片不能超过 1MB，当前 ${(file.bytes.byteLength / 1024 / 1024).toFixed(2)}MB。请压缩后重试。`);
  }
  const data = await postForm<{ url: string }>("/cgi-bin/media/uploadimg", () => toFormData(file, format.extension, format.contentType));
  return data.url;
}

/** 上传为永久素材，返回 media_id，用作草稿的封面 thumb_media_id。 */
export async function uploadThumbMaterial(file: ImageFile): Promise<string> {
  const format = sniffImageFormat(file.bytes);
  if (!format) throw new Error(describeUnsupported(file.bytes));
  if (file.bytes.byteLength > MATERIAL_IMAGE_MAX_BYTES) {
    throw new Error(`封面图不能超过 10MB，当前 ${(file.bytes.byteLength / 1024 / 1024).toFixed(2)}MB。请压缩后重试。`);
  }
  const data = await postForm<{ media_id: string }>("/cgi-bin/material/add_material?type=image", () =>
    toFormData(file, format.extension, format.contentType),
  );
  return data.media_id;
}

export async function fetchRemoteImage(url: string): Promise<ImageFile> {
  let response: Response;
  try {
    response = await fetch(url, { redirect: "follow" });
  } catch {
    throw new Error(`无法访问图片地址 ${url}，请确认它是公网可访问的。`);
  }
  if (!response.ok) throw new Error(`拉取图片失败（HTTP ${response.status}）：${url}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > REMOTE_FETCH_MAX_BYTES) throw new Error(`图片过大（超过 10MB）：${url}`);
  if (bytes.byteLength === 0) throw new Error(`图片内容为空：${url}`);

  const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop() || "image");
  return { bytes, fileName, contentType: response.headers.get("content-type") ?? "application/octet-stream" };
}
