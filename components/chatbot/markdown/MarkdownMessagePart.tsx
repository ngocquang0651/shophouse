import { MessagePartPrimitive } from "@assistant-ui/react";
import { MarkdownText } from "@/components/chatbot/markdown/MarkdownText";

export function MarkdownMessagePart() {
  return <MessagePartPrimitive.Text component={MarkdownText} />;
}
