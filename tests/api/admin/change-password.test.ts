import { POST } from "@/app/api/admin/change-password/route";
import { changeAdminPassword } from "@/lib/auth/credentials";

vi.mock("@/lib/auth/credentials", () => ({
  changeAdminPassword: vi.fn(),
}));

const request = (body: unknown) => new Request("http://localhost/api/admin/change-password", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => vi.clearAllMocks());

it("rejects a short new password", async () => {
  const response = await POST(request({ currentPassword: "old-pass", newPassword: "short" }));
  expect(response.status).toBe(400);
  expect(changeAdminPassword).not.toHaveBeenCalled();
});

it("returns 401 when the current password is wrong", async () => {
  vi.mocked(changeAdminPassword).mockResolvedValue(false);
  const response = await POST(request({ currentPassword: "wrong", newPassword: "a-new-password" }));
  expect(response.status).toBe(401);
});

it("changes the password when the current password is correct", async () => {
  vi.mocked(changeAdminPassword).mockResolvedValue(true);
  const response = await POST(request({ currentPassword: "old-pass", newPassword: "a-new-password" }));
  expect(response.status).toBe(200);
  expect(changeAdminPassword).toHaveBeenCalledWith("old-pass", "a-new-password");
});
