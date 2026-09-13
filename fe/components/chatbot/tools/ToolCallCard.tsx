import { Wrench } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { ToolStatusBadge } from "@/components/chatbot/tools/ToolStatusBadge";
import { cn } from "@/lib/utils";

type ToolCallCardProps = {
  name: string;
  description?: string;
  status?: "running" | "complete" | "error";
};

export function ToolCallCard({ name, description, status = "running" }: ToolCallCardProps) {
  return (
    <div className={cn("border border-black/10 bg-white/80 p-3", chatbotLayout.radius.panel)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0eee8] text-neutral-700">
            <Wrench className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-950">{name}</p>
            {description ? <p className="truncate text-xs text-neutral-500">{description}</p> : null}
          </div>
        </div>
        <ToolStatusBadge status={status} />
      </div>
    </div>
  );
}
