import { z } from "zod";

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { calculateCompatibility } from "./compatibility";
import { MatchingEngine } from "./matchingEngine";
import { FeedSuggestion, MatchingFeed } from "./matchingFeed";
import { DeepProfile, ProfileBuilder } from "./profileBuilder";
import { MatchingFeedInput, MatchingFeedOutput } from "@shared/schemas";

const MAX_LIMIT = 50;

export type MatchingFeedCard = {
  id: number;
  name: string;
  match: number;
  headline: string;
  tags: string[];
};

export const matchingRouter = router({
  feed: protectedProcedure
    .input(MatchingFeedInput)
    .output(MatchingFeedOutput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const limit = input?.limit ?? 10;

      const engine = new MatchingEngine();

      const candidateIds = await fetchCandidateIds(userId, limit * 3);

      let suggestions: FeedSuggestion[] = [];
      const profileMap = new Map<number, DeepProfile>();

      if (candidateIds.length > 0) {
        suggestions = await engine.suggestMatches(userId, candidateIds);
        const candidates = await Promise.all(candidateIds.map(id => engine.buildProfile(id)));
        candidates.forEach(profile => profileMap.set(profile.userId, profile));
      }

      if (suggestions.length === 0) {
        const fallback = await buildSyntheticFeed(userId, limit);
        suggestions = fallback.suggestions;
        fallback.profiles.forEach((profile, id) => profileMap.set(id, profile));
      }

      const items = suggestions
        .slice(0, limit)
        .map(suggestion => toCard(profileMap.get(suggestion.userId), suggestion));

      return { items };
    }),
});

async function fetchCandidateIds(currentUserId: number, limit: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .limit(limit + 5);

  return rows
    .map(row => row.id)
    .filter(id => id !== currentUserId)
    .slice(0, limit);
}

async function buildSyntheticFeed(userId: number, limit: number) {
  const builder = new ProfileBuilder();
  const feed = new MatchingFeed();

  const userProfile = await builder.build(userId);

  const seeds = createSyntheticSeeds(userId, limit);
  const syntheticProfiles = await Promise.all(
    seeds.map(async seed => {
      const profile = await builder.build(seed.id);
      profile.core.identity.aliases = seed.aliases ?? profile.core.identity.aliases;
      profile.activeDomains = seed.activeDomains ?? profile.activeDomains;
      profile.domains = {
        ...profile.domains,
        ...(seed.activeDomains ?? []).reduce((acc, domain) => {
          const state = profile.domains[domain];
          acc[domain] = {
            ...state,
            active: true,
            activationReason: state.activationReason ?? "sugestão sintética",
            signals: state.signals.length > 0 ? state.signals : ["interesse registrado"],
          };
          return acc;
        }, {} as DeepProfile["domains"]),
      };
      profile.recurringThemes = seed.themes ?? profile.recurringThemes;
      profile.hobbies = seed.hobbies ?? profile.hobbies;
      profile.interests = seed.interests ?? profile.interests;
      profile.conversationStyle = seed.conversationStyle ?? profile.conversationStyle;
      profile.emotionalTriggers = seed.emotionalTriggers ?? profile.emotionalTriggers;
      profile.recentTopics = seed.recentTopics ?? profile.recentTopics;
      return profile;
    }),
  );

  const scored = syntheticProfiles.map(profile => ({
    profile,
    compatibility: calculateCompatibility(userProfile, profile, feed.getPreferenceBias(userId)),
  }));

  const suggestions = feed.buildFeed(userProfile, scored);
  const profiles = new Map(syntheticProfiles.map(profile => [profile.userId, profile] as const));

  return { suggestions, profiles };
}

function createSyntheticSeeds(userId: number, limit: number) {
  const baseId = userId + 100;
  const template = [
    {
      id: baseId + 1,
      aliases: ["Lia"],
      activeDomains: ["relationships", "learning"] as DeepProfile["activeDomains"],
      themes: ["impacto social", "criatividade"],
      hobbies: ["música", "arte", "fotografia"],
      interests: ["educação", "inovação"],
      conversationStyle: ["prefere tom acolhedor", "aprecia explorar possibilidades"],
      emotionalTriggers: ["entusiasmo/novidade"],
      recentTopics: ["projetos comunitários", "design"],
    },
    {
      id: baseId + 2,
      aliases: ["Rafa"],
      activeDomains: ["career", "performance"] as DeepProfile["activeDomains"],
      themes: ["mentoria", "liderança"],
      hobbies: ["corrida", "tecnologia"],
      interests: ["engenharia", "mentoria"],
      conversationStyle: ["organiza ideias em passos"],
      emotionalTriggers: ["entusiasmo/novidade"],
      recentTopics: ["carreira", "foco"]
    },
    {
      id: baseId + 3,
      aliases: ["Maya"],
      activeDomains: ["learning", "relationships"] as DeepProfile["activeDomains"],
      themes: ["criatividade", "autenticidade"],
      hobbies: ["produção musical", "shows", "arte"],
      interests: ["comunidade", "projetos paralelos"],
      conversationStyle: ["gosta de conversas dinâmicas"],
      emotionalTriggers: ["entusiasmo/novidade"],
      recentTopics: ["música", "colaborações"]
    },
  ];

  if (limit <= template.length) return template.slice(0, limit);

  const extra: typeof template = Array.from({ length: limit - template.length }, (_, idx) => {
    const id = baseId + template.length + idx + 1;
    return {
      id,
      aliases: [`Conexão ${id}`],
      activeDomains: ["learning", "performance"] as DeepProfile["activeDomains"],
      themes: ["crescimento", "colaboração"],
      hobbies: ["leitura", "construir projetos"],
      interests: ["produtividade", "tecnologia"],
      conversationStyle: ["aprecia explorar possibilidades"],
      emotionalTriggers: ["entusiasmo/novidade"],
      recentTopics: ["trabalho em equipe"],
    };
  });

  return [...template, ...extra];
}

function toCard(profile: DeepProfile | undefined, suggestion: FeedSuggestion): MatchingFeedCard {
  const fallbackName = `Conexão #${suggestion.userId}`;
  const name = profile?.core.identity.aliases[0] ?? profile?.core.identity.statements[0] ?? fallbackName;

  const headline = suggestion.feedPreview;

  const candidateTags = [
    ...(suggestion.rationale ?? []),
    ...(profile?.activeDomains.slice(0, 2) ?? []),
    ...(profile?.hobbies.slice(0, 2) ?? []),
  ];

  const tags = Array.from(new Set(candidateTags.filter(Boolean))).slice(0, 3);

  return {
    id: suggestion.userId,
    name,
    match: Math.round(suggestion.score),
    headline,
    tags: tags.length > 0 ? tags : ["perfil em descoberta"],
  };
}
