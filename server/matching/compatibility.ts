import { BrainDomainName } from "../secondBrain/domains";
import { DeepProfile } from "./profileBuilder";

export type CompatibilityBias = {
  preferredDomains: Partial<Record<BrainDomainName, number>>;
  favoredInterests: Partial<Record<string, number>>;
  conversationTone: Partial<Record<string, number>>;
};

export type CompatibilityBreakdown = {
  bigFive: number;
  domains: number;
  themes: number;
  hobbies: number;
  conversation: number;
  emotionalTriggers: number;
};

export type CompatibilityResult = {
  score: number;
  breakdown: CompatibilityBreakdown;
  rationale: string[];
};

export const calculateCompatibility = (
  user: DeepProfile,
  candidate: DeepProfile,
  bias?: CompatibilityBias
): CompatibilityResult => {
  const bigFiveScore = scoreBigFive(user, candidate);
  const domainScore = scoreDomainOverlap(user, candidate, bias?.preferredDomains ?? {});
  const themeScore = similarity(user.recurringThemes, candidate.recurringThemes, bias?.favoredInterests ?? {});
  const hobbyScore = similarity(user.hobbies, candidate.hobbies, bias?.favoredInterests ?? {});
  const conversationScore = similarity(user.conversationStyle, candidate.conversationStyle, bias?.conversationTone ?? {});
  const triggerScore = similarity(user.emotionalTriggers, candidate.emotionalTriggers);

  const breakdown: CompatibilityBreakdown = {
    bigFive: bigFiveScore,
    domains: domainScore,
    themes: themeScore,
    hobbies: hobbyScore,
    conversation: conversationScore,
    emotionalTriggers: triggerScore,
  };

  const weightedScore =
    bigFiveScore * 0.35 +
    domainScore * 0.25 +
    themeScore * 0.15 +
    hobbyScore * 0.1 +
    conversationScore * 0.1 +
    triggerScore * 0.05;

  const rationale = buildRationale(user, candidate, breakdown);

  return { score: clamp(weightedScore), breakdown, rationale };
};

const scoreBigFive = (user: DeepProfile, candidate: DeepProfile): number => {
  const dimensions: Array<keyof DeepProfile["core"]["bigFive"]> = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ];

  const distance = dimensions.reduce((sum, key) => {
    const diff = Math.abs(user.core.bigFive[key] - candidate.core.bigFive[key]);
    return sum + diff;
  }, 0);

  const normalized = 100 - distance / dimensions.length;
  return clamp(normalized);
};

const scoreDomainOverlap = (
  user: DeepProfile,
  candidate: DeepProfile,
  bias: CompatibilityBias["preferredDomains"]
): number => {
  const userDomains = user.activeDomains;
  const candidateDomains = candidate.activeDomains;

  if (userDomains.length === 0 || candidateDomains.length === 0) return 50;

  const intersection = userDomains.filter(domain => candidateDomains.includes(domain));
  const union = Array.from(new Set([...userDomains, ...candidateDomains]));

  const baseScore = (intersection.length / union.length) * 100;
  const biasBoost = intersection.reduce((sum, domain) => sum + (bias[domain] ?? 0), 0);

  return clamp(baseScore + biasBoost);
};

const similarity = (
  itemsA: string[],
  itemsB: string[],
  bias: Partial<Record<string, number>> = {}
): number => {
  if (itemsA.length === 0 || itemsB.length === 0) return 40;

  const setA = new Set(itemsA.map(item => item.toLowerCase()));
  const setB = new Set(itemsB.map(item => item.toLowerCase()));

  const intersection = Array.from(setA).filter(item => setB.has(item));
  const union = new Set([...setA, ...setB]);

  const baseScore = (intersection.length / union.size) * 100;
  const biasBoost = intersection.reduce((sum, item) => sum + (bias[item] ?? 0), 0);

  return clamp(baseScore + biasBoost);
};

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const buildRationale = (
  user: DeepProfile,
  candidate: DeepProfile,
  breakdown: CompatibilityBreakdown
): string[] => {
  const reasons: string[] = [];

  if (breakdown.domains >= 60 && user.activeDomains.length > 0) {
    reasons.push(
      `Domínios em comum: ${user.activeDomains
        .filter(domain => candidate.activeDomains.includes(domain))
        .join(", ")}`
    );
  }

  if (breakdown.bigFive >= 65) {
    reasons.push("Compatibilidade alta de perfil comportamental (Big Five)");
  }

  if (breakdown.themes >= 50) {
    reasons.push(`Temas recorrentes alinhados: ${shared(user.recurringThemes, candidate.recurringThemes)}`);
  }

  if (breakdown.hobbies >= 50) {
    reasons.push(`Hobbies compatíveis: ${shared(user.hobbies, candidate.hobbies)}`);
  }

  if (breakdown.conversation >= 50) {
    reasons.push("Estilos de conversa combinam");
  }

  if (breakdown.emotionalTriggers >= 50) {
    reasons.push("Gatilhos emocionais parecidos");
  }

  return reasons.filter(Boolean);
};

const shared = (a: string[], b: string[]): string => {
  const intersection = a.filter(item => b.includes(item));
  return intersection.join(", ");
};
