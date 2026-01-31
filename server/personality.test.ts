import { describe, expect, it, vi, beforeEach } from "vitest";
// Mock o módulo de DB para que os testes não dependam de DATABASE_URL
vi.mock("./db", () => {
  type User = {
    id: number;
    openId: string;
    email?: string | null;
    name?: string | null;
    loginMethod?: string | null;
  };
  let users: User[] = [];
  let personalities: Array<{ userId: number; bigFiveScores: any; answers: any }> = [];
  let nextUserId = 1;

  function __reset() {
    users = [];
    personalities = [];
    nextUserId = 1;
  }

  async function upsertUser(user: Partial<User> & { openId: string }) {
    const existing = users.find(u => u.openId === user.openId);
    if (existing) {
      Object.assign(existing, user);
      return;
    }
    users.push({
      id: nextUserId++,
      openId: user.openId,
      email: user.email ?? null,
      name: user.name ?? null,
      loginMethod: user.loginMethod ?? null,
    });
  }

  async function getUserByOpenId(openId: string) {
    return users.find(u => u.openId === openId);
  }

  async function savePersonality(data: { userId: number; bigFiveScores: any; answers: any }) {
    // Simples: substitui se já existir, senão adiciona
    const idx = personalities.findIndex(p => p.userId === data.userId);
    if (idx >= 0) personalities[idx] = data;
    else personalities.push(data);
  }

  async function getPersonalityByUserId(userId: number) {
    return personalities.find(p => p.userId === userId);
  }

  return {
    __reset,
    upsertUser,
    getUserByOpenId,
    savePersonality,
    getPersonalityByUserId,
  };
});

// Import dinâmico do appRouter após o mock acima
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

beforeEach(async () => {
  const db = await import("./db");
  // @ts-ignore - função exposta pelo mock
  db.__reset?.();
});

describe("personality.save", () => {
  it("saves personality data successfully", async () => {
    const { ctx } = createAuthContext();
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(ctx);
    
    // Create user first (upsert will handle it)
    const { upsertUser } = await import("./db");
    await upsertUser({
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
    });

    const result = await caller.personality.save({
      bigFiveScores: {
        openness: 4.5,
        conscientiousness: 3.8,
        extraversion: 4.2,
        agreeableness: 4.0,
        neuroticism: 2.5,
      },
      answers: [
        {
          question: "Test question",
          answer: "Test answer",
          category: "openness",
        },
      ],
    });

    expect(result).toEqual({ success: true });
  });
});

describe("personality.get", () => {
  it("retrieves personality data for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(ctx);
    
    // Create user first
    const { upsertUser } = await import("./db");
    await upsertUser({
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
    });

    // First save some data
    await caller.personality.save({
      bigFiveScores: {
        openness: 4.5,
        conscientiousness: 3.8,
        extraversion: 4.2,
        agreeableness: 4.0,
        neuroticism: 2.5,
      },
      answers: [
        {
          question: "Test question",
          answer: "Test answer",
          category: "openness",
        },
      ],
    });

    // Then retrieve it
    const personality = await caller.personality.get();

    expect(personality).toBeDefined();
    expect(personality?.userId).toBe(1);
    expect(personality?.bigFiveScores).toBeDefined();
  });
});
