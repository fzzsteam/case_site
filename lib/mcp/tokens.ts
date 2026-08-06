import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mcpTokens } from "@/lib/db/schema";

export const TOKEN_PREFIX = "mcpat_";
/** lastUsedAt 只是"还在不在用"的信号，不需要每次调用都写库。 */
const LAST_USED_WRITE_INTERVAL_MS = 60 * 1000;

export type McpToken = { id: string; name: string; token: string; createdAt: Date; lastUsedAt: Date | null };

export function generateToken(): string {
  return TOKEN_PREFIX + randomBytes(32).toString("base64url");
}

export async function listTokens(): Promise<McpToken[]> {
  const db = getDb();
  return db.select().from(mcpTokens).orderBy(desc(mcpTokens.createdAt));
}

export async function createToken(name: string): Promise<McpToken> {
  const db = getDb();
  const row = { id: randomUUID(), name, token: generateToken(), createdAt: new Date(), lastUsedAt: null };
  await db.insert(mcpTokens).values(row);
  return row;
}

export async function deleteToken(id: string): Promise<boolean> {
  const db = getDb();
  const [existing] = await db.select({ id: mcpTokens.id }).from(mcpTokens).where(eq(mcpTokens.id, id));
  if (!existing) return false;
  await db.delete(mcpTokens).where(eq(mcpTokens.id, id));
  return true;
}

/** 校验 Bearer token；命中则顺带刷新 lastUsedAt（限流写入）。 */
export async function verifyToken(raw: string | undefined): Promise<McpToken | null> {
  if (!raw || !raw.startsWith(TOKEN_PREFIX)) return null;
  const db = getDb();
  const [row] = await db.select().from(mcpTokens).where(eq(mcpTokens.token, raw));
  if (!row) return null;

  const now = Date.now();
  if (!row.lastUsedAt || now - row.lastUsedAt.getTime() > LAST_USED_WRITE_INTERVAL_MS) {
    await db.update(mcpTokens).set({ lastUsedAt: new Date(now) }).where(eq(mcpTokens.id, row.id));
  }
  return row;
}

export function extractBearerToken(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1];
}
