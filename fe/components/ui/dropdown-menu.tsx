"use client";

import type * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn("admin-scope admin-fade-in z-[80] min-w-52 rounded-card border border-border bg-popover p-1 text-popover-foreground shadow-soft", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { destructive?: boolean };

function DropdownMenuItem({ className, destructive = false, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-control px-3 py-2.5 text-left text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        destructive && "text-destructive",
        className
      )}
      {...props}
    />
  );
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };
