import { validateMediaPath } from "@/lib/oss/path";

it("accepts allowed private media paths", () => expect(validateMediaPath("cases/nanyang/cover.webp")).toBe("cases/nanyang/cover.webp"));
it.each(["../secret", "cases/../../secret", "https://host/object", "/cases/file.png", "other/file.png"])("rejects unsafe path %s", (path) => expect(() => validateMediaPath(path)).toThrow("Invalid media path"));
