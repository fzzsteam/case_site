import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.MYSQL_URL || "mysql://root@localhost:3306/case_site",
  },
} satisfies Config;
