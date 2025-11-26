import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { processUserMessage } from "./engine";
import { ChatMessage } from "./types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRouter = router({
  talk: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Mensagem obrigatória"),
        history: z.array(messageSchema).default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await processUserMessage({
        userId: ctx.user.id,
        message: input.message,
        history: input.history as ChatMessage[],
      });

      return result;
    }),
});
