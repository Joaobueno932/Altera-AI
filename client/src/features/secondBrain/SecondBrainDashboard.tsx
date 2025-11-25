import { MobileCard } from "@/components/ui/mobile-card";
import { TimelineBoard } from "./timeline/TimelineBoard";

export function SecondBrainDashboard() {
  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/60">
        <p className="text-xs uppercase tracking-wide text-primary">Second Brain</p>
        <p className="text-lg font-semibold">Timeline visual, sempre atualizada</p>
        <p className="text-sm text-muted-foreground">
          Eventos do dia, evolução contínua, padrões emocionais e hábitos recorrentes em um só painel.
        </p>
      </MobileCard>

      <TimelineBoard />
    </div>
  );
}
