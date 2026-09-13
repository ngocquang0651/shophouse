import { type FormEvent, useState } from "react";
import { ThreadListItemPrimitive, useThreadListItem, useThreadListItemRuntime } from "@assistant-ui/react";
import { Check, Pencil, Pin, PinOff, Trash2, X } from "lucide-react";
import { chatbotLayout } from "@/components/chatbot/constants";
import { cn } from "@/lib/utils";

export function ThreadListItem({ onSelect }: { onSelect: () => void }) {
  const thread = useThreadListItem();
  const threadRuntime = useThreadListItemRuntime();
  const pinned = thread.custom?.pinned === true;
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(thread.title ?? "New conversation");

  const beginEdit = () => {
    setDraftTitle(thread.title ?? "New conversation");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftTitle(thread.title ?? "New conversation");
    setIsEditing(false);
  };

  const saveTitle = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextTitle = draftTitle.trim();

    if (!nextTitle || nextTitle === thread.title) {
      setIsEditing(false);
      return;
    }

    await Promise.resolve(threadRuntime.rename(nextTitle));
    setIsEditing(false);
  };

  const deleteThread = async () => {
    const confirmed = window.confirm(`Delete "${thread.title ?? "New conversation"}"?`);
    if (!confirmed) {
      return;
    }

    await Promise.resolve(threadRuntime.delete());
  };

  return (
    <ThreadListItemPrimitive.Root className="group mb-1 flex items-center gap-1">
      {isEditing ? (
        <form
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1 border border-black/10 bg-white px-2 py-1.5",
            chatbotLayout.radius.control,
          )}
          onSubmit={saveTitle}
        >
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                cancelEdit();
              }
            }}
            aria-label="Thread name"
            autoFocus
          />
          <button
            className={cn("grid size-7 place-items-center text-neutral-500 hover:text-neutral-950", chatbotLayout.radius.control, chatbotLayout.focus)}
            type="submit"
            aria-label="Save thread name"
            title="Save"
          >
            <Check className="size-4" />
          </button>
          <button
            className={cn("grid size-7 place-items-center text-neutral-500 hover:text-neutral-950", chatbotLayout.radius.control, chatbotLayout.focus)}
            type="button"
            onClick={cancelEdit}
            aria-label="Cancel rename"
            title="Cancel"
          >
            <X className="size-4" />
          </button>
        </form>
      ) : (
        <ThreadListItemPrimitive.Trigger
          className={cn(
            "min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-neutral-600 transition hover:bg-black/[0.04] hover:text-neutral-950 data-[active]:bg-[#e8e3d8] data-[active]:text-neutral-950",
            chatbotLayout.radius.control,
            chatbotLayout.focus,
          )}
          onClick={onSelect}
        >
          <span className="flex min-w-0 items-center gap-2">
            {pinned ? <Pin className="size-3 shrink-0 text-[#9c7330]" /> : null}
            <span className="min-w-0 truncate">
              <ThreadListItemPrimitive.Title fallback="New conversation" />
            </span>
          </span>
        </ThreadListItemPrimitive.Trigger>
      )}
      <button
        className={cn(
          "grid size-8 shrink-0 place-items-center border border-transparent text-neutral-500 transition hover:border-black/10 hover:bg-black/[0.04] hover:text-neutral-950",
          chatbotLayout.radius.control,
          chatbotLayout.focus,
          pinned ? "text-[#9c7330]" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        )}
        type="button"
        onClick={() => {
          threadRuntime.updateCustom({
            ...(thread.custom ?? {}),
            pinned: !pinned
          });
        }}
        aria-label={pinned ? "Unpin thread" : "Pin thread"}
        title={pinned ? "Unpin" : "Pin"}
      >
        {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>
      <button
        className={cn(
          "grid size-8 shrink-0 place-items-center border border-transparent text-neutral-500 opacity-100 transition hover:border-black/10 hover:bg-black/[0.04] hover:text-neutral-950 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100",
          chatbotLayout.radius.control,
          chatbotLayout.focus,
        )}
        type="button"
        onClick={beginEdit}
        aria-label="Rename thread"
        title="Rename"
      >
        <Pencil className="size-4" />
      </button>
      <button
        className={cn(
          "grid size-8 shrink-0 place-items-center border border-transparent text-neutral-500 opacity-100 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100",
          chatbotLayout.radius.control,
          chatbotLayout.focus,
        )}
        type="button"
        onClick={deleteThread}
        aria-label="Delete thread"
        title="Delete"
      >
        <Trash2 className="size-4" />
      </button>
    </ThreadListItemPrimitive.Root>
  );
}
