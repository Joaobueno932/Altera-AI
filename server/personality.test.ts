import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
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

describe("personality.save", () => {
  it("saves personality data successfully", async () => {
    const { ctx } = createAuthContext();
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
