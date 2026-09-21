"use client";

import type * as React from "react";
import { Check, Minus } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";

/**
 * The visible box is 16px; the ::after pseudo-element stretches the hit area to 44px
 * so it is easy to tap without making tables look heavy.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "relative grid size-4 shrink-0 place-items-center rounded-control border border-input bg-background text-primary-foreground transition-colors after:absolute after:-inset-3.5 after:content-[''] hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        focusRing,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        {props.checked === "indeterminate" ? <Minus className="size-3" strokeWidth={3} aria-hidden="true" /> : <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
