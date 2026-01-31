import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized =
    error.data?.code === "UNAUTHORIZED" || error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  const target = getLoginUrl();
  const currentPath = window.location.pathname;

  // Evita loops de redirecionamento se já estivermos na página de destino
  if (currentPath === "/login" || currentPath === "/signup") return;
  if (target.startsWith("/") && currentPath === target) return;

  window.location.href = target;
};

const isNetworkError = (error: unknown) => {
  if (error instanceof TRPCClientError) {
    // TRPCClientError pode embrulhar falhas de rede do fetch
    return (
      error.message.toLowerCase().includes("failed to fetch") ||
      error.message.toLowerCase().includes("load failed") ||
      error.message.toLowerCase().includes("network error")
    );
  }
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes("failed to fetch") ||
      error.name === "TypeError" && error.message.toLowerCase().includes("fetch")
    );
  }
  return false;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);

    if (isNetworkError(error)) {
      console.error("[API Network Error]", error);
      // Aqui poderíamos disparar um estado global ou deixar o ErrorBoundary pegar se for fatal
    } else {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);

    if (isNetworkError(error)) {
      console.error("[API Network Error]", error);
    } else {
      console.error("[API Mutation Error]", error);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return {
          "x-trpc-source": "web",
        };
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
