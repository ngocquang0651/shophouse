import type { ExportedMessageRepository, ExportedMessageRepositoryItem, ThreadMessage } from "@assistant-ui/react";

export type ChatThreadStatus = "regular" | "archived";

export type ChatThread = {
  id: string;
  title: string;
  status: ChatThreadStatus;
  createdAt: string;
  updatedAt: string;
  custom?: Record<string, unknown>;
};

export type ChatThreadListResponse = {
  threads: ChatThread[];
};

export type ChatHistoryRepository = ExportedMessageRepository;

export type ChatHistoryItem = ExportedMessageRepositoryItem;

export type ChatStreamChunk =
  | {
      type: "chunk";
      text: string;
    }
  | {
      type: "done";
      threadId: string;
      assistantMessageId?: string;
    };

export type ChatStreamRequest = {
  messages: readonly ThreadMessage[];
  parentId?: string | null;
  assistantMessageId?: string;
};
