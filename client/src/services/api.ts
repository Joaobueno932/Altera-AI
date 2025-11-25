export type OnboardingAnswer = {
  id: string;
  responses: string[];
};

export async function saveOnboardingProgress(payload: OnboardingAnswer[]) {
  return new Promise(resolve => setTimeout(resolve, 200));
}

export async function submitOnboarding(payload: OnboardingAnswer[]) {
  return new Promise(resolve => setTimeout(resolve, 400));
}
