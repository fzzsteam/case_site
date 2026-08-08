import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { aigcLeads } from "@/lib/db/schema";

export const LEAD_SOURCES = ["kit", "openclass", "advisor"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** 同一手机号 + 同一入口在该窗口内重复提交视为同一条线索，避免重复点击刷单 */
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

export interface CreateLeadInput {
  name: string;
  phone: string;
  source: LeadSource;
  requestIp?: string | null;
  userAgent?: string | null;
}

/**
 * 写入一条招生留资线索。窗口期内的重复提交直接复用已有记录，
 * 对调用方而言两种情况都算成功。
 */
export async function createAigcLead(input: CreateLeadInput) {
  const db = getDb();
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);

  const [existing] = await db
    .select({ id: aigcLeads.id })
    .from(aigcLeads)
    .where(
      and(
        eq(aigcLeads.phone, input.phone),
        eq(aigcLeads.source, input.source),
        gte(aigcLeads.createdAt, since),
      ),
    )
    .orderBy(desc(aigcLeads.createdAt))
    .limit(1);

  if (existing) {
    return { id: existing.id, duplicated: true as const };
  }

  const id = randomUUID();
  await db.insert(aigcLeads).values({
    id,
    name: input.name,
    phone: input.phone,
    source: input.source,
    requestIp: input.requestIp?.slice(0, 64) ?? null,
    userAgent: input.userAgent?.slice(0, 255) ?? null,
  });

  return { id, duplicated: false as const };
}
