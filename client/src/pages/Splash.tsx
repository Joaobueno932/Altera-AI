import { BrainIcon } from "@/components/BrainIcon";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        <BrainIcon className="w-24 h-24" />
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">
            nome do app<span className="ml-2">🧠</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu segundo eu, mais racional
          </p>
        </div>
        <div className="flex space-x-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }}></div>
        </div>
      </div>
    </div>
  );
}
