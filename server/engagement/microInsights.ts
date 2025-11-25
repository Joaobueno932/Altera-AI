import { PatternInsight, SecondBrainStore } from "../secondBrain/store";
import { dedupeInsights } from "./triggers";

export type MicroInsightPlan = {
  insights: PatternInsight[];
  mirroredPatterns: string[];
  contentFragments: string[];
  weeklyInsight?: string;
};

const emotionKeywords = {
  ansiedade: "ansiedade", medo: "medo", feliz: "ânimo positivo", triste: "tristeza", animado: "motivação",
};

export const generateMicroInsights = async (
  userId: number,
  message: string,
  recentMessages: { content: string; createdAt: Date }[],
  store: SecondBrainStore,
  options: { due: boolean; varietySeed: number }
): Promise<MicroInsightPlan> => {
  const candidates: PatternInsight[] = [];
  const mirroredPatterns: string[] = [];
  const fragments: string[] = [];

  const lowered = message.toLowerCase();
  const tokens = lowered.split(/[^\p{L}]+/u).filter(Boolean);
  const keyword = detectKeyword(tokens);

  if (keyword) {
    mirroredPatterns.push(`Você vem mencionando ${keyword} — quer que eu conecte com algo já registrado?`);
    candidates.push({ category: "theme", label: `Tema recorrente: ${keyword}` });
  }

  const emotion = detectEmotion(lowered);
  if (emotion) {
    candidates.push({ category: "emotion", label: `Humor detectado: ${emotion}` });
  }

  const habit = detectHabit(lowered);
  if (habit) {
    candidates.push({ category: "habit", label: habit });
    fragments.push(`Em micro dose: que tal repetir ${habit} por 2 minutos hoje?`);
  }

  const preference = detectPreference(lowered);
  if (preference) {
    candidates.push({ category: "preference", label: preference });
  }

  const domain = detectDomain(lowered);
  if (domain) {
    candidates.push({ category: "domain", label: domain });
  }

  const weeklyInsight = buildWeeklyInsight(recentMessages, options.varietySeed);
  if (weeklyInsight) fragments.push(weeklyInsight);

  const filtered = options.due ? await dedupeInsights(userId, candidates) : [];

  return {
    insights: filtered,
    mirroredPatterns,
    contentFragments: fragments,
    weeklyInsight: weeklyInsight ?? undefined,
  };
};

const detectKeyword = (tokens: string[]): string | null => {
  const frequency: Record<string, number> = {};
  tokens.forEach(token => {
    if (token.length < 4) return;
    frequency[token] = (frequency[token] ?? 0) + 1;
  });
  const [top] = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
  if (top && top[1] > 1) return top[0];
  return null;
};

const detectEmotion = (lowered: string): string | null => {
  const found = Object.keys(emotionKeywords).find(key => lowered.includes(key));
  return found ? emotionKeywords[found as keyof typeof emotionKeywords] : null;
};

const detectHabit = (lowered: string): string | null => {
  if (lowered.includes("todo dia") || lowered.includes("diariamente")) {
    return "Hábito diário mencionado";
  }
  if (lowered.includes("rotina")) return "Rotina desejada";
  return null;
};

const detectPreference = (lowered: string): string | null => {
  if (lowered.includes("prefiro")) return "Preferência explicitada";
  if (lowered.includes("gosto")) return "Interesse declarado";
  return null;
};

const detectDomain = (lowered: string): string | null => {
  const signals = ["carreira", "trabalho", "saúde", "relacionamento", "estudo", "finanças", "dinheiro"];
  const match = signals.find(signal => lowered.includes(signal));
  return match ? `Domínio ativo: ${match}` : null;
};

const buildWeeklyInsight = (
  recent: { content: string; createdAt: Date }[],
  seed: number
): string | null => {
  if (recent.length < 7) return null;
  const slice = recent.slice(-7);
  const avgLength = slice.reduce((sum, msg) => sum + msg.content.length, 0) / slice.length;
  const direction = seed % 2 === 0 ? "mais concisas" : "mais profundas";
  return `Insight semanal: suas mensagens ficaram ${direction} (média ${Math.round(avgLength)} caracteres).`;
};
