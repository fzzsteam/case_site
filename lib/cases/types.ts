export type CaseCategory = string;
export type VideoOrientation = "landscape" | "portrait";

export type Episode = { id: string; videoPath: string; orientation: VideoOrientation; durationSeconds: number | null };
export type CaseStudy = { id: string; slug: string; title: string; category: CaseCategory; summary: string; detail: string; coverPath: string; createdAt: Date; episodes: Episode[] };

export type Category = { id: string; name: string; sortOrder: number };
