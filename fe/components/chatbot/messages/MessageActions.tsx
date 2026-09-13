import { ActionBarPrimitive } from "@assistant-ui/react";
import { Copy, Edit3, RefreshCcw } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import type { MessageActionKind } from "@/components/chatbot/types";
import { cn } from "@/lib/utils";

const actionButtonClassName = cn(
  "grid size-8 place-items-center text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-950 data-[copied=true]:text-[#9c7330]",
  chatbotLayout.radius.control,
  chatbotLayout.focus
);

export function MessageActions({ kind }: { kind: MessageActionKind }) {
  return (
    <ActionBarPrimitive.Root
      className="flex items-center gap-1 text-neutral-500 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
      autohide="never"
      hideWhenRunning
    >
      <ActionBarPrimitive.Copy
        className={actionButtonClassName}
        copiedDuration={1500}
        aria-label="Copy message"
        title="Copy"
      >
        <Copy className="size-4" />
      </ActionBarPrimitive.Copy>
      {kind === "user" ? (
        <ActionBarPrimitive.Edit
          className={actionButtonClassName}
          aria-label="Edit message"
          title="Edit"
        >
          <Edit3 className="size-4" />
        </ActionBarPrimitive.Edit>
      ) : (
        <ActionBarPrimitive.Reload
          className={actionButtonClassName}
          aria-label="Regenerate response"
          title="Regenerate"
        >
          <RefreshCcw className="size-4" />
        </ActionBarPrimitive.Reload>
      )}
    </ActionBarPrimitive.Root>
  );
}
