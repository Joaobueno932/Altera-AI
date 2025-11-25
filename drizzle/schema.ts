import {
  boolean,
  date,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const onboardingResponses = mysqlTable(
  "onboarding_responses",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    step: int("step").notNull(),
    status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
    responses: json("responses").$type<Record<string, unknown>>(),
    notes: text("notes"),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    onboardingUserStepIdx: uniqueIndex("uq_onboarding_user_step").on(table.userId, table.step),
    onboardingUserIdx: index("idx_onboarding_user").on(table.userId),
  })
);

export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
export type InsertOnboardingResponse = typeof onboardingResponses.$inferInsert;

export const secondBrainCore = mysqlTable(
  "second_brain_core",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    identity: json("identity").$type<Record<string, unknown>>(),
    lifeContext: json("lifeContext").$type<Record<string, unknown>>(),
    goals: json("goals").$type<Array<{ title: string; status: string }>>(),
    strategies: json("strategies").$type<Record<string, unknown>>(),
    score: int("score").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    secondBrainUserIdx: uniqueIndex("uq_second_brain_core_user").on(table.userId),
  })
);

export type SecondBrainCore = typeof secondBrainCore.$inferSelect;
export type InsertSecondBrainCore = typeof secondBrainCore.$inferInsert;

export const secondBrainDomains = mysqlTable(
  "second_brain_domains",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    coreId: int("coreId").references(() => secondBrainCore.id),
    domainKey: varchar("domainKey", { length: 64 }).notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
    priority: int("priority").default(1).notNull(),
    metrics: json("metrics").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    domainUserIdx: index("idx_domains_user").on(table.userId),
    domainCoreIdx: index("idx_domains_core").on(table.coreId),
    domainUserKeyIdx: uniqueIndex("uq_domain_user_key").on(table.userId, table.domainKey),
  })
);

export type SecondBrainDomain = typeof secondBrainDomains.$inferSelect;
export type InsertSecondBrainDomain = typeof secondBrainDomains.$inferInsert;

export const secondBrainMicroModules = mysqlTable(
  "second_brain_micro_modules",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    domainId: int("domainId").references(() => secondBrainDomains.id),
    moduleKey: varchar("moduleKey", { length: 64 }).notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    depth: int("depth").default(1).notNull(),
    status: mysqlEnum("status", ["draft", "active", "completed", "archived"]).default("draft").notNull(),
    triggers: json("triggers").$type<Array<Record<string, unknown>>>(),
    state: json("state").$type<Record<string, unknown>>(),
    progress: int("progress").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    microModulesUserIdx: index("idx_micro_modules_user").on(table.userId),
    microModulesDomainIdx: index("idx_micro_modules_domain").on(table.domainId),
    microModulesUserKeyIdx: uniqueIndex("uq_micro_modules_user_key").on(table.userId, table.moduleKey),
  })
);

export type SecondBrainMicroModule = typeof secondBrainMicroModules.$inferSelect;
export type InsertSecondBrainMicroModule = typeof secondBrainMicroModules.$inferInsert;

export const userInsights = mysqlTable(
  "user_insights",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    domainId: int("domainId").references(() => secondBrainDomains.id),
    source: mysqlEnum("source", ["system", "user", "signal", "analysis"]).default("system").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    summary: text("summary").notNull(),
    confidence: int("confidence").default(50).notNull(),
    details: json("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    insightsUserIdx: index("idx_insights_user").on(table.userId),
    insightsDomainIdx: index("idx_insights_domain").on(table.domainId),
  })
);

export type UserInsight = typeof userInsights.$inferSelect;
export type InsertUserInsight = typeof userInsights.$inferInsert;

export const userMessages = mysqlTable(
  "user_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    insightId: int("insightId").references(() => userInsights.id),
    role: mysqlEnum("role", ["user", "assistant", "system"]).default("user").notNull(),
    channel: mysqlEnum("channel", ["timeline", "chat", "notification", "system"]).default("timeline").notNull(),
    content: text("content").notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    messagesUserIdx: index("idx_messages_user").on(table.userId),
    messagesInsightIdx: index("idx_messages_insight").on(table.insightId),
    messagesRoleIdx: index("idx_messages_role").on(table.role),
  })
);

