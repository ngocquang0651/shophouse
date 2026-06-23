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

export type ChatMessagePart = {
  type: string;
  text?: string;
  [key: string]: unknown;
};

export type ChatThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: ChatMessagePart[];
  createdAt?: string | Date;
  status?: unknown;
  metadata?: unknown;
  [key: string]: unknown;
};

export type ChatHistoryItem = {
  parentId: string | null;
  message: ChatThreadMessage;
  runConfig?: Record<string, unknown>;
};

export type ChatHistoryRepository = {
  headId?: string | null;
  messages: ChatHistoryItem[];
};

export type ChatThreadDetail = {
  thread: ChatThread;
  messages: ChatHistoryItem[];
  headId?: string | null;
};
