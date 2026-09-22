export const FALLBACK_SLUG = "san-pham";

/** "Giày Đen Nam!" -> "giay-den-nam". Empty input falls back to a usable stem. */
export function slugifyProductName(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || FALLBACK_SLUG;
}

/**
 * Appends -2, -3, ... until the slug is free. `isTaken` is async because the
 * check is a database lookup.
 */
export async function buildUniqueSlug(base: string, isTaken: (candidate: string) => Promise<boolean>) {
  const root = base || FALLBACK_SLUG;
  let candidate = root;

  for (let suffix = 2; await isTaken(candidate); suffix += 1) {
    candidate = `${root}-${suffix}`;
  }

  return candidate;
}
