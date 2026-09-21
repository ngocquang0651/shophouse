import type * as React from "react";

import { cn } from "@/lib/utils";
import { fieldControl } from "@/components/ui/styles";

/** Set `aria-invalid` to get the error border; pair it with `aria-describedby` pointing at the message. */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" type={type} className={cn(fieldControl, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldControl, "h-auto min-h-28 py-3", className)} {...props} />;
}

export { Input, Textarea };
