import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth/session";

const secret = "proxy-test-secret";

beforeEach(() => {
  process.env.SESSION_SECRET = secret;
});

it("lets the login page and login API through without a session", async () => {
  expect((await proxy(new NextRequest("http://localhost/admin/login"))).status).toBe(200);
  expect((await proxy(new NextRequest(new Request("http://localhost/api/admin/login", { method: "POST" })))).status).toBe(200);
});

it("redirects unauthenticated admin page requests to the login page", async () => {
  const response = await proxy(new NextRequest("http://localhost/admin/cases"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("http://localhost/admin/login");
});

it("returns 401 for unauthenticated admin API requests", async () => {
  const response = await proxy(new NextRequest("http://localhost/api/admin/cases"));
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ error: "Unauthorized" });
});

it("passes through requests with a valid session cookie", async () => {
  const token = await createSessionToken(secret);
  const request = new NextRequest("http://localhost/admin/cases", { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
  const response = await proxy(request);
  expect(response.status).toBe(200);
});

it("treats an invalid session cookie as unauthenticated", async () => {
  const request = new NextRequest("http://localhost/admin/cases", { headers: { cookie: `${SESSION_COOKIE_NAME}=garbage` } });
  const response = await proxy(request);
  expect(response.status).toBe(307);
});
