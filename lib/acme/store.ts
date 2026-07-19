import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { acmeCertificates } from "@/lib/db/schema";

export type StoredCertificate = { fullchain: string; privateKey: string; notAfter: Date };

export async function getCachedCertificate(domain: string): Promise<StoredCertificate | null> {
  const [row] = await getDb().select().from(acmeCertificates).where(eq(acmeCertificates.domain, domain));
  if (!row) return null;
  return { fullchain: row.fullchain, privateKey: row.privateKey, notAfter: row.notAfter };
}

export async function saveCertificate(domain: string, fullchain: string, privateKey: string, notAfter: Date): Promise<void> {
  const db = getDb();
  await db
    .insert(acmeCertificates)
    .values({ domain, fullchain, privateKey, notAfter })
    .onDuplicateKeyUpdate({ set: { fullchain, privateKey, notAfter } });
}
