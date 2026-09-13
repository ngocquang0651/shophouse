"use client";

import { type PropsWithChildren, useMemo } from "react";
import {
  AssistantRuntimeProvider,
  RuntimeAdapterProvider,
  type ThreadHistoryAdapter,
  useAuiState,
  useLocalRuntime,
  useRemoteThreadListRuntime
} from "@assistant-ui/react";
import { appendChatMessage, getChatMessages } from "@/lib/chatbot/api";
import { createChatModelAdapter, createRemoteThreadListAdapter } from "@/components/chatbot/runtime";
import { useChatbot } from "@/components/chatbot/provider/useChatbot";

export function ChatbotRuntimeProvider({ children }: PropsWithChildren) {
  const { activeThreadId, ensureThread, refreshThreads, selectThread, setThreads } = useChatbot();

  function useThreadRuntime() {
    return useLocalRuntime(createChatModelAdapter(ensureThread));
  }

  const threadListAdapter = useMemo(
    () =>
      createRemoteThreadListAdapter(ChatThreadHistoryProvider, {
        setThreads,
        selectThread,
        refreshThreads
      }),
    [refreshThreads, selectThread, setThreads]
  );
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useThreadRuntime,
    adapter: threadListAdapter,
    threadId: activeThreadId ?? undefined
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
  );
}

function ChatThreadHistoryProvider({ children }: PropsWithChildren) {
  const threadId = useAuiState((state) => state.threadListItem.remoteId);
  const { ensureThread } = useChatbot();

  const history = useMemo<ThreadHistoryAdapter>(
    () => ({
      async load() {
        if (!threadId) {
          return { messages: [] };
        }

        return getChatMessages(threadId);
      },
      async append(item) {
        const targetThreadId = await ensureThread(threadId);

        await appendChatMessage(targetThreadId, item);
      }
    }),
    [ensureThread, threadId]
  );

  return <RuntimeAdapterProvider adapters={{ history }}>{children}</RuntimeAdapterProvider>;
}
