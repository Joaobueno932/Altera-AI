import { MobileCard, SectionTitle } from "@/components/ui/mobile-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useMemo, useState } from "react";
import { Brain, Send, Zap, Sparkles, History } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type Message = { role: "user" | "assistant" | "system"; content: string };

type Rhythm = {
  question: string;
  observation: string;
  insight: string;
  deepQuestion: string;
  styleNote: string;
};

type ContextEntry = { title: string; note: string };

type TalkResponse = {
  reply: Message;
  rhythm: Rhythm;
  microInsight: string;
  microMission: string;
  contextLog: ContextEntry[];
  futureSuggestions: string[];
  updatedHistory: Message[];
};

const starterInsights = [
  "Sente que precisa de mais ritmo ou clareza?",
  "Quer testar uma ideia em 24h?",
  "Prefere missão rápida ou reflexão profunda hoje?",
];

const starterMissions = [
  "Listar 3 hipóteses para a próxima semana",
  "Enviar uma mensagem estratégica agora",
  "Fechar um bloco de foco de 25 minutos",
];

const splitAssistantBlocks = (content: string) =>
  content.split("\n").filter(Boolean);

export function AssessorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Sou seu assessor ativo. Vamos manter um ciclo vivo: pergunta → observação → insight → pergunta profunda.",
    },
  ]);
  const [input, setInput] = useState("");
  const [rhythm, setRhythm] = useState<Rhythm | null>(null);
  const [contextLog, setContextLog] = useState<ContextEntry[]>([]);
  const [futureSuggestions, setFutureSuggestions] = useState<string[]>([]);
  const [microInsight, setMicroInsight] = useState<string | null>(null);
  const [microMission, setMicroMission] = useState<string | null>(null);

  const talkMutation = trpc.chat.talk.useMutation({
    onSuccess: (data: TalkResponse) => {
      setMessages(prev => [...prev, data.reply]);
      setRhythm(data.rhythm);
      setContextLog(data.contextLog);
      setFutureSuggestions(data.futureSuggestions);
      setMicroInsight(data.microInsight);
      setMicroMission(data.microMission);
    },
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");

    talkMutation.mutate({ message: trimmed, history });
  };

  const latestAssistantBlocks = useMemo(() => {
    const lastAssistant = [...messages].reverse().find(msg => msg.role === "assistant");
    return lastAssistant ? splitAssistantBlocks(lastAssistant.content) : [];
  }, [messages]);

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">Chat assessor</p>
          <h2 className="text-xl font-semibold">Ritmo dinâmico e vivo</h2>
          <p className="text-sm text-muted-foreground">
            Pergunta → observação → insight → pergunta profunda, com micro-missões.
          </p>
        </div>
      </div>

      <MobileCard className="space-y-3">
        <SectionTitle>Dispare rápido</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {starterInsights.map(item => (
            <Chip key={item} className="text-left" onClick={() => sendMessage(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {starterMissions.map(item => (
            <Chip key={item} className="text-left bg-secondary/15" onClick={() => sendMessage(item)}>
              <Zap className="w-4 h-4 mr-2" />
              {item}
            </Chip>
          ))}
        </div>
      </MobileCard>

      <MobileCard className="space-y-3">
        <SectionTitle>Diálogo vivo</SectionTitle>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
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
            placeholder="Envie uma pergunta ou sinalize seu humor"
            className="flex-1 h-12 rounded-full px-4 bg-muted/60 border border-border/70 text-sm"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
            onClick={() => sendMessage(input)}
            disabled={talkMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </MobileCard>

      <div className="grid md:grid-cols-2 gap-4">
        <MobileCard className="space-y-3">
          <SectionTitle>Ritmo dinâmico</SectionTitle>
          {rhythm ? (
            <div className="space-y-2 text-sm">
              <p>❓ {rhythm.question}</p>
              <p>👀 {rhythm.observation}</p>
              <p>💡 {rhythm.insight}</p>
              <p>🔎 {rhythm.deepQuestion}</p>
              <p className="text-primary">✨ {rhythm.styleNote}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Envie algo e eu entro no ciclo pergunta → observação → insight → pergunta profunda.
            </p>
          )}
        </MobileCard>

        <MobileCard className="space-y-3">
          <SectionTitle>Micro-insights & micro-missões</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {microInsight && (
              <Chip className="text-left">🧠 {microInsight}</Chip>
            )}
            {microMission && (
              <Chip className="text-left bg-secondary/15">
                <Zap className="w-4 h-4 mr-2" />
                {microMission}
              </Chip>
            )}
            {!microInsight && !microMission && (
              <p className="text-sm text-muted-foreground">
                Vou anexar micro-insights e micro-missões assim que você responder.
              </p>
            )}
          </div>
          {latestAssistantBlocks.length > 0 && (
            <div className="space-y-1 text-xs text-muted-foreground">
              {latestAssistantBlocks.map((block, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 mt-1" />
                  <span>{block}</span>
                </div>
              ))}
            </div>
          )}
        </MobileCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <MobileCard className="space-y-3">
          <SectionTitle>Contexto da conversa</SectionTitle>
          {contextLog.length > 0 ? (
            <div className="space-y-2 text-sm">
              {contextLog.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-muted/60 flex items-start gap-2">
                  <History className="w-4 h-4 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vou registrando o contexto conforme conversamos para manter o estilo persistente.
            </p>
          )}
        </MobileCard>

        <MobileCard className="space-y-3">
          <SectionTitle>Sugestões futuras (efeito Zeigarnik)</SectionTitle>
          {futureSuggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {futureSuggestions.map(suggestion => (
                <Chip
                  key={suggestion}
                  className="text-left bg-primary/10 text-primary"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Assim que notar tarefas abertas, sugiro retomadas para manter você em movimento.
            </p>
          )}
        </MobileCard>
      </div>
    </div>
  );
}
