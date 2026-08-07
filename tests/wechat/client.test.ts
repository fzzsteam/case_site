import { getAccessToken, getJson, postJson, resetAccessTokenCache } from "@/lib/wechat/client";
import { WechatApiError } from "@/lib/wechat/errors";

const fetchMock = vi.fn();

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  resetAccessTokenCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  process.env.WECHAT_APP_ID = "wx-test";
  process.env.WECHAT_APP_SECRET = "secret-test";
});

afterEach(() => vi.unstubAllGlobals());

it("取一次 token 后复用缓存，不重复请求微信", async () => {
  fetchMock.mockResolvedValue(jsonResponse({ access_token: "token-1", expires_in: 7200 }));

  expect(await getAccessToken()).toBe("token-1");
  expect(await getAccessToken()).toBe("token-1");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toContain("/cgi-bin/stable_token");
});

it("并发取 token 时只真正调用一次微信", async () => {
  fetchMock.mockResolvedValue(jsonResponse({ access_token: "token-1", expires_in: 7200 }));

  const tokens = await Promise.all([getAccessToken(), getAccessToken(), getAccessToken()]);

  expect(tokens).toEqual(["token-1", "token-1", "token-1"]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("缓存提前 5 分钟过期，临界点不会用到失效 token", async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: "token-1", expires_in: 400 }));
  fetchMock.mockResolvedValueOnce(jsonResponse({ access_token: "token-2", expires_in: 7200 }));

  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    expect(await getAccessToken()).toBe("token-1");
    // expires_in 400 秒减去 300 秒安全边界，只剩 100 秒有效。
    vi.setSystemTime(new Date(Date.now() + 101 * 1000));
    expect(await getAccessToken()).toBe("token-2");
  } finally {
    vi.useRealTimers();
  }
});

it("遇到 40001 时强制刷新 token 并重试一次", async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ access_token: "stale", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 40001, errmsg: "invalid credential" }))
    .mockResolvedValueOnce(jsonResponse({ access_token: "fresh", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 0, media_id: "m-1" }));

  await expect(postJson("/cgi-bin/draft/add", {})).resolves.toMatchObject({ media_id: "m-1" });

  const refreshCall = fetchMock.mock.calls[2];
  expect(JSON.parse(refreshCall[1].body as string)).toMatchObject({ force_refresh: true });
});

it("重试后依然 40001 就抛出错误，不无限重试", async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ access_token: "stale", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 40001, errmsg: "invalid credential" }))
    .mockResolvedValueOnce(jsonResponse({ access_token: "still-stale", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 40001, errmsg: "invalid credential" }));

  await expect(postJson("/cgi-bin/draft/add", {})).rejects.toBeInstanceOf(WechatApiError);
  expect(fetchMock).toHaveBeenCalledTimes(4);
});

it("非 token 类错误直接抛出，不触发重试", async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ access_token: "token-1", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 48001, errmsg: "api unauthorized" }));

  await expect(postJson("/cgi-bin/draft/add", {})).rejects.toThrow(/已通过微信认证/);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("解析微信以 text/plain 返回的 JSON", async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ access_token: "token-1", expires_in: 7200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ errcode: 0, url: "https://mmbiz.qpic.cn/x" }), { headers: { "Content-Type": "text/plain" } }));

  await expect(postJson("/cgi-bin/media/uploadimg", {})).resolves.toMatchObject({ url: "https://mmbiz.qpic.cn/x" });
});

it("缺少公众号配置时给出明确报错", async () => {
  delete process.env.WECHAT_APP_SECRET;
  await expect(getAccessToken()).rejects.toThrow(/WECHAT_APP_ID \/ WECHAT_APP_SECRET 未配置/);
});

it("getJson 用 GET 请求并返回解析结果", async () => {
  fetchMock
    .mockResolvedValueOnce(jsonResponse({ access_token: "token-1", expires_in: 7200 }))
    .mockResolvedValueOnce(jsonResponse({ errcode: 0, tags: [{ id: 1, name: "vip", count: 3 }] }));

  await expect(getJson("/cgi-bin/tags/get")).resolves.toMatchObject({ tags: [{ id: 1, name: "vip", count: 3 }] });

  expect(fetchMock.mock.calls[1][0]).toContain("/cgi-bin/tags/get?access_token=token-1");
  expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "GET" });
  expect((fetchMock.mock.calls[1][1] as RequestInit).body).toBeUndefined();
});
