/** Shared class recipes so every control gets the same focus ring, border, and radius. */

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Text-like controls: input, select trigger, textarea. 44px tall so they are comfortable on touch. */
export const fieldControl =
  "h-11 w-full min-w-0 rounded-field border border-input bg-background px-3 text-sm text-foreground transition-colors placeholder:text-neutral-600 hover:border-foreground focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive " +
  focusRing;
