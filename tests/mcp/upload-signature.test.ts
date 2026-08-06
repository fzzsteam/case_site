import { buildUploadUrl, verifyUploadUrl } from "@/lib/mcp/upload-signature";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-secret";
});

function paramsOf(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

it("签发的上传地址能通过校验并带回 purpose", () => {
  const { url } = buildUploadUrl("https://example.com", "cover");
  expect(url).toContain("/api/mcp/upload");
  expect(verifyUploadUrl(paramsOf(url))).toEqual({ purpose: "cover" });
});

it("篡改签名会被拒绝", () => {
  const { url } = buildUploadUrl("https://example.com", "content");
  const params = paramsOf(url);
  params.set("sig", "tampered");
  expect(verifyUploadUrl(params)).toBeNull();
});

it("篡改 purpose 会被拒绝（签名覆盖了 purpose）", () => {
  const { url } = buildUploadUrl("https://example.com", "content");
  const params = paramsOf(url);
  params.set("purpose", "cover");
  expect(verifyUploadUrl(params)).toBeNull();
});

it("延长有效期会被拒绝（签名覆盖了 exp）", () => {
  const { url } = buildUploadUrl("https://example.com", "cover");
  const params = paramsOf(url);
  params.set("exp", String(Date.now() + 86_400_000));
  expect(verifyUploadUrl(params)).toBeNull();
});

it("过期的地址会被拒绝", () => {
  const { url } = buildUploadUrl("https://example.com", "cover");
  const params = paramsOf(url);
  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    vi.setSystemTime(new Date(Date.now() + 11 * 60 * 1000));
    expect(verifyUploadUrl(params)).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});

it("换一个 SESSION_SECRET 后旧地址失效", () => {
  const { url } = buildUploadUrl("https://example.com", "cover");
  process.env.SESSION_SECRET = "rotated-secret";
  expect(verifyUploadUrl(paramsOf(url))).toBeNull();
});

it("缺少参数直接判为无效", () => {
  expect(verifyUploadUrl(new URLSearchParams())).toBeNull();
});
