import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

type ToolStatus = "running" | "complete" | "error";

const toolStatusConfig = {
  running: {
    label: "Running",
    className: "bg-blue-50 text-blue-700",
    icon: Loader2
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2
  },
  error: {
    label: "Failed",
    className: "bg-red-50 text-red-700",
    icon: XCircle
  }
} satisfies Record<ToolStatus, { label: string; className: string; icon: typeof Loader2 }>;

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  const config = toolStatusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
        chatbotLayout.radius.control,
        config.className
      )}
    >
      <Icon className={cn("size-3.5", status === "running" && "animate-spin")} />
      {config.label}
    </span>
  );
}
