import "server-only";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { cases, caseEpisodes } from "@/lib/db/schema";
import { nextSlugCandidate, slugify } from "./slug";
import type { CaseCategory, CaseStudy, VideoOrientation } from "./types";

export type EpisodeInput = { videoPath: string; orientation: VideoOrientation; durationSeconds?: number | null };
export type CaseInput = { title: string; category: CaseCategory; summary: string; detail: string; coverPath: string; episodes: EpisodeInput[] };

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

export async function getCaseBySlug(slug: string): Promise<CaseStudy | undefined> {
  const row = await getDb().query.cases.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
    with: { episodes: { orderBy: (table, { asc }) => [asc(table.sortOrder)] } },
  });
  return row ? toCaseStudy(row) : undefined;
}

export async function resolveUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const db = getDb();
  const base = slugify(title);
  for (let attempt = 0; ; attempt++) {
    const candidate = nextSlugCandidate(base, attempt);
    const rows = await db.select({ id: cases.id }).from(cases).where(eq(cases.slug, candidate)).limit(1);
    if (rows.length === 0 || rows[0].id === excludeId) return candidate;
  }
}

export async function videoPathExists(videoPath: string): Promise<boolean> {
  const rows = await getDb().select({ id: caseEpisodes.id }).from(caseEpisodes).where(eq(caseEpisodes.videoPath, videoPath)).limit(1);
  return rows.length > 0;
}

export async function createCase(input: CaseInput): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  const slug = await resolveUniqueSlug(input.title);
  const existing = await db.select({ sortOrder: cases.sortOrder }).from(cases).orderBy(asc(cases.sortOrder));
  const sortOrder = existing.length ? Math.max(...existing.map((item) => item.sortOrder)) + 1 : 0;
  await db.transaction(async (tx) => {
    await tx.insert(cases).values({ id, slug, title: input.title, category: input.category, summary: input.summary, detail: input.detail, coverPath: input.coverPath, sortOrder });
    if (input.episodes.length) await tx.insert(caseEpisodes).values(input.episodes.map((episode, index) => ({ id: randomUUID(), caseId: id, videoPath: episode.videoPath, orientation: episode.orientation, durationSeconds: episode.durationSeconds ?? null, sortOrder: index })));
  });
  return id;
}

export async function updateCase(id: string, input: CaseInput): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(cases).set({ title: input.title, category: input.category, summary: input.summary, detail: input.detail, coverPath: input.coverPath }).where(eq(cases.id, id));
    await tx.delete(caseEpisodes).where(eq(caseEpisodes.caseId, id));
    if (input.episodes.length) await tx.insert(caseEpisodes).values(input.episodes.map((episode, index) => ({ id: randomUUID(), caseId: id, videoPath: episode.videoPath, orientation: episode.orientation, durationSeconds: episode.durationSeconds ?? null, sortOrder: index })));
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

function toCaseStudy(row: { id: string; slug: string; title: string; category: string; summary: string; detail: string; coverPath: string; createdAt: Date; episodes: { id: string; videoPath: string; orientation: string; durationSeconds: number | null }[] }): CaseStudy {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as CaseCategory,
    summary: row.summary,
    detail: row.detail,
    coverPath: row.coverPath,
    createdAt: row.createdAt,
    episodes: row.episodes.map((episode) => ({ id: episode.id, videoPath: episode.videoPath, orientation: episode.orientation as VideoOrientation, durationSeconds: episode.durationSeconds })),
  };
}
