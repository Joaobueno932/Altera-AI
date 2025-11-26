import { protectedProcedure, router } from "../_core/trpc";
import { finalizeOnboarding, saveOnboardingProgress } from "../db";
import { z } from "zod";

const onboardingInput = z.array(
  z.object({
    id: z.string(),
    responses: z.array(z.string()),
  }),
);

export const onboardingRouter = router({
  saveProgress: protectedProcedure.input(onboardingInput).mutation(async ({ ctx, input }) => {
    await saveOnboardingProgress(ctx.user.id, input);
    return { success: true } as const;
  }),

  submit: protectedProcedure.input(onboardingInput).mutation(async ({ ctx, input }) => {
    await finalizeOnboarding(ctx.user.id, input);
    return { success: true } as const;
  }),
});
