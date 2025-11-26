import type { CheckInPlan } from "../engagement/checkins";
import type { MicroMission } from "../engagement/microMissions";
import type { ZeigarnikHook } from "../engagement/zeigarnik";
import type { PatternInsight } from "../secondBrain/store";

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
  insights: PatternInsight[];
  microMissions: MicroMission[];
  zeigarnikHooks: ZeigarnikHook[];
  checkIns: CheckInPlan[];
  contextLog: ContextEntry[];
  futureSuggestions: string[];
  microInsight?: string;
  microMission?: string;
  updatedHistory: ChatMessage[];
};
