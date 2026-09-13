"use client";

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createChatThread,
  deleteChatThread,
  listChatThreads,
  pinChatThread,
  renameChatThread,
  unpinChatThread,
} from "@/lib/chatbot/api";
import type { ChatThread } from "@/types/chatbot";
import {
  ChatbotContext,
  type ChatbotContextValue,
} from "@/components/chatbot/provider/ChatbotContext";

const sortThreads = (threads: ChatThread[]) =>
  [...threads].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });

export function ChatbotProvider({ children }: PropsWithChildren) {
  const [threadsState, setThreadsState] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeThreadIdRef = useRef<string | null>(null);
  const pendingThreadPromiseRef = useRef<Promise<string> | null>(null);

  const setThreads = useCallback((nextThreads: ChatThread[]) => {
    setThreadsState(sortThreads(nextThreads));
  }, []);

  const refreshThreads = useCallback(async () => {
    setIsLoadingThreads(true);
    setError(null);

    try {
      const result = await listChatThreads();
      setThreads(result.threads);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to load chat threads.",
      );
    } finally {
      setIsLoadingThreads(false);
    }
  }, [setThreads]);

  const createNewThread = useCallback(async (title = "New conversation") => {
    const threadId = crypto.randomUUID();
    const thread = await createChatThread({ threadId, title });
    setThreadsState((currentThreads) =>
      sortThreads([
        thread,
        ...currentThreads.filter((item) => item.id !== thread.id),
      ]),
    );
    setActiveThreadId(thread.id);
    activeThreadIdRef.current = thread.id;

    return thread.id;
  }, []);

  const ensureThread = useCallback(
    async (threadId?: string | null, title?: string) => {
      if (threadId) {
        activeThreadIdRef.current = threadId;
        setActiveThreadId(threadId);
        return threadId;
      }

      if (activeThreadIdRef.current) {
        return activeThreadIdRef.current;
      }

      if (!pendingThreadPromiseRef.current) {
        pendingThreadPromiseRef.current = createNewThread(title).finally(() => {
          pendingThreadPromiseRef.current = null;
        });
      }

      return pendingThreadPromiseRef.current;
    },
    [createNewThread],
  );

  const selectThread = useCallback((threadId: string) => {
    activeThreadIdRef.current = threadId;
    setActiveThreadId(threadId);
  }, []);

  const renameThread = useCallback(async (threadId: string, title: string) => {
    const thread = await renameChatThread(threadId, title);
    setThreadsState((currentThreads) =>
      sortThreads(
        currentThreads.map((item) => (item.id === thread.id ? thread : item)),
      ),
    );
  }, []);

  const pinThread = useCallback(async (threadId: string) => {
    const thread = await pinChatThread(threadId);
    setThreadsState((currentThreads) =>
      sortThreads(
        currentThreads.map((item) => (item.id === thread.id ? thread : item)),
      ),
    );
  }, []);

  const unpinThread = useCallback(async (threadId: string) => {
    const thread = await unpinChatThread(threadId);
    setThreadsState((currentThreads) =>
      sortThreads(
        currentThreads.map((item) => (item.id === thread.id ? thread : item)),
      ),
    );
  }, []);

  const deleteThread = useCallback(
    async (threadId: string) => {
      await deleteChatThread(threadId);
      setThreadsState((currentThreads) => {
        const nextThreads = currentThreads.filter(
          (thread) => thread.id !== threadId,
        );
        if (activeThreadId === threadId) {
          const nextActiveThreadId = nextThreads[0]?.id ?? null;
          activeThreadIdRef.current = nextActiveThreadId;
          setActiveThreadId(nextActiveThreadId);
        }

        return nextThreads;
      });
    },
    [activeThreadId],
  );

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  const value = useMemo<ChatbotContextValue>(
    () => ({
      threads: threadsState,
      activeThreadId,
      isLoadingThreads,
      error,
      setThreads,
      refreshThreads,
      ensureThread,
      createNewThread,
      selectThread,
      renameThread,
      pinThread,
      unpinThread,
      deleteThread,
    }),
    [
      threadsState,
      activeThreadId,
      isLoadingThreads,
      error,
      setThreads,
      refreshThreads,
      ensureThread,
      createNewThread,
      selectThread,
      renameThread,
      pinThread,
      unpinThread,
      deleteThread,
    ],
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}
