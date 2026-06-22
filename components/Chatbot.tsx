"use client";

import Link from "next/link";
import { type PropsWithChildren, type ReactNode, useMemo, useState } from "react";
import {
  ActionBarPrimitive,
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePartPrimitive,
  MessagePrimitive,
  RuntimeAdapterProvider,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  ThreadPrimitive,
  type ChatModelAdapter,
  type RemoteThreadListAdapter,
  type ThreadHistoryAdapter,
  useAuiState,
  useEditComposer,
  useLocalRuntime,
  useThreadListItem,
  useThreadListItemRuntime,
  useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import {
  ArrowUp,
  Bot,
  Check,
  Copy,
  Edit3,
  History,
  Home,
  MessageSquarePlus,
  PanelLeft,
  Pin,
  PinOff,
  RefreshCcw,
  Search,
  Sparkles,
  Square,
  X
} from "lucide-react";
import {
  appendChatMessage,
  createChatThread,
  deleteChatThread,
  getChatMessages,
  getChatThread,
  listChatThreads,
  streamChatRun,
  updateChatThread
} from "@/lib/chatbot/api";

const quickPrompts = [
  "Gợi ý túi luxury đang sale",
  "Tài khoản demo đăng nhập là gì?",
  "Có những brand nào?",
  "Tóm tắt các khu vực chính của home page"
];

let activeChatThreadId: string | undefined;

const localModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal, unstable_assistantMessageId, unstable_parentId, unstable_threadId }) {
    const threadId = unstable_threadId ?? activeChatThreadId ?? (await createChatThread()).id;
    activeChatThreadId = threadId;

    let text = "";

    for await (const chunk of streamChatRun(
      threadId,
      {
        messages,
        parentId: unstable_parentId,
        assistantMessageId: unstable_assistantMessageId
      },
      abortSignal
    )) {
      if (chunk.type === "chunk") {
        text += chunk.text;
        yield {
          content: [{ type: "text", text }]
        };
      }
    }

    yield {
      content: [{ type: "text", text }],
      status: { type: "complete", reason: "stop" }
    };
  }
};

function useChatThreadRuntime() {
  return useLocalRuntime(localModelAdapter);
}

