import { GET, POST } from "@/app/api/admin/categories/route";
import { PATCH, DELETE } from "@/app/api/admin/categories/[id]/route";
import { CategoryInUseError, categoryNameExists, createCategory, deleteCategory, listCategories, renameCategory } from "@/lib/cases/categories-queries";

vi.mock("@/lib/cases/categories-queries", () => ({
  CategoryInUseError: class CategoryInUseError extends Error {},
  categoryNameExists: vi.fn(),
  createCategory: vi.fn(),
  renameCategory: vi.fn(),
  deleteCategory: vi.fn(),
  listCategories: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(categoryNameExists).mockResolvedValue(false);
});

it("lists categories", async () => {
  vi.mocked(listCategories).mockResolvedValue([{ id: "c1", name: "宣传片", sortOrder: 0 }]);
  const response = await GET();
  expect(await response.json()).toEqual({ categories: [{ id: "c1", name: "宣传片", sortOrder: 0 }] });
});

it("creates a category with a new name", async () => {
  vi.mocked(createCategory).mockResolvedValue({ id: "c2", name: "纪录片", sortOrder: 1 });
  const response = await POST(new Request("http://localhost/api/admin/categories", { method: "POST", body: JSON.stringify({ name: "纪录片" }) }));
  expect(response.status).toBe(201);
  expect(createCategory).toHaveBeenCalledWith("纪录片");
});

it("rejects creating a category that already exists", async () => {
  vi.mocked(categoryNameExists).mockResolvedValue(true);
  const response = await POST(new Request("http://localhost/api/admin/categories", { method: "POST", body: JSON.stringify({ name: "宣传片" }) }));
  expect(response.status).toBe(409);
  expect(createCategory).not.toHaveBeenCalled();
});

it("rejects an empty category name", async () => {
  const response = await POST(new Request("http://localhost/api/admin/categories", { method: "POST", body: JSON.stringify({ name: "  " }) }));
  expect(response.status).toBe(400);
  expect(createCategory).not.toHaveBeenCalled();
});

it("renames a category", async () => {
  const response = await PATCH(
    new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ name: "新分类" }) }),
    { params: Promise.resolve({ id: "c1" }) },
  );
  expect(response.status).toBe(200);
  expect(renameCategory).toHaveBeenCalledWith("c1", "新分类");
});

it("deletes an unused category", async () => {
  const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: "c1" }) });
  expect(response.status).toBe(200);
  expect(deleteCategory).toHaveBeenCalledWith("c1");
});

it("returns 409 when deleting a category still in use", async () => {
  vi.mocked(deleteCategory).mockRejectedValue(new CategoryInUseError());
  const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: "c1" }) });
  expect(response.status).toBe(409);
});
