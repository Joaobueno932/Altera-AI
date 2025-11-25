import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

const moodPalette = ["focado", "calmo", "energizado", "curioso", "reflexivo"] as const;
const habitCatalog = [
  { name: "Jornada de foco", cadence: "manhãs úteis", category: "Foco" },
  { name: "Check-in emocional", cadence: "todos os dias", category: "Bem-estar" },
  { name: "Revisão de aprendizados", cadence: "segundas e quintas", category: "Aprendizado" },
  { name: "Contato com mentores", cadence: "quartas", category: "Relações" },
];

function relativeLabel(minutesAgo: number) {
  if (minutesAgo < 60) return `há ${Math.max(1, Math.round(minutesAgo))}min`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d atrás`;
}

function oscillate(base: number, variance: number) {
  const seed = Date.now() / 1000 / 60; // minutes
  return Math.max(0, Math.min(100, base + Math.sin(seed) * variance));
}

export const timelineRouter = router({
  snapshot: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(3).max(20).optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const limit = input?.limit ?? 8;
      const now = new Date();
      const baseSeries = Array.from({ length: 7 }).map((_, idx) => ({
        label: `D-${6 - idx}`,
        value: Math.round(oscillate(65 + idx * 2, 12)),
      }));

      const events = Array.from({ length: limit }).map((_, idx) => {
        const minutesAgo = (idx + 1) * 45;
        const mood = moodPalette[idx % moodPalette.length];
        return {
          id: `${ctx.user.id}-${idx}-${now.getTime()}`,
          title: idx % 2 === 0 ? "Micro-missão concluída" : "Reflexão registrada",
          description:
            idx % 3 === 0
              ? "Você fechou um bloco de foco profundo."
              : "Nova percepção adicionada à área de projetos.",
          category: idx % 2 === 0 ? "progresso" : "reflexão",
          mood,
          impact: Math.round(oscillate(60 + idx * 4, 15)),
          timeLabel: relativeLabel(minutesAgo),
        } as const;
      });

      const consistentHabits = habitCatalog.map((habit, idx) => ({
        ...habit,
        consistency: Math.round(oscillate(72 + idx * 5, 18)),
        lastOccurrence: relativeLabel((idx + 2) * 90),
      }));

      return {
        updatedAt: now.toISOString(),
        events,
        evolutions: {
          streakDays: Math.round(oscillate(9, 3)),
          focusGain: Math.round(oscillate(18, 6)),
          resilience: Math.round(oscillate(74, 8)),
          wins: [
            "Você manteve o mesmo horário de início em 4 dias seguidos.",
            "Seu tempo em tarefas profundas aumentou 22% nesta semana.",
            "Você registrou 3 reflexões que viraram próximos passos.",
          ],
        },
        progress: {
          overall: Math.round(oscillate(76, 10)),
          change: Math.round(oscillate(14, 4)),
          graph: baseSeries,
        },
        emotionalPatterns: {
          dominant: "Calmo e focado",
          breakdown: [
            { label: "Calmo", value: Math.round(oscillate(42, 6)), tone: "positive" },
            { label: "Focado", value: Math.round(oscillate(36, 5)), tone: "positive" },
            { label: "Ansioso", value: Math.round(oscillate(12, 4)), tone: "attention" },
            { label: "Cansado", value: Math.round(oscillate(10, 3)), tone: "neutral" },
          ],
          triggers: [
            "Reuniões longas à tarde",
            "Blocos sem pausa a cada 90min",
            "Notificações sociais perto do almoço",
          ],
        },
        habits: consistentHabits,
      };
    }),
});
