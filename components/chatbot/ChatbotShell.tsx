"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, PanelLeft } from "lucide-react";
import { ChatSidebar } from "@/components/chatbot/ChatSidebar";
import { ChatThread } from "@/components/chatbot/ChatThread";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

export function ChatbotShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn("h-[100dvh] overflow-hidden", chatbotLayout.surface.app)}>
      <div className={cn("grid h-full min-h-0", chatbotLayout.sidebarWidth)}>
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
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-[#fbfaf7]/90 px-3 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className={cn(
                  "grid size-9 shrink-0 place-items-center border border-black/10 bg-white text-neutral-700 transition hover:border-black/20 hover:bg-neutral-100 hover:text-neutral-950 lg:hidden",
                  chatbotLayout.radius.control,
                  chatbotLayout.focus
                )}
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open thread panel"
                title="Threads"
              >
                <PanelLeft className="size-4" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-950">Chatbot</p>
                <p className="truncate text-xs text-neutral-500">
                  Ask about LuxeStore, products, login, or shopping flows
                </p>
              </div>
            </div>
            <Link
              className={cn(
                "grid size-9 shrink-0 place-items-center border border-black/10 bg-white text-neutral-700 transition hover:border-black/20 hover:bg-neutral-100 hover:text-neutral-950",
                chatbotLayout.radius.control,
                chatbotLayout.focus
              )}
              href="/"
              aria-label="Back to home"
              title="Home"
            >
              <Home className="size-4" />
            </Link>
          </header>

          <ChatThread />
        </main>
      </div>
    </div>
  );
}
