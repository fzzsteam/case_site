import { generateInitialPassword, hashPassword, verifyPassword } from "@/lib/auth/password";

it("verifies a matching password against its hash", () => {
  const hash = hashPassword("correct-horse");
  expect(verifyPassword("correct-horse", hash)).toBe(true);
});

it("rejects a wrong password against a hash", () => {
  const hash = hashPassword("correct-horse");
  expect(verifyPassword("wrong", hash)).toBe(false);
});

it("produces a different hash each time due to random salt", () => {
  expect(hashPassword("same-password")).not.toBe(hashPassword("same-password"));
});

it("generates initial passwords of the expected length", () => {
  const password = generateInitialPassword();
  expect(password).toHaveLength(12);
  expect(password).toMatch(/^[A-Za-z0-9]+$/);
});

it("generates different initial passwords on each call", () => {
  expect(generateInitialPassword()).not.toBe(generateInitialPassword());
});
