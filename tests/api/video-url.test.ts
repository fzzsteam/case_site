import { POST } from "@/app/api/media/video-url/route";
import { videoPathExists } from "@/lib/cases/queries";

vi.mock("@/lib/cases/queries", () => ({ videoPathExists: vi.fn() }));

it("rejects video paths that are absent from the case database", async () => {
  vi.mocked(videoPathExists).mockResolvedValue(false);
  const response = await POST(new Request("http://localhost/api/media/video-url", { method: "POST", body: JSON.stringify({ path: "cases/unknown/video.mp4" }) }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Unknown video" });
});
