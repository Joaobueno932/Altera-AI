import { z } from "zod";

// --- Auth ---
export const AuthMeOutput = z.object({
  id: z.number(),
  email: z.string().optional(),
  name: z.string().optional(),
  // Adicione outros campos de usuário conforme necessário
}).nullable();

export const AuthLogoutOutput = z.object({
  success: z.boolean(),
});

// --- Onboarding ---
export const OnboardingInput = z.array(
  z.object({
    id: z.string(),
    responses: z.array(z.string()),
  })
);

export const OnboardingOutput = z.object({
  success: z.boolean(),
});

// --- Chat ---
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const ChatTalkInput = z.object({
  message: z.string().min(1, "Mensagem obrigatória"),
  history: z.array(ChatMessageSchema).default([]),
});

// O output do chat é mais dinâmico, mas podemos definir a estrutura base
export const ChatTalkOutput = z.any(); 

// --- Timeline ---
export const TimelineSnapshotInput = z.object({
  limit: z.number().min(3).max(20).optional(),
}).optional();

export const TimelineEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  mood: z.string(),
  impact: z.number(),
  timeLabel: z.string(),
  createdAt: z.date().optional(),
});

export const TimelineSnapshotOutput = z.object({
  updatedAt: z.string(),
  events: z.array(TimelineEventSchema),
  evolutions: z.object({
    streakDays: z.number(),
    focusGain: z.number(),
    resilience: z.number(),
    wins: z.array(z.string()),
  }),
  progress: z.object({
    overall: z.number(),
    change: z.number(),
    graph: z.array(z.object({
      label: z.string(),
      value: z.number(),
    })),
  }),
  emotionalPatterns: z.object({
    dominant: z.string(),
    breakdown: z.array(z.object({
      label: z.string(),
      value: z.number(),
      tone: z.string(),
    })),
    triggers: z.array(z.string()),
  }),
  habits: z.array(z.object({
    name: z.string(),
    cadence: z.string(),
    category: z.string(),
    consistency: z.number(),
    lastOccurrence: z.string(),
  })),
});

// --- Progress ---
export const ProgressOverviewOutput = z.object({
  areas: z.array(z.object({
    title: z.string(),
    score: z.number(),
    trend: z.string(),
  })),
  microModules: z.array(z.string()),
});

// --- Matching ---
export const MatchingFeedInput = z.object({
  limit: z.number().min(1).max(50).default(10),
}).optional();

export const MatchingFeedCardSchema = z.object({
  id: z.number(),
  name: z.string(),
  match: z.number(),
  headline: z.string(),
  tags: z.array(z.string()),
});

export const MatchingFeedOutput = z.object({
  items: z.array(MatchingFeedCardSchema),
});
