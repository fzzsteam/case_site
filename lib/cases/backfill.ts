import "server-only";
import { isNull, or, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { resolveUniqueSlug } from "./queries";
import { seedCases } from "./seed-data";

const detailByTitle = new Map(seedCases.map((item) => [item.title, item.detail]));

export async function backfillCaseSlugsAndDetails(): Promise<void> {
  const db = getDb();
  const rows = await db.select({ id: cases.id, title: cases.title, summary: cases.summary, slug: cases.slug, detail: cases.detail }).from(cases).where(or(isNull(cases.slug), isNull(cases.detail), eq(cases.detail, "")));
  for (const row of rows) {
    const slug = row.slug ?? (await resolveUniqueSlug(row.title, row.id));
    const detail = row.detail && row.detail.length > 0 ? row.detail : (detailByTitle.get(row.title) ?? row.summary);
    await db.update(cases).set({ slug, detail }).where(eq(cases.id, row.id));
  }
}
