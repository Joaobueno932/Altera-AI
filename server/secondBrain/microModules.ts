import { BrainDomainName } from "./domains";

export type MicroModuleActivation = {
  name: string;
  domain?: BrainDomainName;
  depth: number;
  triggers: string[];
};

export type MicroModuleState = {
  name: string;
  domain?: BrainDomainName;
  depth: number;
  active: boolean;
  triggers: string[];
  state: Record<string, unknown>;
};

export const microModuleTemplates: MicroModuleActivation[] = [
  {
    name: "sleep_quality",
    domain: "health",
    depth: 2,
    triggers: ["sleep", "insomnia", "rest"],
  },
  {
    name: "nutrition_tracking",
    domain: "health",
    depth: 2,
    triggers: ["diet", "calories", "nutrition", "alimentação"],
  },
  {
    name: "career_transition",
    domain: "career",
    depth: 2,
    triggers: ["new job", "career change", "transition"],
  },
  {
    name: "relationship_conflict",
    domain: "relationships",
    depth: 3,
    triggers: ["argument", "conflict", "relationship issue"],
  },
  {
    name: "financial_planning",
    domain: "finance",
    depth: 2,
    triggers: ["budget", "savings", "invest", "debt"],
  },
  {
    name: "learning_path",
    domain: "learning",
    depth: 2,
    triggers: ["course", "study plan", "certification"],
  },
  {
    name: "productivity_routines",
    domain: "performance",
    depth: 2,
    triggers: ["routine", "habit", "agenda", "planner"],
  },
];

export const detectMicroModules = (
  text: string,
  activeDomains: BrainDomainName[]
): MicroModuleActivation[] => {
  const lowered = text.toLowerCase();

  return microModuleTemplates.filter(template => {
    if (template.domain && !activeDomains.includes(template.domain)) return false;
    return template.triggers.some(trigger => lowered.includes(trigger));
  });
};
