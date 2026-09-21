import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-control px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-secondary text-neutral-800",
      outline: "border border-input text-neutral-800",
      success: "bg-emerald-50 text-emerald-800",
      warning: "bg-amber-50 text-amber-900",
      danger: "bg-red-50 text-red-800"
    }
  },
  defaultVariants: { variant: "default" }
});

export type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
