import "server-only";
import { isNull, or, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { getLegacyCasePresentation } from "@/lib/seo/case-content";
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

export async function backfillCasePresentationContent(): Promise<void> {
  const db = getDb();
  const rows = await db.select({
    id: cases.id,
    slug: cases.slug,
    detailIntro: cases.detailIntro,
    client: cases.client,
    region: cases.region,
    deliverable: cases.deliverable,
    method: cases.method,
    value: cases.value,
    faq: cases.faq,
  }).from(cases);

  for (const row of rows) {
    const legacy = getLegacyCasePresentation(row.slug);
    if (!legacy) continue;
    const values: Partial<Record<"detailIntro" | "client" | "region" | "deliverable" | "method" | "value" | "faq", string>> = {};
    if (row.detailIntro === null) values.detailIntro = legacy.detailIntro;
    if (row.client === null) values.client = legacy.client;
    if (row.region === null) values.region = legacy.region;
    if (row.deliverable === null) values.deliverable = legacy.deliverable;
    if (row.method === null) values.method = legacy.method;
    if (row.value === null) values.value = legacy.value;
    if (row.faq === null) values.faq = JSON.stringify(legacy.faq);
    if (Object.keys(values).length > 0) await db.update(cases).set(values).where(eq(cases.id, row.id));
  }
}
