import type { ReactNode } from "react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

type ToolResultBlockProps = {
  title: string;
  children: ReactNode;
};

export function ToolResultBlock({ title, children }: ToolResultBlockProps) {
  return (
    <section className={cn("border border-black/10 bg-[#fbfaf7] p-3", chatbotLayout.radius.panel)}>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">{title}</p>
      <div className="text-sm leading-6 text-neutral-800">{children}</div>
    </section>
  );
}
