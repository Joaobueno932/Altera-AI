import { create } from "zustand";
import type { ChatMessage, ProcessedChat } from "../../server/chat/types";

export type ChatState = {
  history: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  appendResponse: (payload: ProcessedChat) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>(set => ({
  history: [],
  addMessage: message => set(state => ({ history: [...state.history, message] })),
  appendResponse: payload =>
    set(state => ({
      history: [...state.history, payload.reply, ...payload.updatedHistory],
    })),
  reset: () => set({ history: [] }),
}));
