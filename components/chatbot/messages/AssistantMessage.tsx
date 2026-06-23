import { MessagePrimitive } from "@assistant-ui/react";
import { Bot } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { MarkdownMessagePart } from "@/components/chatbot/markdown/MarkdownMessagePart";
import { MessageActions } from "@/components/chatbot/messages/MessageActions";
import { cn } from "@/lib/utils";

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="group flex min-w-0 gap-3">
      <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-[#e8e3d8] text-neutral-700">
        <Bot className="size-4" />
      </div>
      <div className="flex min-w-0 max-w-[92%] flex-col items-start gap-1.5 sm:max-w-[82%]">
        <div
          className={cn(
            "min-w-0 overflow-hidden break-words px-1 py-1 text-sm leading-6",
            chatbotLayout.surface.assistantMessage
          )}
        >
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
