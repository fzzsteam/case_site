import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { talentProfiles } from "@/lib/db/schema";
import type { TalentProfile, TalentWork } from "./types";

type TalentWorkRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  source: string;
  summary: string;
  coverPath: string;
  mediaPath: string | null;
  mediaPaths: string | null;
  galleryPaths: string | null;
  siteSlug: string | null;
  siteUrl: string | null;
};

type TalentProfileRow = {
  id: string;
  name: string;
  role: string;
  intro: string;
  bio: string;
  avatarPath: string | null;
  location: string | null;
  skills: string;
  works: TalentWorkRow[];
};

function parseStringArray(value: string | null): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string" && item.length > 0)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function parseSkills(value: string): string[] {
  return parseStringArray(value) ?? [];
}

function toTalentWork(row: TalentWorkRow): TalentWork {
  const mediaPaths = parseStringArray(row.mediaPaths) ?? (row.mediaPath ? [row.mediaPath] : undefined);
  const galleryPaths = parseStringArray(row.galleryPaths);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as TalentWork["type"],
    source: row.source as TalentWork["source"],
    summary: row.summary,
    coverPath: row.coverPath,
    mediaPath: mediaPaths?.[0] ?? row.mediaPath ?? undefined,
    mediaPaths,
    galleryPaths,
    siteSlug: row.siteSlug ?? undefined,
    siteUrl: row.siteUrl ?? undefined,
  };
}

function toTalentProfile(row: TalentProfileRow): TalentProfile {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    intro: row.intro,
    bio: row.bio,
    avatarPath: row.avatarPath ?? undefined,
    location: row.location ?? undefined,
    skills: parseSkills(row.skills),
    works: row.works.map(toTalentWork),
  };
}

export async function listTalentProfiles(): Promise<TalentProfile[]> {
  const rows = await getDb().query.talentProfiles.findMany({
    orderBy: (table, { asc: orderAsc }) => [orderAsc(table.sortOrder), orderAsc(table.createdAt)],
    with: { works: { orderBy: (table, { asc: orderAsc }) => [orderAsc(table.sortOrder), orderAsc(table.createdAt)] } },
  });
  return (rows as TalentProfileRow[]).map(toTalentProfile);
}

export async function getTalentProfile(id: string): Promise<TalentProfile | undefined> {
  const row = await getDb().query.talentProfiles.findFirst({
    where: (table) => eq(table.id, id),
    with: { works: { orderBy: (table, { asc: orderAsc }) => [orderAsc(table.sortOrder), orderAsc(table.createdAt)] } },
  });
  return row ? toTalentProfile(row as TalentProfileRow) : undefined;
}
