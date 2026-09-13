import { apiClient, apiDelete, apiGet, apiPatch, apiPost, toApiError } from "@/lib/api";
import type {
  ChatHistoryItem,
  ChatHistoryRepository,
  ChatStreamChunk,
  ChatStreamRequest,
  ChatThread,
  ChatThreadDetail,
  ChatThreadListResponse
} from "@/types/chatbot";

export function listChatThreads() {
  return apiGet<ChatThreadListResponse>("/chat/threads", { auth: false });
}

export function createChatThread(body: { threadId: string; title?: string }) {
  return apiPost<ChatThread>("/chat/threads", body, { auth: false });
}

export function getChatThreadDetail(threadId: string) {
  return apiGet<ChatThreadDetail>(`/chat/threads/${threadId}`, { auth: false });
}

export function updateChatThread(threadId: string, body: Partial<Pick<ChatThread, "title" | "status" | "custom">>) {
  return apiPatch<ChatThread>(`/chat/threads/${threadId}`, body, { auth: false });
}

export function renameChatThread(threadId: string, title: string) {
  return apiPatch<ChatThread>(`/chat/threads/${threadId}/name`, { title }, { auth: false });
}

export function pinChatThread(threadId: string) {
  return apiPost<ChatThread>(`/chat/threads/${threadId}/pin`, {}, { auth: false });
}

export function unpinChatThread(threadId: string) {
  return apiPost<ChatThread>(`/chat/threads/${threadId}/unpin`, {}, { auth: false });
}

export function deleteChatThread(threadId: string) {
  return apiDelete<{ ok: true }>(`/chat/threads/${threadId}`, { auth: false });
}

export function getChatMessages(threadId: string) {
  return getChatThreadDetail(threadId).then(
    ({ headId, messages }) =>
      ({
        headId,
        messages: messages.map(normalizeHistoryItem)
      }) satisfies ChatHistoryRepository
  );
}

export function appendChatMessage(threadId: string, item: ChatHistoryItem) {
  return apiPost<ChatHistoryItem>(`/chat/threads/${threadId}/messages`, item, { auth: false });
}

export async function* streamChatRun(threadId: string, body: ChatStreamRequest, abortSignal: AbortSignal) {
  const chunks: ChatStreamChunk[] = [];
  let notifyNextChunk: (() => void) | null = null;
  let isDone = false;
  let streamError: unknown = null;
  let buffer = "";
  let cursor = 0;

  const waitForNextChunk = () =>
    new Promise<void>((resolve) => {
      notifyNextChunk = resolve;
    });

  const notify = () => {
    notifyNextChunk?.();
    notifyNextChunk = null;
  };

  const appendText = (text: string) => {
    buffer += text;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        chunks.push(JSON.parse(trimmed) as ChatStreamChunk);
      }
    }

    notify();
  };

  const request = apiClient
    .request<string>({
      method: "POST",
      url: `/chat/threads/${threadId}/messages/stream`,
      data: body,
      responseType: "text",
      signal: abortSignal,
      onDownloadProgress: (event) => {
        const responseText = getProgressResponseText(event);
        if (!responseText || responseText.length <= cursor) {
          return;
        }

        appendText(responseText.slice(cursor));
        cursor = responseText.length;
      }
    })
    .then((response) => {
      const responseText = response.data;

      if (responseText.length > cursor) {
        appendText(responseText.slice(cursor));
        cursor = responseText.length;
      }

      if (buffer.trim()) {
        chunks.push(JSON.parse(buffer.trim()) as ChatStreamChunk);
        buffer = "";
      }
    })
    .catch((error) => {
      streamError = toApiError(error);
    })
    .finally(() => {
      isDone = true;
      notify();
    });

  while (!isDone || chunks.length > 0) {
    if (chunks.length === 0) {
      await waitForNextChunk();
      continue;
    }

    yield chunks.shift() as ChatStreamChunk;
  }

  await request;

  if (streamError) {
    throw streamError;
  }
}

function getProgressResponseText(event: { event?: ProgressEvent }) {
  const target = event.event?.target as ({ responseText?: string; response?: unknown } & EventTarget) | null | undefined;

  if (typeof target?.responseText === "string") {
    return target.responseText;
  }

  return typeof target?.response === "string" ? target.response : "";
}

function normalizeHistoryItem(item: ChatHistoryItem): ChatHistoryItem {
  const message = item.message;
  const metadata = (typeof message.metadata === "object" && message.metadata !== null ? message.metadata : {}) as Record<string, unknown>;
  const custom = getRecord(metadata.custom);

  if (message.role === "assistant") {
    return {
      ...item,
      parentId: item.parentId ?? null,
      message: {
        ...message,
        status: message.status ?? { type: "complete", reason: "stop" },
        metadata: {
          unstable_state: metadata.unstable_state ?? null,
          unstable_annotations: Array.isArray(metadata.unstable_annotations) ? metadata.unstable_annotations : [],
          unstable_data: Array.isArray(metadata.unstable_data) ? metadata.unstable_data : [],
          steps: Array.isArray(metadata.steps) ? metadata.steps : [],
          ...metadata,
          custom
        }
      }
    } as ChatHistoryItem;
  }

  if (message.role === "user") {
    return {
      ...item,
      parentId: item.parentId ?? null,
      message: {
        ...message,
        attachments: Array.isArray(message.attachments) ? message.attachments : [],
        metadata: {
          ...metadata,
          custom
        }
      }
    } as ChatHistoryItem;
  }

  return {
    ...item,
    parentId: item.parentId ?? null,
    message: {
      ...message,
      metadata: {
        ...metadata,
        custom
      }
    }
  } as ChatHistoryItem;
}

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}
