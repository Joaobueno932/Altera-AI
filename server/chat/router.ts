import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { processUserMessage } from "./engine";
import { ChatMessage } from "./types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const chatRouter = router({
  talk: publicProcedure
    .input(
      z.object({
        message: z.string().min(1, "Mensagem obrigatória"),
        history: z.array(messageSchema).default([]),
      })
    )
    .mutation(({ input }) => {
      const result = processUserMessage({
        message: input.message,
        history: input.history as ChatMessage[],
      });

      return result;
    }),
});
