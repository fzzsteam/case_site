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
    // drizzle 按 UTC 编解码 TIMESTAMP 字段（mapToDriverValue 用 toISOString，mapFromDriverValue
    // 给读回的字符串强行拼上 "+0000"），这要求 MySQL 会话时区必须是 UTC，否则会跟服务器默认时区
    // （阿里云 RDS 国内地域常见默认 +08:00）产生偏差。显式固定会话时区，不依赖服务器默认值。
    pool.on("connection", (connection) => {
      connection.query("SET time_zone = '+00:00'");
    });
    db = drizzle(pool, { schema, mode: "default" });
  }
  return db!;
}
