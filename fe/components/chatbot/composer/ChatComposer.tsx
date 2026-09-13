import { ComposerPrimitive } from "@assistant-ui/react";
import { ArrowUp, Square } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { ComposerToolbar } from "@/components/chatbot/composer/ComposerToolbar";
import { cn } from "@/lib/utils";

export function ChatComposer() {
  return (
    <ComposerPrimitive.Root
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col gap-2 p-2 transition focus-within:border-black/20",
        chatbotLayout.radius.panel,
        chatbotLayout.surface.composer
      )}
    >
      <ComposerPrimitive.Input
        className="max-h-44 min-h-12 min-w-0 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-500"
        placeholder="Ask LuxeStore anything..."
        rows={1}
        submitMode="enter"
      />
      <div className="flex items-center justify-between gap-2">
        <ComposerToolbar />
        <div className="flex items-center gap-1">
          <ComposerPrimitive.Cancel
            className={cn(
              "grid size-9 shrink-0 place-items-center bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-950",
              chatbotLayout.radius.control,
              chatbotLayout.focus
            )}
            aria-label="Stop response"
            title="Stop"
          >
            <Square className="size-4 fill-current" />
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send
            className={cn(
              "grid size-9 shrink-0 place-items-center bg-[#1d1c19] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400",
              chatbotLayout.radius.control,
              chatbotLayout.focus
            )}
            aria-label="Send message"
            title="Send"
          >
            <ArrowUp className="size-4" />
          </ComposerPrimitive.Send>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
}
