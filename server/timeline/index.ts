import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { progressGlobal, weeklyEvolution } from "../../drizzle/schema";
import { SecondBrainStore } from "../secondBrain/store";

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
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 8;
      const now = new Date();

      const store = new SecondBrainStore();
      await store.load(ctx.user.id);

      const [recentMessages, recentInsights, domainStates, db] = await Promise.all([
        store.listRecentMessages(ctx.user.id, limit * 3),
        store.listRecentInsights(ctx.user.id, limit * 2),
        store.getDomains(ctx.user.id),
        getDb(),
      ]);

      const baseSeries = Array.from({ length: 7 }).map((_, idx) => ({
        label: `D-${6 - idx}`,
        value: Math.round(oscillate(65 + idx * 2, 12)),
      }));

      const deriveMood = (text: string | undefined, category?: string) => {
        const lowered = (text ?? "").toLowerCase();
        if (category?.toLowerCase().includes("energia") || lowered.includes("animad")) return "energizado";
        if (lowered.includes("foco") || lowered.includes("focado")) return "focado";
        if (lowered.includes("calmo") || lowered.includes("tranquilo")) return "calmo";
        if (lowered.includes("curios")) return "curioso";
        if (lowered.includes("reflex")) return "reflexivo";
        return moodPalette[Math.floor(oscillate(1, 10)) % moodPalette.length];
      };

      const realEvents = [
        ...recentInsights.map(insight => ({
          id: `insight-${insight.id ?? insight.createdAt?.getTime() ?? Math.random()}`,
          title: "Insight identificado",
          description: insight.summary ?? "Insight adicionado",
          category: insight.category ?? "insight",
          mood: deriveMood(insight.summary, insight.category),
          impact: Math.min(100, Math.max(0, insight.confidence ?? 60)),
          createdAt: insight.createdAt ?? now,
        })),
        ...recentMessages.map(message => ({
          id: `msg-${message.createdAt?.getTime() ?? Math.random()}`,
          title: "Mensagem registrada",
          description: message.content,
          category: "mensagem",
          mood: deriveMood(message.content),
          impact: Math.round(50 + oscillate(message.content.length % 20, 10)),
          createdAt: message.createdAt ?? now,
        })),
      ]
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        .slice(0, limit)
        .map(event => ({
          ...event,
          timeLabel: relativeLabel(Math.max(1, (now.getTime() - event.createdAt.getTime()) / 1000 / 60)),
        }));

      const fallbackEvents = Array.from({ length: Math.max(0, limit - realEvents.length) }).map((_, idx) => {
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

      const events = [...realEvents, ...fallbackEvents].slice(0, limit);

      const consistentHabits = (() => {
        const activeDomains = Object.values(domainStates).filter(domain => domain.active);
        if (activeDomains.length === 0) {
          return habitCatalog.map((habit, idx) => ({
            ...habit,
            consistency: Math.round(oscillate(72 + idx * 5, 18)),
            lastOccurrence: relativeLabel((idx + 2) * 90),
          }));
        }

        return activeDomains.map((domain, idx) => {
          const lastSignal = Object.values(domain.signals).sort((a, b) => b.lastSeenAt - a.lastSeenAt)[0];
          return {
            name: `Padrão em ${domain.name}`,
            cadence: domain.activationReason ?? "registro recente",
            category: domain.name,
            consistency: Math.max(20, Math.min(95, 60 + Object.keys(domain.signals).length * 8 + idx * 4)),
            lastOccurrence: lastSignal
              ? relativeLabel((now.getTime() - lastSignal.lastSeenAt) / 1000 / 60)
              : "hoje",
          };
        });
      })();

      const progressFromDb = async () => {
        if (!db) return null;
        const series = await db
          .select()
          .from(weeklyEvolution)
          .where(eq(weeklyEvolution.userId, ctx.user.id))
          .orderBy(weeklyEvolution.weekStart)
          .limit(7);

        if (series.length === 0) return null;

        const graph = series.map(row => ({
          label: new Date(row.weekStart).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
          value: Math.min(100, Math.max(0, row.sentiment ?? 50)),
        }));

        const progressRow = await db
          .select()
          .from(progressGlobal)
          .where(eq(progressGlobal.userId, ctx.user.id))
          .limit(1);

        return {
          graph,
          overall: progressRow[0]?.overallScore ?? graph[graph.length - 1]?.value ?? 60,
        };
      };

      const progressData = (await progressFromDb()) ?? { graph: baseSeries, overall: Math.round(oscillate(76, 10)) };
      const progressChange = progressData.graph.length > 1
        ? Math.round(progressData.graph[progressData.graph.length - 1].value - progressData.graph[0].value)
        : Math.round(oscillate(14, 4));

      const emotionalBreakdown = (() => {
        if (recentInsights.length === 0) {
          return {
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
          };
        }

        const categories = recentInsights.reduce<Record<string, number>>((acc, insight) => {
          const key = insight.category ?? "outros";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        const total = Object.values(categories).reduce((sum, value) => sum + value, 0) || 1;
        const breakdown = Object.entries(categories)
          .slice(0, 4)
          .map(([label, count]) => ({
            label,
            value: Math.round((count / total) * 100),
            tone: count > 1 ? "positive" : "neutral",
          }));

        const triggers = recentMessages
          .slice(0, 5)
          .map(message => (message.content.length > 60 ? `${message.content.slice(0, 57)}...` : message.content));

        return {
          dominant: breakdown[0]?.label ?? "Focado",
          breakdown,
          triggers: triggers.length > 0 ? triggers : ["Mensagens recentes orientaram a análise"],
        };
      })();

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
          overall: progressData.overall,
          change: progressChange,
          graph: progressData.graph,
        },
        emotionalPatterns: emotionalBreakdown,
        habits: consistentHabits,
      };
    }),
});
