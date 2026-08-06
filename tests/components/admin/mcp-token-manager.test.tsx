import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { McpTokenManager } from "@/components/admin/mcp-token-manager";
import { ToastProvider } from "@/components/admin/toast";

const FULL_TOKEN = "mcpat_abcdefghijklmnopqrstuvwxyz0123456789";
const sampleTokens = [{ id: "t1", name: "我的笔记本", token: FULL_TOKEN, createdAt: "2026-08-01T02:00:00.000Z", lastUsedAt: null }];

const writeText = vi.fn(async () => {});

function renderManager() {
  return render(<ToastProvider><McpTokenManager /></ToastProvider>);
}

beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/admin/mcp-tokens" && (!init || init.method === undefined)) return { ok: true, json: async () => ({ tokens: sampleTokens }) };
    if (url === "/api/admin/mcp-tokens" && init?.method === "POST") {
      const body = JSON.parse(init.body as string);
      return { ok: true, status: 201, json: async () => ({ token: { id: "t2", name: body.name, token: "mcpat_newtoken0123456789", createdAt: "2026-08-06T02:00:00.000Z", lastUsedAt: null } }) };
    }
    if (url === "/api/admin/mcp-tokens/t1" && init?.method === "DELETE") return { ok: true, status: 200, json: async () => ({ ok: true }) };
    return { ok: false, status: 500, json: async () => ({ error: "unexpected" }) };
  }));
});

afterEach(() => vi.unstubAllGlobals());

it("列表默认打码，不直接暴露完整 token", async () => {
  renderManager();
  await screen.findByText("我的笔记本");

  expect(screen.queryByText(FULL_TOKEN)).not.toBeInTheDocument();
  expect(screen.getByText(/^mcpat_abcdef•+6789$/)).toBeInTheDocument();
});

it("点击显示后展开完整 token", async () => {
  renderManager();
  await screen.findByText("我的笔记本");

  fireEvent.click(screen.getByRole("button", { name: "显示 Token" }));

  expect(await screen.findByText(FULL_TOKEN)).toBeInTheDocument();
});

it("从未使用过的 token 显示「从未使用」", async () => {
  renderManager();
  expect(await screen.findByText("最后使用 从未使用")).toBeInTheDocument();
});

it("复制接入命令带上完整的 transport、地址和鉴权头", async () => {
  renderManager();
  await screen.findByText("我的笔记本");

  fireEvent.click(screen.getByRole("button", { name: "复制接入命令" }));

  await waitFor(() => expect(writeText).toHaveBeenCalled());
  const command = writeText.mock.calls[0][0] as unknown as string;
  expect(command).toContain("claude mcp add --transport http wechat");
  expect(command).toContain("/api/mcp");
  expect(command).toContain(`Authorization: Bearer ${FULL_TOKEN}`);
});

it("新建的 token 立即展开，方便当场复制", async () => {
  renderManager();
  await screen.findByText("我的笔记本");

  fireEvent.change(screen.getByPlaceholderText("用途备注，如「我的笔记本」"), { target: { value: "台式机" } });
  fireEvent.click(screen.getByRole("button", { name: "新建 Token" }));

  expect(await screen.findByText("台式机")).toBeInTheDocument();
  expect(screen.getByText("mcpat_newtoken0123456789")).toBeInTheDocument();
});

it("吊销前弹确认框，确认后从列表移除", async () => {
  renderManager();
  await screen.findByText("我的笔记本");

  fireEvent.click(screen.getByRole("button", { name: "吊销我的笔记本" }));
  expect(screen.getByText(/确定要吊销「我的笔记本」吗/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "吊销" }));

  await waitFor(() => expect(screen.queryByText("我的笔记本")).not.toBeInTheDocument());
});

it("没有 token 时给出空状态引导", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ tokens: [] }) })));
  renderManager();

  expect(await screen.findByText("还没有 Token，新建一个才能让 agent 连上来")).toBeInTheDocument();
});
