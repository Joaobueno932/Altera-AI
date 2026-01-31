import { SecondBrainCore as BrainCore } from "../../drizzle/schema";

export type BigFiveScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type CoreProfile = {
  identity: {
    statements: string[];
    aliases: string[];
  };
  lifeContext: {
    location?: string;
    roles: string[];
    goals: string[];
  };
  bigFive: BigFiveScores;
  behavior: {
    habits: string[];
    preferences: string[];
  };
  metacognition: {
    selfReflection: string[];
    blindspots: string[];
  };
  goals: Array<{ title: string; status: string }>;
  strategies: Record<string, unknown>;
};

export const emptyBigFive: BigFiveScores = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

export const createDefaultCoreProfile = (): CoreProfile => ({
  identity: { statements: [], aliases: [] },
  lifeContext: { roles: [], goals: [] },
  bigFive: emptyBigFive,
  behavior: { habits: [], preferences: [] },
  metacognition: { selfReflection: [], blindspots: [] },
  goals: [],
  strategies: {},
});

export const mergeCoreProfile = (
  current: CoreProfile | null | undefined,
  updates: Partial<CoreProfile>
): CoreProfile => {
  const base = current ?? createDefaultCoreProfile();
  return {
    identity: {
      statements: unique([...base.identity.statements, ...(updates.identity?.statements ?? [])]),
      aliases: unique([...base.identity.aliases, ...(updates.identity?.aliases ?? [])]),
    },
    lifeContext: {
      location: updates.lifeContext?.location ?? base.lifeContext.location,
      roles: unique([...base.lifeContext.roles, ...(updates.lifeContext?.roles ?? [])]),
      goals: unique([...base.lifeContext.goals, ...(updates.lifeContext?.goals ?? [])]),
    },
    bigFive: normalizeBigFive(updates.bigFive ?? base.bigFive),
    behavior: {
      habits: unique([...base.behavior.habits, ...(updates.behavior?.habits ?? [])]),
      preferences: unique([...base.behavior.preferences, ...(updates.behavior?.preferences ?? [])]),
    },
    metacognition: {
      selfReflection: unique([
        ...base.metacognition.selfReflection,
        ...(updates.metacognition?.selfReflection ?? []),
      ]),
      blindspots: unique([
        ...base.metacognition.blindspots,
        ...(updates.metacognition?.blindspots ?? []),
      ]),
    },
    goals: updates.goals ?? base.goals,
    strategies: { ...base.strategies, ...(updates.strategies ?? {}) },
  };
};

export const normalizeBigFive = (scores: BigFiveScores): BigFiveScores => ({
  openness: clamp(scores.openness),
  conscientiousness: clamp(scores.conscientiousness),
  extraversion: clamp(scores.extraversion),
  agreeableness: clamp(scores.agreeableness),
  neuroticism: clamp(scores.neuroticism),
});

export const deriveCoreFromRecord = (record?: BrainCore | null): CoreProfile => {
  if (!record) return createDefaultCoreProfile();
  const profile: CoreProfile = {
    identity: (record.identity as any) ?? { statements: [], aliases: [] },
    lifeContext: (record.lifeContext as any) ?? { roles: [], goals: [] },
    bigFive: normalizeBigFive((record as any).bigFive ?? emptyBigFive),
    behavior: (record as any).behavior ?? { habits: [], preferences: [] },
    metacognition: (record as any).metacognition ?? { selfReflection: [], blindspots: [] },
    goals: record.goals ?? [],
    strategies: record.strategies ?? {},
  };

  return profile;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
