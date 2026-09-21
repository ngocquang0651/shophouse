"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { fieldControl } from "@/components/ui/styles";

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  /** Shown while `value` matches no option. An option with `value: ""` (e.g. "All") takes over when it exists. */
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

// Radix forbids an empty string as an item value, but "" is how the admin filters say "no filter".
const EMPTY_VALUE = "__empty__";

/**
 * One dropdown for the whole admin: filters, sorting, and form fields.
 * Takes plain `{ value, label }` options so call sites stay as short as a native <select>.
 */
function Select({ value, onValueChange, options, placeholder, id, disabled, invalid, className, ...aria }: SelectProps) {
  const hasEmptyOption = options.some((option) => option.value === "");
  const rootValue = value === "" ? (hasEmptyOption ? EMPTY_VALUE : "") : value;

  return (
    <SelectPrimitive.Root
      value={rootValue}
      onValueChange={(next) => onValueChange(next === EMPTY_VALUE ? "" : next)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        data-slot="select-trigger"
        aria-invalid={invalid || undefined}
        className={cn(fieldControl, "flex items-center justify-between gap-2 text-left data-[placeholder]:text-neutral-600", className)}
        {...aria}
      >
        <span className="min-w-0 flex-1 truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-neutral-600" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          data-slot="select-content"
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="admin-scope admin-fade-in z-[80] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-border bg-popover text-popover-foreground shadow-soft"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value === "" ? EMPTY_VALUE : option.value}
                className="relative flex min-h-11 cursor-pointer select-none items-center rounded-control py-2 pl-3 pr-9 text-sm outline-none data-[highlighted]:bg-accent data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 grid place-items-center">
                  <Check className="size-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select, EMPTY_VALUE };
