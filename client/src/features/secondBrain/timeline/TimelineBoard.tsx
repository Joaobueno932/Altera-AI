import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Activity, Brain, Clock, Flame, HeartPulse, RefreshCw } from "lucide-react";
import type React from "react";

const moodTone: Record<string, string> = {
  focado: "bg-emerald-100 text-emerald-700",
  calmo: "bg-sky-100 text-sky-700",
  energizado: "bg-amber-100 text-amber-700",
  curioso: "bg-indigo-100 text-indigo-700",
  reflexivo: "bg-purple-100 text-purple-700",
};

export function TimelineBoard() {
  const { data, isLoading, isRefetching, refetch } = trpc.timeline.snapshot.useQuery(
    { limit: 7 },
    {
      refetchInterval: 15000,
    },
  );

  if (isLoading || !data) {
    return (
      <div className="space-y-4 pb-24 animate-pulse">
        <MobileCard className="h-36" />
        <MobileCard className="h-48" />
        <MobileCard className="h-44" />
        <MobileCard className="h-52" />
      </div>
    );
  }

  const maxGraphValue = Math.max(...data.progress.graph.map(point => point.value));
  const updatedTime = new Date(data.updatedAt);

  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">Timeline viva</p>
            <p className="text-lg font-semibold">Fluxo atualizado em tempo real</p>
            <p className="text-xs text-muted-foreground">Eventos, evoluções e padrões emocionais.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className={cn(
            "p-2 rounded-full border border-border/70 text-muted-foreground hover:text-primary transition",
            isRefetching && "animate-spin text-primary",
          )}
          aria-label="Atualizar timeline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Eventos recentes</SectionTitle>
        <div className="relative pl-4">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border/70" />
          <div className="space-y-3">
            {data.events.map(event => (
              <div key={event.id} className="flex gap-3 items-start">
                <div className="relative mt-1">
                  <span className="absolute -left-[11px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
                </div>
                <div className="flex-1 rounded-xl bg-muted/50 p-3 border border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.timeLabel}</span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-primary">{event.category}</span>
                  </div>
                  <p className="font-semibold mt-1">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full",
                        moodTone[event.mood] ?? "bg-secondary/20 text-secondary-foreground",
                      )}
                    >
                      {event.mood}
                    </span>
                    <span className="text-primary">Impacto +{event.impact}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Evoluções monitoradas</SectionTitle>
        <div className="grid grid-cols-3 gap-3 text-center">
          <MetricPill label="Streak" value={`${data.evolutions.streakDays}d`} icon={<Flame className="w-4 h-4" />} />
          <MetricPill label="+Foco" value={`+${data.evolutions.focusGain}%`} icon={<Activity className="w-4 h-4" />} />
          <MetricPill label="Resiliência" value={`${data.evolutions.resilience}%`} icon={<HeartPulse className="w-4 h-4" />} />
        </div>
        <div className="space-y-2">
          {data.evolutions.wins.map(win => (
            <div key={win} className="p-3 rounded-xl bg-primary/10 text-primary text-sm">
              {win}
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-4">
        <SectionTitle>Gráficos de progresso</SectionTitle>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="text-primary font-semibold">+{data.progress.change}%</span>
            </div>
            <ProgressBar progress={data.progress.overall} />
          </div>
          <div className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
            {data.progress.overall}%
          </div>
        </div>
        <div className="flex items-end gap-2 h-28">
          {data.progress.graph.map(point => (
            <div key={point.label} className="flex-1 flex flex-col gap-1 items-center">
              <div
                className="w-full rounded-full bg-gradient-to-t from-primary/30 to-primary"
                style={{ height: `${(point.value / maxGraphValue) * 100}%` }}
                aria-label={`Valor ${point.value}`}
              />
              <span className="text-[10px] text-muted-foreground">{point.label}</span>
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Padrões emocionais</SectionTitle>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60">
          <div>
            <p className="text-xs text-muted-foreground">Tendência dominante</p>
            <p className="text-lg font-semibold">{data.emotionalPatterns.dominant}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">tempo real</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.emotionalPatterns.breakdown.map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-muted/50 border border-border/60">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <span className="text-primary">{item.value}%</span>
              </div>
              <ProgressBar progress={item.value} />
              <p className="text-[11px] text-muted-foreground capitalize mt-1">{item.tone}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Gatilhos rastreados</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {data.emotionalPatterns.triggers.map(trigger => (
              <span key={trigger} className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                {trigger}
              </span>
            ))}
          </div>
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Hábitos recorrentes</SectionTitle>
        <div className="space-y-2">
          {data.habits.map(habit => (
            <div key={habit.name} className="p-3 rounded-xl bg-muted/50 border border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.cadence}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{habit.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground">
                <span>Último registro {habit.lastOccurrence}</span>
                <span className="text-primary font-medium">{habit.consistency}%</span>
              </div>
              <ProgressBar progress={habit.consistency} />
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground text-right">Atualizado {updatedTime.toLocaleTimeString()}</div>
      </MobileCard>
    </div>
  );
}

function MetricPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/70 flex flex-col items-center gap-1">
      <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
