import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const secret = "test-secret";

it("verifies a freshly issued token", async () => {
  const token = await createSessionToken(secret);
  expect(await verifySessionToken(token, secret)).toBe(true);
});

it("rejects a token signed with a different secret", async () => {
  const token = await createSessionToken(secret);
  expect(await verifySessionToken(token, "other-secret")).toBe(false);
});

it("rejects a tampered payload", async () => {
  const token = await createSessionToken(secret);
  const [, signature] = token.split(".");
  const tampered = `${btoa(JSON.stringify({ exp: Date.now() + 999_999 }))}.${signature}`;
  expect(await verifySessionToken(tampered, secret)).toBe(false);
});

it("rejects an expired token", async () => {
  vi.useFakeTimers();
  const token = await createSessionToken(secret);
  vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);
  expect(await verifySessionToken(token, secret)).toBe(false);
  vi.useRealTimers();
});

it("rejects missing or malformed tokens", async () => {
  expect(await verifySessionToken(undefined, secret)).toBe(false);
  expect(await verifySessionToken("not-a-real-token", secret)).toBe(false);
});
