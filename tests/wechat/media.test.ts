import { uploadContentImage, uploadThumbMaterial, type ImageFile } from "@/lib/wechat/media";
import { postForm } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postForm: vi.fn() }));

const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47];
const JPEG_HEADER = [0xff, 0xd8, 0xff];
const GIF_HEADER = [0x47, 0x49, 0x46];
const WEBP_HEADER = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];

function imageOf(header: number[], totalBytes = header.length, fileName = "image.png"): ImageFile {
  const bytes = new Uint8Array(totalBytes);
  bytes.set(header);
  return { bytes, fileName, contentType: "application/octet-stream" };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(postForm).mockResolvedValue({ url: "https://mmbiz.qpic.cn/x", media_id: "media-1" } as never);
});

it("上传正文 png 图片并返回微信域名地址", async () => {
  await expect(uploadContentImage(imageOf(PNG_HEADER))).resolves.toBe("https://mmbiz.qpic.cn/x");
  expect(vi.mocked(postForm).mock.calls[0][0]).toBe("/cgi-bin/media/uploadimg");
});

it("上传封面走永久素材接口并返回 media_id", async () => {
  await expect(uploadThumbMaterial(imageOf(JPEG_HEADER))).resolves.toBe("media-1");
  expect(vi.mocked(postForm).mock.calls[0][0]).toContain("/cgi-bin/material/add_material");
});

it("按魔数而不是文件名判断格式，纠正错误的扩展名", async () => {
  await uploadContentImage(imageOf(JPEG_HEADER, JPEG_HEADER.length, "看起来像.png"));
  const form = vi.mocked(postForm).mock.calls[0][1]() as FormData;
  expect((form.get("media") as File).name).toBe("看起来像.jpg");
});

it("webp 图片给出明确的转换提示", async () => {
  await expect(uploadContentImage(imageOf(WEBP_HEADER))).rejects.toThrow(/webp/);
  expect(postForm).not.toHaveBeenCalled();
});

it("正文图不接受 gif，提示只支持 jpg/png", async () => {
  await expect(uploadContentImage(imageOf(GIF_HEADER))).rejects.toThrow(/只支持 jpg 和 png/);
});

it("正文图超过 1MB 时在本地拦截，不浪费一次微信调用", async () => {
  await expect(uploadContentImage(imageOf(PNG_HEADER, 1024 * 1024 + 1))).rejects.toThrow(/不能超过 1MB/);
  expect(postForm).not.toHaveBeenCalled();
});

it("封面超过 10MB 时在本地拦截", async () => {
  await expect(uploadThumbMaterial(imageOf(PNG_HEADER, 10 * 1024 * 1024 + 1))).rejects.toThrow(/不能超过 10MB/);
  expect(postForm).not.toHaveBeenCalled();
});

it("封面接受 gif 等正文图不支持的格式", async () => {
  await expect(uploadThumbMaterial(imageOf(GIF_HEADER))).resolves.toBe("media-1");
});

it("无法识别的格式给出明确报错", async () => {
  await expect(uploadThumbMaterial(imageOf([0x00, 0x01, 0x02, 0x03]))).rejects.toThrow(/无法识别的图片格式/);
});
