import { BrainIcon } from "@/components/BrainIcon";
import { MobileContainer } from "@/components/ui/mobile-container";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <MobileContainer contentClassName="justify-center">
      <div className="flex flex-col items-center space-y-6 text-center animate-fade-in">
        <BrainIcon className="w-24 h-24" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            nome do app<span className="ml-2">🧠</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu segundo eu, mais racional
          </p>
        </div>
        <div className="mt-8 flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }}></div>
        </div>
      </div>
    </MobileContainer>
  );
}
