import type { TalentWork } from "./types";

export function getWorkTypeLabel(type: TalentWork["type"]) {
  return type === "video" ? "视频作品" : type === "image" ? "图片作品" : "网站作品";
}

export function getStaticSiteUrl(siteSlug: string) {
  return `https://${siteSlug}.edu.fzzsai.com/`;
}
