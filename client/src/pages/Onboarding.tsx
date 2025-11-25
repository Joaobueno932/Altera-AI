import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  return <OnboardingFlow onFinish={() => setLocation("/home")} />;
}
