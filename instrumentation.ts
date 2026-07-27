import { PHASE_PRODUCTION_BUILD } from "next/constants";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return;
  try {
    const { runMigrations } = await import("@/lib/db/migrate");
    await runMigrations();
    const { seedIfEmpty } = await import("@/lib/cases/seed");
    await seedIfEmpty();
    const { backfillCaseSlugsAndDetails } = await import("@/lib/cases/backfill");
    await backfillCaseSlugsAndDetails();
    const { ensureAdminCredentials } = await import("@/lib/auth/credentials");
    await ensureAdminCredentials();
  } catch (error) {
    console.error("Database startup check failed:", error);
  }

  const { startAcmeRenewalLoop } = await import("@/lib/acme/renew");
  startAcmeRenewalLoop();
}
