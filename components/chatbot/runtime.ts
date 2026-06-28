import type { ChatModelAdapter, RemoteThreadListAdapter } from "@assistant-ui/react";
import {
  createChatThread,
  deleteChatThread,
  getChatThreadDetail,
  listChatThreads,
  pinChatThread,
  renameChatThread,
  streamChatRun,
  unpinChatThread
} from "@/lib/chatbot/api";
import type { ChatThread, DemoToolCall } from "@/types/chatbot";

type RemoteThreadListCallbacks = {
  setThreads(threads: ChatThread[]): void;
  selectThread(threadId: string): void;
  refreshThreads(): Promise<void>;
};

export function createChatModelAdapter(ensureThread: (threadId?: string | null) => Promise<string>): ChatModelAdapter {
  return {
    async *run({ messages, abortSignal, unstable_assistantMessageId, unstable_parentId, unstable_threadId }) {
      const threadId = await ensureThread(unstable_threadId);

      let text = "";
      let demoTools: DemoToolCall[] = [];

      for await (const chunk of streamChatRun(
        threadId,
        {
          messages,
          parentId: unstable_parentId,
          assistantMessageId: unstable_assistantMessageId
        },
        abortSignal
      )) {
        if (chunk.type === "tools") {
          demoTools = chunk.tools;
          yield {
            content: [{ type: "text", text }],
            metadata: { custom: { demoTools } }
          };
        }

        if (chunk.type === "chunk") {
          text += chunk.text;
          yield {
            content: [{ type: "text", text }],
            metadata: { custom: { demoTools } }
          };
        }
      }

      yield {
        content: [{ type: "text", text }],
        status: { type: "complete", reason: "stop" },
        metadata: { custom: { demoTools } }
      };
    }
  };
}

export function createRemoteThreadListAdapter(
  unstableProvider: RemoteThreadListAdapter["unstable_Provider"],
  callbacks: RemoteThreadListCallbacks
) {
  return {
    async list() {
      const { threads } = await listChatThreads();
      callbacks.setThreads(threads);

      return {
        threads: threads.map(toRemoteThreadMetadata)
      };
    },
    async initialize(threadId) {
      const thread = await createChatThread({ threadId });
      callbacks.selectThread(thread.id);
      await callbacks.refreshThreads();

      return {
        remoteId: thread.id,
        externalId: thread.id
      };
    },
    async rename(remoteId, title) {
      await renameChatThread(remoteId, title);
      await callbacks.refreshThreads();
    },
    async updateCustom(remoteId, custom) {
      if (custom?.pinned === true) {
        await pinChatThread(remoteId);
      } else {
        await unpinChatThread(remoteId);
      }

      await callbacks.refreshThreads();
    },
    async archive(remoteId) {
      await unpinChatThread(remoteId);
      await callbacks.refreshThreads();
    },
    async unarchive(remoteId) {
      await pinChatThread(remoteId);
      await callbacks.refreshThreads();
    },
    async delete(remoteId) {
      await deleteChatThread(remoteId);
      await callbacks.refreshThreads();
    },
    async fetch(remoteId) {
      const detail = await getChatThreadDetail(remoteId);
      callbacks.selectThread(detail.thread.id);

      return toRemoteThreadMetadata(detail.thread);
    },
    async generateTitle() {
      return new ReadableStream({
        start(controller) {
          controller.close();
        }
      }) as never;
    },
    unstable_Provider: unstableProvider
  } satisfies RemoteThreadListAdapter;
}

function toRemoteThreadMetadata(thread: ChatThread) {
  return {
    remoteId: thread.id,
    externalId: thread.id,
    title: thread.title,
    status: thread.status,
    custom: {
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      pinned: thread.pinned,
      ...thread.custom
    }
  } satisfies Awaited<ReturnType<RemoteThreadListAdapter["fetch"]>>;
}
