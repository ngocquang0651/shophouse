"use client";

import { ChatbotRuntimeProvider } from "@/components/chatbot/ChatbotRuntimeProvider";
import { ChatbotShell } from "@/components/chatbot/ChatbotShell";
import { ChatbotProvider } from "@/components/chatbot/provider/ChatbotProvider";

export function Chatbot() {
  return (
    <ChatbotProvider>
      <ChatbotRuntimeProvider>
        <ChatbotShell />
      </ChatbotRuntimeProvider>
    </ChatbotProvider>
  );
}
