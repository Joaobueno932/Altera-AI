import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { savePersonality, getPersonalityByUserId } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  personality: router({
    save: protectedProcedure
      .input(z.object({
        bigFiveScores: z.object({
          openness: z.number(),
          conscientiousness: z.number(),
          extraversion: z.number(),
          agreeableness: z.number(),
          neuroticism: z.number(),
        }),
        answers: z.array(z.object({
          question: z.string(),
          answer: z.string(),
          category: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        await savePersonality({
          userId: ctx.user.id,
          bigFiveScores: input.bigFiveScores,
          answers: input.answers,
        });
        return { success: true };
      }),
    
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getPersonalityByUserId(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
