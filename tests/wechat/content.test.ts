import { rewriteContentImages } from "@/lib/wechat/content";
import { fetchRemoteImage, uploadContentImage } from "@/lib/wechat/media";

vi.mock("@/lib/wechat/media", () => ({
  fetchRemoteImage: vi.fn(),
  uploadContentImage: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchRemoteImage).mockImplementation(async (url: string) => ({ bytes: new Uint8Array([1]), fileName: url, contentType: "image/png" }));
  let counter = 0;
  vi.mocked(uploadContentImage).mockImplementation(async () => `https://mmbiz.qpic.cn/uploaded-${++counter}`);
});

it("把外链图片转投微信并回填地址", async () => {
  const { html, uploadedCount } = await rewriteContentImages('<p>正文</p><img src="https://cdn.example.com/a.png" alt="图">');

  expect(html).toBe('<p>正文</p><img src="https://mmbiz.qpic.cn/uploaded-1" alt="图">');
  expect(uploadedCount).toBe(1);
});

it("已经是微信域名的图片保持不动", async () => {
  const html = '<img src="https://mmbiz.qpic.cn/existing/0">';
  const result = await rewriteContentImages(html);

  expect(result.html).toBe(html);
  expect(result.uploadedCount).toBe(0);
  expect(uploadContentImage).not.toHaveBeenCalled();
});

it("同一张图出现多次只上传一次", async () => {
  const { html, uploadedCount } = await rewriteContentImages('<img src="https://cdn.example.com/a.png"><img src="https://cdn.example.com/a.png">');

  expect(html).toBe('<img src="https://mmbiz.qpic.cn/uploaded-1"><img src="https://mmbiz.qpic.cn/uploaded-1">');
  expect(uploadedCount).toBe(1);
  expect(uploadContentImage).toHaveBeenCalledTimes(1);
});

it("除 img 的 src 外不改动 HTML 的任何内容", async () => {
  const input = `<h2 style="font-size:19px">标题</h2><p style='line-height:1.8'>正文<strong>加粗</strong></p><img class="pic" src="https://cdn.example.com/a.png" width="100">`;
  const { html } = await rewriteContentImages(input);

  expect(html).toBe(input.replace("https://cdn.example.com/a.png", "https://mmbiz.qpic.cn/uploaded-1"));
});

it("支持单引号包裹的 src", async () => {
  const { html } = await rewriteContentImages("<img src='https://cdn.example.com/a.png'>");
  expect(html).toBe("<img src='https://mmbiz.qpic.cn/uploaded-1'>");
});

it("本地路径给出引导性报错而不是含糊的参数错误", async () => {
  await expect(rewriteContentImages('<img src="./cover.png">')).rejects.toThrow(/wechat_create_upload_url/);
});

it("误把封面句柄写进正文时明确指出用错了", async () => {
  await expect(rewriteContentImages('<img src="wxmedia:abc">')).rejects.toThrow(/封面专用/);
});

it("data: 内联图片被拒绝并给出替代做法", async () => {
  await expect(rewriteContentImages('<img src="data:image/png;base64,AAAA">')).rejects.toThrow(/curl/);
});

it("没有图片时原样返回", async () => {
  const { html, uploadedCount } = await rewriteContentImages("<p>纯文字</p>");
  expect(html).toBe("<p>纯文字</p>");
  expect(uploadedCount).toBe(0);
});
