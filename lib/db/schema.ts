import { mysqlTable, char, varchar, text, int, mysqlEnum, timestamp, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").primaryKey(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  initialPassword: varchar("initial_password", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// MCP 服务的访问凭证。token 按产品决策以明文存储，后台可随时查看复制；
// 因此这张表的读取权限等价于公众号发布权限，不要在日志或接口响应里外泄。
export const mcpTokens = mysqlTable("mcp_tokens", {
  id: char("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  token: varchar("token", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export const acmeCertificates = mysqlTable("acme_certificates", {
  domain: varchar("domain", { length: 255 }).primaryKey(),
  fullchain: text("fullchain").notNull(),
  privateKey: text("private_key").notNull(),
  notAfter: timestamp("not_after").notNull(),
  certId: varchar("cert_id", { length: 64 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const categories = mysqlTable("categories", {
  id: char("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cases = mysqlTable("cases", {
  id: char("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  summary: text("summary").notNull(),
  detail: text("detail").notNull(),
  coverPath: varchar("cover_path", { length: 500 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const caseEpisodes = mysqlTable("case_episodes", {
  id: char("id", { length: 36 }).primaryKey(),
  caseId: char("case_id", { length: 36 }).notNull().references(() => cases.id, { onDelete: "cascade" }),
  videoPath: varchar("video_path", { length: 500 }).notNull(),
  orientation: mysqlEnum("orientation", ["landscape", "portrait"]).notNull(),
  durationSeconds: int("duration_seconds"),
  sortOrder: int("sort_order").notNull().default(0),
});

// 招生站（/aigc）的留资线索。表里存手机号，属于个人信息：
// 任何日志、接口响应都不得回显 phone，只能出现 source。
export const aigcLeads = mysqlTable("aigc_leads", {
  id: char("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  // 来源 CTA：kit（领资料包）/ openclass（预约公开课）/ advisor（1v1 咨询）
  source: varchar("source", { length: 32 }).notNull().default("kit"),
  // 跟进状态：new / contacted / closed
  status: varchar("status", { length: 32 }).notNull().default("new"),
  requestIp: varchar("request_ip", { length: 64 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_aigc_leads_phone").on(table.phone),
  index("idx_aigc_leads_created_at").on(table.createdAt),
]);

export const casesRelations = relations(cases, ({ many }) => ({ episodes: many(caseEpisodes) }));
export const caseEpisodesRelations = relations(caseEpisodes, ({ one }) => ({
  case: one(cases, { fields: [caseEpisodes.caseId], references: [cases.id] }),
}));
