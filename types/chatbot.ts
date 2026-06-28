import type { ExportedMessageRepository, ExportedMessageRepositoryItem, ThreadMessage } from "@assistant-ui/react";

export type ChatThreadStatus = "regular" | "archived";

export type ChatThread = {
  id: string;
  title: string;
  pinned: boolean;
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

export type ChatThreadDetail = {
  thread: ChatThread;
  messages: ChatHistoryItem[];
  headId?: string | null;
};

export type DemoToolStatus = "running" | "complete" | "error";

export type DemoToolResult = {
  title: string;
  rows?: Record<string, string | number>[];
  bullets?: string[];
  note?: string;
};

export type DemoToolCall = {
  id: string;
  name: string;
  description?: string;
  status: DemoToolStatus;
  result?: DemoToolResult;
};

export type ChatStreamChunk =
  | {
      type: "chunk";
      text: string;
    }
  | {
      type: "tools";
      tools: DemoToolCall[];
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

export type CreateChatThreadInput = {
  threadId: string;
  title?: string;
};
