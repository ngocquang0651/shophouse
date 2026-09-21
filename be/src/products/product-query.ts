import type { FilterQuery } from "mongoose";
import { Types } from "mongoose";
import { ProductStatus } from "../common/enums/product-status.enum";
import type { Product } from "./schemas/product.schema";

export const DEFAULT_LOW_STOCK_THRESHOLD = 3;
export const MAX_LOW_STOCK_THRESHOLD = 100;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const adminSortKeys = ["newest", "name", "price-asc", "price-desc", "stock-asc", "stock-desc"] as const;
export type AdminSortKey = (typeof adminSortKeys)[number];
export type AdminStockFilter = "" | "low" | "out";

export type AdminListQuery = {
  q: string;
  category: string;
  badge: string;
  status: "" | ProductStatus;
  stock: AdminStockFilter;
  sort: AdminSortKey;
  page: number;
  pageSize: number;
  lowStockThreshold: number;
};

type RawQuery = Record<string, string | string[] | undefined>;

const vietnameseVowels: Record<string, string> = {
  a: "àáảãạăằắẳẵặâầấẩẫậ",
  e: "èéẻẽẹêềếểễệ",
  i: "ìíỉĩị",
  o: "òóỏõọôồốổỗộơờớởỡợ",
  u: "ùúủũụưừứửữự",
  y: "ỳýỷỹỵ",
  d: "đ"
};

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lowercases and removes Vietnamese diacritics ("Giày Đen" -> "giay den"). */
export function stripDiacritics(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

/**
 * Builds a regex source that matches the query whether or not the stored text
 * carries diacritics, so "giay" finds "Giày" and "giày" still finds "Giày".
 */
export function buildDiacriticInsensitivePattern(query: string) {
  return Array.from(stripDiacritics(query))
    .map((char) => {
      const variants = vietnameseVowels[char];
      if (!variants) return escapeRegex(char);
      const chars = char + variants;
      return `[${chars}${chars.toUpperCase()}]`;
    })
    .join("");
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toInteger(value: string | string[] | undefined) {
  const parsed = Number(firstValue(value));
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function clampLowStockThreshold(value: number | undefined) {
  if (value === undefined) return DEFAULT_LOW_STOCK_THRESHOLD;
  return Math.min(MAX_LOW_STOCK_THRESHOLD, Math.max(1, value));
}

/** Reads admin list parameters leniently: anything invalid falls back to a safe default. */
export function parseAdminListQuery(raw: RawQuery): AdminListQuery {
  const status = firstValue(raw.status);
  const stock = firstValue(raw.stock);
  const sort = firstValue(raw.sort);
  const pageSize = toInteger(raw.pageSize);
  const page = toInteger(raw.page);

  return {
    q: (firstValue(raw.q) ?? "").trim().slice(0, 100),
    category: firstValue(raw.category) ?? "",
    badge: firstValue(raw.badge) ?? "",
    status: status === ProductStatus.Active || status === ProductStatus.Inactive ? status : "",
    stock: stock === "low" || stock === "out" ? stock : "",
    sort: (adminSortKeys as readonly string[]).includes(sort ?? "") ? (sort as AdminSortKey) : "newest",
    page: page && page > 1 ? page : 1,
    pageSize: pageSize && pageSize > 0 ? Math.min(pageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
    lowStockThreshold: clampLowStockThreshold(toInteger(raw.lowStockThreshold))
  };
}

export function buildAdminFilter(query: AdminListQuery): FilterQuery<Product> {
  const filter: FilterQuery<Product> = {};

  if (query.q) {
    const pattern = new RegExp(buildDiacriticInsensitivePattern(query.q), "i");
    const conditions: FilterQuery<Product>[] = [{ name: pattern }, { brand: pattern }, { "variants.sku": pattern }];
    if (Types.ObjectId.isValid(query.q) && query.q.length === 24) {
      conditions.push({ _id: new Types.ObjectId(query.q) });
    }
    filter.$or = conditions;
  }

  if (query.category) filter.category = query.category;
  if (query.badge) filter.badge = query.badge;
  if (query.status) filter.status = query.status;
  if (query.stock === "out") filter.stock = { $lte: 0 };
  if (query.stock === "low") filter.stock = { $gt: 0, $lte: query.lowStockThreshold };

  return filter;
}

export function buildAdminSort(sort: AdminSortKey): Record<string, 1 | -1> {
  switch (sort) {
    case "name":
      return { name: 1, _id: 1 };
    case "price-asc":
      return { price: 1, _id: 1 };
    case "price-desc":
      return { price: -1, _id: 1 };
    case "stock-asc":
      return { stock: 1, _id: 1 };
    case "stock-desc":
      return { stock: -1, _id: 1 };
    case "newest":
    default:
      return { createdAt: -1, _id: -1 };
  }
}
