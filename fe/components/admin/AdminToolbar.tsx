"use client";

import { ListFilter, Plus, Search, X } from "lucide-react";
import type { ProductBadge, ProductStatus } from "@/types/product";

type AdminToolbarProps = {
  query: string;
  category: string;
  badge: "" | ProductBadge;
  status: "" | ProductStatus;
  categories: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBadgeChange: (value: "" | ProductBadge) => void;
  onStatusChange: (value: "" | ProductStatus) => void;
  onCreate: () => void;
  onClear: () => void;
  resultCount: number;
};

const badges: ProductBadge[] = ["New", "Sale", "Luxury"];
const statuses: ProductStatus[] = ["active", "inactive"];

export function AdminToolbar({
  query,
  category,
  badge,
  status,
  categories,
  onQueryChange,
  onCategoryChange,
  onBadgeChange,
  onStatusChange,
  onCreate,
  onClear,
  resultCount
}: AdminToolbarProps) {
  const hasFilters = Boolean(query || category || badge || status);
  return (
    <div className="border border-neutral-200 bg-white shadow-soft">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            className="h-11 w-full border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10"
            type="search"
            placeholder="Search by product, brand or ID"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Search products"
          />
        </div>

        <label className="flex h-11 items-center gap-2 border border-neutral-300 px-3 text-sm lg:w-48">
          <ListFilter className="size-4 text-neutral-500" />
          <select
          className="h-11 border border-neutral-300 bg-white px-3 text-sm text-ink outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          </select>
        </label>

        <select
          className="h-11 border border-neutral-300 bg-white px-3 text-sm text-ink outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10"
          value={badge}
          onChange={(event) => onBadgeChange(event.target.value as "" | ProductBadge)}
          aria-label="Filter by badge"
        >
          <option value="">All badges</option>
          {badges.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="h-11 border border-neutral-300 bg-white px-3 text-sm text-ink outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as "" | ProductStatus)}
          aria-label="Filter by status"
        >
          <option value="">All status</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {hasFilters ? <button className="inline-flex h-11 items-center justify-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 transition hover:text-ink" type="button" onClick={onClear}><X className="size-4" />Clear</button> : null}
        <button
          className="flex h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
          type="button"
          onClick={onCreate}
        >
          <Plus className="size-4" />
           Add product
         </button>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 bg-[#fcfbf9] px-4 py-2.5 text-xs text-neutral-500"><span>{resultCount.toLocaleString()} matching products</span><span className="hidden sm:inline">Tip: search by brand or SKU</span></div>
    </div>
  );
}
