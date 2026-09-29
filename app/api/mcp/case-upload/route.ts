import { Readable, Transform } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { verifyCaseUploadUrl } from "@/lib/mcp/case-upload-signature";
import { getOssClient } from "@/lib/oss/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const verified = verifyCaseUploadUrl(new URL(request.url).searchParams);
  if (!verified) return Response.json({ error: "上传地址无效或已过期，请重新调用 case_create_upload_url。" }, { status: 401 });

  if ((request.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase() !== verified.contentType) {
    return Response.json({ error: "Content-Type 与上传地址不匹配，请使用 case_create_upload_url 返回的 content_type。" }, { status: 400 });
  }
  if (!request.body) return Response.json({ error: "缺少文件内容。请使用 curl --upload-file 上传本地文件。" }, { status: 400 });

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader === null ? undefined : Number(contentLengthHeader);
  if (contentLengthHeader !== null && (!Number.isSafeInteger(contentLength) || (contentLength ?? 0) <= 0)) {
    return Response.json({ error: "文件内容为空或长度无效。" }, { status: 400 });
  }

  const source = Readable.fromWeb(request.body as unknown as NodeReadableStream<Uint8Array>);
  let uploadedBytes = 0;
  const countingStream = new Transform({
    transform(chunk: Uint8Array, _encoding, callback) {
      uploadedBytes += chunk.byteLength;
      callback(null, chunk);
    },
    flush(callback) {
      if (uploadedBytes === 0) callback(new Error("Empty upload"));
      else callback();
    },
  });
  source.on("error", (error) => countingStream.destroy(error));
  const body = source.pipe(countingStream);

  const startedAt = Date.now();
  try {
    const oss = getOssClient();
    await oss.putStream(verified.objectPath, body, {
      contentLength,
      timeout: 60 * 60 * 1000,
      mime: verified.contentType,
      meta: {},
      callback: undefined,
    } as unknown as Parameters<typeof oss.putStream>[2]);
    console.log(`[mcp] case upload ok ${uploadedBytes}B ${Date.now() - startedAt}ms`);
    return Response.json({ object_path: verified.objectPath, bytes: uploadedBytes }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    source.destroy(error instanceof Error ? error : undefined);
    countingStream.destroy(error instanceof Error ? error : undefined);
    const message = error instanceof Error ? error.message : "上传失败";
    console.error(`[mcp] case upload failed ${Date.now() - startedAt}ms: ${message}`);
    return Response.json({ error: "文件上传到对象存储失败，请确认文件完整后重试。" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
