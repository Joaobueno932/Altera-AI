export type CheckInPlan = {
  slot: "morning" | "afternoon" | "evening" | "weekly";
  prompt: string;
  scope: "dia" | "semana";
};

export const planCheckIns = (
  slot: CheckInPlan["slot"] | null,
  varietySeed: number
): CheckInPlan[] => {
  if (!slot) return [];
  const scope = slot === "weekly" ? "semana" : "dia";
  const prompts = {
    morning: "Qual é a intenção principal para hoje?",
    afternoon: "Quer medir o progresso parcial?",
    evening: "Que micro vitória você teve hoje?",
    weekly: "Vamos fechar a semana com 1 insight e 1 próximo passo?",
  } as const;

  const spice = varietySeed % 3 === 0 ? "(responda em uma frase)" : "(posso sugerir 3 opções)";
  return [
    {
      slot,
      prompt: `${prompts[slot]} ${spice}`,
      scope,
    },
  ];
};
