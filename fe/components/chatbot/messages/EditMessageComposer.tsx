import { ComposerPrimitive } from "@assistant-ui/react";
import { Check, X } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

export function EditMessageComposer() {
  return (
    <ComposerPrimitive.Root
      className={cn(
        "flex min-w-[min(78vw,30rem)] flex-col gap-2 p-2",
        chatbotLayout.radius.panel,
        chatbotLayout.surface.composer
      )}
    >
      <ComposerPrimitive.Input
        className="max-h-44 min-h-24 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-500"
        rows={3}
        submitMode="enter"
      />
      <div className="flex justify-end gap-2">
        <ComposerPrimitive.Cancel
          className={cn(
            "grid size-9 place-items-center border border-black/10 bg-white text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
            chatbotLayout.radius.control,
            chatbotLayout.focus
          )}
          aria-label="Cancel edit"
          title="Cancel"
        >
          <X className="size-4" />
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send
          className={cn(
            "grid size-9 place-items-center bg-[#1d1c19] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400",
            chatbotLayout.radius.control,
            chatbotLayout.focus
          )}
          aria-label="Save edit"
          title="Save"
        >
          <Check className="size-4" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}
