import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/api";
import { PAGE_SIZE, type AdminFilters, type ProductSummary } from "@/lib/admin-products";
import { buildCreatePayload, buildUpdatePayload, type ProductWriteValues } from "@/lib/product-payload";
import type { CatalogFilters, Product, ProductTag, ProductVariant } from "@/types/product";

type ApiProduct = Omit<Product, "id"> & {
  _id?: string;
  id?: string;
};

type ApiCatalogResponse = {
  items?: ApiProduct[];
  total?: number;
};

export type CatalogResult = {
  items: Product[];
  total: number;
};

function titleToSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeProduct(product: ApiProduct): Product {
  const image = product.image || product.images?.[0] || product.media?.[0]?.url || "";
  const variants: ProductVariant[] = product.variants?.length
    ? product.variants
    : [
        {
          sku: `${product.id ?? product._id ?? product.name}-default`,
          color: "Mặc định",
          colorHex: "#171717",
          size: "One size",
          stock: product.stock ?? 0
        }
      ];

  const legacyTags: ProductTag[] = [];
  if (product.badge === "Sale") legacyTags.push("sale");
  if (product.badge === "New") legacyTags.push("new");
  const tags: ProductTag[] = product.tags ?? legacyTags;
  const badge = product.badge === "Luxury" ? "Limited" : product.badge;

  return {
    ...product,
    id: product.id ?? product._id ?? "",
    slug: product.slug || titleToSlug(product.name),
    audience: product.audience ?? "unisex",
    productType: product.productType ?? "shoes",
    tags,
    badge,
    image,
    images: product.images?.length ? product.images : [image].filter(Boolean),
    media: product.media?.length ? product.media : [image].filter(Boolean).map((url) => ({ url })),
    variants,
    sizeGuideKey: product.sizeGuideKey ?? (product.productType === "belts" ? "belts" : "men-shoes")
  };
}

function createSearchParams(filters: CatalogFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export async function getCatalogProducts(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const query = createSearchParams(filters);
  const path = query ? `/products?${query}` : "/products";
  const response = await apiGet<ApiProduct[] | ApiCatalogResponse>(path, { auth: false });
  const products = Array.isArray(response) ? response : response.items ?? [];
  return { items: products.map(normalizeProduct), total: Array.isArray(response) ? products.length : response.total ?? products.length };
}

export type AdminProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  summary: ProductSummary;
  categories: string[];
  brands: string[];
};

type ApiAdminProductPage = Omit<AdminProductPage, "items"> & { items: ApiProduct[] };

/**
 * Admin products keep their real variants. The storefront normaliser invents a
 * "default" variant for products without any, which must not show up in the editor.
 */
export function normalizeAdminProduct(product: ApiProduct): Product {
  const normalized = normalizeProduct(product);
  return product.variants?.length ? normalized : { ...normalized, variants: [] };
}

/** Admin-only listing: every status, filtered, sorted and paginated by the server. */
export async function getAdminProducts(filters: AdminFilters, lowStockThreshold: number): Promise<AdminProductPage> {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE), sort: filters.sort, lowStockThreshold: String(lowStockThreshold) });
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.badge) params.set("badge", filters.badge);
  if (filters.status) params.set("status", filters.status);
  if (filters.stock) params.set("stock", filters.stock);

  const response = await apiGet<ApiAdminProductPage>(`/products/admin?${params.toString()}`);
  return { ...response, items: response.items.map(normalizeAdminProduct) };
}

export async function getAdminSummary(lowStockThreshold: number) {
  return apiGet<ProductSummary>(`/products/admin/summary?lowStockThreshold=${lowStockThreshold}`);
}

export async function getPublicProducts() {
  return (await getCatalogProducts()).items;
}

export async function getProductBySlug(slug: string) {
  const product = await apiGet<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`, { auth: false });
  return normalizeProduct(product);
}

export async function createProduct(values: ProductWriteValues) {
  const nextProduct = await apiPost<ApiProduct>("/products", buildCreatePayload(values));
  return normalizeAdminProduct(nextProduct);
}

export async function updateProduct(productId: string, values: ProductWriteValues) {
  const nextProduct = await apiPatch<ApiProduct>(`/products/${productId}`, buildUpdatePayload(values));
  return normalizeAdminProduct(nextProduct);
}

export type ProductQuickPatch = Partial<Pick<Product, "price" | "stock" | "status">>;

/** Sends only the changed fields, for inline edits and bulk status changes. */
export async function patchProduct(productId: string, patch: ProductQuickPatch) {
  const nextProduct = await apiPatch<ApiProduct>(`/products/${productId}`, patch);
  return normalizeAdminProduct(nextProduct);
}

export async function deleteProduct(productId: string) {
  await apiDelete<{ ok: true }>(`/products/${productId}`);
}

export async function uploadProductImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const result = await apiUpload<{ urls: string[] }>("/products/uploads", formData);
  return result.urls;
}
