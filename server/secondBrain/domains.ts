export type BrainDomainName =
  | "health"
  | "career"
  | "relationships"
  | "learning"
  | "finance"
  | "performance";

export type DomainSignal = {
  reason: string;
  weight: number;
  lastSeenAt: number;
};

export type DomainState = {
  name: BrainDomainName;
  active: boolean;
  activationReason?: string;
  signals: Record<string, DomainSignal>;
};

export const domainKeywords: Record<BrainDomainName, string[]> = {
  health: ["exercise", "health", "sleep", "nutrition", "diet", "therapy"],
  career: ["job", "work", "career", "promotion", "empresa", "startup"],
  relationships: ["family", "relationship", "friend", "marriage", "partner", "parents"],
  learning: ["study", "learning", "course", "class", "training", "leitura"],
  finance: ["money", "finance", "budget", "invest", "economy", "expenses"],
  performance: ["focus", "productivity", "performance", "habits", "routine", "discipline"],
};

export const createEmptyDomainState = (name: BrainDomainName): DomainState => ({
  name,
  active: false,
  activationReason: undefined,
  signals: {},
});

export const upsertDomainSignals = (
  existing: DomainState,
  newSignals: DomainSignal[],
  activationReason?: string
): DomainState => {
  const signals = { ...existing.signals } as Record<string, DomainSignal>;
  newSignals.forEach(signal => {
    const id = signal.reason;
    const current = signals[id];
    if (!current || signal.weight >= current.weight) {
      signals[id] = signal;
    }
  });

  const strongest = Object.values(signals).sort((a, b) => b.weight - a.weight)[0];
  const active = !!strongest && strongest.weight >= 0.5;

  return {
    ...existing,
    active,
    activationReason: activationReason ?? strongest?.reason ?? existing.activationReason,
    signals,
  };
};

export const detectDomainsFromText = (
  text: string,
  now: number = Date.now()
): Array<{ name: BrainDomainName; signal: DomainSignal }> => {
  const lowered = text.toLowerCase();
  const matches: Array<{ name: BrainDomainName; signal: DomainSignal }> = [];

  (Object.keys(domainKeywords) as BrainDomainName[]).forEach(name => {
    const keywords = domainKeywords[name];
    const hit = keywords.find(keyword => lowered.includes(keyword));
    if (hit) {
      matches.push({
        name,
        signal: {
          reason: `Palavra-chave: ${hit}`,
          weight: 0.6,
          lastSeenAt: now,
        },
      });
    }
  });

  return matches;
};
