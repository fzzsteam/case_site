import { prepareUpload, getSignedUploadUrl } from "@/lib/oss/upload";
import { getOssClient } from "@/lib/oss/client";

const hasOss = Boolean(process.env.OSS_ACCESS_KEY_ID);

describe.skipIf(!hasOss)("signed upload url against real OSS credentials", () => {
  it("produces a PUT-signed https url for the generated object path", async () => {
    const { objectPath, contentType } = prepareUpload("cover", "integration-check.png");
    const url = await getSignedUploadUrl(objectPath, contentType);
    expect(url.startsWith("https://")).toBe(true);
    expect(decodeURIComponent(url)).toContain(objectPath);
    expect(url).toMatch(/Signature=/);
  });

  it("actually accepts a PUT write against the real bucket with the current AK/SK", async () => {
    const { objectPath, contentType } = prepareUpload("cover", "integration-write-check.png");
    const url = await getSignedUploadUrl(objectPath, contentType);
    try {
      const response = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: new Uint8Array([137, 80, 78, 71]) });
      expect(response.status).toBe(200);
    } finally {
      await getOssClient().delete(objectPath);
    }
  });
});
