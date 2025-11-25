import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { ProgressBar } from "@/components/ui/progress-bar";

const areas = [
  { title: "Carreira", score: 78, trend: "+6%" },
  { title: "Saúde", score: 64, trend: "+2%" },
  { title: "Relações", score: 82, trend: "+4%" },
  { title: "Criatividade", score: 74, trend: "+3%" },
];

const microModules = [
  "Rotina de foco de 25min x 4 blocos",
  "Checklist de energia matinal",
  "Mapa de conexões significativas",
  "Painel de ideias rápidas",
];

export function LifeProgress() {
  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="space-y-4">
        <SectionTitle>Progresso da vida</SectionTitle>
        <div className="grid grid-cols-1 gap-3">
          {areas.map(area => (
            <div key={area.title} className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{area.title}</p>
                <span className="text-xs text-primary">{area.trend}</span>
              </div>
              <ProgressBar progress={area.score} />
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Micro-modules ativos</SectionTitle>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {microModules.map(module => (
            <div key={module} className="p-3 rounded-xl bg-primary/10 text-primary">
              {module}
            </div>
          ))}
        </div>
      </MobileCard>
    </div>
  );
}
