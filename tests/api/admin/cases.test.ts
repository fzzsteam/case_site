import { GET, POST } from "@/app/api/admin/cases/route";
import { GET as getOne, PATCH, DELETE } from "@/app/api/admin/cases/[id]/route";
import { PATCH as reorder } from "@/app/api/admin/cases/reorder/route";
import { listCases, createCase, getCaseById, updateCase, deleteCase, reorderCases } from "@/lib/cases/queries";
import { categoryNameExists } from "@/lib/cases/categories-queries";
import type { CaseStudy } from "@/lib/cases/types";

vi.mock("@/lib/cases/queries", () => ({
  listCases: vi.fn(),
  createCase: vi.fn(),
  getCaseById: vi.fn(),
  updateCase: vi.fn(),
  deleteCase: vi.fn(),
  reorderCases: vi.fn(),
}));

vi.mock("@/lib/cases/categories-queries", () => ({
  categoryNameExists: vi.fn(),
}));

const sampleCase: CaseStudy = {
  id: "case-1",
  slug: "shi-li-an-li",
  title: "示例案例",
  category: "宣传片",
  summary: "简介",
  detail: "详情正文",
  coverPath: "case-site/cases/uploads/cover.png",
  createdAt: new Date("2026-01-01"),
  episodes: [{ id: "ep-1", videoPath: "case-site/cases/uploads/video.mp4", orientation: "landscape", durationSeconds: null }],
};

const validInput = { title: "示例案例", category: "宣传片", summary: "简介", detail: "详情正文", coverPath: "case-site/cases/uploads/cover.png", episodes: [{ videoPath: "case-site/cases/uploads/video.mp4", orientation: "landscape" }] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(categoryNameExists).mockResolvedValue(true);
});

it("lists cases", async () => {
  vi.mocked(listCases).mockResolvedValue([sampleCase]);
  const response = await GET();
  expect(await response.json()).toEqual({ cases: [{ ...sampleCase, createdAt: sampleCase.createdAt.toISOString() }] });
});

it("creates a case with valid input", async () => {
  vi.mocked(createCase).mockResolvedValue("new-id");
  const response = await POST(new Request("http://localhost/api/admin/cases", { method: "POST", body: JSON.stringify(validInput) }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id: "new-id" });
});

it("rejects case creation with missing fields", async () => {
  const response = await POST(new Request("http://localhost/api/admin/cases", { method: "POST", body: JSON.stringify({ title: "" }) }));
  expect(response.status).toBe(400);
  expect(createCase).not.toHaveBeenCalled();
});

it("rejects case creation with a media path outside the allowed prefix", async () => {
  const response = await POST(new Request("http://localhost/api/admin/cases", { method: "POST", body: JSON.stringify({ ...validInput, coverPath: "https://evil.example/cover.png" }) }));
  expect(response.status).toBe(400);
  expect(createCase).not.toHaveBeenCalled();
});

it("rejects case creation with an unknown category", async () => {
  vi.mocked(categoryNameExists).mockResolvedValue(false);
  const response = await POST(new Request("http://localhost/api/admin/cases", { method: "POST", body: JSON.stringify(validInput) }));
  expect(response.status).toBe(400);
  expect(createCase).not.toHaveBeenCalled();
});

it("returns 404 for an unknown case id on GET/PATCH/DELETE", async () => {
  vi.mocked(getCaseById).mockResolvedValue(undefined);
  const params = Promise.resolve({ id: "missing" });
  expect((await getOne(new Request("http://localhost"), { params })).status).toBe(404);
  expect((await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify(validInput) }), { params })).status).toBe(404);
  expect((await DELETE(new Request("http://localhost"), { params })).status).toBe(404);
});

it("updates an existing case", async () => {
  vi.mocked(getCaseById).mockResolvedValue(sampleCase);
  const response = await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify(validInput) }), { params: Promise.resolve({ id: "case-1" }) });
  expect(response.status).toBe(200);
  expect(updateCase).toHaveBeenCalledWith("case-1", expect.objectContaining({ title: "示例案例" }));
});

it("deletes an existing case", async () => {
  vi.mocked(getCaseById).mockResolvedValue(sampleCase);
  const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: "case-1" }) });
  expect(response.status).toBe(200);
  expect(deleteCase).toHaveBeenCalledWith("case-1");
});

it("reorders cases", async () => {
  const response = await reorder(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ orderedIds: ["b", "a"] }) }));
  expect(response.status).toBe(200);
  expect(reorderCases).toHaveBeenCalledWith(["b", "a"]);
});

it("rejects an empty reorder list", async () => {
  const response = await reorder(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ orderedIds: [] }) }));
  expect(response.status).toBe(400);
  expect(reorderCases).not.toHaveBeenCalled();
});
