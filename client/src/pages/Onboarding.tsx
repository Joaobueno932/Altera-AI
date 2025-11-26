import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { MobileContainer } from "@/components/ui/mobile-container";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  return (
    <MobileContainer>
      <OnboardingFlow onFinish={() => setLocation("/home")} />
    </MobileContainer>
  );
}
