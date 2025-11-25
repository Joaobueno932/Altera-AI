import { Role } from "../_core/llm";
import { SecondBrainStore, PatternInsight } from "../secondBrain/store";
import { BrainDomainName } from "../secondBrain/domains";
import { evaluateTriggers, persistMemory } from "./triggers";
import { generateMicroInsights } from "./microInsights";
import { planMicroMissions, MicroMission } from "./microMissions";
import { planCheckIns } from "./checkins";
import { buildNotifications } from "./notifications";
import { buildZeigarnikHooks, ZeigarnikHook } from "./zeigarnik";

export type EngagementResult = {
  insights: PatternInsight[];
  microMissions: MicroMission[];
  checkIns: ReturnType<typeof planCheckIns>;
  zeigarnikHooks: ZeigarnikHook[];
  notifications: ReturnType<typeof buildNotifications>;
  conversationalStyle: string[];
  guidedQuestions: string[];
  fragments: string[];
  resumeMechanic?: string;
  matchingHint?: string;
  weeklyStory?: string;
  pacing: "fast" | "balanced" | "slow";
  varietyMix: { focus: number; exploration: number };
};

export class EngagementEngine {
  private store: SecondBrainStore;

  constructor(store = new SecondBrainStore()) {
    this.store = store;
  }

  async processMessage(userId: number, message: string, role: Role = "user"): Promise<EngagementResult> {
    await this.store.ensureCore(userId);
    await this.store.logMessage(userId, { role, content: message, metadata: { kind: "engagement" } });

    const recentMessages = await this.store.listRecentMessages(userId, 50);
    const triggers = await evaluateTriggers(userId, recentMessages, this.store);

    const microInsightPlan = await generateMicroInsights(userId, message, recentMessages, this.store, {
      due: triggers.microInsightDue,
      varietySeed: triggers.varietySeed,
    });

    if (microInsightPlan.insights.length > 0) {
      await this.store.addInsights(userId, microInsightPlan.insights);
    }

    const primaryDomain = detectPrimaryDomain(microInsightPlan.insights);
    const microMissions = await planMicroMissions(userId, { due: triggers.microMissionDue, varietySeed: triggers.varietySeed }, {
      domain: primaryDomain,
      preferredStyle: triggers.pacing === "fast" ? "balas" : "parágrafos curtos",
    });

    const checkIns = planCheckIns(triggers.checkInSlot, triggers.varietySeed);
    const zeigarnikHooks = await buildZeigarnikHooks(userId, recentMessages, triggers.zeigarnikHook);
    const notifications = buildNotifications(checkIns, microMissions, zeigarnikHooks);

    await applyCoreUpdates(userId, microInsightPlan.insights, message, this.store);

    await persistMemory(userId, {
      lastInsightAt: microInsightPlan.insights.length > 0 ? new Date() : undefined,
      lastMissionAt: microMissions.length > 0 ? new Date() : undefined,
      lastCheckInAt: checkIns.length > 0 ? new Date() : undefined,
      lastPace: triggers.pacing,
    }, this.store);

    return {
      insights: microInsightPlan.insights,
      microMissions,
      checkIns,
      zeigarnikHooks,
      notifications,
      conversationalStyle: buildStyle(triggers.pacing, microInsightPlan.mirroredPatterns),
      guidedQuestions: buildGuidedQuestions(microMissions, primaryDomain),
      fragments: microInsightPlan.contentFragments,
      resumeMechanic: zeigarnikHooks[0]?.reminder,
      matchingHint: primaryDomain ? `Match com peers interessados em ${primaryDomain}` : undefined,
      weeklyStory: buildWeeklyStory(microInsightPlan.weeklyInsight, primaryDomain),
      pacing: triggers.pacing,
      varietyMix: { focus: 0.8, exploration: 0.2 },
    };
  }
}

const detectPrimaryDomain = (insights: PatternInsight[]): BrainDomainName | undefined => {
  const domainInsight = insights.find(item => item.category === "domain");
  if (domainInsight?.label.includes("saúde")) return "health";
  if (domainInsight?.label.includes("carreira")) return "career";
  if (domainInsight?.label.includes("relacionamento")) return "relationships";
  if (domainInsight?.label.includes("estudo")) return "learning";
  if (domainInsight?.label.includes("finan")) return "finance";
  return undefined;
};

const buildStyle = (pacing: EngagementResult["pacing"], mirrored: string[]): string[] => {
  const base = pacing === "fast" ? "Respostas curtas, objetivas." : pacing === "slow" ? "Tom calmo e reflexivo." : "Tom equilibrado.";
  return [
    base,
    "Manter coerência com preferências já registradas.",
    "Variar 20% com curiosidade e 80% com foco no objetivo.",
    ...mirrored,
  ];
};

const buildGuidedQuestions = (missions: MicroMission[], domain?: BrainDomainName): string[] => {
  const commitment = missions.map(mission => mission.commitmentQuestion);
  const domainChoice = domain
    ? [`Quer explorar opções rápidas ou aprofundar em ${domain}?`]
    : ["Prefere que eu ofereça 3 opções ou siga com uma sugestão direta?"];
  return [...commitment, ...domainChoice];
};

const buildWeeklyStory = (insight?: string, domain?: BrainDomainName): string | undefined => {
  if (!insight) return undefined;
  const focus = domain ? `no domínio ${domain}` : "na sua jornada";
  return `Micro-história da semana ${focus}: ${insight}`;
};

const applyCoreUpdates = async (
  userId: number,
  insights: PatternInsight[],
  message: string,
  store: SecondBrainStore
) => {
  const behavior = insights
    .filter(insight => insight.category === "habit" || insight.category === "preference")
    .map(insight => insight.label);

  const aliases = extractAliases(message);

  if (behavior.length === 0 && aliases.length === 0) return;

  await store.updateCore(userId, {
    identity: { aliases },
    behavior: { habits: behavior, preferences: behavior },
  });
};

const extractAliases = (message: string): string[] => {
  const match = message.match(/me chama de ([^.,!]+)/i);
  return match ? [match[1].trim()] : [];
};
