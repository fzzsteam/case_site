import "server-only";
import { getDb } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { createCategory, listCategories } from "./categories-queries";
import { createCase } from "./queries";
import { seedCases } from "./seed-data";

const defaultCategories = ["宣传片", "广告片", "短剧", "IP创造"];

export async function seedIfEmpty(): Promise<void> {
  const existingCategories = await listCategories();
  const existingNames = new Set(existingCategories.map((category) => category.name));
  for (const name of defaultCategories) if (!existingNames.has(name)) await createCategory(name);

  const existing = await getDb().select({ id: cases.id }).from(cases).limit(1);
  if (existing.length > 0) return;
  for (const seedCase of seedCases) await createCase(seedCase);
}
