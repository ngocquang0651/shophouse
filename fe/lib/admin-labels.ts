import type { Audience, ProductBadge, ProductStatus, ProductType } from "@/types/product";

export type ApiBadge = "New" | "Sale" | "Luxury";

export const apiBadgeOptions: readonly ApiBadge[] = ["New", "Sale", "Luxury"];

export const statusLabels: Record<ProductStatus, string> = {
  active: "Đang bán",
  inactive: "Ngừng bán"
};

export const badgeLabels: Record<ProductBadge, string> = {
  New: "Mới",
  Sale: "Giảm giá",
  Bestseller: "Bán chạy",
  Limited: "Cao cấp",
  Luxury: "Cao cấp"
};

export const audienceLabels: Record<Audience, string> = {
  women: "Nữ",
  men: "Nam",
  kids: "Trẻ em",
  unisex: "Unisex"
};

export const productTypeLabels: Record<ProductType, string> = {
  shoes: "Giày dép",
  belts: "Dây lưng",
  wallets: "Ví",
  food: "Đồ ăn"
};

/**
 * The storefront renames the API badge "Luxury" to "Limited" when reading products,
 * but the API only accepts New | Sale | Luxury. Convert back before sending.
 */
export function toApiBadge(badge: ProductBadge): ApiBadge {
  if (badge === "Limited" || badge === "Luxury") return "Luxury";
  if (badge === "Sale") return "Sale";
  return "New";
}
