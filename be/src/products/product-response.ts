import type { ProductBadge } from "../common/enums/product-badge.enum";
import type { ProductStatus } from "../common/enums/product-status.enum";

/**
 * Shapes what leaves the API.
 *
 * Mongoose documents carry `_id`, `__v` and the whole `source` block, which
 * records where an imported product came from. None of that belongs in a public
 * response, and the frontend only ever wants `id`.
 */

export type ProductVariantResponse = {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  image?: string;
  price?: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  audience: string;
  productType: string;
  category: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  badge: ProductBadge;
  stock: number;
  status: ProductStatus;
  variants: ProductVariantResponse[];
};

export type ProductDetail = ProductListItem & {
  description: string;
  material?: string;
  details: string[];
  careInstructions?: string;
  sizeGuideKey?: string;
};

export type AdminProductResponse = ProductDetail & {
  createdAt?: string;
  updatedAt?: string;
  source?: {
    provider: string;
    productId: string;
    importedAt?: string;
    lastSeenAt?: string;
  };
};

/** The subset of fields a list view needs, used as a MongoDB projection. */
export const PRODUCT_LIST_PROJECTION = {
  name: 1,
  brand: 1,
  slug: 1,
  audience: 1,
  productType: 1,
  category: 1,
  tags: 1,
  price: 1,
  originalPrice: 1,
  image: 1,
  images: 1,
  badge: 1,
  stock: 1,
  status: 1,
  variants: 1
} as const;

type RawId = { toString(): string };

type RawProduct = {
  _id?: RawId;
  id?: RawId;
  [key: string]: unknown;
};

/**
 * Mongoose lean documents are typed as classes rather than index-signature
 * objects, so they are read through one cast here instead of at every call site.
 */
function read(raw: object): RawProduct {
  return raw as RawProduct;
}

function toId(raw: RawProduct) {
  return (raw._id ?? raw.id)?.toString() ?? "";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function toNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toIsoDate(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : undefined;
}

export function toVariantResponse(source: object): ProductVariantResponse {
  const raw = read(source);

  return {
    sku: toStringValue(raw.sku) ?? "",
    color: toStringValue(raw.color) ?? "",
    colorHex: toStringValue(raw.colorHex) ?? "",
    size: toStringValue(raw.size) ?? "",
    stock: toNumberValue(raw.stock) ?? 0,
    ...optional("image", toStringValue(raw.image)),
    ...optional("price", toNumberValue(raw.price))
  };
}

export function toProductListItem(source: object): ProductListItem {
  const raw = read(source);
  const variants = Array.isArray(raw.variants) ? (raw.variants as object[]) : [];

  return {
    id: toId(raw),
    name: toStringValue(raw.name) ?? "",
    brand: toStringValue(raw.brand) ?? "",
    slug: toStringValue(raw.slug) ?? "",
    audience: toStringValue(raw.audience) ?? "",
    productType: toStringValue(raw.productType) ?? "",
    category: toStringValue(raw.category) ?? "",
    tags: toStringArray(raw.tags),
    price: toNumberValue(raw.price) ?? 0,
    ...optional("originalPrice", toNumberValue(raw.originalPrice)),
    image: toStringValue(raw.image) ?? "",
    images: toStringArray(raw.images),
    badge: raw.badge as ProductBadge,
    stock: toNumberValue(raw.stock) ?? 0,
    status: raw.status as ProductStatus,
    variants: variants.map(toVariantResponse)
  };
}

export function toProductDetail(source: object): ProductDetail {
  const raw = read(source);

  return {
    ...toProductListItem(raw),
    description: toStringValue(raw.description) ?? "",
    ...optional("material", toStringValue(raw.material)),
    details: toStringArray(raw.details),
    ...optional("careInstructions", toStringValue(raw.careInstructions)),
    ...optional("sizeGuideKey", toStringValue(raw.sizeGuideKey))
  };
}

/** Admin needs the audit timestamps and the import provenance; shoppers do not. */
export function toAdminProductResponse(input: object): AdminProductResponse {
  const raw = read(input);
  const source = raw.source as Record<string, unknown> | undefined;

  return {
    ...toProductDetail(raw),
    ...optional("createdAt", toIsoDate(raw.createdAt)),
    ...optional("updatedAt", toIsoDate(raw.updatedAt)),
    ...(source
      ? {
          source: {
            provider: toStringValue(source.provider) ?? "",
            productId: toStringValue(source.productId) ?? "",
            ...optional("importedAt", toIsoDate(source.importedAt)),
            ...optional("lastSeenAt", toIsoDate(source.lastSeenAt))
          }
        }
      : {})
  };
}

/** Keeps a key out of the object entirely when its value is undefined. */
function optional<K extends string, V>(key: K, value: V | undefined) {
  return (value === undefined ? {} : { [key]: value }) as { [P in K]?: V };
}
