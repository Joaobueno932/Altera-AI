import { relations } from "drizzle-orm";
import {
  matchingProfiles,
  matchingScores,
  notifications,
  onboardingResponses,
  progressGlobal,
  secondBrainCore,
  secondBrainDomains,
  secondBrainMicroModules,
  timeline,
  userInsights,
  userMessages,
  userSettings,
  users,
  weeklyEvolution,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  onboardingResponses: many(onboardingResponses),
  secondBrainCore: one(secondBrainCore),
  secondBrainDomains: many(secondBrainDomains),
  secondBrainMicroModules: many(secondBrainMicroModules),
  insights: many(userInsights),
  messages: many(userMessages),
  timelineEvents: many(timeline),
  weeklyEvolution: many(weeklyEvolution),
  progress: one(progressGlobal),
  matchingProfiles: many(matchingProfiles),
  matchingScores: many(matchingScores),
  notifications: many(notifications),
  settings: one(userSettings),
}));

export const onboardingResponsesRelations = relations(onboardingResponses, ({ one }) => ({
  user: one(users, {
    fields: [onboardingResponses.userId],
    references: [users.id],
  }),
}));

export const secondBrainCoreRelations = relations(secondBrainCore, ({ one, many }) => ({
  user: one(users, {
    fields: [secondBrainCore.userId],
    references: [users.id],
  }),
  domains: many(secondBrainDomains),
}));

export const secondBrainDomainsRelations = relations(secondBrainDomains, ({ one, many }) => ({
  user: one(users, {
    fields: [secondBrainDomains.userId],
    references: [users.id],
  }),
  core: one(secondBrainCore, {
    fields: [secondBrainDomains.coreId],
    references: [secondBrainCore.id],
  }),
  microModules: many(secondBrainMicroModules),
  insights: many(userInsights),
}));

export const secondBrainMicroModulesRelations = relations(
  secondBrainMicroModules,
  ({ one }) => ({
    user: one(users, {
      fields: [secondBrainMicroModules.userId],
      references: [users.id],
    }),
    domain: one(secondBrainDomains, {
      fields: [secondBrainMicroModules.domainId],
      references: [secondBrainDomains.id],
    }),
  })
);

export const userInsightsRelations = relations(userInsights, ({ one, many }) => ({
  user: one(users, {
    fields: [userInsights.userId],
    references: [users.id],
  }),
  domain: one(secondBrainDomains, {
    fields: [userInsights.domainId],
    references: [secondBrainDomains.id],
  }),
  messages: many(userMessages),
}));

export const userMessagesRelations = relations(userMessages, ({ one }) => ({
  user: one(users, {
    fields: [userMessages.userId],
    references: [users.id],
  }),
  insight: one(userInsights, {
    fields: [userMessages.insightId],
    references: [userInsights.id],
  }),
}));

export const timelineRelations = relations(timeline, ({ one }) => ({
  user: one(users, {
    fields: [timeline.userId],
    references: [users.id],
  }),
}));

export const weeklyEvolutionRelations = relations(weeklyEvolution, ({ one }) => ({
  user: one(users, {
    fields: [weeklyEvolution.userId],
    references: [users.id],
  }),
}));

export const progressGlobalRelations = relations(progressGlobal, ({ one }) => ({
  user: one(users, {
    fields: [progressGlobal.userId],
    references: [users.id],
  }),
}));

export const matchingProfilesRelations = relations(matchingProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [matchingProfiles.userId],
    references: [users.id],
  }),
  scores: many(matchingScores),
}));

export const matchingScoresRelations = relations(matchingScores, ({ one }) => ({
  user: one(users, {
    fields: [matchingScores.userId],
    references: [users.id],
  }),
  profile: one(matchingProfiles, {
    fields: [matchingScores.profileId],
    references: [matchingProfiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
