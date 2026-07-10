import { getCaseBySlug, getCaseSlugs } from "@/content/cases";
it("provides stable case slugs", () => expect(getCaseSlugs()).toContain("nanyang-museum"));
it("returns undefined for unknown case", () => expect(getCaseBySlug("missing")).toBeUndefined());
