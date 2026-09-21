"use client";

import { focusRing } from "@/components/ui/styles";
import { InlineNumberField } from "@/components/admin/InlineNumberField";
import type { ProductSummary, StockFilter } from "@/lib/admin-products";
import { MAX_LOW_STOCK_THRESHOLD } from "@/lib/admin-settings";
import type { ProductStatus } from "@/types/product";
import { cn } from "@/lib/utils";

export type StatSelection = { status: "" | ProductStatus; stock: StockFilter };

export type AdminStatsProps = {
  summary: ProductSummary;
  selection: StatSelection;
  lowStockThreshold: number;
  onSelect: (selection: StatSelection) => void;
  onLowStockThresholdChange: (value: number) => void;
};

type StatCard = {
  label: string;
  value: number;
  selection: StatSelection;
  tone: string;
};

export function AdminStats({ summary, selection, lowStockThreshold, onSelect, onLowStockThresholdChange }: AdminStatsProps) {
  const cards: StatCard[] = [
    { label: "Tất cả sản phẩm", value: summary.total, selection: { status: "", stock: "" }, tone: "text-ink" },
    { label: "Đang bán", value: summary.active, selection: { status: "active", stock: "" }, tone: "text-emerald-700" },
    { label: "Ngừng bán", value: summary.inactive, selection: { status: "inactive", stock: "" }, tone: "text-neutral-600" },
    { label: `Sắp hết (≤ ${lowStockThreshold})`, value: summary.low, selection: { status: "", stock: "low" }, tone: "text-amber-700" },
    { label: "Hết hàng", value: summary.out, selection: { status: "", stock: "out" }, tone: "text-red-700" }
  ];

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Lọc nhanh theo tình trạng">
        {cards.map((card) => {
          const selected = card.selection.status === selection.status && card.selection.stock === selection.stock;

          return (
            <button
              key={card.label}
              className={cn(
                "rounded-card border bg-background p-4 text-left transition-colors hover:border-foreground",
                focusRing,
                selected ? "border-foreground ring-1 ring-foreground" : "border-border"
              )}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(card.selection)}
            >
              <span className="block text-sm text-neutral-600">{card.label}</span>
              <span className={cn("mt-1 block text-2xl font-semibold tabular-nums", card.tone)}>{card.value.toLocaleString("vi-VN")}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 text-sm text-neutral-600">
        <span>Coi là “sắp hết” khi còn tối đa</span>
        <InlineNumberField
          className="w-16"
          value={lowStockThreshold}
          min={1}
          label="Ngưỡng báo sắp hết hàng"
          onCommit={(value) => onLowStockThresholdChange(Math.min(value, MAX_LOW_STOCK_THRESHOLD))}
        />
        <span>sản phẩm</span>
      </div>
    </div>
  );
}
