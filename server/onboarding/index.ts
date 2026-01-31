import { protectedProcedure, router } from "../_core/trpc";
import { finalizeOnboarding, saveOnboardingProgress } from "../db";
import { z } from "zod";
import { OnboardingInput, OnboardingOutput } from "@shared/schemas";

export const onboardingRouter = router({
  saveProgress: protectedProcedure
    .input(OnboardingInput)
    .output(OnboardingOutput)
    .mutation(async ({ ctx, input }) => {
      await saveOnboardingProgress(ctx.user.id, input);
      return { success: true };
    }),

  submit: protectedProcedure
    .input(OnboardingInput)
    .output(OnboardingOutput)
    .mutation(async ({ ctx, input }) => {
      await finalizeOnboarding(ctx.user.id, input);
      return { success: true };
    }),
});
