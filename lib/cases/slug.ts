import { pinyin } from "pinyin-pro";

export function slugify(title: string): string {
  const romanized = pinyin(title, { toneType: "none", type: "array" }).join("-");
  return romanized
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "case";
}

export function nextSlugCandidate(base: string, attempt: number): string {
  return attempt === 0 ? base : `${base}-${attempt + 1}`;
}
