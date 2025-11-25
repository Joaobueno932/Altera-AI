import { eq } from "drizzle-orm";
import { BrainInsight, brainInsights } from "../../drizzle/schema";
import { getDb } from "../db";
import { SecondBrainStore } from "../secondBrain/store";

export type TriggerEvaluation = {
  microInsightDue: boolean;
  microMissionDue: boolean;
  checkInSlot: "morning" | "afternoon" | "evening" | "weekly" | null;
  zeigarnikHook: boolean;
  pacing: "fast" | "balanced" | "slow";
  varietySeed: number;
};

export type EngagementMemory = {
  lastInsightAt?: Date;
  lastMissionAt?: Date;
  lastCheckInAt?: Date;
  lastPace?: "fast" | "balanced" | "slow";
};

export const evaluateTriggers = async (
  userId: number,
  recentMessages: { content: string; createdAt: Date }[],
  store: SecondBrainStore
): Promise<TriggerEvaluation> => {
  const now = new Date();
  const totalMessages = recentMessages.length;
  const memory = await loadMemory(userId, store);

  const microInsightDue = totalMessages >= 3 && totalMessages % 4 === 0;
  const microMissionDue = !memory.lastMissionAt || hoursDiff(now, memory.lastMissionAt) > 24;
  const checkInSlot = resolveCheckInSlot(now, memory.lastCheckInAt);
  const zeigarnikHook = totalMessages > 6 && Boolean(memory.lastMissionAt);

  const pacing = derivePacing(memory.lastPace, recentMessages);
  const varietySeed = (now.getDay() * 24 + now.getHours()) % 100;

  return {
    microInsightDue,
    microMissionDue,
    checkInSlot,
    zeigarnikHook,
    pacing,
    varietySeed,
  };
};

const resolveCheckInSlot = (
  now: Date,
  lastCheckIn?: Date
): TriggerEvaluation["checkInSlot"] => {
  if (!lastCheckIn) return "morning";

  const hours = hoursDiff(now, lastCheckIn);
  if (hours > 168) return "weekly";
  if (hours > 8 && now.getHours() < 12) return "morning";
  if (hours > 8 && now.getHours() < 18) return "afternoon";
  if (hours > 8) return "evening";
  return null;
};

const derivePacing = (
  previous: TriggerEvaluation["pacing"] | undefined,
  recentMessages: { content: string; createdAt: Date }[]
): TriggerEvaluation["pacing"] => {
  if (recentMessages.length < 5) return previous ?? "balanced";
  const lastTwo = recentMessages.slice(-2);
  const longMessage = lastTwo.some(msg => msg.content.length > 320);
  if (longMessage) return "slow";
  const veryShort = lastTwo.every(msg => msg.content.length < 80);
  if (veryShort) return "fast";
  return previous ?? "balanced";
};

const hoursDiff = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);

const loadMemory = async (userId: number, store: SecondBrainStore): Promise<EngagementMemory> => {
  const microModules = await store.getMicroModules(userId);
  const memory = microModules.find(module => module.name === "engagement_memory");
  if (!memory) return {};
  return {
    lastInsightAt: memory.state.lastInsightAt ? new Date(memory.state.lastInsightAt as string) : undefined,
    lastMissionAt: memory.state.lastMissionAt ? new Date(memory.state.lastMissionAt as string) : undefined,
    lastCheckInAt: memory.state.lastCheckInAt ? new Date(memory.state.lastCheckInAt as string) : undefined,
    lastPace: memory.state.lastPace as EngagementMemory["lastPace"],
  };
};

export const persistMemory = async (
  userId: number,
  memory: EngagementMemory,
  store: SecondBrainStore
): Promise<void> => {
  await store.upsertMicroModule(
    userId,
    {
      name: "engagement_memory",
      domain: "performance",
      depth: 1,
      triggers: ["message_count", "checkins", "pacing"],
    },
    true,
    undefined,
    {
      lastInsightAt: memory.lastInsightAt?.toISOString(),
      lastMissionAt: memory.lastMissionAt?.toISOString(),
      lastCheckInAt: memory.lastCheckInAt?.toISOString(),
      lastPace: memory.lastPace,
    }
  );
};

export const dedupeInsights = async (
  userId: number,
  candidates: Array<{ category: BrainInsight["category"]; label: string }>
): Promise<typeof candidates> => {
  const db = await getDb();
  if (!db) return candidates;
  const rows = await db
    .select({ label: brainInsights.label })
    .from(brainInsights)
    .where(eq(brainInsights.userId, userId));
  const existing = new Set(rows.map(row => row.label));
  return candidates.filter(candidate => !existing.has(candidate.label));
};
