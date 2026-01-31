import { BrainIcon } from "@/components/BrainIcon";
import { MobileContainer } from "@/components/ui/mobile-container";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // O onboarding é considerado completo se o usuário tem uma personalidade salva
  const { data: personality, isLoading: personalityLoading } = trpc.personality.get.useQuery(
    undefined, 
    { 
      enabled: isAuthenticated,
      retry: false,
      staleTime: Infinity 
    }
  );

  const loading = authLoading || (isAuthenticated && personalityLoading);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        setLocation("/login");
      } else if (!personality) {
        setLocation("/onboarding");
      } else {
        setLocation("/home");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, personality, loading, setLocation]);

  return (
    <MobileContainer contentClassName="justify-center">
      <div className="flex flex-col items-center space-y-6 text-center animate-fade-in">
        <BrainIcon className="w-24 h-24" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Segundo Eu<span className="ml-2">🧠</span>
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
