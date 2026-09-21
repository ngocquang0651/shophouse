import { apiBadgeOptions, type ApiBadge } from "@/lib/admin-labels";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/admin-settings";
import type { Product, ProductStatus } from "@/types/product";

export const PAGE_SIZE = 25;

export type StockLevel = "ok" | "low" | "out";
export type StockFilter = "" | "low" | "out";

export const sortKeys = ["newest", "name", "price-asc", "price-desc", "stock-asc", "stock-desc"] as const;
export type SortKey = (typeof sortKeys)[number];

export type SortColumn = "name" | "price" | "stock";
export type AriaSort = "ascending" | "descending" | "none";

export type AdminFilters = {
  query: string;
  category: string;
  badge: "" | ApiBadge;
  status: "" | ProductStatus;
  stock: StockFilter;
  sort: SortKey;
  page: number;
};

export const defaultFilters: AdminFilters = {
  query: "",
  category: "",
  badge: "",
  status: "",
  stock: "",
  sort: "newest",
  page: 1
};

export type ProductSummary = {
  total: number;
  active: number;
  inactive: number;
  low: number;
  out: number;
};

/**
 * Sort to apply when a column header is pressed. Price and stock flip between
 * ascending and descending; name toggles on and off (off returns to newest).
 */
export function getNextSort(current: SortKey, column: SortColumn): SortKey {
  switch (column) {
    case "name":
      return current === "name" ? "newest" : "name";
    case "price":
      return current === "price-asc" ? "price-desc" : "price-asc";
    case "stock":
      return current === "stock-asc" ? "stock-desc" : "stock-asc";
  }
}

export function getAriaSort(current: SortKey, column: SortColumn): AriaSort {
  if (column === "name") return current === "name" ? "ascending" : "none";
  if (current === `${column}-asc`) return "ascending";
  if (current === `${column}-desc`) return "descending";
  return "none";
}

/**
 * Parses whole numbers typed by shop owners: "1290000" or "1.290.000" (Vietnamese
 * thousands separators). Returns null for empty, decimal, negative or malformed input.
 */
export function parseWholeNumber(text: string): number | null {
  const trimmed = text.trim();
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) return Number(trimmed.replace(/\./g, ""));
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return null;
}

export function getStockLevel(stock: number | undefined, lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD): StockLevel {
  const value = Number.isFinite(stock) ? (stock as number) : 0;
  if (value <= 0) return "out";
  if (value <= lowStockThreshold) return "low";
  return "ok";
}

export function getStockLabel(stock: number | undefined, lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD) {
  const level = getStockLevel(stock, lowStockThreshold);
  const value = Number.isFinite(stock) ? (stock as number) : 0;
  if (level === "out") return "Hết hàng";
  if (level === "low") return `Sắp hết · còn ${value}`;
  return `Còn ${value}`;
}

/** Whole-number discount percentage, or null when there is no real discount. */
export function getDiscountPercent(price: number, originalPrice: number | undefined) {
  if (!originalPrice || !Number.isFinite(originalPrice) || !Number.isFinite(price)) return null;
  if (price <= 0 || originalPrice <= price) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

export function getProductStatus(product: Product): ProductStatus {
  return product.status ?? "active";
}

/** True when stock is tracked per colour/size rather than as a single number. */
export function hasVariantStock(product: Product) {
  return (product.variants?.length ?? 0) > 0;
}

type ParamReader = { get(name: string): string | null };

function isOneOf<T extends string>(value: string | null, options: readonly T[]): value is T {
  return value !== null && (options as readonly string[]).includes(value);
}

/** Reads filters from a URL, ignoring anything malformed or unexpected. */
export function parseAdminFilters(params: ParamReader): AdminFilters {
  const badge = params.get("badge");
  const status = params.get("status");
  const stock = params.get("stock");
  const sort = params.get("sort");
  const page = Number(params.get("page"));

  return {
    query: (params.get("q") ?? "").slice(0, 100),
    category: params.get("category") ?? "",
    badge: isOneOf(badge, apiBadgeOptions) ? badge : "",
    status: isOneOf(status, ["active", "inactive"] as const) ? status : "",
    stock: isOneOf(stock, ["low", "out"] as const) ? stock : "",
    sort: isOneOf(sort, sortKeys) ? sort : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1
  };
}

/** Builds a query string containing only values that differ from the defaults. */
export function serializeAdminFilters(filters: AdminFilters) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.badge) params.set("badge", filters.badge);
  if (filters.status) params.set("status", filters.status);
  if (filters.stock) params.set("stock", filters.stock);
  if (filters.sort !== defaultFilters.sort) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
