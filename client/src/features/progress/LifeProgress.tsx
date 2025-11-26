import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { trpc } from "@/lib/trpc";

export function LifeProgress() {
  const { data, isLoading } = trpc.progress.getOverview.useQuery();

  const areas = data?.areas ?? [];
  const microModules = data?.microModules ?? [];

  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="space-y-4">
        <SectionTitle>Progresso da vida</SectionTitle>
        {areas.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">Nenhum dado disponível ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {(areas.length > 0 ? areas : Array.from({ length: 4 })).map((area, idx) => (
              <div key={area ? area.title : idx} className="p-3 rounded-xl bg-muted/50">
                {area ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{area.title}</p>
                      <span className="text-xs text-primary">{area.trend}</span>
                    </div>
                    <ProgressBar progress={area.score} />
                  </>
                ) : (
                  <div className="animate-pulse h-4 bg-muted rounded" />
                )}
              </div>
            ))}
          </div>
        )}
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Micro-modules ativos</SectionTitle>
        {microModules.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">Nenhum micro-module ativo ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 text-sm">
            {(microModules.length > 0 ? microModules : Array.from({ length: 4 })).map((module, idx) => (
              <div key={module ?? idx} className="p-3 rounded-xl bg-primary/10 text-primary">
                {module ?? <div className="animate-pulse h-4 bg-primary/40 rounded" />}
              </div>
            ))}
          </div>
        )}
      </MobileCard>
    </div>
  );
}
