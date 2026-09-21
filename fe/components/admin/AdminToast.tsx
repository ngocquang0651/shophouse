"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type AdminToastState = {
  id: number;
  tone: "success" | "error";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type AdminToastProps = {
  toast: AdminToastState | null;
  onDismiss: () => void;
};

const SUCCESS_DISMISS_MS = 6000;

export function AdminToast({ toast, onDismiss }: AdminToastProps) {
  if (!toast) {
    return null;
  }

  // Keyed by id so a new message restarts the timer and the pause state.
  return <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />;
}

function ToastCard({ toast, onDismiss }: { toast: AdminToastState; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false);
  const isError = toast.tone === "error";
  const Icon = isError ? XCircle : CheckCircle2;

  // Successes dismiss themselves (and wait while hovered or focused so "Hoàn tác" stays reachable).
  // Errors stay until dismissed so nobody misses what went wrong.
  useEffect(() => {
    if (isError || paused) {
      return;
    }

    const timer = window.setTimeout(onDismiss, SUCCESS_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [isError, paused, onDismiss]);

  return (
    <div
      className="fixed inset-x-4 top-16 z-[60] flex justify-center sm:inset-x-auto sm:right-6"
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={`admin-rise-in flex w-full max-w-md items-start gap-3 rounded-card border px-4 py-3 text-sm shadow-soft ${
          isError ? "border-red-300 bg-red-50 text-red-900" : "border-border bg-background text-ink"
        }`}
      >
        <Icon className={`mt-0.5 size-5 shrink-0 ${isError ? "text-red-700" : "text-emerald-700"}`} aria-hidden="true" />
        <p className="min-w-0 flex-1 break-words leading-5">{toast.message}</p>
        {toast.actionLabel && toast.onAction ? (
          <button
            className="min-h-8 shrink-0 rounded-control px-1 font-semibold text-shopo-orange underline underline-offset-4 hover:text-ink"
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
          >
            {toast.actionLabel}
          </button>
        ) : null}
        <button
          className="grid size-8 shrink-0 place-items-center rounded-control text-neutral-600 hover:text-ink"
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
