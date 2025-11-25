import { InvokeResult, Role, invokeLLM } from "../_core/llm";
import { ENV } from "../_core/env";
import { CoreProfile, emptyBigFive, mergeCoreProfile } from "./core";
import { BrainDomainName, detectDomainsFromText, upsertDomainSignals } from "./domains";
import { detectMicroModules } from "./microModules";
import { PatternInsight, SecondBrainStore } from "./store";

export type BrainUpdateInput = {
  userId: number;
  message: string;
  role?: Role;
  metadata?: Record<string, unknown>;
};

export type InferenceResult = {
  coreUpdates: Partial<CoreProfile>;
  activatedDomains: BrainDomainName[];
  insights: PatternInsight[];
};

const emotionKeywords: Record<string, string[]> = {
  alegria: ["feliz", "animado", "empolgado", "grato"],
  tristeza: ["triste", "chateado", "decepcionado"],
  ansiedade: ["ansioso", "preocupado", "nervoso", "ansiedade"],
  confiança: ["confiante", "seguro", "convencido"],
  frustração: ["frustrado", "irritado", "raiva"],
};

const habitMarkers = ["todo dia", "todos os dias", "diariamente", "sempre", "costumo"];
const preferenceMarkers = ["prefiro", "gosto", "amo", "curto", "favorito"];

export async function runSecondBrainUpdate(
  input: BrainUpdateInput,
  store: SecondBrainStore = new SecondBrainStore()
): Promise<InferenceResult> {
  await store.ensureCore(input.userId);
  await store.logMessage(input.userId, { role: input.role, content: input.message, metadata: input.metadata });

  const domainStates = await store.getDomains(input.userId);
  const detectedDomains = detectDomainsFromText(input.message);
  const updatedStates = { ...domainStates };

  detectedDomains.forEach(({ name, signal }) => {
    const current = updatedStates[name] ?? domainStates[name];
    updatedStates[name] = upsertDomainSignals(current, [signal], signal.reason);
  });

  await store.upsertDomainStates(input.userId, Object.values(updatedStates));

  const activeDomains = Object.values(updatedStates)
    .filter(domain => domain.active)
    .map(domain => domain.name);

  const activatedModules = detectMicroModules(input.message, activeDomains);
  await Promise.all(
    activatedModules.map(module =>
      store.upsertMicroModule(input.userId, module, true, undefined, {
        lastTriggeredAt: Date.now(),
      })
    )
  );

  const patternInsights = buildInsights(input.message, activeDomains, detectedDomains.map(d => d.name));
  await store.addInsights(input.userId, patternInsights);

  const llmUpdate = await inferWithLLM(input.message);

  const coreUpdates: Partial<CoreProfile> = mergeCoreProfile(null, {
    identity: extractIdentity(input.message),
    behavior: inferBehaviors(input.message),
    bigFive: llmUpdate?.bigFive ?? emptyBigFive,
    metacognition: llmUpdate?.metacognition ?? { selfReflection: [], blindspots: [] },
    lifeContext: llmUpdate?.lifeContext ?? { roles: [], goals: [] },
  });

  if (llmUpdate?.core) {
    const merged = mergeCoreProfile(coreUpdates, llmUpdate.core);
    await store.updateCore(input.userId, merged);
  } else {
    await store.updateCore(input.userId, coreUpdates);
  }

  return {
    coreUpdates,
    activatedDomains: activeDomains,
    insights: patternInsights,
  };
}

const extractIdentity = (message: string): CoreProfile["identity"] => {
  const statements: string[] = [];
  const aliases: string[] = [];

  const lower = message.toLowerCase();
  const identityMatch = /eu sou ([^.]+)/i.exec(message);
  if (identityMatch) {
    statements.push(identityMatch[1].trim());
  }

  if (lower.includes("meu nome")) {
    aliases.push(message);
  }

  return { statements, aliases };
};

const inferBehaviors = (message: string): CoreProfile["behavior"] => {
  const habits: string[] = [];
  const preferences: string[] = [];

  habitMarkers.forEach(marker => {
    if (message.toLowerCase().includes(marker)) habits.push(`Hábito detectado: ${marker}`);
  });

  preferenceMarkers.forEach(marker => {
    if (message.toLowerCase().includes(marker)) preferences.push(`Preferência detectada: ${marker}`);
  });

  return { habits, preferences };
};

const buildInsights = (
  message: string,
  activeDomains: BrainDomainName[],
  detectedDomains: BrainDomainName[]
): PatternInsight[] => {
  const insights: PatternInsight[] = [];
  const lower = message.toLowerCase();

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some(keyword => lower.includes(keyword))) {
      insights.push({ category: "emotion", label: emotion, confidence: 70 });
    }
  });

  habitMarkers.forEach(marker => {
    if (lower.includes(marker)) {
      insights.push({ category: "habit", label: marker, confidence: 65 });
    }
  });

  preferenceMarkers.forEach(marker => {
    if (lower.includes(marker)) {
      insights.push({ category: "preference", label: marker, confidence: 60 });
    }
  });

  detectedDomains.forEach(name => {
    insights.push({ category: "domain", label: name, confidence: 80 });
  });

  if (activeDomains.length > 1) {
    insights.push({
      category: "theme",
      label: `Domínios simultâneos: ${activeDomains.join(", ")}`,
      confidence: 55,
    });
  }

  return insights;
};

async function inferWithLLM(message: string) {
  if (!ENV.forgeApiKey) return null;

  try {
    const schema = {
      name: "second_brain_inference",
      schema: {
        type: "object",
        properties: {
          identity: { type: "array", items: { type: "string" } },
          lifeContext: {
            type: "object",
            properties: {
              roles: { type: "array", items: { type: "string" } },
              goals: { type: "array", items: { type: "string" } },
              location: { type: ["string", "null"] },
            },
          },
          bigFive: {
            type: "object",
            properties: {
              openness: { type: "number" },
              conscientiousness: { type: "number" },
              extraversion: { type: "number" },
              agreeableness: { type: "number" },
              neuroticism: { type: "number" },
            },
          },
          behavior: {
            type: "object",
            properties: {
              habits: { type: "array", items: { type: "string" } },
              preferences: { type: "array", items: { type: "string" } },
            },
          },
          metacognition: {
            type: "object",
            properties: {
              selfReflection: { type: "array", items: { type: "string" } },
              blindspots: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    } as const;

    const prompt = `Atue como um "Second Brain". Extraia identidade, contexto de vida, Big Five (0-100), comportamentos e metacognição a partir da mensagem do usuário.`;

    const result: InvokeResult = await invokeLLM({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      responseFormat: { type: "json_schema", json_schema: schema },
    });

    const content = result.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const parsed = JSON.parse(content);
    return {
      core: {
        identity: { statements: parsed.identity ?? [], aliases: [] },
        lifeContext: parsed.lifeContext ?? { roles: [], goals: [] },
        bigFive: parsed.bigFive ?? emptyBigFive,
        behavior: parsed.behavior ?? { habits: [], preferences: [] },
        metacognition: parsed.metacognition ?? { selfReflection: [], blindspots: [] },
      },
      bigFive: parsed.bigFive ?? emptyBigFive,
      metacognition: parsed.metacognition ?? { selfReflection: [], blindspots: [] },
      lifeContext: parsed.lifeContext ?? { roles: [], goals: [] },
    } satisfies Partial<CoreProfile> & { core: CoreProfile };
  } catch (error) {
    console.warn("[SecondBrain] Falha na inferência LLM", error);
    return null;
  }
}
