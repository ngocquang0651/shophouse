"use client";

import type * as React from "react";
import { X } from "lucide-react";
import { AlertDialog as AlertDialogPrimitive, Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const overlayClass = "admin-fade-in fixed inset-0 z-50 bg-black/50";

// Content is portaled to <body>, outside the admin shell, so each surface re-applies `admin-scope`
// to keep the admin focus ring and the 16px phone inputs.

/** Radix handles the focus trap, Esc, scroll lock, aria-modal, and returning focus to the trigger. */
const Dialog = DialogPrimitive.Root;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogClose = DialogPrimitive.Close;

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Accessible name for the close (X) button. Omit to render no close button. */
  closeLabel?: string;
  closeDisabled?: boolean;
};

/**
 * Scrolling dialog for long forms: the overlay scrolls, the panel keeps its own height.
 * On phones the panel is full-bleed with square edges; from `sm` up it floats with the dialog radius.
 */
function DialogContent({ className, children, closeLabel, closeDisabled, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={cn(overlayClass, "overflow-y-auto sm:px-4 sm:py-6")}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn("admin-scope admin-rise-in relative mx-auto min-h-full w-full bg-background shadow-soft sm:min-h-0 sm:rounded-dialog", className)}
          {...props}
        >
          {children}
          {closeLabel ? (
            <DialogPrimitive.Close asChild>
              <Button className="absolute right-4 top-4 sm:right-5" variant="outline" size="icon" disabled={closeDisabled} aria-label={closeLabel} title="Đóng">
                <X aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

/** `role="alertdialog"`: for confirmations, initial focus goes to the safe action via Cancel. */
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTitle = AlertDialogPrimitive.Title;
const AlertDialogDescription = AlertDialogPrimitive.Description;

function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className={cn(overlayClass, "grid place-items-center overflow-y-auto px-4")}>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn("admin-scope admin-rise-in w-full max-w-md rounded-dialog bg-background p-6 shadow-soft", className)}
          {...props}
        />
      </AlertDialogPrimitive.Overlay>
    </AlertDialogPrimitive.Portal>
  );
}

const AlertDialogCancel = AlertDialogPrimitive.Cancel;
const AlertDialogAction = AlertDialogPrimitive.Action;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
};