export function Chatbot() {
  const threadListAdapter = useMemo<RemoteThreadListAdapter>(
    () => ({
      async list() {
        const { threads } = await listChatThreads();
        const firstRegularThread = threads.find((thread) => thread.status === "regular");
        activeChatThreadId = activeChatThreadId ?? firstRegularThread?.id;

        return {
          threads: threads
            .toSorted((a, b) => {
              const aPinned = a.custom?.pinned === true;
              const bPinned = b.custom?.pinned === true;

              if (aPinned !== bPinned) {
                return aPinned ? -1 : 1;
              }

              return b.updatedAt.localeCompare(a.updatedAt);
            })
            .map((thread) => ({
              remoteId: thread.id,
              externalId: thread.id,
              title: thread.title,
              status: thread.status,
              custom: {
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
                ...thread.custom
              }
            }))
        };
      },
      async initialize() {
        const thread = await createChatThread();
        activeChatThreadId = thread.id;

        return {
          remoteId: thread.id,
          externalId: thread.id
        };
      },
      async rename(remoteId, title) {
        await updateChatThread(remoteId, { title });
      },
      async updateCustom(remoteId, custom) {
        await updateChatThread(remoteId, { custom });
      },
      async archive(remoteId) {
        await updateChatThread(remoteId, { status: "archived" });
      },
      async unarchive(remoteId) {
        await updateChatThread(remoteId, { status: "regular" });
      },
      async delete(remoteId) {
        await deleteChatThread(remoteId);
      },
      async fetch(remoteId) {
        const thread = await getChatThread(remoteId);
        activeChatThreadId = thread.id;

        return {
          remoteId: thread.id,
          externalId: thread.id,
          title: thread.title,
          status: thread.status,
          custom: {
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
            ...thread.custom
          }
        };
      },
      async generateTitle() {
        return new ReadableStream({
          start(controller) {
            controller.close();
          }
        }) as never;
      },
      unstable_Provider: ChatThreadHistoryProvider
    }),
    []
  );
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useChatThreadRuntime,
    adapter: threadListAdapter
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-[100dvh] overflow-hidden bg-[#09090b] text-neutral-100">
        <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div
            className={`fixed inset-0 z-40 bg-black/55 transition lg:hidden ${
              sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          <ChatSidebar
            className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,300px)] transform transition duration-200 lg:static lg:z-auto lg:w-auto lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="flex h-full min-h-0 min-w-0 flex-col">
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0f0f12]/95 px-3 backdrop-blur sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="grid size-9 shrink-0 place-items-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 lg:hidden"
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open thread panel"
                  title="Threads"
                >
                  <PanelLeft className="size-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Chatbot</p>
                  <p className="truncate text-xs text-neutral-400">
                    Ask about LuxeStore, products, login, or shopping flows
                  </p>
                </div>
              </div>
              <Link
                className="grid size-9 shrink-0 place-items-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                href="/"
                aria-label="Back to home"
                title="Home"
              >
                <Home className="size-4" />
              </Link>
            </header>

            <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
              <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" autoScroll>
                <ThreadPrimitive.Empty>
                  <div className="mx-auto flex min-h-[calc(100dvh-13.5rem)] w-full max-w-3xl flex-col justify-center">
                    <div className="mb-8">
                      <div className="mb-5 grid size-12 place-items-center bg-white text-[#09090b]">
                        <Sparkles className="size-6" />
                      </div>
                      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        What can I help with?
                      </h1>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                        Ask about LuxeStore products, luxury categories, the login demo, or how the storefront works.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <ThreadPrimitive.Suggestion
                          className="border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-neutral-200 transition hover:border-white/25 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/20"
                          key={prompt}
                          prompt={prompt}
                          method="replace"
                          autoSend
                        >
                          {prompt}
                        </ThreadPrimitive.Suggestion>
                      ))}
                    </div>
                  </div>
                </ThreadPrimitive.Empty>

                <div className="mx-auto w-full max-w-3xl space-y-5">
                  <ThreadPrimitive.Messages>
                    {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
                  </ThreadPrimitive.Messages>
                </div>
              </ThreadPrimitive.Viewport>

              <div className="shrink-0 border-t border-white/10 bg-[#09090b] px-3 py-3 sm:px-6 sm:py-4">
                <Composer />
              </div>
            </ThreadPrimitive.Root>
          </main>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

function ChatThreadHistoryProvider({ children }: PropsWithChildren) {
  const threadId = useAuiState((state) => state.threadListItem.remoteId);
  activeChatThreadId = threadId ?? activeChatThreadId;
  const history = useMemo<ThreadHistoryAdapter>(
    () => ({
      async load() {
        const targetThreadId = threadId ?? activeChatThreadId;
        if (!targetThreadId) {
          return { messages: [] };
        }

        return getChatMessages(targetThreadId);
      },
      async append(item) {
        const targetThreadId = threadId ?? activeChatThreadId;
        if (!targetThreadId) {
          return;
        }

        await appendChatMessage(targetThreadId, item);
      }
    }),
    [threadId]
  );

  return <RuntimeAdapterProvider adapters={{ history }}>{children}</RuntimeAdapterProvider>;
}

function ChatSidebar({ className, onClose }: { className: string; onClose: () => void }) {
  return (
    <aside className={`flex h-full min-h-0 flex-col border-r border-white/10 bg-[#0f0f12] ${className}`}>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <div className="grid size-9 shrink-0 place-items-center bg-white text-[#09090b]">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">LuxeStore Codex</p>
          <p className="truncate text-xs text-neutral-400">Assistant workspace</p>
        </div>
        <button
          className="grid size-9 place-items-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 lg:hidden"
          type="button"
          onClick={onClose}
          aria-label="Close thread panel"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="shrink-0 p-3">
        <ThreadListPrimitive.New
          className="flex w-full items-center gap-2 bg-white px-3 py-2.5 text-sm font-semibold text-[#09090b] transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={onClose}
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </ThreadListPrimitive.New>
      </div>

      <div className="flex shrink-0 items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
        <History className="size-3.5" />
        Threads
      </div>

      <ThreadListPrimitive.Root className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <ThreadListPrimitive.Items>{() => <ThreadListItem onSelect={onClose} />}</ThreadListPrimitive.Items>
      </ThreadListPrimitive.Root>

      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          href="/"
        >
          <Home className="size-4" />
          Back to store
        </Link>
      </div>
    </aside>
  );
}

function ThreadListItem({ onSelect }: { onSelect: () => void }) {
  const thread = useThreadListItem();
  const threadRuntime = useThreadListItemRuntime();
  const pinned = thread.custom?.pinned === true;

  return (
    <ThreadListItemPrimitive.Root className="group mb-1 flex items-center gap-1">
      <ThreadListItemPrimitive.Trigger
        className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white data-[active]:bg-white/15 data-[active]:text-white"
        onClick={onSelect}
      >
        <span className="flex min-w-0 items-center gap-2">
          {pinned ? <Pin className="size-3 shrink-0 text-[#d8b56d]" /> : null}
          <span className="min-w-0 truncate">
            <ThreadListItemPrimitive.Title fallback="New conversation" />
          </span>
        </span>
      </ThreadListItemPrimitive.Trigger>
      <button
        className={`grid size-8 shrink-0 place-items-center border border-transparent text-neutral-500 transition hover:border-white/15 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 ${
          pinned ? "text-[#d8b56d]" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        }`}
        type="button"
        onClick={() => {
          threadRuntime.updateCustom({
            ...(thread.custom ?? {}),
            pinned: !pinned
          });
        }}
        aria-label={pinned ? "Unpin thread" : "Pin thread"}
        title={pinned ? "Unpin" : "Pin"}
      >
        {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>
    </ThreadListItemPrimitive.Root>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="group flex justify-end">
      <div className="flex min-w-0 max-w-[88%] flex-col items-end gap-1 sm:max-w-[72%]">
        <UserMessageBody />
        <MessageActions kind="user" />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="group flex min-w-0 gap-3">
      <div className="mt-1 grid size-8 shrink-0 place-items-center bg-white/10 text-neutral-200">
        <Bot className="size-4" />
      </div>
      <div className="flex min-w-0 max-w-[88%] flex-col items-start gap-1 sm:max-w-[78%]">
        <div className="min-w-0 overflow-hidden break-words border border-white/10 bg-[#111114] px-4 py-3 text-sm leading-6 text-neutral-100">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownMessagePart
            }}
          />
        </div>
        <MessageActions kind="assistant" />
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessageBody() {
  const isEditing = useEditComposer((composer) => composer.isEditing);

  if (isEditing) {
    return <EditMessageComposer />;
  }

  return (
    <div className="min-w-0 overflow-hidden break-words bg-white px-4 py-3 text-sm leading-6 text-[#09090b] shadow-lg">
      <MessagePrimitive.Parts
        components={{
          Text: MarkdownMessagePart
        }}
      />
    </div>
  );
}

function MarkdownMessagePart() {
  return <MessagePartPrimitive.Text component={MarkdownText} />;
}

function MarkdownText({ children }: { children?: ReactNode }) {
  const text = flattenText(children);
  const blocks = parseMarkdownBlocks(text);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return (
            <HeadingTag className="font-semibold leading-snug text-inherit" key={index}>
              {renderInlineMarkdown(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p className="whitespace-pre-wrap" key={index}>
              {renderInlineMarkdown(block.text)}
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul className="list-disc space-y-1 pl-5" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol className="list-decimal space-y-1 pl-5" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <pre
            className="overflow-x-auto border border-white/10 bg-black/25 p-3 text-xs leading-5 text-neutral-100"
            key={index}
          >
            <code>{block.text}</code>
          </pre>
        );
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; text: string };

function flattenText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  return "";
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "unordered-list", items: listItems });
      listItems = [];
    }

    if (orderedListItems.length) {
      blocks.push({ type: "ordered-list", items: orderedListItems });
      orderedListItems = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2]
      });
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      orderedListItems = [];
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      listItems = [];
      orderedListItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  if (inCodeBlock && codeLines.length) {
    blocks.push({ type: "code", text: codeLines.join("\n") });
  }

  flushParagraph();
  flushList();

  return blocks.length ? blocks : [{ type: "paragraph", text }];
}

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code className="border border-current/15 bg-current/10 px-1 py-0.5 text-[0.92em]" key={nodes.length}>
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={nodes.length}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={nodes.length}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            className="underline underline-offset-4 transition hover:text-[#d8b56d]"
            href={linkMatch[2]}
            key={nodes.length}
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function EditMessageComposer() {
  return (
    <ComposerPrimitive.Root className="flex min-w-[min(78vw,30rem)] flex-col gap-2 border border-white/15 bg-[#111114] p-2 shadow-2xl">
      <ComposerPrimitive.Input
        className="max-h-44 min-h-24 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-neutral-500"
        rows={3}
        submitMode="enter"
      />
      <div className="flex justify-end gap-2">
        <ComposerPrimitive.Cancel
          className="grid size-9 place-items-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Cancel edit"
          title="Cancel"
        >
          <X className="size-4" />
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send
          className="grid size-9 place-items-center bg-white text-[#09090b] transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
          aria-label="Save edit"
          title="Save"
        >
          <Check className="size-4" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}

function MessageActions({ kind }: { kind: "user" | "assistant" }) {
  return (
    <ActionBarPrimitive.Root
      className="flex items-center gap-1 text-neutral-500 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
      autohide="never"
      hideWhenRunning
    >
      <ActionBarPrimitive.Copy
        className="grid size-8 place-items-center transition hover:bg-white/10 hover:text-white data-[copied=true]:text-[#d8b56d] focus:outline-none focus:ring-2 focus:ring-white/20"
        copiedDuration={1500}
        aria-label="Copy message"
        title="Copy"
      >
        <Copy className="size-4" />
      </ActionBarPrimitive.Copy>
      {kind === "user" ? (
        <ActionBarPrimitive.Edit
          className="grid size-8 place-items-center transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Edit message"
          title="Edit"
        >
          <Edit3 className="size-4" />
        </ActionBarPrimitive.Edit>
      ) : (
        <ActionBarPrimitive.Reload
          className="grid size-8 place-items-center transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Regenerate response"
          title="Regenerate"
        >
          <RefreshCcw className="size-4" />
        </ActionBarPrimitive.Reload>
      )}
    </ActionBarPrimitive.Root>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl items-end gap-1.5 border border-white/10 bg-[#111114] p-2 shadow-2xl transition focus-within:border-white/30 sm:gap-2">
      <button
        className="hidden size-10 shrink-0 place-items-center text-neutral-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 sm:grid"
        type="button"
        aria-label="Search context"
        title="Search"
      >
        <Search className="size-4" />
      </button>
      <ComposerPrimitive.Input
        className="max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-6 text-white outline-none placeholder:text-neutral-500"
        placeholder="Ask LuxeStore anything..."
        rows={1}
        submitMode="enter"
      />
      <ComposerPrimitive.Cancel
        className="grid size-10 shrink-0 place-items-center bg-white/10 text-neutral-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="Stop response"
        title="Stop"
      >
        <Square className="size-4 fill-current" />
      </ComposerPrimitive.Cancel>
      <ComposerPrimitive.Send
        className="grid size-10 shrink-0 place-items-center bg-white text-[#09090b] transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
        aria-label="Send message"
        title="Send"
      >
        <ArrowUp className="size-4" />
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
}
