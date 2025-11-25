import { ChatMessage, ContextEntry, ProcessedChat, Rhythm } from "./types";

const persistentStyle = {
  voice: "assessor ativo, direto e caloroso",
  signature: "Estou acompanhando você em tempo real."
};

const microInsights = [
  "Seu padrão de linguagem mostra foco em impacto imediato.",
  "Você costuma ganhar energia ao testar ideias com poucas variáveis.",
  "Repetiu um desejo de autonomia: priorize decisões que devolvam controle.",
  "Você funciona melhor com checkpoints curtos e visíveis.",
];

const microMissions = [
  "Escolher uma ação de 15 minutos que mova a agulha hoje.",
  "Transformar a última ideia em um teste rápido com prazo de 24h.",
  "Enviar uma mensagem para validar o próximo passo com alguém-chave.",
  "Registrar um aprendizado concreto antes de dormir hoje.",
];

const zeigarnikPrompts = [
  "Qual pequena tarefa ficou aberta e merece 10 minutos agora?",
  "Que conversa você adiou e pode destravar seu próximo movimento?",
  "Há um teste simples que confirme se vale avançar com essa ideia?",
];

const pickCycled = (items: string[], indexSeed: number) => {
  if (items.length === 0) return "";
  return items[indexSeed % items.length];
};

const buildContextLog = (history: ChatMessage[], lastUserMessage: string): ContextEntry[] => {
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

export const applyRhythm = (
  message: string,
  history: ChatMessage[],
): Rhythm => {
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

export const attachMicroInsight = (history: ChatMessage[], message: string, seed: number) => {
  const keyword = message.split(" ")[0] ?? "";
  const scoredSeed = seed + keyword.length;
  return pickCycled(microInsights, scoredSeed);
};

export const attachMicroMission = (history: ChatMessage[], seed: number) => {
  const recentUserTurns = history.filter(msg => msg.role === "user").length;
  return pickCycled(microMissions, seed + recentUserTurns);
};

export const generateAIMessage = (
  message: string,
  history: ChatMessage[],
  seed: number,
) => {
  const rhythm = applyRhythm(message, history);
  const microInsight = attachMicroInsight(history, message, seed);
  const microMission = attachMicroMission(history, seed);

  const blocks = [
    `❓ Pergunta rápida: ${rhythm.question}`,
    `👀 Observação: ${rhythm.observation}`,
    `💡 Insight: ${rhythm.insight}`,
    `🧠 Micro-insight: ${microInsight}`,
    `🎯 Micro-missão: ${microMission}`,
    `🔎 Pergunta profunda: ${rhythm.deepQuestion}`,
    `✨ ${rhythm.styleNote}`,
  ];

  const content = blocks.join("\n");

  return { rhythm, microInsight, microMission, content };
};

export const processUserMessage = (
  input: { message: string; history?: ChatMessage[] }
): ProcessedChat => {
  const history = input.history ?? [];
  const userMessage: ChatMessage = { role: "user", content: input.message };
  const enrichedHistory = [...history, userMessage];
  const seed = enrichedHistory.length;

  const { rhythm, microInsight, microMission, content } = generateAIMessage(
    input.message,
    history,
    seed,
  );

  const reply: ChatMessage = {
    role: "assistant",
    content,
  };

  const contextLog = buildContextLog(enrichedHistory, input.message);
  const futureSuggestions = zeigarnikPrompts.map(prompt => `${prompt} (vou cobrar mais tarde)`);

  return {
    reply,
    rhythm,
    microInsight,
    microMission,
    contextLog,
    futureSuggestions,
    updatedHistory: [...enrichedHistory, reply],
  };
};
