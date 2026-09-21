"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { parseWholeNumber } from "@/lib/admin-products";
import { cn } from "@/lib/utils";

type InlineNumberFieldProps = {
  value: number;
  label: string;
  min: number;
  onCommit: (value: number) => void | Promise<void>;
  disabled?: boolean;
  suffix?: string;
  className?: string;
};

/**
 * A number that can be edited in place. Enter or leaving the field saves,
 * Esc cancels, and invalid input snaps back to the last saved value.
 */
export function InlineNumberField({ value, label, min, onCommit, disabled = false, suffix, className }: InlineNumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const editing = draft !== null;

  function commit() {
    if (draft === null) {
      return;
    }

    const parsed = parseWholeNumber(draft);
    setDraft(null);

    if (parsed === null || parsed < min) {
      setInvalid(true);
      return;
    }

    setInvalid(false);
    if (parsed !== value) {
      void onCommit(parsed);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        className={cn("px-2 text-right font-semibold tabular-nums disabled:bg-neutral-50 lg:h-9", invalid && "border-destructive", className)}
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={invalid}
        disabled={disabled}
        value={editing ? draft : value.toLocaleString("vi-VN")}
        onFocus={(event) => {
          setDraft(String(value));
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setInvalid(false);
          setDraft(event.target.value);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.stopPropagation();
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
      />
      {suffix ? <span className="text-sm text-neutral-600">{suffix}</span> : null}
    </div>
  );
}
