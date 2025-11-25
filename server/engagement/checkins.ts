import { SecondBrainStore } from "../secondBrain/store";

export type CheckInPlan = {
  slot: "morning" | "afternoon" | "evening" | "weekly";
  prompt: string;
  scope: "dia" | "semana";
};

export type CheckInKind =
  | "daily"
  | "return_ping"
  | "motivational_mission"
  | "weekly_review"
  | "progress_alert";

export type CheckInMessage = {
  title: string;
  body: string;
  kind: CheckInKind;
  channel: "chat" | "notification";
  metadata?: Record<string, unknown>;
};

export type CheckInJob = {
  id: string;
  userId: number;
  kind: CheckInKind;
  runAt: Date;
  metadata?: Record<string, unknown>;
};

export type CheckInCron = {
  daily: string;
  weeklyReview: string;
  inactivityScan: string;
  motivationalMission: string;
};

export const DEFAULT_CHECKIN_CRON: CheckInCron = {
  daily: "0 9 * * *",
  motivationalMission: "30 10 * * *",
  weeklyReview: "0 18 * * 5",
  inactivityScan: "0 */6 * * *",
};

export class CheckInQueue {
  private jobs: CheckInJob[] = [];

  enqueue(job: CheckInJob) {
    this.jobs.push(job);
    this.jobs.sort((a, b) => a.runAt.getTime() - b.runAt.getTime());
  }

  popDue(now = new Date()): CheckInJob | undefined {
    const next = this.jobs[0];
    if (next && next.runAt.getTime() <= now.getTime()) {
      return this.jobs.shift();
    }
    return undefined;
  }

  list(kind?: CheckInKind): CheckInJob[] {
    return this.jobs.filter(job => !kind || job.kind === kind);
  }
}

export class CheckInWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private queue = new CheckInQueue(),
    private store = new SecondBrainStore(),
    public deliver?: (job: CheckInJob, message: CheckInMessage) => Promise<void> | void
  ) {}

  start(pollIntervalMs = 5_000) {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), pollIntervalMs);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  async tick(now = new Date()) {
    let job = this.queue.popDue(now);
    while (job) {
      const message = await this.buildMessage(job);
      await this.deliver?.(job, message);
      job = this.queue.popDue(now);
    }
  }

  private async buildMessage(job: CheckInJob): Promise<CheckInMessage> {
    switch (job.kind) {
      case "daily":
        return buildDailyMessage(job.userId, this.store);
      case "return_ping":
        return buildInactivityMessage(job.userId, job.metadata?.hoursAway as number | undefined, this.store);
      case "motivational_mission":
        return buildMotivationalMission(job.userId, this.store);
      case "weekly_review":
        return buildWeeklyReview(job.userId, this.store);
      case "progress_alert":
      default:
        return buildProgressAlert(job.userId, this.store, job.metadata?.progress as number | undefined);
    }
  }
}

export const seedQueueFromCron = (
  queue: CheckInQueue,
  userId: number,
  cron: CheckInCron = DEFAULT_CHECKIN_CRON,
  now = new Date()
) => {
  queue.enqueue({
    id: `${userId}-daily-${now.toISOString()}`,
    userId,
    kind: "daily",
    runAt: resolveNextHour(now, 9),
  });

  queue.enqueue({
    id: `${userId}-mission-${now.toISOString()}`,
    userId,
    kind: "motivational_mission",
    runAt: resolveNextHour(now, 10, 30),
  });

  queue.enqueue({
    id: `${userId}-weekly-${now.toISOString()}`,
    userId,
    kind: "weekly_review",
    runAt: resolveNextWeekday(now, 5, 18),
  });

  queue.enqueue({
    id: `${userId}-inactivity-${now.toISOString()}`,
    userId,
    kind: "return_ping",
    runAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
    metadata: { cron: cron.inactivityScan },
  });
};

const resolveNextHour = (base: Date, hour: number, minute = 0) => {
  const target = new Date(base);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= base.getTime()) target.setDate(target.getDate() + 1);
  return target;
};

