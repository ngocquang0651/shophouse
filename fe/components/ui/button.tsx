import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-field text-sm font-semibold transition-colors",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    focusRing
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background text-foreground hover:border-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground hover:bg-accent",
        link: "text-foreground underline underline-offset-4 hover:text-shopo-orange",
        // For use on the dark bulk-action bar.
        inverse: "border border-white/40 text-white hover:bg-white/10"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "size-11",
        // 44px on touch, 36px where a mouse is expected (dense table rows).
        "icon-sm": "size-11 lg:size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner and blocks clicks while an action is in flight. */
    loading?: boolean;
  };

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
