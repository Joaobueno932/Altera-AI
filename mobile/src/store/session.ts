import { create } from "zustand";

export type SessionUser = {
  id?: number;
  name?: string | null;
  email?: string | null;
};

type SessionState = {
  user?: SessionUser;
  onboardingComplete: boolean;
  setUser: (user?: SessionUser) => void;
  completeOnboarding: () => void;
  logout: () => void;
};

export const useSessionStore = create<SessionState>(set => ({
  user: undefined,
  onboardingComplete: false,
  setUser: user => set({ user }),
  completeOnboarding: () => set({ onboardingComplete: true }),
  logout: () => set({ user: undefined, onboardingComplete: false }),
}));
