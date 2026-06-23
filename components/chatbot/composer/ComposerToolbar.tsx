import { Paperclip, Search, SlidersHorizontal } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

const toolbarButtonClassName = cn(
  "grid size-8 place-items-center text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-45",
  chatbotLayout.radius.control,
  chatbotLayout.focus
);

export function ComposerToolbar() {
  return (
    <div className="flex items-center gap-1">
      <button className={toolbarButtonClassName} type="button" aria-label="Search context" title="Search">
        <Search className="size-4" />
      </button>
      <button className={toolbarButtonClassName} type="button" aria-label="Attach file" title="Attach" disabled>
        <Paperclip className="size-4" />
      </button>
      <button className={toolbarButtonClassName} type="button" aria-label="Tool settings" title="Tools" disabled>
        <SlidersHorizontal className="size-4" />
      </button>
    </div>
  );
}
