import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminCredentials } from "@/lib/db/schema";
import { generateInitialPassword, hashPassword, verifyPassword } from "./password";

const SINGLETON_ID = 1;

export async function ensureAdminCredentials(): Promise<void> {
  const db = getDb();
  const [existing] = await db.select({ id: adminCredentials.id }).from(adminCredentials).where(eq(adminCredentials.id, SINGLETON_ID));
  if (existing) return;
  const initialPassword = generateInitialPassword();
  await db.insert(adminCredentials).values({ id: SINGLETON_ID, passwordHash: hashPassword(initialPassword), initialPassword });
}

export async function getInitialPassword(): Promise<string | null> {
  const db = getDb();
  const [row] = await db.select({ initialPassword: adminCredentials.initialPassword }).from(adminCredentials).where(eq(adminCredentials.id, SINGLETON_ID));
  return row?.initialPassword ?? null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db.select({ passwordHash: adminCredentials.passwordHash }).from(adminCredentials).where(eq(adminCredentials.id, SINGLETON_ID));
  if (!row) return false;
  return verifyPassword(password, row.passwordHash);
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db.select({ passwordHash: adminCredentials.passwordHash }).from(adminCredentials).where(eq(adminCredentials.id, SINGLETON_ID));
  if (!row || !verifyPassword(currentPassword, row.passwordHash)) return false;
  await db.update(adminCredentials).set({ passwordHash: hashPassword(newPassword), initialPassword: null }).where(eq(adminCredentials.id, SINGLETON_ID));
  return true;
}
