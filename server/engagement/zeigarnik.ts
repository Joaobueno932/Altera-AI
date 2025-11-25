import { SecondBrainStore } from "../secondBrain/store";
import { MissionState } from "./microMissions";

export type ZeigarnikHook = {
  missionId?: string;
  reminder: string;
  nextStep: string;
};

export const buildZeigarnikHooks = async (
  userId: number,
  recentMessages: { content: string; createdAt: Date }[],
  enabled: boolean
): Promise<ZeigarnikHook[]> => {
  if (!enabled) return [];
  const store = new SecondBrainStore();
  const modules = await store.getMicroModules(userId);
  const missions = modules.find(module => module.name === "micro_missions");
  const missionState = (missions?.state as MissionState | undefined)?.missions ?? [];

  const unfinished = missionState.slice(0, 1);
  const hooks: ZeigarnikHook[] = unfinished.map(item => ({
    missionId: item.id,
    reminder: `Quer retomar a missão: ${item.description}?`,
    nextStep: "Eu posso quebrar em 1 passo de 3 minutos agora.",
  }));

  if (hooks.length === 0 && recentMessages.length > 0) {
    const last = recentMessages[recentMessages.length - 1];
    hooks.push({
      reminder: "Você deixou uma ideia em aberto, posso fechar agora?",
      nextStep: `Resumo do último ponto: ${truncate(last.content, 120)}`,
    });
  }

  await store.upsertMicroModule(
    userId,
    { name: "zeigarnik_hooks", domain: "performance", depth: 1, triggers: ["resume", "loop"] },
    true,
    undefined,
    { active: hooks.length > 0, lastRefreshed: new Date().toISOString() }
  );

  return hooks;
};

const truncate = (value: string, size: number) => (value.length > size ? `${value.slice(0, size)}...` : value);
