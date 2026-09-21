import type * as React from "react";

import { cn } from "@/lib/utils";

/** A bordered panel. `overflow-hidden` keeps tables and dividers inside the rounded corners. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("overflow-hidden rounded-card border border-border bg-background", className)} {...props} />;
}

export { Card };
