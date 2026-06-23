import Link from "next/link";
import { ThreadListPrimitive } from "@assistant-ui/react";
import { Bot, History, Home, MessageSquarePlus, X } from "lucide-react";
import { ThreadListItem } from "@/components/chatbot/ThreadListItem";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

export function ChatSidebar({ className, onClose }: { className: string; onClose: () => void }) {
  return (
    <aside className={cn("flex h-full min-h-0 flex-col", chatbotLayout.surface.sidebar, className)}>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-black/10 px-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#1d1c19] text-white">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-950">LuxeStore Codex</p>
          <p className="truncate text-xs text-neutral-500">Assistant workspace</p>
        </div>
        <button
          className={cn(
            "grid size-9 place-items-center border border-black/10 bg-white text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 lg:hidden",
            chatbotLayout.radius.control,
            chatbotLayout.focus
          )}
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
          className={cn(
            "flex w-full items-center gap-2 bg-[#1d1c19] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800",
            chatbotLayout.radius.control,
            chatbotLayout.focus
          )}
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

      <div className="shrink-0 border-t border-black/10 p-3">
        <Link
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 transition hover:bg-black/[0.04] hover:text-neutral-950",
            chatbotLayout.radius.control,
            chatbotLayout.focus
          )}
          href="/"
        >
          <Home className="size-4" />
          Back to store
        </Link>
      </div>
    </aside>
  );
}
