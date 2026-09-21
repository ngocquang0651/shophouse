import type { Product, ProductTag } from "@/types/product";

export const HOME_SECTION_SIZE = 8;

/**
 * Picks `count` products for a home section: tagged products first, then any other
 * product to fill the grid so it never ends on a lonely orphan card. Products in
 * `excludeIds` (already shown higher on the page) and duplicate ids are skipped.
 */
export function pickFeatured(products: readonly Product[], tag: ProductTag, count: number = HOME_SECTION_SIZE, excludeIds: ReadonlySet<string> = new Set()): Product[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const seen = new Set(excludeIds);
  const picked: Product[] = [];
  const take = (product: Product) => {
    if (picked.length >= count || seen.has(product.id)) return;
    seen.add(product.id);
    picked.push(product);
  };
  for (const product of products) if (product.tags?.includes(tag)) take(product);
  for (const product of products) take(product);
  return picked;
}
