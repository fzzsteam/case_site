import "server-only";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { cases, caseEpisodes } from "@/lib/db/schema";
import type { CaseCategory, CaseStudy, VideoOrientation } from "./types";

export type EpisodeInput = { videoPath: string; orientation: VideoOrientation };
export type CaseInput = { title: string; category: CaseCategory; summary: string; coverPath: string; episodes: EpisodeInput[] };

export async function listCases(): Promise<CaseStudy[]> {
  const rows = await getDb().query.cases.findMany({
    orderBy: (table, { asc }) => [asc(table.sortOrder)],
    with: { episodes: { orderBy: (table, { asc }) => [asc(table.sortOrder)] } },
  });
  return rows.map(toCaseStudy);
}

export async function getCaseById(id: string): Promise<CaseStudy | undefined> {
  const row = await getDb().query.cases.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: { episodes: { orderBy: (table, { asc }) => [asc(table.sortOrder)] } },
  });
  return row ? toCaseStudy(row) : undefined;
}

export async function videoPathExists(videoPath: string): Promise<boolean> {
  const rows = await getDb().select({ id: caseEpisodes.id }).from(caseEpisodes).where(eq(caseEpisodes.videoPath, videoPath)).limit(1);
  return rows.length > 0;
}

export async function createCase(input: CaseInput): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  const existing = await db.select({ sortOrder: cases.sortOrder }).from(cases).orderBy(asc(cases.sortOrder));
  const sortOrder = existing.length ? Math.max(...existing.map((item) => item.sortOrder)) + 1 : 0;
  await db.transaction(async (tx) => {
    await tx.insert(cases).values({ id, title: input.title, category: input.category, summary: input.summary, coverPath: input.coverPath, sortOrder });
    if (input.episodes.length) await tx.insert(caseEpisodes).values(input.episodes.map((episode, index) => ({ id: randomUUID(), caseId: id, videoPath: episode.videoPath, orientation: episode.orientation, sortOrder: index })));
  });
  return id;
}

export async function updateCase(id: string, input: CaseInput): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(cases).set({ title: input.title, category: input.category, summary: input.summary, coverPath: input.coverPath }).where(eq(cases.id, id));
    await tx.delete(caseEpisodes).where(eq(caseEpisodes.caseId, id));
    if (input.episodes.length) await tx.insert(caseEpisodes).values(input.episodes.map((episode, index) => ({ id: randomUUID(), caseId: id, videoPath: episode.videoPath, orientation: episode.orientation, sortOrder: index })));
  });
}

export async function deleteCase(id: string): Promise<void> {
  await getDb().delete(cases).where(eq(cases.id, id));
}

export async function reorderCases(orderedIds: string[]): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await Promise.all(orderedIds.map((id, index) => tx.update(cases).set({ sortOrder: index }).where(eq(cases.id, id))));
  });
}

function toCaseStudy(row: { id: string; title: string; category: string; summary: string; coverPath: string; episodes: { id: string; videoPath: string; orientation: string }[] }): CaseStudy {
  return {
    id: row.id,
    title: row.title,
    category: row.category as CaseCategory,
    summary: row.summary,
    coverPath: row.coverPath,
    episodes: row.episodes.map((episode) => ({ id: episode.id, videoPath: episode.videoPath, orientation: episode.orientation as VideoOrientation })),
  };
}
