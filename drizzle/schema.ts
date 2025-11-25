import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const personalities = mysqlTable("personalities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  bigFiveScores: json("bigFiveScores").$type<{
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }>(),
  answers: json("answers").$type<Array<{
    question: string;
    answer: string;
    category: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Personality = typeof personalities.$inferSelect;
export type InsertPersonality = typeof personalities.$inferInsert;

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  messages: json("messages").$type<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const brainCores = mysqlTable("brain_cores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  identity: json("identity"),
  lifeContext: json("lifeContext"),
  bigFive: json("bigFive"),
  behavior: json("behavior"),
  metacognition: json("metacognition"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrainCore = typeof brainCores.$inferSelect;
export type InsertBrainCore = typeof brainCores.$inferInsert;

export const brainDomains = mysqlTable("brain_domains", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: mysqlEnum("name", [
    "health",
    "career",
    "relationships",
    "learning",
    "finance",
    "performance",
  ]).notNull(),
  active: mysqlEnum("active", ["yes", "no"]).default("no").notNull(),
  activationReason: text("activationReason"),
  signals: json("signals"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrainDomain = typeof brainDomains.$inferSelect;
export type InsertBrainDomain = typeof brainDomains.$inferInsert;

export const brainMicroModules = mysqlTable("brain_micro_modules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  domainId: int("domainId").references(() => brainDomains.id),
  domainName: mysqlEnum("domainName", [
    "health",
    "career",
    "relationships",
    "learning",
    "finance",
    "performance",
  ]),
  name: varchar("name", { length: 128 }).notNull(),
  depth: int("depth").default(1).notNull(),
  active: mysqlEnum("active", ["yes", "no"]).default("no").notNull(),
  triggers: json("triggers"),
  state: json("state"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrainMicroModule = typeof brainMicroModules.$inferSelect;
export type InsertBrainMicroModule = typeof brainMicroModules.$inferInsert;

export const brainMessages = mysqlTable("brain_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["user", "assistant", "system"]).default("user").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrainMessage = typeof brainMessages.$inferSelect;
export type InsertBrainMessage = typeof brainMessages.$inferInsert;

export const brainInsights = mysqlTable("brain_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  category: mysqlEnum("category", [
    "theme",
    "emotion",
    "habit",
    "preference",
    "domain",
  ]).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  confidence: int("confidence").default(50).notNull(),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrainInsight = typeof brainInsights.$inferSelect;
export type InsertBrainInsight = typeof brainInsights.$inferInsert;
