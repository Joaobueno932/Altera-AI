import { Chip } from "@/components/ui/chip";
import { MobileCard } from "@/components/ui/mobile-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { cn } from "@/lib/utils";
import { saveOnboardingProgress, submitOnboarding } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { onboardingSteps, type OnboardingStep } from "./onboardingData";

const animationVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 }
};

export function OnboardingFlow({ onFinish }: { onFinish?: () => void }) {
  const [answers, setAnswers] = useLocalStorageState<Record<string, string[]>>(
    "onboarding-progress",
    {}
  );
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const step: OnboardingStep | undefined = onboardingSteps[index];
  const progress = Math.round(((index + 1) / onboardingSteps.length) * 100);

  useEffect(() => {
    saveOnboardingProgress(
      Object.entries(answers).map(([id, responses]) => ({ id, responses }))
    );
  }, [answers]);

  const toggleOption = (value: string) => {
    if (!step) return;
    setAnswers(prev => {
      const current = prev[step.id] || [];
      const exists = current.includes(value);
      let nextValues: string[];
      if (step.allowMultiple) {
        nextValues = exists ? current.filter(v => v !== value) : [...current, value];
      } else {
        nextValues = exists ? [] : [value];
      }
      return { ...prev, [step.id]: nextValues };
    });
  };

  const canProceed = useMemo(() => (step ? (answers[step.id]?.length ?? 0) > 0 : false), [step, answers]);

  const handleNext = async () => {
    if (!step || saving) return;
    if (index < onboardingSteps.length - 1) {
      setSaving(true);
      await saveOnboardingProgress(
        Object.entries(answers).map(([id, responses]) => ({ id, responses }))
      );
      setSaving(false);
      setIndex(prev => prev + 1);
    } else {
      setSaving(true);
      await submitOnboarding(
        Object.entries(answers).map(([id, responses]) => ({ id, responses }))
      );
      setSaving(false);
      setDone(true);
      onFinish?.();
    }
  };

  const handleBack = () => {
    if (index === 0 || saving) return;
    setIndex(prev => prev - 1);
  };

  if (!step && done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold">Onboarding concluído</h2>
        <p className="text-muted-foreground">
          Seu Second Brain foi inicializado e o matching está calibrado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <div className="max-w-md mx-auto px-4 pb-24 pt-6 flex flex-col gap-6">
        <div className="space-y-3">
          <ProgressBar progress={progress} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{index + 1} / {onboardingSteps.length}</span>
            <span>20-40s</span>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step && (
            <motion.div
              key={step.id}
              variants={animationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <MobileCard className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary">Onboarding</p>
                    <h2 className="text-2xl font-bold leading-tight">{step.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {step.options.map(option => (
                    <Chip
                      key={option}
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "w-full justify-between text-left text-base flex items-center",
                        answers[step.id]?.includes(option)
                          ? "bg-primary/20 border-primary/70 text-primary shadow-inner"
                          : ""
                      )}
                    >
                      {option}
                      {answers[step.id]?.includes(option) && <CheckCircle2 className="w-5 h-5" />}
                    </Chip>
                  ))}
                </div>
              </MobileCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex-1 h-12"
            onClick={handleBack}
            disabled={index === 0 || saving}
          >
            Voltar
          </Button>
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary"
            onClick={handleNext}
            disabled={!canProceed || saving}
          >
            {index === onboardingSteps.length - 1 ? "Finalizar" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
