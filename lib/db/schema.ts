import { mysqlTable, char, varchar, text, int, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").primaryKey(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  initialPassword: varchar("initial_password", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
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

export const casesRelations = relations(cases, ({ many }) => ({ episodes: many(caseEpisodes) }));
export const caseEpisodesRelations = relations(caseEpisodes, ({ one }) => ({
  case: one(cases, { fields: [caseEpisodes.caseId], references: [cases.id] }),
}));
