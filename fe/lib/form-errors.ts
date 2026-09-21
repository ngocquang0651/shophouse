/** Field order as it appears in the product form, so the summary reads top to bottom. */
const fieldOrder = ["name", "brand", "category", "images", "price", "originalPrice", "editor", "stock"] as const;

export type SummarizedField = (typeof fieldOrder)[number];

/** Element id each error should move focus to. */
export const fieldIds: Record<SummarizedField, string> = {
  name: "product-name",
  brand: "product-brand",
  category: "product-category",
  images: "product-images",
  price: "product-price",
  originalPrice: "product-original-price",
  editor: "product-variants",
  stock: "product-stock"
};

export type ErrorSummaryItem = { key: SummarizedField; targetId: string; message: string };

/** Turns field errors into ordered summary entries, ignoring empty and unknown ones. */
export function buildErrorSummary(errors: Partial<Record<string, string | undefined>>): ErrorSummaryItem[] {
  return fieldOrder.flatMap((key) => {
    const message = errors[key]?.trim();
    return message ? [{ key, targetId: fieldIds[key], message }] : [];
  });
}
