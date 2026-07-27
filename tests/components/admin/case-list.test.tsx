import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CaseList } from "@/components/admin/case-list";
import { ToastProvider } from "@/components/admin/toast";
import type { CaseStudy, Category } from "@/lib/cases/types";

const sampleCases: CaseStudy[] = [
  { id: "case-1", slug: "an-li-yi", title: "案例一", category: "宣传片", summary: "简介一", detail: "详情一", coverPath: "case-site/cases/uploads/cover1.png", createdAt: new Date("2026-01-01"), episodes: [{ id: "ep-1", videoPath: "case-site/cases/uploads/video1.mp4", orientation: "landscape", durationSeconds: null }] },
  { id: "case-2", slug: "an-li-er", title: "案例二", category: "短剧", summary: "简介二", detail: "详情二", coverPath: "case-site/cases/uploads/cover2.png", createdAt: new Date("2026-01-01"), episodes: [{ id: "ep-2a", videoPath: "case-site/cases/uploads/video2a.mp4", orientation: "portrait", durationSeconds: null }, { id: "ep-2b", videoPath: "case-site/cases/uploads/video2b.mp4", orientation: "landscape", durationSeconds: null }] },
];

const sampleCategories: Category[] = [
  { id: "c1", name: "宣传片", sortOrder: 0 },
  { id: "c2", name: "广告片", sortOrder: 1 },
  { id: "c3", name: "短剧", sortOrder: 2 },
  { id: "c4", name: "IP创造", sortOrder: 3 },
];

function renderCaseList() {
  return render(<ToastProvider><CaseList /></ToastProvider>);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/admin/cases" && (!init || init.method === undefined)) return { ok: true, json: async () => ({ cases: sampleCases }) };
    if (url === "/api/admin/categories" && (!init || init.method === undefined)) return { ok: true, json: async () => ({ categories: sampleCategories }) };
    if (url.startsWith("/api/admin/cases/") && init?.method === "DELETE") return { ok: true, json: async () => ({ ok: true }) };
    if (url === "/api/admin/cases/reorder") return { ok: true, json: async () => ({ ok: true }) };
    return { ok: false, json: async () => ({ error: "unexpected" }) };
  }));
});

afterEach(() => vi.unstubAllGlobals());

it("loads and displays cases with category badges", async () => {
  renderCaseList();
  expect(await screen.findByText("案例一")).toBeInTheDocument();
  expect(screen.getByText("案例二")).toBeInTheDocument();
  expect(screen.getByText("2 个视频")).toBeInTheDocument();
});

it("filters the list by category tab", async () => {
  renderCaseList();
  await screen.findByText("案例一");
  fireEvent.click(screen.getByRole("button", { name: "短剧" }));
  expect(screen.queryByText("案例一")).not.toBeInTheDocument();
  expect(screen.getByText("案例二")).toBeInTheDocument();
});

it("shows an empty state when a category has no cases", async () => {
  renderCaseList();
  await screen.findByText("案例一");
  fireEvent.click(screen.getByRole("button", { name: "IP创造" }));
  expect(screen.getByText("还没有案例，点击右上角新建一个吧")).toBeInTheDocument();
});

it("asks for confirmation before deleting and removes the row on confirm", async () => {
  renderCaseList();
  await screen.findByText("案例一");
  fireEvent.click(screen.getByRole("button", { name: "删除案例一" }));
  expect(screen.getByText(/确定要删除「案例一」吗/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "删除" }));
  await waitFor(() => expect(screen.queryByText("案例一")).not.toBeInTheDocument());
  expect(screen.getByText("案例已删除")).toBeInTheDocument();
});

it("cancels deletion without calling the API", async () => {
  renderCaseList();
  await screen.findByText("案例一");
  fireEvent.click(screen.getByRole("button", { name: "删除案例一" }));
  fireEvent.click(screen.getByRole("button", { name: "取消" }));
  expect(screen.getByText("案例一")).toBeInTheDocument();
});
