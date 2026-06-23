import { MessagePrimitive, useEditComposer } from "@assistant-ui/react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { MarkdownMessagePart } from "@/components/chatbot/markdown/MarkdownMessagePart";
import { EditMessageComposer } from "@/components/chatbot/messages/EditMessageComposer";
import { MessageActions } from "@/components/chatbot/messages/MessageActions";
import { cn } from "@/lib/utils";

export function UserMessage() {
  return (
    <MessagePrimitive.Root className="group flex justify-end">
      <div className="flex min-w-0 max-w-[88%] flex-col items-end gap-1.5 sm:max-w-[72%]">
        <UserMessageBody />
        <MessageActions kind="user" />
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
    <div
      className={cn(
        "min-w-0 overflow-hidden break-words px-4 py-3 text-sm leading-6",
        chatbotLayout.radius.message,
        chatbotLayout.surface.userMessage
      )}
    >
      <MessagePrimitive.Parts
        components={{
          Text: MarkdownMessagePart
        }}
      />
    </div>
  );
}
