"use client";

import { Switch } from "@/components/ui/switch";
import { statusLabels } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/product";

type StatusSwitchProps = {
  status: ProductStatus;
  productName: string;
  onChange: (status: ProductStatus) => void;
  disabled?: boolean;
};

export function StatusSwitch({ status, productName, onChange, disabled = false }: StatusSwitchProps) {
  const active = status === "active";

  // The label wraps the switch so the words are clickable too, which gives a comfortable hit area.
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 py-1 text-sm lg:min-h-8">
      <Switch
        checked={active}
        disabled={disabled}
        aria-label={`${active ? "Ngừng bán" : "Bán lại"} ${productName}`}
        onCheckedChange={(next) => onChange(next ? "active" : "inactive")}
      />
      <span className={cn("whitespace-nowrap font-medium", active ? "text-emerald-700" : "text-neutral-600")}>{statusLabels[status]}</span>
    </label>
  );
}
