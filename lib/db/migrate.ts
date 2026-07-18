import "server-only";
import path from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { getDb } from "./client";

export async function runMigrations(): Promise<void> {
  await migrate(getDb(), { migrationsFolder: path.join(process.cwd(), "lib/db/migrations") });
}
