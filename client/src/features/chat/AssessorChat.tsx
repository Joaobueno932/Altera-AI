import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useState } from "react";
import { Brain, Send, Zap } from "lucide-react";

const microInsights = [
  "Seu pico de foco costuma ser à tarde. Blinde 90 minutos hoje.",
  "Você reage bem a desafios curtos. Que tal uma missão de 24h?",
  "Você mencionou 'impacto' 3 vezes. Priorize tarefas com retorno rápido.",
];

const microMissions = [
  "Esboçar 3 ideias de projeto e escolher 1 para testar.",
  "Enviar mensagem para uma pessoa-chave sobre sua próxima fase.",
  "Organizar uma lista de hábitos que quer ativar esta semana.",
];

type Message = { role: "user" | "assistant"; content: string };

export function AssessorChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Sou seu assessor proativo. Posso sugerir micro-insights e missões rápidas." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTimeout(() => {
      const response = microInsights[(messages.length + 1) % microInsights.length];
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 300);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Chat assessor</p>
          <h2 className="text-xl font-semibold">Micro-insights em tempo real</h2>
          <p className="text-sm text-muted-foreground">Ritmo dinâmico, missoes rápidas e acompanhamento.
          </p>
        </div>
      </div>

      <MobileCard className="space-y-3">
        <SectionTitle>Micro-insights</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {microInsights.map(item => (
            <Chip key={item} className="text-left" onClick={() => sendMessage(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Micro-missões</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {microMissions.map(item => (
            <Chip key={item} className="text-left bg-secondary/15" onClick={() => sendMessage(item)}>
              <Zap className="w-4 h-4 mr-2" />
              {item}
            </Chip>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Diálogo</SectionTitle>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enviar pergunta ou sinalizar humor"
            className="flex-1 h-12 rounded-full px-4 bg-muted/60 border border-border/70 text-sm"
          />
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
            onClick={() => sendMessage(input)}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </MobileCard>
    </div>
  );
}
