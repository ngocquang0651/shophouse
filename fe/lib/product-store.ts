import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/api";
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

export async function getProducts() {
  return (await getCatalogProducts()).items;
}

export async function getPublicProducts() {
  return (await getCatalogProducts()).items;
}

export async function getProductBySlug(slug: string) {
  const product = await apiGet<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`, { auth: false });
  return normalizeProduct(product);
}

export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const nextProduct = await apiPost<ApiProduct>("/products", product);
  return normalizeProduct(nextProduct);
}

export async function updateProduct(product: Product) {
  const { id, createdAt, updatedAt, ...payload } = product;
  void createdAt;
  void updatedAt;
  const nextProduct = await apiPatch<ApiProduct>(`/products/${id}`, payload);
  return normalizeProduct(nextProduct);
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
