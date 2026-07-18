import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { listCases } from "@/lib/cases/queries";

const hasMysql = Boolean(process.env.MYSQL_URL);

describe.skipIf(!hasMysql)("runMigrations", () => {
  it("creates the schema from scratch on a database with no tables, and is safe to re-run", async () => {
    const db = getDb();
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(sql`DROP TABLE IF EXISTS case_episodes`);
    await db.execute(sql`DROP TABLE IF EXISTS cases`);
    await db.execute(sql`DROP TABLE IF EXISTS categories`);
    await db.execute(sql`DROP TABLE IF EXISTS admin_credentials`);
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations`);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    await runMigrations();
    await expect(listCases()).resolves.toEqual([]);

    await runMigrations();
    await expect(listCases()).resolves.toEqual([]);
  });
});
