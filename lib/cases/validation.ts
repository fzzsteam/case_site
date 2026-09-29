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
  detailIntro: z.string().trim().max(500).optional(),
  client: z.string().trim().max(255).optional(),
  region: z.string().trim().max(255).optional(),
  deliverable: z.string().trim().max(255).optional(),
  summary: z.string().trim().min(1),
  detail: z.string().trim().optional(),
  method: z.string().trim().optional(),
  value: z.string().trim().optional(),
  faq: z.array(z.object({ question: z.string().trim().min(1).max(255), answer: z.string().trim().min(1) })).optional(),
  coverPath: z.string().min(1),
  episodes: z.array(episodeInputSchema).min(1),
});

export const caseUpdateInputSchema = caseInputSchema.partial().strict().refine(
  (input) => Object.keys(input).length > 0,
  "至少提供一个要修改的案例字段。",
);

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
