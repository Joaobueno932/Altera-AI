import { and, eq } from "drizzle-orm";
import {
  SecondBrainCore as BrainCore,
  SecondBrainDomain as BrainDomain,
  SecondBrainMicroModule as BrainMicroModule,
  ProgressGlobal,
  UserInsight as BrainInsight,
  userInsights as brainInsights,
  userMessages as brainMessages,
  progressGlobal,
  secondBrainCore as brainCores,
  secondBrainDomains as brainDomains,
  secondBrainMicroModules as brainMicroModules,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { Role } from "../_core/llm";
import { CoreProfile, deriveCoreFromRecord, mergeCoreProfile } from "./core";
import { BrainDomainName, DomainState, createEmptyDomainState } from "./domains";
import { MicroModuleActivation, MicroModuleState } from "./microModules";

export type PatternInsight = {
  category: BrainInsight["category"];
  label: string;
  confidence?: number;
  details?: Record<string, unknown>;
};

export class SecondBrainStore {
  private loadedUserId?: number;

  async load(userId: number): Promise<void> {
    this.loadedUserId = userId;
    await this.ensureCore(userId);
  }

  async getCore(userId: number): Promise<CoreProfile> {
    const db = await getDb();
    if (!db) return deriveCoreFromRecord(null);

    const record = await db
      .select()
      .from(brainCores)
      .where(eq(brainCores.userId, userId))
      .limit(1);

    return deriveCoreFromRecord(record[0]);
  }

  async ensureCore(userId: number): Promise<BrainCore | null> {
    const db = await getDb();
    if (!db) return null;

    const existing = await db
      .select()
      .from(brainCores)
      .where(eq(brainCores.userId, userId))
      .limit(1);

    if (existing[0]) return existing[0];

    const [created] = await db
      .insert(brainCores)
      .values({ userId })
      .onDuplicateKeyUpdate({ set: { userId } });

    return created ?? null;
  }

  async updateCore(userId: number, updates: Partial<CoreProfile>): Promise<void> {
    const db = await getDb();
    if (!db) return;

    const current = await this.getCore(userId);
    const merged = mergeCoreProfile(current, updates);

    await db
      .insert(brainCores)
      .values({
        userId,
        identity: merged.identity,
        lifeContext: merged.lifeContext,
        bigFive: merged.bigFive,
        behavior: merged.behavior,
        metacognition: merged.metacognition,
      })
      .onDuplicateKeyUpdate({
        set: {
          identity: merged.identity,
          lifeContext: merged.lifeContext,
          bigFive: merged.bigFive,
          behavior: merged.behavior,
          metacognition: merged.metacognition,
        },
      });
  }

  async getDomains(userId: number): Promise<Record<BrainDomainName, DomainState>> {
    const db = await getDb();
    const base: Record<BrainDomainName, DomainState> = {
      health: createEmptyDomainState("health"),
      career: createEmptyDomainState("career"),
      relationships: createEmptyDomainState("relationships"),
      learning: createEmptyDomainState("learning"),
      finance: createEmptyDomainState("finance"),
      performance: createEmptyDomainState("performance"),
    };

    if (!db) return base;

    const rows = await db.select().from(brainDomains).where(eq(brainDomains.userId, userId));
    rows.forEach(row => {
      base[row.name as BrainDomainName] = this.mapDomain(row);
    });

    return base;
  }

  async upsertDomainState(userId: number, state: DomainState): Promise<void> {
    const db = await getDb();
    if (!db) return;

    await db
      .insert(brainDomains)
      .values({
        userId,
        name: state.name,
        active: state.active ? "yes" : "no",
        activationReason: state.activationReason,
        signals: state.signals,
      })
      .onDuplicateKeyUpdate({
        set: {
          active: state.active ? "yes" : "no",
          activationReason: state.activationReason,
          signals: state.signals,
        },
      });
  }

  async upsertDomainStates(userId: number, states: DomainState[]): Promise<void> {
    await Promise.all(states.map(state => this.upsertDomainState(userId, state)));
  }

  async upsertMicroModule(
    userId: number,
    activation: MicroModuleActivation,
    active: boolean,
    domainId?: number,
    state: Record<string, unknown> = {}
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;

    const existing = await db
      .select()
      .from(brainMicroModules)
      .where(
        and(
          eq(brainMicroModules.userId, userId),
          eq(brainMicroModules.name, activation.name)
        )
      )
      .limit(1);

    const payload = {
      userId,
      domainId,
      domainName: activation.domain,
      name: activation.name,
      depth: activation.depth,
      active: active ? "yes" : "no",
      triggers: activation.triggers,
      state,
    } satisfies Partial<BrainMicroModule>;

    if (existing[0]) {
      await db
        .update(brainMicroModules)
        .set(payload)
        .where(eq(brainMicroModules.id, existing[0].id));
    } else {
      await db.insert(brainMicroModules).values(payload);
    }
  }

  async getMicroModules(userId: number): Promise<MicroModuleState[]> {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.select().from(brainMicroModules).where(eq(brainMicroModules.userId, userId));
    return rows.map(row => ({
      name: row.name,
      domain: row.domainName as BrainDomainName | undefined,
      depth: row.depth,
      active: row.active === "yes",
      triggers: (row.triggers as string[]) ?? [],
      state: (row.state as Record<string, unknown>) ?? {},
    }));
  }

  async logMessage(
    userId: number,
    params: { role?: Role; content: string; metadata?: Record<string, unknown> }
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;

    await db.insert(brainMessages).values({
      userId,
      role: params.role ?? "user",
      content: params.content,
      metadata: params.metadata,
    });
  }

  async addMessage(
    userId: number,
    params: { role?: Role; content: string; metadata?: Record<string, unknown> }
  ): Promise<void> {
    await this.ensureCore(userId);
    await this.logMessage(userId, params);
  }

  async listRecentMessages(userId: number, limit = 25) {
    const db = await getDb();
    if (!db) return [] as { content: string; createdAt: Date }[];

    const rows = await db
      .select({ content: brainMessages.content, createdAt: brainMessages.createdAt })
      .from(brainMessages)
      .where(eq(brainMessages.userId, userId))
      .orderBy(brainMessages.createdAt)
      .limit(limit);

    return rows;
  }

  async addInsights(userId: number, insights: PatternInsight[]): Promise<void> {
    const db = await getDb();
    if (!db || insights.length === 0) return;

    await db.insert(brainInsights).values(
      insights.map(insight => ({
        userId,
        category: insight.category,
        summary: insight.label,
        confidence: insight.confidence ?? 50,
        details: insight.details,
      }))
    );
  }

  async listRecentInsights(userId: number, limit = 15): Promise<BrainInsight[]> {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(brainInsights)
      .where(eq(brainInsights.userId, userId))
      .orderBy(brainInsights.createdAt)
      .limit(limit);

    return rows;
  }

  async getProgress(userId: number): Promise<ProgressGlobal | null> {
    const db = await getDb();
    if (!db) return null;

    const [row] = await db.select().from(progressGlobal).where(eq(progressGlobal.userId, userId)).limit(1);
    return row ?? null;
  }

  private mapDomain(row: BrainDomain): DomainState {
    return {
      name: (row.domainKey as BrainDomainName) ?? "performance",
      active: row.status === "active",
      activationReason: row.description ?? undefined,
      signals: ((row.metrics as DomainState["signals"]) ?? {}) as DomainState["signals"],
    };
  }
}
