import { GET } from "@/app/api/admin/initial-password/route";
import { getInitialPassword } from "@/lib/auth/credentials";

vi.mock("@/lib/auth/credentials", () => ({
  getInitialPassword: vi.fn(),
}));

it("returns the initial password when it has not been changed", async () => {
  vi.mocked(getInitialPassword).mockResolvedValue("Ab3xY9pQ7z1K");
  const response = await GET();
  expect(await response.json()).toEqual({ password: "Ab3xY9pQ7z1K" });
});

it("returns null once the password has been changed", async () => {
  vi.mocked(getInitialPassword).mockResolvedValue(null);
  const response = await GET();
  expect(await response.json()).toEqual({ password: null });
});
