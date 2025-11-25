import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

const timeline = [
  { title: "Insight capturado", detail: "Tema recorrente: impacto social", time: "Hoje" },
  { title: "Evolução semanal", detail: "+12% consistência de foco", time: "Ontem" },
  { title: "Domínio ativado", detail: "Projetos de longo prazo", time: "Segunda" },
];

const weeklyInsights = [
  "Você conclui mais tarefas quando inicia com uma micro-missão.",
  "Conversas profundas aumentam em 18% sua motivação na semana.",
  "Seu melhor horário para decisões: início da tarde.",
];

const activeDomains = [
  { label: "Ideias", progress: 70 },
  { label: "Projetos", progress: 50 },
  { label: "Pessoas", progress: 60 },
  { label: "Hábitos", progress: 40 },
];

export function SecondBrainDashboard() {
  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">Second Brain</p>
            <h2 className="text-xl font-semibold">Timeline viva</h2>
            <p className="text-sm text-muted-foreground">Evolução, padrões e gatilhos semanais.</p>
          </div>
        </div>
        <div className="space-y-3">
          {timeline.map(item => (
            <div key={item.title} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs text-primary">{item.time}</span>
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Insights semanais</SectionTitle>
        <div className="space-y-2">
          {weeklyInsights.map(text => (
            <div key={text} className="p-3 rounded-xl bg-primary/10 text-primary text-sm leading-relaxed">
              <Sparkles className="w-4 h-4 inline mr-2" />
              {text}
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Domínios ativados</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {activeDomains.map(domain => (
            <div key={domain.label} className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{domain.label}</span>
                <span className="text-primary">{domain.progress}%</span>
              </div>
              <ProgressBar progress={domain.progress} />
            </div>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Evolução semanal</SectionTitle>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 to-secondary/15 border border-border/70 flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Consistência média</p>
            <p className="text-2xl font-bold">+18%</p>
            <p className="text-xs text-muted-foreground">Baseado nas últimas 2 semanas</p>
          </div>
        </div>
      </MobileCard>
    </div>
  );
}
