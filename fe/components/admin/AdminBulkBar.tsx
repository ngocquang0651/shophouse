"use client";

import { Eye, EyeOff, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AdminBulkBarProps = {
  count: number;
  busy: boolean;
  canArchive: boolean;
  canRestore: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
};

/** Floating action bar shown only while products are selected. */
export function AdminBulkBar({ count, busy, canArchive, canRestore, onArchive, onRestore, onDelete, onClear }: AdminBulkBarProps) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="on-dark admin-rise-in fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-3xl flex-col gap-3 rounded-dialog bg-ink px-4 py-3 text-white shadow-soft sm:flex-row sm:items-center sm:justify-between" role="region" aria-label="Thao tác hàng loạt">
      <div className="flex items-center gap-3 text-sm">
        <span role="status" aria-live="polite" className="tabular-nums">
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Đang xử lý {count} sản phẩm…
            </span>
          ) : (
            <>
              Đã chọn <strong>{count}</strong> sản phẩm
            </>
          )}
        </span>
        <Button className="px-1 text-white/80 underline underline-offset-4 hover:text-white" variant="link" type="button" disabled={busy} onClick={onClear}>
          <X className="!size-3.5" aria-hidden="true" />
          Bỏ chọn
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {canArchive ? (
          <Button variant="inverse" type="button" onClick={onArchive} disabled={busy}>
            <EyeOff aria-hidden="true" />
            Ngừng bán
          </Button>
        ) : null}
        {canRestore ? (
          <Button variant="inverse" type="button" onClick={onRestore} disabled={busy}>
            <Eye aria-hidden="true" />
            Bán lại
          </Button>
        ) : null}
        <Button className="bg-red-600 hover:bg-red-500" variant="destructive" type="button" onClick={onDelete} disabled={busy}>
          <Trash2 aria-hidden="true" />
          Xoá
        </Button>
      </div>
    </div>
  );
}
