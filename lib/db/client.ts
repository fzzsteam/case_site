import "server-only";
import mysql, { type Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { getMysqlUrl } from "./config";
import * as schema from "./schema";

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema, Pool>> | undefined;

export function getDb() {
  if (!db) {
    pool = mysql.createPool(getMysqlUrl());
    db = drizzle(pool, { schema, mode: "default" });
  }
  return db!;
}
