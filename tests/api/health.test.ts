import { GET } from "@/app/api/health/route";

it("returns ok status for SAE health checks", async () => {
  const response = GET();
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: "ok" });
});
