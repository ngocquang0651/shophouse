"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from "@/components/ui/dialog";
import type { Product } from "@/types/product";

export type ProductDeleteDialogProps = {
  products: Product[];
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const PREVIEW_LIMIT = 5;

export function ProductDeleteDialog({ products, isDeleting, onCancel, onConfirm }: ProductDeleteDialogProps) {
  const open = products.length > 0;
  const [single] = products;
  const hidden = products.length - PREVIEW_LIMIT;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isDeleting) onCancel();
      }}
    >
      {open ? (
        <AlertDialogContent onEscapeKeyDown={(event) => isDeleting && event.preventDefault()}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-ink">
                {products.length === 1 ? "Xoá sản phẩm?" : `Xoá ${products.length} sản phẩm?`}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-sm text-neutral-700">Không thể hoàn tác sau khi xoá.</AlertDialogDescription>
            </div>
          </div>

          {products.length === 1 && single ? (
            <p className="mt-5 text-sm leading-6 text-neutral-700">
              Bạn sắp xoá <span className="font-semibold text-ink">{single.brand} {single.name}</span> khỏi cửa hàng.
            </p>
          ) : (
            <ul className="mt-5 grid gap-1 text-sm text-neutral-700">
              {products.slice(0, PREVIEW_LIMIT).map((product) => (
                <li className="truncate" key={product.id}>
                  • <span className="font-medium text-ink">{product.brand} {product.name}</span>
                </li>
              ))}
              {hidden > 0 ? <li className="text-neutral-600">… và {hidden} sản phẩm khác</li> : null}
            </ul>
          )}

          <p className="mt-4 rounded-field bg-porcelain px-3 py-2 text-sm leading-5 text-neutral-700">
            Chỉ muốn tạm ẩn khỏi cửa hàng? Hãy chọn <strong>Ngừng bán</strong> để giữ lại dữ liệu và bán lại sau.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Giữ lại
              </Button>
            </AlertDialogCancel>
            {/* Not <AlertDialogAction>: that would close the dialog before the delete request finishes. */}
            <Button variant="destructive" loading={isDeleting} onClick={onConfirm}>
              {isDeleting ? null : <Trash2 aria-hidden="true" />}
              {isDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
            </Button>
          </div>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}
