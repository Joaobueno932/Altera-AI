import { and, eq } from "drizzle-orm";

import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { SecondBrainStore } from "../secondBrain/store";
import { EngagementEngine } from "./engine";

export const engagementRouter = router({
  planCheckInsNow: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const store = new SecondBrainStore();
    await store.load(userId);

    const engine = new EngagementEngine(store);
    return engine.planStandaloneCheckIns(userId);
  }),

  listNotifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.status, "unread")));
  }),
});

