import { apiDelete, apiGet, apiPatch, apiPost, getApiUrl } from "@/lib/api";
import type {
  ChatHistoryItem,
  ChatHistoryRepository,
  ChatStreamChunk,
  ChatStreamRequest,
  ChatThread,
  ChatThreadListResponse
} from "@/types/chatbot";

export function listChatThreads() {
  return apiGet<ChatThreadListResponse>("/chat/threads", { auth: false });
}

export function createChatThread(title?: string) {
  return apiPost<ChatThread>("/chat/threads", { title }, { auth: false });
}

export function getChatThread(threadId: string) {
  return apiGet<ChatThread>(`/chat/threads/${threadId}`, { auth: false });
}

export function updateChatThread(threadId: string, body: Partial<Pick<ChatThread, "title" | "status" | "custom">>) {
  return apiPatch<ChatThread>(`/chat/threads/${threadId}`, body, { auth: false });
}

export function deleteChatThread(threadId: string) {
  return apiDelete<{ ok: true }>(`/chat/threads/${threadId}`, { auth: false });
}

export function getChatMessages(threadId: string) {
  return apiGet<ChatHistoryRepository>(`/chat/threads/${threadId}/messages`, { auth: false });
}

export function appendChatMessage(threadId: string, item: ChatHistoryItem) {
  return apiPost<ChatHistoryItem>(`/chat/threads/${threadId}/messages`, item, { auth: false });
}

export async function* streamChatRun(threadId: string, body: ChatStreamRequest, abortSignal: AbortSignal) {
  const response = await fetch(getApiUrl(`/chat/threads/${threadId}/runs/stream`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: abortSignal
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat stream failed with status ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      yield JSON.parse(trimmed) as ChatStreamChunk;
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    yield JSON.parse(buffer.trim()) as ChatStreamChunk;
  }
}
