import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CaseForm } from "@/components/admin/case-form";
import { ToastProvider } from "@/components/admin/toast";
import { uploadFile, readVideoMetadata } from "@/lib/admin/upload-client";
import type { CaseStudy, Category } from "@/lib/cases/types";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

vi.mock("@/lib/admin/upload-client", () => ({
  uploadFile: vi.fn(),
  readVideoMetadata: vi.fn(),
}));

const sampleCategories: Category[] = [
  { id: "c1", name: "宣传片", sortOrder: 0 },
  { id: "c2", name: "短剧", sortOrder: 1 },
];

function renderForm(initialCase?: CaseStudy) {
  return render(<ToastProvider><CaseForm initialCase={initialCase} /></ToastProvider>);
}

const videoFile = (name: string) => new File(["data"], name, { type: "video/mp4" });
const imageFile = (name: string) => new File(["data"], name, { type: "image/png" });

function stubFetch(handlers: Record<string, (init?: RequestInit) => unknown>) {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/admin/categories" && (!init || init.method === undefined)) return { ok: true, json: async () => ({ categories: sampleCategories }) };
    const handler = handlers[url];
    if (handler) return { ok: true, json: async () => handler(init) };
    return { ok: false, json: async () => ({ error: "unexpected" }) };
  }));
}

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
  vi.mocked(uploadFile).mockReset();
  vi.mocked(readVideoMetadata).mockReset();
});

afterEach(() => vi.unstubAllGlobals());

it("blocks submit and shows errors when required fields are missing", async () => {
  renderForm();
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText("请填写标题")).toBeInTheDocument();
  expect(screen.getByText("请填写简介")).toBeInTheDocument();
  expect(screen.getByText("请填写详情正文")).toBeInTheDocument();
  expect(screen.getByText("请上传封面图片")).toBeInTheDocument();
  expect(screen.getByText("请至少上传一个视频")).toBeInTheDocument();
});

it("uploads a cover and a video then submits a new case", async () => {
  vi.mocked(uploadFile).mockImplementation(async (kind) => (kind === "cover" ? "case-site/cases/uploads/cover.png" : "case-site/cases/uploads/video.mp4"));
  vi.mocked(readVideoMetadata).mockResolvedValue({ orientation: "landscape", durationSeconds: 92 });
  stubFetch({ "/api/admin/cases": () => ({ id: "new-id" }) });

  renderForm();
  await waitFor(() => expect(screen.getByRole("combobox")).toHaveTextContent("宣传片"));
  fireEvent.change(screen.getByLabelText("标题"), { target: { value: "新案例" } });
  fireEvent.change(screen.getByLabelText("简介"), { target: { value: "这是简介" } });
  fireEvent.change(screen.getByLabelText("详情正文"), { target: { value: "这是详情正文" } });

  const [videoInput, coverInput] = document.querySelectorAll('input[type="file"]');
  fireEvent.change(coverInput, { target: { files: [imageFile("cover.png")] } });
  await waitFor(() => expect(uploadFile).toHaveBeenCalledWith("cover", expect.any(File), expect.any(Function)));

  fireEvent.change(videoInput, { target: { files: [videoFile("clip.mp4")] } });
  await screen.findByText("横屏");

  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/admin/cases", expect.objectContaining({ method: "POST" })));
  const call = vi.mocked(fetch).mock.calls.find(([url]) => url === "/api/admin/cases")!;
  const body = JSON.parse((call[1] as RequestInit).body as string);
  expect(body).toEqual({
    title: "新案例",
    category: "宣传片",
    summary: "这是简介",
    detail: "这是详情正文",
    coverPath: "case-site/cases/uploads/cover.png",
    episodes: [{ videoPath: "case-site/cases/uploads/video.mp4", orientation: "landscape", durationSeconds: 92 }],
  });
  expect(push).toHaveBeenCalledWith("/admin/cases");
});

it("prefills fields in edit mode and PATCHes the existing case id", async () => {
  const existing: CaseStudy = {
    id: "case-1",
    slug: "jiu-an-li",
    title: "旧案例",
    category: "短剧",
    summary: "旧简介",
    detail: "旧详情正文",
    coverPath: "case-site/cases/uploads/old-cover.png",
    createdAt: new Date("2026-01-01"),
    episodes: [{ id: "ep-1", videoPath: "case-site/cases/uploads/old-video.mp4", orientation: "portrait", durationSeconds: 45 }],
  };
  stubFetch({ "/api/admin/cases/case-1": () => ({ ok: true }) });

  renderForm(existing);
  expect(screen.getByLabelText("标题")).toHaveValue("旧案例");
  expect(screen.getByLabelText("简介")).toHaveValue("旧简介");
  expect(screen.getByLabelText("详情正文")).toHaveValue("旧详情正文");
  expect(screen.getByText("old-video.mp4")).toBeInTheDocument();
  expect(screen.getByText("竖屏")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/admin/cases/case-1", expect.objectContaining({ method: "PATCH" })));
});

it("removes an episode from the list", async () => {
  const existing: CaseStudy = {
    id: "case-1",
    slug: "jiu-an-li",
    title: "旧案例",
    category: "短剧",
    summary: "旧简介",
    detail: "旧详情正文",
    coverPath: "case-site/cases/uploads/old-cover.png",
    createdAt: new Date("2026-01-01"),
    episodes: [{ id: "ep-1", videoPath: "case-site/cases/uploads/old-video.mp4", orientation: "portrait", durationSeconds: 45 }],
  };
  renderForm(existing);
  expect(screen.getByText("old-video.mp4")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "移除old-video.mp4" }));
  expect(screen.queryByText("old-video.mp4")).not.toBeInTheDocument();
});
