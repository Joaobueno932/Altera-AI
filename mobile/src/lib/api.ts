import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";
import type { ChatMessage } from "../../server/chat/types";
import { env } from "../config/env";

const baseUrl = env.BACKEND_BASE_URL.replace(/\/$/, "");

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
      transformer: superjson,
      fetch(input, init) {
        return fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});

export type OnboardingAnswer = { id: string; responses: string[] };

export const api = {
  health: () => trpc.system.health.query({ timestamp: Date.now() }),
  currentUser: () => trpc.auth.me.query(),
  logout: () => trpc.auth.logout.mutate(),
  saveOnboarding: (answers: OnboardingAnswer[]) => trpc.onboarding.saveProgress.mutate(answers),
  submitOnboarding: (answers: OnboardingAnswer[]) => trpc.onboarding.submit.mutate(answers),
  talkToBrain: (message: string, history: ChatMessage[]) =>
    trpc.chat.talk.mutate({ message, history }),
};
