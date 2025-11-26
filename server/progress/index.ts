import { desc, eq } from "drizzle-orm";
import { progressGlobal, weeklyEvolution } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function clampScore(value: number | undefined | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatTrend(current: number | undefined, previous: number | undefined) {
  if (current === undefined || previous === undefined) return "+0%";
  const diff = Math.round(current - previous);
  const sign = diff > 0 ? "+" : diff < 0 ? "" : "+";
  return `${sign}${diff}%`;
}

const defaultAreas = [
  { title: "Carreira", score: 78, trend: "+6%" },
  { title: "Saúde", score: 64, trend: "+2%" },
  { title: "Relações", score: 82, trend: "+4%" },
  { title: "Criatividade", score: 74, trend: "+3%" },
];

const defaultMicroModules = [
  "Rotina de foco de 25min x 4 blocos",
  "Checklist de energia matinal",
  "Mapa de conexões significativas",
  "Painel de ideias rápidas",
];

export const progressRouter = router({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = ctx.user.id;

    const [weekly, progress] = await Promise.all([
      db
        ?.select()
        .from(weeklyEvolution)
        .where(eq(weeklyEvolution.userId, userId))
        .orderBy(desc(weeklyEvolution.weekStart))
        .limit(4),
      db
        ?.select()
        .from(progressGlobal)
        .where(eq(progressGlobal.userId, userId))
        .limit(1),
    ]);

    const weeklySeries = weekly ?? [];
    const progressRow = progress?.[0];

    const latestMetrics = (() => {
      const rawMetrics = weeklySeries[0]?.metrics as unknown;
      if (!rawMetrics || typeof rawMetrics !== "object" || Array.isArray(rawMetrics)) return null;
      const maybeAreas = (rawMetrics as Record<string, unknown>).areas ?? rawMetrics;
      if (!maybeAreas || typeof maybeAreas !== "object" || Array.isArray(maybeAreas)) return null;
      return maybeAreas as Record<string, unknown>;
    })();

    const previousMetrics = (() => {
      const rawMetrics = weeklySeries[1]?.metrics as unknown;
      if (!rawMetrics || typeof rawMetrics !== "object" || Array.isArray(rawMetrics)) return null;
      const maybeAreas = (rawMetrics as Record<string, unknown>).areas ?? rawMetrics;
      if (!maybeAreas || typeof maybeAreas !== "object" || Array.isArray(maybeAreas)) return null;
      return maybeAreas as Record<string, unknown>;
    })();

    const areaKeys = latestMetrics ? Object.keys(latestMetrics) : [];

    const areas = areaKeys.map(title => {
      const currentScore = clampScore(latestMetrics?.[title] as number | undefined);
      const previousScore = clampScore(previousMetrics?.[title] as number | undefined);
      return {
        title,
        score: currentScore ?? 0,
        trend: formatTrend(currentScore, previousScore),
      };
    });

    if (areas.length === 0) {
      const current = clampScore(progressRow?.overallScore ?? weeklySeries[0]?.sentiment ?? undefined);
      const previous = clampScore(weeklySeries[1]?.sentiment ?? undefined);
      if (current !== undefined) {
        areas.push({ title: "Progresso geral", score: current, trend: formatTrend(current, previous) });
      }
    }

    const microModulesFromMilestones = (progressRow?.milestones ?? [])
      .map(entry => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const label = record.title ?? record.name ?? record.label;
        return typeof label === "string" && label.trim().length > 0 ? label : null;
      })
      .filter((value): value is string => Boolean(value));

    const microModulesFromWeekly = weeklySeries
      .map(item => item.focus)
      .filter((value): value is string => Boolean(value));

    const microModules = microModulesFromMilestones.length > 0
      ? microModulesFromMilestones
      : microModulesFromWeekly.length > 0
        ? microModulesFromWeekly
        : defaultMicroModules;

    return {
      areas: areas.length > 0 ? areas : defaultAreas,
      microModules,
    } as const;
  }),
});
