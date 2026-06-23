"use client";

import { useContext } from "react";
import { ChatbotContext } from "@/components/chatbot/provider/ChatbotContext";

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider.");
  }

  return context;
}
