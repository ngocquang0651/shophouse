"use client";

import { createContext } from "react";
import type { ChatThread } from "@/types/chatbot";

export type ChatbotContextValue = {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoadingThreads: boolean;
  error: string | null;
  setThreads(threads: ChatThread[]): void;
  refreshThreads(): Promise<void>;
  ensureThread(threadId?: string | null, title?: string): Promise<string>;
  createNewThread(title?: string): Promise<string>;
  selectThread(threadId: string): void;
  renameThread(threadId: string, title: string): Promise<void>;
  pinThread(threadId: string): Promise<void>;
  unpinThread(threadId: string): Promise<void>;
  deleteThread(threadId: string): Promise<void>;
};

export const ChatbotContext = createContext<ChatbotContextValue | null>(null);