export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserMessage = typeof userMessages.$inferInsert;

export const timeline = mysqlTable(
  "timeline",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    eventType: mysqlEnum("eventType", [
      "insight",
      "module",
      "goal",
      "notification",
      "checkin",
      "system",
    ]).default("system").notNull(),
    entityType: varchar("entityType", { length: 64 }),
    entityId: int("entityId"),
    payload: json("payload").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    timelineUserIdx: index("idx_timeline_user").on(table.userId),
    timelineEventIdx: index("idx_timeline_event_type").on(table.eventType),
    timelineOccurredIdx: index("idx_timeline_occurred").on(table.occurredAt),
  })
);

export type TimelineEvent = typeof timeline.$inferSelect;
export type InsertTimelineEvent = typeof timeline.$inferInsert;

export const weeklyEvolution = mysqlTable(
  "weekly_evolution",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    weekStart: date("weekStart").notNull(),
    focus: text("focus"),
    summary: text("summary"),
    metrics: json("metrics").$type<Record<string, unknown>>(),
    sentiment: int("sentiment").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    weeklyUserIdx: index("idx_weekly_user").on(table.userId),
    weeklyPeriodIdx: uniqueIndex("uq_weekly_period").on(table.userId, table.weekStart),
  })
);

export type WeeklyEvolution = typeof weeklyEvolution.$inferSelect;
export type InsertWeeklyEvolution = typeof weeklyEvolution.$inferInsert;

export const progressGlobal = mysqlTable(
  "progress_global",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    overallScore: int("overallScore").default(0).notNull(),
    level: varchar("level", { length: 64 }),
    streak: int("streak").default(0).notNull(),
    milestones: json("milestones").$type<Array<Record<string, unknown>>>(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    progressUserIdx: uniqueIndex("uq_progress_user").on(table.userId),
  })
);

export type ProgressGlobal = typeof progressGlobal.$inferSelect;
export type InsertProgressGlobal = typeof progressGlobal.$inferInsert;

export const matchingProfiles = mysqlTable(
  "matching_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    profileType: mysqlEnum("profileType", ["mentor", "peer", "expert", "companion"]).notNull(),
    traits: json("traits").$type<Record<string, unknown>>(),
    availability: json("availability").$type<Record<string, unknown>>(),
    visibility: mysqlEnum("visibility", ["public", "private", "connections"]).default("private").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    matchingUserIdx: index("idx_matching_user").on(table.userId),
  })
);

export type MatchingProfile = typeof matchingProfiles.$inferSelect;
export type InsertMatchingProfile = typeof matchingProfiles.$inferInsert;

export const matchingScores = mysqlTable(
  "matching_scores",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    profileId: int("profileId").notNull().references(() => matchingProfiles.id),
    score: int("score").notNull(),
    dimensions: json("dimensions").$type<Record<string, unknown>>(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    matchingScoreUserIdx: index("idx_matching_scores_user").on(table.userId),
    matchingScoreProfileIdx: uniqueIndex("uq_matching_user_profile").on(table.userId, table.profileId),
  })
);

export type MatchingScore = typeof matchingScores.$inferSelect;
export type InsertMatchingScore = typeof matchingScores.$inferInsert;

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    category: mysqlEnum("category", ["system", "match", "insight", "progress", "reminder"]).default("system").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    status: mysqlEnum("status", ["unread", "read", "archived"]).default("unread").notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
  },
  (table) => ({
    notificationsUserIdx: index("idx_notifications_user").on(table.userId),
    notificationsStatusIdx: index("idx_notifications_status").on(table.status),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const userSettings = mysqlTable(
  "user_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    locale: varchar("locale", { length: 16 }).default("pt-BR").notNull(),
    timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
    theme: mysqlEnum("theme", ["light", "dark", "system"]).default("system").notNull(),
    notificationsOptIn: boolean("notificationsOptIn").default(true).notNull(),
    preferences: json("preferences").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    settingsUserIdx: uniqueIndex("uq_settings_user").on(table.userId),
  })
);

export type UserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;
