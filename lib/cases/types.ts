export type CaseCategory = string;
export type VideoOrientation = "landscape" | "portrait";

export type Episode = { id: string; videoPath: string; orientation: VideoOrientation };
export type CaseStudy = { id: string; title: string; category: CaseCategory; summary: string; coverPath: string; episodes: Episode[] };

export type CaseVideo = Episode & { projectId: string; projectTitle: string; category: CaseCategory; coverPath: string };

export type Category = { id: string; name: string; sortOrder: number };

export function buildCaseVideos(caseStudies: CaseStudy[]): CaseVideo[] {
  return caseStudies.flatMap((item) => item.episodes.map((episode) => ({
    ...episode,
    projectId: item.id,
    projectTitle: item.title,
    category: item.category,
    coverPath: item.coverPath,
  })));
}
