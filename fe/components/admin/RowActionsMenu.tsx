"use client";

import { Eye, EyeOff, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ProductStatus } from "@/types/product";

export type RowActionsMenuProps = {
  productName: string;
  status: ProductStatus;
  onToggleStatus: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function RowActionsMenu({ productName, status, onToggleStatus, onDelete, disabled = false }: RowActionsMenuProps) {
  const active = status === "active";

  // modal={false}: the delete action opens a dialog, and a modal menu would still hold the page's
  // pointer-events lock while that dialog mounts.
  return (
    <DropdownMenu modal={false}>
      {/* `disabled` goes on the trigger too: Radix opens on pointerdown, which a disabled child alone does not stop. */}
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="icon-sm" disabled={disabled} aria-label={`Thêm thao tác cho ${productName}`}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label={`Thao tác với ${productName}`}>
        <DropdownMenuItem onSelect={onToggleStatus}>
          {active ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {active ? "Ngừng bán" : "Bán lại"}
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={onDelete}>
          <Trash2 aria-hidden="true" />
          Xoá sản phẩm
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
