export const audiences = ["women", "men", "kids", "unisex"] as const;
export const productTypes = ["shoes", "belts", "wallets", "food"] as const;
export const productTags = ["new", "bestseller", "sale", "limited"] as const;

export type Audience = (typeof audiences)[number];
export type ProductType = (typeof productTypes)[number];
export type ProductTag = (typeof productTags)[number];
export type ProductBadge = "New" | "Sale" | "Bestseller" | "Limited" | "Luxury";
export type ProductStatus = "active" | "inactive";

export type ProductMedia = {
  url: string;
  alt?: string;
};

export type ProductVariant = {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  image?: string;
  price?: number;
  sourceVariantId?: string;
  sourceLabel?: string;
  gtin?: string;
};

export type Product = {
  id: string;
  slug?: string;
  brand: string;
  name: string;
  audience?: Audience;
  productType?: ProductType;
  category: string;
  tags?: ProductTag[];
  price: number;
  originalPrice?: number;
  badge: ProductBadge;
  image: string;
  images?: string[];
  media?: ProductMedia[];
  variants?: ProductVariant[];
  description?: string;
  material?: string;
  details?: string[];
  careInstructions?: string;
  sizeGuideKey?: "women-shoes" | "men-shoes" | "kids-shoes" | "belts";
  stock?: number;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogFilters = {
  q?: string;
  audience?: Audience;
  type?: ProductType;
  category?: string;
  tag?: ProductTag;
  size?: string;
  color?: string;
  sort?: "newest" | "price-asc" | "price-desc";
};

export type Category = {
  id: string;
  name: string;
  image: string;
  href: string;
  description?: string;
};

export type Brand = {
  id: string;
  name: string;
};
