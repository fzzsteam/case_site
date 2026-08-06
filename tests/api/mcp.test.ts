import { GET, POST } from "@/app/api/mcp/route";
import { verifyToken } from "@/lib/mcp/tokens";
import { handleMessage } from "@/lib/mcp/protocol";

vi.mock("@/lib/mcp/tokens", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/mcp/tokens")>()),
  verifyToken: vi.fn(),
}));
vi.mock("@/lib/mcp/protocol", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/mcp/protocol")>()),
  handleMessage: vi.fn(),
}));

const VALID_TOKEN = "mcpat_valid";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://internal.local/api/mcp", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
}

function authorized(body: unknown) {
  return request(body, { Authorization: `Bearer ${VALID_TOKEN}` });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://video.example.com";
  vi.mocked(verifyToken).mockImplementation(async (raw) => (raw === VALID_TOKEN ? { id: "t1", name: "n", token: VALID_TOKEN, createdAt: new Date(), lastUsedAt: null } : null));
  vi.mocked(handleMessage).mockResolvedValue({ jsonrpc: "2.0", id: 1, result: {} });
});

it("没有 Authorization 头时返回 401", async () => {
  const response = await POST(request({ jsonrpc: "2.0", id: 1, method: "ping" }));

  expect(response.status).toBe(401);
  expect(handleMessage).not.toHaveBeenCalled();
});

it("token 不正确时返回 401，且不泄露任何细节", async () => {
  const response = await POST(request({ jsonrpc: "2.0", id: 1, method: "ping" }, { Authorization: "Bearer mcpat_wrong" }));

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ error: "Unauthorized" });
});

it("token 正确时转交协议层处理", async () => {
  const response = await POST(authorized({ jsonrpc: "2.0", id: 1, method: "ping" }));

  expect(response.status).toBe(200);
  expect(handleMessage).toHaveBeenCalledWith({ jsonrpc: "2.0", id: 1, method: "ping" }, { origin: "https://video.example.com" });
});

it("上传地址用对外站点域名而不是网关后面的内网地址", async () => {
  await POST(authorized({ jsonrpc: "2.0", id: 1, method: "ping" }));
  expect(vi.mocked(handleMessage).mock.calls[0][1]).toEqual({ origin: "https://video.example.com" });
});

it("协议层返回 null（通知）时应答 202 且无响应体", async () => {
  vi.mocked(handleMessage).mockResolvedValue(null);

  const response = await POST(authorized({ jsonrpc: "2.0", method: "notifications/initialized" }));

  expect(response.status).toBe(202);
  expect(await response.text()).toBe("");
});

it("请求体不是合法 JSON 时返回 -32700", async () => {
  const response = await POST(request("not json", { Authorization: `Bearer ${VALID_TOKEN}` }));

  expect(response.status).toBe(400);
  expect((await response.json()).error.code).toBe(-32700);
});

it("拒绝 JSON-RPC 批量请求", async () => {
  const response = await POST(authorized([{ jsonrpc: "2.0", id: 1, method: "ping" }]));

  expect(response.status).toBe(400);
  expect(handleMessage).not.toHaveBeenCalled();
});

it("GET 返回 405，本服务不提供 SSE 流", () => {
  expect(GET().status).toBe(405);
});
