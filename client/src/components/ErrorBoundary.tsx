import { cn } from "@/lib/utils";
import { TRPCClientError } from "@trpc/client";
import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private isNetworkError(error: unknown) {
    if (error instanceof TRPCClientError) {
      return (
        error.message.toLowerCase().includes("failed to fetch") ||
        error.message.toLowerCase().includes("load failed") ||
        error.message.toLowerCase().includes("network error")
      );
    }
    if (error instanceof Error) {
      return (
        error.message.toLowerCase().includes("failed to fetch") ||
        (error.name === "TypeError" && error.message.toLowerCase().includes("fetch"))
      );
    }
    return false;
  }

  render() {
    if (this.state.hasError) {
      const isNetwork = this.isNetworkError(this.state.error);

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            {isNetwork ? (
              <WifiOff size={48} className="text-muted-foreground mb-6" />
            ) : (
              <AlertTriangle
                size={48}
                className="text-destructive mb-6 flex-shrink-0"
              />
            )}

            <h2 className="text-2xl font-semibold mb-2">
              {isNetwork ? "Conexão perdida" : "Algo deu errado"}
            </h2>
            
            <p className="text-muted-foreground mb-8">
              {isNetwork 
                ? "Não conseguimos conectar ao servidor. Verifique sua conexão com a internet." 
                : "Ocorreu um erro inesperado. Nossa equipe já foi notificada."}
            </p>

            {!isNetwork && (
              <div className="p-4 w-full rounded-xl bg-muted overflow-auto mb-8 max-h-40">
                <pre className="text-xs text-left text-muted-foreground whitespace-break-spaces">
                  {this.state.error?.message}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 active:scale-95 cursor-pointer shadow-lg shadow-primary/20"
              )}
            >
              <RotateCcw size={18} />
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
