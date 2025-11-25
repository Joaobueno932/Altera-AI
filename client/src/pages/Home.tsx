import { useAuth } from "@/_core/hooks/useAuth";
import { BrainIcon } from "@/components/BrainIcon";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { MobileCard } from "@/components/ui/mobile-card";
import { AssessorChat } from "@/features/chat/AssessorChat";
import { MatchingDeck } from "@/features/matching/MatchingDeck";
import { SecondBrainDashboard } from "@/features/secondBrain/SecondBrainDashboard";
import { LifeProgress } from "@/features/progress/LifeProgress";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, MessageCircle, Sparkles, TrendingUp, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const tabs = [
  { id: "brain", label: "Brain", icon: <Sparkles className="w-5 h-5" /> },
  { id: "matching", label: "Matching", icon: <UserCheck className="w-5 h-5" /> },
  { id: "progress", label: "Progresso", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [active, setActive] = useState("brain");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/70">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainIcon className="w-10 h-10" />
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Second Brain</p>
              <h1 className="text-xl font-semibold leading-tight">Seu app nativo</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || "Você"}</p>
              <p className="text-xs text-muted-foreground">Assessor ativo</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await logout();
                setLocation("/login");
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className={cn("max-w-md mx-auto px-4 pb-28 pt-4 space-y-4")}
      >
        <MobileCard className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ritmo dinâmico</p>
            <p className="text-lg font-semibold">Assessor acompanhando seu dia</p>
          </div>
          <div className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm">Mobile-first</div>
        </MobileCard>

        {renderContent()}
      </main>

      <BottomNav items={tabs} active={active} onSelect={setActive} />
    </div>
  );
}
