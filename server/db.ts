import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  onboardingResponses,
  personalities,
  userSettings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { infoOnce } from "./_core/log";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn("[Database] Cannot upsert user: database not available");
    } else {
      infoOnce(
        "[Database] Upsert skipped: no DATABASE_URL configured (dev mode). Set DATABASE_URL to enable persistence."
      );
    }
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn("[Database] Cannot get user: database not available");
    } else {
      infoOnce(
        "[Database] Read skipped: no DATABASE_URL configured (dev mode). Returning undefined."
      );
    }
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Personality queries
export async function savePersonality(data: { userId: number; bigFiveScores: any; answers: any }) {
  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn("[Database] Cannot save personality: database not available");
    } else {
      infoOnce(
        "[Database] Save personality skipped: no DATABASE_URL configured (dev mode)."
      );
    }
    return;
  }

  try {
    await db.insert(personalities).values({
      userId: data.userId,
      bigFiveScores: data.bigFiveScores,
      answers: data.answers,
    });
  } catch (error) {
    console.error("[Database] Failed to save personality:", error);
    throw error;
  }
}

export async function getPersonalityByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn("[Database] Cannot get personality: database not available");
    } else {
      infoOnce(
        "[Database] Get personality skipped: no DATABASE_URL configured (dev mode). Returning undefined."
      );
    }
    return undefined;
  }

  const result = await db.select().from(personalities).where(eq(personalities.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

type OnboardingPayload = { id: string; responses: string[] }[];

const getStepNumber = (stepId: string) => {
  let hash = 0;
  for (let i = 0; i < stepId.length; i++) {
    hash = (hash << 5) - hash + stepId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

async function upsertOnboardingResponses(
  userId: number,
  payload: OnboardingPayload,
  status: "in_progress" | "completed",
) {
  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn("[Database] Cannot save onboarding: database not available");
    } else {
      infoOnce(
        "[Database] Save onboarding skipped: no DATABASE_URL configured (dev mode)."
      );
    }
    return;
  }

  const now = new Date();

  for (const entry of payload) {
    const stepNumber = getStepNumber(entry.id);
    const responses = { id: entry.id, responses: entry.responses } as Record<string, unknown>;

    await db
      .insert(onboardingResponses)
      .values({
        userId,
        step: stepNumber,
        responses,
        status,
        completedAt: status === "completed" ? now : null,
      })
      .onDuplicateKeyUpdate({
        set: {
          responses,
          status,
          updatedAt: now,
          completedAt: status === "completed" ? now : null,
        },
      });
  }
}

export async function saveOnboardingProgress(userId: number, payload: OnboardingPayload) {
  await upsertOnboardingResponses(userId, payload, "in_progress");
}

async function markOnboardingCompleted(userId: number) {
  const db = await getDb();
  if (!db) {
    if (ENV.isProduction) {
      console.warn(
        "[Database] Cannot mark onboarding completion: database not available"
      );
    } else {
      infoOnce(
        "[Database] Mark onboarding completed skipped: no DATABASE_URL configured (dev mode)."
      );
    }
    return;
  }

  const existing = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  const currentPreferences = (existing[0]?.preferences as Record<string, unknown> | null) ?? {};
  const preferences = { ...currentPreferences, onboardingCompleted: true } as Record<string, unknown>;

  if (existing.length === 0) {
    await db.insert(userSettings).values({
      userId,
      preferences,
    });
  } else {
    await db
      .update(userSettings)
      .set({
        preferences,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));
  }
}

export async function finalizeOnboarding(userId: number, payload: OnboardingPayload) {
  await upsertOnboardingResponses(userId, payload, "completed");
  await markOnboardingCompleted(userId);
}
