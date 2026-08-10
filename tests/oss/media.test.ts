import { getSignedVideoUrl } from "@/lib/oss/media";
import { getOssClient } from "@/lib/oss/client";

vi.mock("@/lib/oss/client", () => ({ getOssClient: vi.fn() }));

it("overrides OSS video downloads to inline media responses", async () => {
  const signatureUrl = vi.fn().mockReturnValue("https://oss.example.com/signed-video");
  vi.mocked(getOssClient).mockReturnValue({ signatureUrl } as never);

  await expect(getSignedVideoUrl("case-site/cases/uploads/clip.mp4", 60)).resolves.toBe("https://oss.example.com/signed-video");
  expect(signatureUrl).toHaveBeenCalledWith("case-site/cases/uploads/clip.mp4", {
    expires: 60,
    response: { "content-disposition": "inline" },
  });
});
