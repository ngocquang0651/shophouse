"use client";

import { useEffect, useRef } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiBadgeOptions, badgeLabels, statusLabels, type ApiBadge } from "@/lib/admin-labels";
import type { AdminFilters, SortKey, StockFilter } from "@/lib/admin-products";
import type { ProductStatus } from "@/types/product";

export type AdminToolbarProps = {
  filters: AdminFilters;
  categories: string[];
  resultCount: number;
  onChange: (patch: Partial<AdminFilters>) => void;
  onCreate: () => void;
  onClear: () => void;
};

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "name", label: "Tên A → Z" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "stock-asc", label: "Tồn kho ít nhất" },
  { value: "stock-desc", label: "Tồn kho nhiều nhất" }
];

const badgeOptions = [{ value: "", label: "Tất cả nhãn" }, ...apiBadgeOptions.map((item) => ({ value: item, label: badgeLabels[item] }))];

const statusOptions = [
  { value: "", label: "Mọi trạng thái" },
  ...(Object.keys(statusLabels) as ProductStatus[]).map((item) => ({ value: item, label: statusLabels[item] }))
];

const stockOptions = [
  { value: "", label: "Mọi mức tồn kho" },
  { value: "low", label: "Sắp hết hàng" },
  { value: "out", label: "Hết hàng" }
];

export function AdminToolbar({ filters, categories, resultCount, onChange, onCreate, onClear }: AdminToolbarProps) {
  const hasFilters = Boolean(filters.query || filters.category || filters.badge || filters.status || filters.stock);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" jumps to the search box, as in most admin tools (ignored while typing elsewhere).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const typing = target?.closest("input, textarea, select, [role='combobox'], [contenteditable='true']");

      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categoryOptions = [{ value: "", label: "Tất cả danh mục" }, ...categories.map((item) => ({ value: item, label: item }))];

  return (
    <Card>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-600" aria-hidden="true" />
          <Input
            ref={searchRef}
            className="pl-10 pr-10"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            aria-keyshortcuts="/"
            placeholder="Tìm theo tên, thương hiệu hoặc mã sản phẩm"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            aria-label="Tìm sản phẩm"
          />
          <kbd
            className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-control border border-input px-1.5 text-xs text-neutral-600 lg:block"
            aria-hidden="true"
          >
            /
          </kbd>
        </div>
        <Button className="shrink-0" type="button" onClick={onCreate}>
          <Plus aria-hidden="true" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="grid gap-3 border-t border-border px-4 py-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          aria-label="Lọc theo danh mục"
          value={filters.category}
          options={categoryOptions}
          onValueChange={(category) => onChange({ category })}
        />
        <Select
          aria-label="Lọc theo nhãn"
          value={filters.badge}
          options={badgeOptions}
          onValueChange={(badge) => onChange({ badge: badge as "" | ApiBadge })}
        />
        <Select
          aria-label="Lọc theo trạng thái"
          value={filters.status}
          options={statusOptions}
          onValueChange={(status) => onChange({ status: status as "" | ProductStatus })}
        />
        <Select
          aria-label="Lọc theo tồn kho"
          value={filters.stock}
          options={stockOptions}
          onValueChange={(stock) => onChange({ stock: stock as StockFilter })}
        />
        <Select
          aria-label="Sắp xếp"
          value={filters.sort}
          options={sortOptions}
          onValueChange={(sort) => onChange({ sort: sort as SortKey })}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-paper px-4 py-2.5 text-sm text-neutral-600">
        <span className="tabular-nums" role="status" aria-live="polite">
          {resultCount.toLocaleString("vi-VN")} sản phẩm
        </span>
        {hasFilters ? (
          <Button className="min-h-8 h-auto px-2 py-1 text-neutral-700" variant="ghost" size="sm" type="button" onClick={onClear}>
            <X aria-hidden="true" />
            Xoá bộ lọc
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
