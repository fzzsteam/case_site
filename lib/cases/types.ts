export type CaseCategory = string;
export type VideoOrientation = "landscape" | "portrait";

export type Episode = { id: string; videoPath: string; orientation: VideoOrientation; durationSeconds: number | null };
export type CaseFaq = { question: string; answer: string };
export type CaseStudy = { id: string; slug: string; title: string; category: CaseCategory; detailIntro: string | null; client: string | null; region: string | null; deliverable: string | null; summary: string; detail: string; method: string | null; value: string | null; faq: CaseFaq[]; coverPath: string; createdAt: Date; episodes: Episode[] };

export type Category = { id: string; name: string; sortOrder: number };