const resolveNextWeekday = (base: Date, weekday: number, hour: number) => {
  const target = new Date(base);
  const distance = (weekday + 7 - target.getDay()) % 7 || 7;
  target.setDate(target.getDate() + distance);
  target.setHours(hour, 0, 0, 0);
  return target;
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

const buildDailyMessage = async (
  userId: number,
  store: SecondBrainStore
): Promise<CheckInMessage> => {
  const context = await loadSecondBrainContext(userId, store);
  const prompt = planCheckIns("morning", context.seed)[0];
  const focus = context.activeDomains[0] ?? "seu foco principal";
  const alias = context.alias ?? "você";

  return {
    title: "Check-in diário",
    body: `${alias}, no seu Second Brain o foco ativo é ${focus}. ${prompt.prompt} Há um hábito listado: ${context.habits[0] ?? "criar rituais simples"}.`,
    kind: "daily",
    channel: "chat",
    metadata: { scope: prompt.scope },
  };
};

const buildInactivityMessage = async (
  userId: number,
  hoursAway = 24,
  store: SecondBrainStore
): Promise<CheckInMessage> => {
  const context = await loadSecondBrainContext(userId, store);
  const alias = context.alias ?? "Ei";
  const goal = context.goals[0] ?? "seu objetivo principal";
  return {
    title: "Senti sua falta",
    body: `${alias}, faz ${hoursAway}h sem trocarmos ideia. Quer retomar pelo ponto registrado no Second Brain: ${goal}? Posso sugerir 1 mini passo agora mesmo.`,
    kind: "return_ping",
    channel: "notification",
    metadata: { hoursAway },
  };
};

const buildMotivationalMission = async (
  userId: number,
  store: SecondBrainStore
): Promise<CheckInMessage> => {
  const context = await loadSecondBrainContext(userId, store);
  const mission = context.missions[0];
  const alias = context.alias ?? "Vamos";
  const body = mission
    ? `${alias}, missão rápida: ${mission.description}. Impacto: ${mission.meaning}. Responda com "Vamos lá" ou peça para ajustar.`
    : `${alias}, bora escolher 1 micro missão alinhada aos seus sinais ativos (${context.activeDomains.join(", ") || "jornada"}).`;
  return {
    title: "Missão motivacional",
    body,
    kind: "motivational_mission",
    channel: "chat",
    metadata: { reward: mission?.reward },
  };
};

const buildWeeklyReview = async (
  userId: number,
  store: SecondBrainStore
): Promise<CheckInMessage> => {
  const context = await loadSecondBrainContext(userId, store);
  const alias = context.alias ?? "Vamos";
  const domains = context.activeDomains.slice(0, 2).join(" e ") || "sua semana";
  const reflection = context.selfReflection[0] ?? "notar o que funcionou";
  return {
    title: "Revisão semanal",
    body: `${alias}, na revisão da semana focamos em ${domains}. Qual foi a micro vitória mais clara? ${reflection}. Em seguida definimos 1 próximo passo.`
      .trim(),
    kind: "weekly_review",
    channel: "chat",
  };
};

const buildProgressAlert = async (
  userId: number,
  store: SecondBrainStore,
  progress = 10
): Promise<CheckInMessage> => {
  const context = await loadSecondBrainContext(userId, store);
  const alias = context.alias ?? "Ei";
  const goal = context.goals[0] ?? "seu objetivo principal";
  const signal = context.signals[0] ?? "checkpoint anotado";
  return {
    title: "Progresso registrado",
    body: `${alias}, avancei ${progress}% na linha do tempo do Second Brain para ${goal}. Último sinal: ${signal}. Quer registrar mais contexto?`,
    kind: "progress_alert",
    channel: "notification",
    metadata: { progress },
  };
};

const loadSecondBrainContext = async (userId: number, store: SecondBrainStore) => {
  const core = await store.getCore(userId);
  const domains = await store.getDomains(userId);
  const modules = await store.getMicroModules(userId);
  const microMissions = modules.find(module => module.name === "micro_missions")?.state as
    | { missions?: Array<{ description: string; meaning: string; reward?: string }> }
    | undefined;

  const activeDomains = Object.values(domains)
    .filter(domain => domain.active)
    .map(domain => domain.name);

  const signals = Object.values(domains)
    .map(domain => Object.keys(domain.signals ?? {}))
    .flat();

  return {
    alias: core.identity.aliases[0],
    goals: core.lifeContext.goals,
    habits: core.behavior.habits,
    selfReflection: core.metacognition.selfReflection,
    activeDomains,
    signals,
    missions: microMissions?.missions ?? [],
    seed: new Date().getDate(),
  };
};
