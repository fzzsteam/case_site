import "server-only";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { categories, cases } from "@/lib/db/schema";
import type { Category } from "./types";

export class CategoryInUseError extends Error {}

export async function listCategories(): Promise<Category[]> {
  const rows = await getDb().select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  return rows.map((row) => ({ id: row.id, name: row.name, sortOrder: row.sortOrder }));
}

export async function categoryNameExists(name: string, excludeId?: string): Promise<boolean> {
  const rows = await getDb().select({ id: categories.id }).from(categories).where(eq(categories.name, name));
  return rows.some((row) => row.id !== excludeId);
}

export async function createCategory(name: string): Promise<Category> {
  const db = getDb();
  const id = randomUUID();
  const existing = await db.select({ sortOrder: categories.sortOrder }).from(categories);
  const sortOrder = existing.length ? Math.max(...existing.map((item) => item.sortOrder)) + 1 : 0;
  await db.insert(categories).values({ id, name, sortOrder });
  return { id, name, sortOrder };
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [current] = await tx.select({ name: categories.name }).from(categories).where(eq(categories.id, id));
    if (!current) throw new Error("Category not found");
    await tx.update(categories).set({ name }).where(eq(categories.id, id));
    if (current.name !== name) await tx.update(cases).set({ category: name }).where(eq(cases.category, current.name));
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  const [current] = await db.select({ name: categories.name }).from(categories).where(eq(categories.id, id));
  if (!current) return;
  const [inUse] = await db.select({ id: cases.id }).from(cases).where(eq(cases.category, current.name)).limit(1);
  if (inUse) throw new CategoryInUseError("Category is in use");
  await db.delete(categories).where(eq(categories.id, id));
}
