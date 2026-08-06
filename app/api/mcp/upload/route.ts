import { COVER_HANDLE_PREFIX } from "@/lib/mcp/refs";
import { verifyUploadUrl } from "@/lib/mcp/upload-signature";
import { uploadContentImage, uploadThumbMaterial } from "@/lib/wechat/media";
import { WechatApiError } from "@/lib/wechat/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 图片上传旁路。模型无法把图片字节写进工具参数，所以本地文件走这里：
 * agent 用 Bash 执行 curl，文件经 HTTP body 上传，完全不经过模型 context。
 * 收到文件后立刻转投微信，返回自描述的 ref——服务端不留任何临时状态，
 * 多副本部署下也不会出现"上传打到 A 实例、建草稿打到 B 实例"的问题。
 */
export async function POST(request: Request) {
  const verified = verifyUploadUrl(new URL(request.url).searchParams);
  if (!verified) return Response.json({ error: "上传地址无效或已过期，请重新调用 wechat_create_upload_url 获取。" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "请求体不是 multipart/form-data。请使用 curl -F \"file=@/路径/图片.png\" 上传。" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "缺少文件字段。字段名必须是 file，例如 curl -F \"file=@/路径/图片.png\"。" }, { status: 400 });
  }

  const image = { bytes: new Uint8Array(await file.arrayBuffer()), fileName: file.name || "image", contentType: file.type || "application/octet-stream" };
  if (image.bytes.byteLength === 0) return Response.json({ error: "上传的文件是空的，请检查本地路径是否正确。" }, { status: 400 });

  const startedAt = Date.now();
  try {
    const ref = verified.purpose === "cover" ? COVER_HANDLE_PREFIX + (await uploadThumbMaterial(image)) : await uploadContentImage(image);
    console.log(`[mcp] upload ${verified.purpose} ok ${image.bytes.byteLength}B ${Date.now() - startedAt}ms`);
    return Response.json({
      ref,
      purpose: verified.purpose,
      bytes: image.bytes.byteLength,
      next_step: verified.purpose === "cover" ? "把 ref 传给 wechat_create_draft 的 cover 参数。" : "把 ref 填进正文 HTML 的 <img src>。",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    const errcode = error instanceof WechatApiError ? ` errcode=${error.errcode}` : "";
    console.error(`[mcp] upload ${verified.purpose} failed ${Date.now() - startedAt}ms${errcode}: ${message}`);
    return Response.json({ error: message }, { status: 400 });
  }
}
