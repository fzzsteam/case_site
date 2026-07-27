import { z } from "zod";
import { validateMediaPath } from "@/lib/oss/path";

export const episodeInputSchema = z.object({
  videoPath: z.string().min(1),
  orientation: z.enum(["landscape", "portrait"]),
  durationSeconds: z.number().int().positive().nullable().optional(),
});

export const caseInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(50),
  summary: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  coverPath: z.string().min(1),
  episodes: z.array(episodeInputSchema).min(1),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const reorderInputSchema = z.object({ orderedIds: z.array(z.string().min(1)).min(1) });

export const uploadUrlInputSchema = z.object({
  fileName: z.string().min(1).max(255),
  kind: z.enum(["cover", "video"]),
});

export function assertValidCaseMediaPaths(input: z.infer<typeof caseInputSchema>): void {
  validateMediaPath(input.coverPath);
  input.episodes.forEach((episode) => validateMediaPath(episode.videoPath));
}
