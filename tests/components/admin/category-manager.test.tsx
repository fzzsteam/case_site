import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CategoryManager } from "@/components/admin/category-manager";
import { ToastProvider } from "@/components/admin/toast";
import type { Category } from "@/lib/cases/types";

const sampleCategories: Category[] = [
  { id: "c1", name: "宣传片", sortOrder: 0 },
  { id: "c2", name: "短剧", sortOrder: 1 },
];

function renderManager() {
  return render(<ToastProvider><CategoryManager /></ToastProvider>);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/admin/categories" && (!init || init.method === undefined)) return { ok: true, json: async () => ({ categories: sampleCategories }) };
    if (url === "/api/admin/categories" && init?.method === "POST") {
      const body = JSON.parse(init.body as string);
      return { ok: true, status: 201, json: async () => ({ category: { id: "c3", name: body.name, sortOrder: 2 } }) };
    }
    if (url === "/api/admin/categories/c1" && init?.method === "PATCH") return { ok: true, status: 200, json: async () => ({ ok: true }) };
    if (url === "/api/admin/categories/c1" && init?.method === "DELETE") return { ok: true, status: 200, json: async () => ({ ok: true }) };
    return { ok: false, status: 500, json: async () => ({ error: "unexpected" }) };
  }));
});

afterEach(() => vi.unstubAllGlobals());

it("loads and displays categories", async () => {
  renderManager();
  expect(await screen.findByText("宣传片")).toBeInTheDocument();
  expect(screen.getByText("短剧")).toBeInTheDocument();
});

it("creates a new category", async () => {
  renderManager();
  await screen.findByText("宣传片");
  fireEvent.change(screen.getByPlaceholderText("新分类名称"), { target: { value: "纪录片" } });
  fireEvent.click(screen.getByRole("button", { name: "添加分类" }));
  expect(await screen.findByText("纪录片")).toBeInTheDocument();
});

it("renames a category", async () => {
  renderManager();
  await screen.findByText("宣传片");
  fireEvent.click(screen.getByRole("button", { name: "重命名宣传片" }));
  const input = screen.getByDisplayValue("宣传片");
  fireEvent.change(input, { target: { value: "品牌宣传" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  await waitFor(() => expect(screen.getByText("品牌宣传")).toBeInTheDocument());
});

it("asks for confirmation before deleting a category", async () => {
  renderManager();
  await screen.findByText("宣传片");
  fireEvent.click(screen.getByRole("button", { name: "删除宣传片" }));
  expect(screen.getByText(/确定要删除「宣传片」吗/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "删除" }));
  await waitFor(() => expect(screen.queryByText("宣传片")).not.toBeInTheDocument());
});
