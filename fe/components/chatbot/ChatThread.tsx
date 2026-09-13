import { ThreadPrimitive } from "@assistant-ui/react";
import { Sparkles } from "lucide-react";
import { chatbotLayout, quickPrompts } from "@/components/chatbot/constants";
import { AssistantMessage } from "@/components/chatbot/messages/AssistantMessage";
import { ChatComposer } from "@/components/chatbot/composer/ChatComposer";
import { UserMessage } from "@/components/chatbot/messages/UserMessage";
import { cn } from "@/lib/utils";

export function ChatThread() {
  return (
    <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
      <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" autoScroll>
        <ThreadPrimitive.Empty>
          <div className={cn("mx-auto flex min-h-[calc(100dvh-13.5rem)] w-full flex-col justify-center", chatbotLayout.contentWidth)}>
            <div className="mb-8">
              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#1d1c19] text-white shadow-sm">
                <Sparkles className="size-6" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">What can I help with?</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Ask about LuxeStore products, luxury categories, the login demo, or how the storefront works.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {quickPrompts.map((prompt) => (
                <ThreadPrimitive.Suggestion
                  className={cn(
                    "border border-black/10 bg-white/80 px-4 py-3 text-left text-sm text-neutral-700 shadow-sm shadow-black/[0.02] transition hover:border-black/20 hover:bg-white hover:text-neutral-950",
                    chatbotLayout.radius.control,
                    chatbotLayout.focus
                  )}
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

        <div className={cn("mx-auto w-full space-y-6", chatbotLayout.contentWidth)}>
          <ThreadPrimitive.Messages>
            {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
          </ThreadPrimitive.Messages>
        </div>
      </ThreadPrimitive.Viewport>

      <div className="shrink-0 border-t border-black/10 bg-[#f7f5f0]/95 px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
        <ChatComposer />
      </div>
    </ThreadPrimitive.Root>
  );
}
