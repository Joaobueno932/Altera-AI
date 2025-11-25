export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type Rhythm = {
  question: string;
  observation: string;
  insight: string;
  deepQuestion: string;
  styleNote: string;
};

export type ContextEntry = {
  title: string;
  note: string;
};

export type ProcessedChat = {
  reply: ChatMessage;
  rhythm: Rhythm;
  microInsight: string;
  microMission: string;
  contextLog: ContextEntry[];
  futureSuggestions: string[];
  updatedHistory: ChatMessage[];
};
