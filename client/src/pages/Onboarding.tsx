import { BrainIcon } from "@/components/BrainIcon";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Link2, Sparkles } from "lucide-react";

const onboardingPages = [
  {
    icon: Brain,
    title: "Crie seu segundo eu",
    description: "Uma IA que aprende sua personalidade e age como um segundo cérebro inteligente",
    image: "brain-texture"
  },
  {
    icon: Link2,
    title: "Conecte seus apps",
    description: "Integre Instagram, WhatsApp, Spotify e mais para treinar sua IA pessoal",
    image: "neurons"
  },
  {
    icon: Sparkles,
    title: "Deixe a IA pensar com você",
    description: "Receba insights, sugestões personalizadas e converse com seu eu mais racional",
    image: "chat-preview"
  }
];

export default function Onboarding() {
  const [currentPage, setCurrentPage] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setLocation("/signup");
    }
  };

  const handleSkip = () => {
    setLocation("/signup");
  };

  const page = onboardingPages[currentPage];
  const Icon = page?.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-8">
      <div className="w-full flex justify-end">
        <Button variant="ghost" onClick={handleSkip} className="text-white">
          Pular
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md">
        <div className="relative w-64 h-64 rounded-3xl overflow-hidden glass-effect flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20"></div>
          {Icon && (
            <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)] flex items-center justify-center">
              <Icon className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">{page?.title}</h2>
          <p className="text-lg text-muted-foreground">{page?.description}</p>
        </div>

        <div className="flex space-x-2">
          {onboardingPages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentPage
                  ? "w-8 bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)]"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)] hover:opacity-90 transition-opacity"
        >
          {currentPage < onboardingPages.length - 1 ? "Próximo" : "Começar"}
        </Button>
      </div>
    </div>
  );
}
