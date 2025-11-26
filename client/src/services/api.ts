import { trpc } from "@/lib/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export type OnboardingAnswer = {
  id: string;
  responses: string[];
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});

export async function saveOnboardingProgress(payload: OnboardingAnswer[]) {
  return trpcClient.mutation("onboarding.saveProgress", payload);
}

export async function submitOnboarding(payload: OnboardingAnswer[]) {
  return trpcClient.mutation("onboarding.submit", payload);
}
