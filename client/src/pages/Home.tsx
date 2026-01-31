import { useAuth } from "@/_core/hooks/useAuth";
import { BrainIcon } from "@/components/BrainIcon";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { InsightBubble } from "@/components/ui/insight-bubble";
import { MissionCard } from "@/components/ui/mission-card";
import { MobileContainer } from "@/components/ui/mobile-container";
import { ProfileCard } from "@/components/ui/profile-card";
import { SectionTitle } from "@/components/ui/section-title";
import { TagSelector } from "@/components/ui/tag-selector";
import { AssessorChat } from "@/features/chat/AssessorChat";
import { MatchingDeck } from "@/features/matching/MatchingDeck";
import { SecondBrainDashboard } from "@/features/secondBrain/SecondBrainDashboard";
import { LifeProgress } from "@/features/progress/LifeProgress";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, MessageCircle, Sparkles, TrendingUp, UserCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

const tabs = [
  { id: "brain", label: "Brain", icon: <Sparkles className="w-5 h-5" /> },
  { id: "matching", label: "Matching", icon: <UserCheck className="w-5 h-5" /> },
  { id: "progress", label: "Progresso", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [pathname, setLocation] = useLocation();
  const [active, setActive] = useState("brain");

  const tagOptions = useMemo(
    () =>
      tabs.map(tab => ({
        label: tab.label,
        value: tab.id,
        icon: tab.icon,
        hint: tab.id === "brain" ? "ativo" : undefined,
      })),
    []
  );

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) return;
    // Evita loops de navegação caso já esteja na tela de login
    if (pathname === "/login") return;
    setLocation("/login");
  }, [loading, isAuthenticated, pathname, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (active) {
      case "matching":
        return <MatchingDeck />;
      case "progress":
        return <LifeProgress />;
      case "chat":
        return <AssessorChat />;
      default:
        return <SecondBrainDashboard />;
    }
  };

  return (
    <>
      <MobileContainer hasBottomNav>
        <header className="sticky top-0 z-30 -mx-4 mb-2 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between border-b border-border/70 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner shadow-primary/30">
                <BrainIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Second Brain</p>
                <h1 className="text-xl font-semibold leading-tight">Experience</h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={async () => {
                await logout();
                setLocation("/login");
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <section className="space-y-4">
          <ProfileCard
            name={user?.name || "Você"}
            role="Assessor ativo"
            status="Presença em tempo real garantida"
            onAction={() => setActive("progress")}
            actionLabel="Ver status"
          />

          <SectionTitle
            eyebrow="Fluxo diário"
            title="Selecione seu foco"
            subtitle="Interface mobile-first com micro animações e cores oficiais"
            action={
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActive("brain")}> 
                Resetar
              </Button>
            }
          />

          <TagSelector
            options={tagOptions}
            value={[active]}
            onChange={([next]) => next && setActive(next)}
            className="pt-1"
          />

          <InsightBubble
            title="Assistente atento ao seu contexto"
            description="Design minimalista, cores oficiais e animações suaves para cada interação."
          />

          <MissionCard
            title="Missão do dia"
            description="Organizar prioridades, revisar conhecimentos e acompanhar progresso."
            progress={72}
            location="Hub mobile"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" size="sm" onClick={() => setActive("matching")}>
                  Matching
                </Button>
                <Button className="w-full" size="sm" onClick={() => setActive("chat")}>
                  Abrir chat
                </Button>
              </div>
            }
          />

          <main className={cn("space-y-4")}>{renderContent()}</main>
        </section>
      </MobileContainer>

      <BottomNav items={tabs} active={active} onSelect={setActive} />
    </>
  );
}
