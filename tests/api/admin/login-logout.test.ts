import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { verifyAdminPassword } from "@/lib/auth/credentials";

vi.mock("@/lib/auth/credentials", () => ({
  verifyAdminPassword: vi.fn(),
}));

const request = (body: unknown) => new Request("http://localhost/api/admin/login", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
  vi.mocked(verifyAdminPassword).mockImplementation(async (password) => password === "correct-password");
});

it("rejects login when the password is wrong", async () => {
  const response = await login(request({ password: "wrong" }));
  expect(response.status).toBe(401);
  expect(response.headers.get("set-cookie")).toBeNull();
});

it("issues a session cookie on a correct password", async () => {
  const response = await login(request({ password: "correct-password" }));
  expect(response.status).toBe(200);
  const cookie = response.headers.get("set-cookie") ?? "";
  expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
  expect(cookie).toContain("HttpOnly");
});

it("returns 503 when admin login is not configured", async () => {
  delete process.env.SESSION_SECRET;
  const response = await login(request({ password: "anything" }));
  expect(response.status).toBe(503);
});

it("clears the session cookie on logout", async () => {
  const response = await logout();
  const cookie = response.headers.get("set-cookie") ?? "";
  expect(cookie).toContain(`${SESSION_COOKIE_NAME}=;`);
});
