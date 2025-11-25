import { BrainDomainName } from "../secondBrain/domains";
import { SecondBrainStore } from "../secondBrain/store";

export type MicroMission = {
  id: string;
  description: string;
  domain?: BrainDomainName;
  reward: string;
  timeframe: "today" | "this_week";
  commitmentQuestion: string;
  guidedChoices: string[];
  meaning: string;
};

export type MissionState = {
  missions: MicroMission[];
  lastUpdated: string;
};

export const planMicroMissions = async (
  userId: number,
  triggers: { due: boolean; varietySeed: number },
  hints: { domain?: BrainDomainName; preferredStyle?: string }
): Promise<MicroMission[]> => {
  if (!triggers.due) return [];

  const existing = await loadState(userId);
  const template = buildTemplate(hints.domain, triggers.varietySeed);
  const mission: MicroMission = {
    id: `${Date.now()}`,
    description: template.description,
    domain: template.domain,
    reward: template.reward,
    timeframe: "today",
    commitmentQuestion: `Quer assumir isso hoje? Posso te lembrar depois em formato ${hints.preferredStyle ?? "curto"}.`,
    guidedChoices: template.choices,
    meaning: template.meaning,
  };

  const missions = [mission, ...(existing?.missions ?? []).slice(0, 2)];
  await persistState(userId, missions);
  return missions;
};

const buildTemplate = (domain?: BrainDomainName, seed = 1) => {
  const baseReward = seed % 2 === 0 ? "emoji surpresa" : "elogio personalizado";
  const choices = ["Vamos lá", "Quero ajustar", "Pular por enquanto"];
  if (domain === "health") {
    return {
      description: "Fazer 1 micro-pausa de respiração por 2 minutos",
      domain,
      reward: baseReward,
      choices,
      meaning: "Cuida do seu corpo e mente em pequenas doses.",
    };
  }
  if (domain === "career") {
    return {
      description: "Anotar 1 vitória ou aprendizado do dia",
      domain,
      reward: baseReward,
      choices,
      meaning: "Refinar seu portfólio mental e alimentar o Second Brain.",
    };
  }
  return {
    description: "Registrar uma pequena ação que avance seu objetivo central",
    domain,
    reward: baseReward,
    choices,
    meaning: "Transformar intenção em progresso medido.",
  };
};

const loadState = async (userId: number): Promise<MissionState | null> => {
  const store = new SecondBrainStore();
  const modules = await store.getMicroModules(userId);
  const module = modules.find(item => item.name === "micro_missions");
  if (!module) return null;
  return module.state as MissionState;
};

const persistState = async (userId: number, missions: MicroMission[]): Promise<void> => {
  const store = new SecondBrainStore();
  await store.upsertMicroModule(
    userId,
    { name: "micro_missions", domain: "performance", depth: 2, triggers: ["mission", "commitment"] },
    true,
    undefined,
    { missions, lastUpdated: new Date().toISOString() }
  );
};
