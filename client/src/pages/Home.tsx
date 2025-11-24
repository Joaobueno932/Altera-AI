import { useAuth } from "@/_core/hooks/useAuth";
import { BrainIcon } from "@/components/BrainIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personality = trpc.personality.get.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!loading && isAuthenticated && !personality.data && !personality.isLoading) {
      setLocation("/questionnaire");
    }
  }, [loading, isAuthenticated, personality.data, personality.isLoading, setLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Simular resposta da IA (substituir por chamada real ao LLM)
    setTimeout(() => {
      const aiResponse = `Entendi sua mensagem: "${userMessage}". Como seu segundo eu mais racional, vou te ajudar a pensar sobre isso de forma mais objetiva e equilibrada.`;
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (loading || personality.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-effect border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrainIcon className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-white">Seu Segundo Eu</h1>
              <p className="text-sm text-muted-foreground">Mais racional e equilibrado</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 flex flex-col max-w-4xl">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <BrainIcon className="w-24 h-24" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Olá! Eu sou seu segundo eu</h2>
                <p className="text-muted-foreground">
                  Converse comigo sobre qualquer coisa. Vou te ajudar a pensar de forma mais racional e equilibrada.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <BrainIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)]"
                        : "glass-effect"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p className="text-white">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="glass-effect rounded-2xl p-4">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-input border-border text-white h-12"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 bg-gradient-to-r from-[oklch(0.65_0.25_270)] to-[oklch(0.60_0.22_290)] hover:opacity-90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
