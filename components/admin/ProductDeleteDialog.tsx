"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Product } from "@/types/product";

type ProductDeleteDialogProps = {
  product: Product | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProductDeleteDialog({ product, onCancel, onConfirm }: ProductDeleteDialogProps) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center bg-red-50 text-red-700">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Delete product</h2>
              <p className="mt-1 text-sm text-neutral-600">This action cannot be undone.</p>
            </div>
          </div>
          <button
            className="grid size-9 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={onCancel}
            aria-label="Close delete dialog"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-neutral-700">
          Delete <span className="font-semibold text-ink">{product.brand} {product.name}</span> from the product list?
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 border border-neutral-300 px-4 text-sm font-semibold text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700/20"
            type="button"
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
