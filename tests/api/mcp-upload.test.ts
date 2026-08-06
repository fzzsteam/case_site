// @vitest-environment node
// jsdom 的 FormData/Request 组合无法被 undici 正确解析成 multipart，而这个路由的全部意义
// 就是收 multipart 文件，必须在 node 环境下测才有意义。
import { POST } from "@/app/api/mcp/upload/route";
import { buildUploadUrl } from "@/lib/mcp/upload-signature";
import { uploadContentImage, uploadThumbMaterial } from "@/lib/wechat/media";

vi.mock("@/lib/wechat/media", () => ({ uploadContentImage: vi.fn(), uploadThumbMaterial: vi.fn() }));

function uploadRequest(url: string, form: FormData) {
  return new Request(url, { method: "POST", body: form });
}

function formWith(fileName: string, bytes: number[]) {
  const form = new FormData();
  form.append("file", new File([new Uint8Array(bytes)], fileName, { type: "image/png" }));
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SESSION_SECRET = "test-secret";
  vi.mocked(uploadThumbMaterial).mockResolvedValue("thumb-1");
  vi.mocked(uploadContentImage).mockResolvedValue("https://mmbiz.qpic.cn/x");
});

it("封面上传直接转投微信并返回 wxmedia 句柄", async () => {
  const { url } = buildUploadUrl("http://localhost:3000", "cover");

  const response = await POST(uploadRequest(url, formWith("cover.png", [1, 2, 3])));

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ ref: "wxmedia:thumb-1", purpose: "cover", bytes: 3 });
});

it("正文图上传返回可直接填进 img src 的微信地址", async () => {
  const { url } = buildUploadUrl("http://localhost:3000", "content");

  const response = await POST(uploadRequest(url, formWith("a.png", [1])));

  expect(await response.json()).toMatchObject({ ref: "https://mmbiz.qpic.cn/x", purpose: "content" });
  expect(uploadThumbMaterial).not.toHaveBeenCalled();
});

it("签名无效时返回 401 并提示重新获取地址", async () => {
  const response = await POST(uploadRequest("http://localhost:3000/api/mcp/upload?purpose=cover&exp=9999999999999&sig=fake", formWith("a.png", [1])));

  expect(response.status).toBe(401);
  expect((await response.json()).error).toContain("wechat_create_upload_url");
  expect(uploadThumbMaterial).not.toHaveBeenCalled();
});

it("字段名写错时明确告诉调用方正确的 curl 写法", async () => {
  const { url } = buildUploadUrl("http://localhost:3000", "cover");
  const form = new FormData();
  form.append("image", new File([new Uint8Array([1])], "a.png"));

  const response = await POST(uploadRequest(url, form));

  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain("file=@");
});

it("空文件被拦截，不浪费一次微信调用", async () => {
  const { url } = buildUploadUrl("http://localhost:3000", "cover");

  const response = await POST(uploadRequest(url, formWith("a.png", [])));

  expect(response.status).toBe(400);
  expect(uploadThumbMaterial).not.toHaveBeenCalled();
});

it("微信侧失败时把原因原样透出给调用方", async () => {
  vi.mocked(uploadContentImage).mockRejectedValue(new Error("正文内嵌图片不能超过 1MB，当前 2.30MB。请压缩后重试。"));
  const { url } = buildUploadUrl("http://localhost:3000", "content");

  const response = await POST(uploadRequest(url, formWith("big.png", [1])));

  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain("不能超过 1MB");
});
