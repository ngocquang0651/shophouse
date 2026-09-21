"use client";

import type * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";

/** On = emerald (selling), off = grey. Pills are the one place fully round corners are right. */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-neutral-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-700",
        focusRing,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
