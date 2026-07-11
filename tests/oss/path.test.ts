import { validateMediaPath } from "@/lib/oss/path";

it("accepts allowed private media paths", () => expect(validateMediaPath("case-site/cases/疯狂的荔枝/cover.png")).toBe("case-site/cases/疯狂的荔枝/cover.png"));
it.each(["../secret", "case-site/cases/../../secret", "https://host/object", "/case-site/cases/file.png", "other/file.png"])("rejects unsafe path %s", (path) => expect(() => validateMediaPath(path)).toThrow("Invalid media path"));
