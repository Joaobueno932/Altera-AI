import { EngagementEngine } from "../engagement/engine";
import { SecondBrainStore } from "../secondBrain/store";
import { ChatMessage, ContextEntry, ProcessedChat } from "./types";

const persistentStyle = {
  voice: "assessor ativo, direto e caloroso",
  signature: "Estou acompanhando você em tempo real.",
};

const buildContextLog = (history: ChatMessage[]): ContextEntry[] => {
  const recentUserMessages = history.filter(msg => msg.role === "user");
  const lastTwo = recentUserMessages.slice(-2);

  const themes = lastTwo.map((msg, idx) => ({
    title: idx === lastTwo.length - 1 ? "Pulso atual" : "Contexto recente",
    note: msg.content,
  }));

  const cadence: ContextEntry = {
    title: "Estilo",
    note: `${persistentStyle.voice} · ${persistentStyle.signature}`,
  };

  return [...themes, cadence];
};

export const processUserMessage = async (
  input: { userId: number; message: string; history?: ChatMessage[] }
): Promise<ProcessedChat> => {
  const history = input.history ?? [];
  const userMessage: ChatMessage = { role: "user", content: input.message };
  const enrichedHistory = [...history, userMessage];

  const store = new SecondBrainStore();
  await store.load(input.userId);
  await store.addMessage(input.userId, {
    role: "user",
    content: input.message,
    metadata: { channel: "chat" },
  });

  const engine = new EngagementEngine(store);
  const engagement = await engine.processMessage(input.userId, input.message, enrichedHistory);

  const reply = engagement.reply;
  const updatedHistory = [...enrichedHistory, reply];

  await store.logMessage(input.userId, {
    role: "assistant",
    content: reply.content,
    metadata: { channel: "chat", rhythm: engagement.rhythm.styleNote },
  });

  const futureSuggestions = engagement.zeigarnikHooks
    .map(hook => `${hook.reminder}${hook.nextStep ? ` ${hook.nextStep}` : ""}`.trim())
    .filter(Boolean);

  return {
    reply,
    rhythm: engagement.rhythm,
    insights: engagement.insights,
    microMissions: engagement.microMissions,
    zeigarnikHooks: engagement.zeigarnikHooks,
    checkIns: engagement.checkIns,
    contextLog: buildContextLog(enrichedHistory),
    futureSuggestions,
    microInsight: engagement.microInsight ?? engagement.insights[0]?.label,
    microMission: engagement.microMission ?? engagement.microMissions[0]?.description,
    updatedHistory,
  };
};
