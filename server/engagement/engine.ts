import type { ChatMessage, Rhythm } from "../chat/types";
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

const persistentStyle = {
  voice: "assessor ativo, direto e caloroso",
  signature: "Estou acompanhando você em tempo real.",
};

export class EngagementEngine {
  private store: SecondBrainStore;

  constructor(store = new SecondBrainStore()) {
    this.store = store;
  }

  async processMessage(
    userId: number,
    message: string,
    history: ChatMessage[] = []
  ): Promise<EngagementResult & { rhythm: Rhythm; reply: ChatMessage; microInsight?: string; microMission?: string }> {
    await this.store.ensureCore(userId);

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

    const rhythm = buildRhythm(message, history);
    const microInsight = microInsightPlan.insights[0]?.label;
    const microMission = microMissions[0]?.description;

    const reply: ChatMessage = {
      role: "assistant",
      content: formatReply({
        rhythm,
        microInsight,
        microMission,
        checkIn: checkIns[0]?.prompt,
        zeigarnik: zeigarnikHooks[0]?.reminder,
      }),
    };

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
      rhythm,
      reply,
      microInsight,
      microMission,
    };
  }
}

const formatReply = (params: {
  rhythm: Rhythm;
  microInsight?: string;
  microMission?: string;
  checkIn?: string;
  zeigarnik?: string;
}): string => {
  const blocks = [
    `❓ Pergunta rápida: ${params.rhythm.question}`,
    `👀 Observação: ${params.rhythm.observation}`,
    `💡 Insight: ${params.rhythm.insight}`,
    `🔎 Pergunta profunda: ${params.rhythm.deepQuestion}`,
    `🧠 Micro-insight: ${params.microInsight ?? "Vou registrar o que você disse."}`,
    `🎯 Micro-missão: ${params.microMission ?? "Posso sugerir um passo de 3 minutos."}`,
    `🔁 Zeigarnik: ${params.zeigarnik ?? "Me avisa se quiser que eu guarde algo em aberto."}`,
    `📅 Check-in: ${params.checkIn ?? "Quer que eu te lembre disso depois?"}`,
    `✨ ${params.rhythm.styleNote}`,
  ];

  return blocks.join("\n");
};

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

const buildRhythm = (message: string, history: ChatMessage[]): Rhythm => {
  const sentimentCue = message.length > 140 ? "Alongado" : "Enxuto";
  const previousSignals = history
    .filter(entry => entry.role === "assistant")
    .slice(-1)
    .map(entry => entry.content)
    .join(" ");

  return {
    question: `O que você realmente quer destravar agora? (${sentimentCue})`,
    observation: previousSignals
      ? `Notei que você reagiu bem quando falei sobre: ${previousSignals}`
      : "Estou entrando em ritmo com você em tempo real.",
    insight: "Padrão: você busca clareza rápida e pequenas vitórias.",
    deepQuestion: "Se der certo, como você saberá em 48h?",
    styleNote: persistentStyle.signature,
  };
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
