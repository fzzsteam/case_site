import { prepareUpload } from "@/lib/oss/upload";
import { validateMediaPath } from "@/lib/oss/path";

it("builds an allowed upload path with the matching content type for a cover image", () => {
  const { objectPath, contentType } = prepareUpload("cover", "我的封面.PNG");
  expect(objectPath).toMatch(/^case-site\/cases\/uploads\/[0-9a-f]{8}-.+\.png$/);
  expect(contentType).toBe("image/png");
  expect(() => validateMediaPath(objectPath)).not.toThrow();
});

it("builds an allowed upload path with the matching content type for a video", () => {
  const { objectPath, contentType } = prepareUpload("video", "clip.mp4");
  expect(objectPath).toMatch(/^case-site\/cases\/uploads\/[0-9a-f]{8}-clip\.mp4$/);
  expect(contentType).toBe("video/mp4");
});

it("rejects a file extension not allowed for the given kind", () => {
  expect(() => prepareUpload("cover", "video.mp4")).toThrow("Unsupported file type");
  expect(() => prepareUpload("video", "image.png")).toThrow("Unsupported file type");
});

it("rejects files without a recognizable extension", () => expect(() => prepareUpload("cover", "noextension")).toThrow("Unsupported file type"));

it("strips path separators from the original file name so it cannot escape the upload prefix", () => {
  const { objectPath } = prepareUpload("video", "../../etc/passwd.mp4");
  expect(objectPath.startsWith("case-site/cases/uploads/")).toBe(true);
  expect(objectPath.slice("case-site/cases/uploads/".length)).not.toContain("/");
  expect(() => validateMediaPath(objectPath)).not.toThrow();
});
