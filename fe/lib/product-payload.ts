import { toApiBadge } from "@/lib/admin-labels";
import type { Product, ProductVariant } from "@/types/product";

export type ProductWriteValues = Omit<Product, "id" | "createdAt" | "updatedAt">;

function cleanVariant(variant: ProductVariant) {
  const cleaned: Record<string, string | number> = {
    sku: variant.sku,
    color: variant.color,
    colorHex: variant.colorHex,
    size: variant.size,
    stock: variant.stock
  };

  if (variant.image) cleaned.image = variant.image;
  if (variant.price !== undefined) cleaned.price = variant.price;
  if (variant.sourceVariantId) cleaned.sourceVariantId = variant.sourceVariantId;
  if (variant.sourceLabel) cleaned.sourceLabel = variant.sourceLabel;
  if (variant.gtin) cleaned.gtin = variant.gtin;

  return cleaned;
}

/**
 * Only fields the admin form owns are sent, so storefront-only fields
 * (media, tags, import source...) never reach the API's strict validation.
 */
function basePayload(values: ProductWriteValues) {
  return {
    name: values.name,
    brand: values.brand,
    audience: values.audience,
    productType: values.productType,
    category: values.category,
    price: values.price,
    image: values.image,
    images: values.images,
    badge: toApiBadge(values.badge),
    description: values.description ?? "",
    stock: values.stock ?? 0,
    status: values.status ?? "active",
    variants: (values.variants ?? []).map(cleanVariant)
  };
}

export function buildCreatePayload(values: ProductWriteValues) {
  return {
    ...basePayload(values),
    ...(values.originalPrice ? { originalPrice: values.originalPrice } : {})
  };
}

/** Sends `originalPrice: null` when cleared, which removes the discount on the server. */
export function buildUpdatePayload(values: ProductWriteValues) {
  return {
    ...basePayload(values),
    originalPrice: values.originalPrice ? values.originalPrice : null
  };
}
