import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, Sparkles, X } from "lucide-react";
import { useState } from "react";

const profiles = [
  {
    name: "Lia",
    match: 92,
    headline: "Exploradora criativa • Impacto social",
    tags: ["Deep talks", "Projetos paralelos", "Ritmo semanal"],
  },
  {
    name: "Rafa",
    match: 88,
    headline: "Engenheiro curioso • Mentor de carreira",
    tags: ["Mentoria", "Habits", "Foco tarde"],
  },
  {
    name: "Maya",
    match: 85,
    headline: "Produtora musical • Busca conexões autênticas",
    tags: ["Criatividade", "Construir junto", "Noite"],
  },
];

export function MatchingDeck() {
  const [index, setIndex] = useState(0);

  const nextProfile = () => setIndex(prev => (prev + 1) % profiles.length);

  const profile = profiles[index];

  return (
    <div className="space-y-4 pb-24">
      <MobileCard className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-secondary/20 text-secondary-foreground flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-foreground">Matching</p>
            <h2 className="text-xl font-semibold">Perfis compatíveis</h2>
            <p className="text-sm text-muted-foreground">Carrossel estilo tinder com deslize suave.</p>
          </div>
        </div>
        <div className="relative h-80 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={profile.name}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-full rounded-3xl bg-cover bg-center bg-gradient-to-br from-background to-primary/10 p-5 flex flex-col justify-between border border-border/70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.headline}</p>
                  </div>
                  <div className="px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                    {profile.match}% match
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map(tag => (
                    <span key={tag} className="px-3 py-2 rounded-full bg-background/60 border border-border/70 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button variant="ghost" className="flex-1 h-12" onClick={nextProfile}>
                    <X className="w-5 h-5 mr-2" /> Pular
                  </Button>
                  <Button className="flex-1 h-12 bg-gradient-to-r from-secondary to-primary" onClick={nextProfile}>
                    <Heart className="w-5 h-5 mr-2" /> Conectar
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Compatibilidade em percentil</SectionTitle>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <p>Ritmo social</p>
            <p className="text-2xl font-bold">88º</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/10 text-secondary-foreground">
            <p>Estilo de decisão</p>
            <p className="text-2xl font-bold">91º</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/60">
            <p>Interesses comuns</p>
            <p className="text-2xl font-bold">85º</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <p>Gatilhos motivacionais</p>
            <p className="text-2xl font-bold">90º</p>
          </div>
        </div>
      </MobileCard>

      <MobileCard>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          Swipes acionam sugestões de micro-conexões e missões sociais automáticas.
        </div>
      </MobileCard>
    </div>
  );
}
