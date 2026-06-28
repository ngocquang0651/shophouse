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

export type ChatRunReply = {
  text: string;
  tools?: DemoToolCall[];
};

export type ChatThreadDetail = {
  thread: ChatThread;
  messages: ChatHistoryItem[];
  headId?: string | null;
};
