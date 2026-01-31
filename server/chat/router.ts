import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { processUserMessage } from "./engine";
import { ChatMessage } from "./types";
import { ChatTalkInput, ChatTalkOutput } from "@shared/schemas";

export const chatRouter = router({
  talk: protectedProcedure
    .input(ChatTalkInput)
    .output(ChatTalkOutput)
    .mutation(async ({ input, ctx }) => {
      const result = await processUserMessage({
        userId: ctx.user.id,
        message: input.message,
        history: input.history as ChatMessage[],
      });

      return result;
    }),
});
