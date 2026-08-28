export type TalentWorkType = "video" | "image" | "website";
export type TalentWorkSource = "uploaded" | "static" | "external";

export type TalentWork = {
  id: string;
  slug: string;
  title: string;
  type: TalentWorkType;
  source: TalentWorkSource;
  summary: string;
  coverPath?: string;
  mediaPath?: string;
  galleryPaths?: string[];
  siteSlug?: string;
  siteUrl?: string;
};

export type TalentProfile = {
  id: string;
  name: string;
  role: string;
  intro: string;
  bio: string;
  avatarPath?: string;
  location?: string;
  skills: string[];
  works: TalentWork[];
};

export const TALENT_SKILLS = [
  "AI影视分镜",
  "短视频剪辑",
  "数字人",
  "影视海报",
  "3D插画",
  "三维建模",
  "AIGC插画",
] as const;

export const TALENT_WORK_TYPES: { value: TalentWorkType; label: string }[] = [
  { value: "video", label: "视频" },
  { value: "image", label: "图片" },
  { value: "website", label: "网站" },
];
