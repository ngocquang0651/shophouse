import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/api";
import type { Product } from "@/types/product";

type ApiProduct = Omit<Product, "id"> & {
  _id?: string;
  id?: string;
};

function normalizeProduct(product: ApiProduct): Product {
  return {
    ...product,
    id: product.id ?? product._id ?? "",
    images: product.images?.length ? product.images : [product.image].filter(Boolean)
  };
}

export async function getProducts() {
  const products = await apiGet<ApiProduct[]>("/products", { auth: false });
  return products.map(normalizeProduct);
}

export async function getPublicProducts() {
  const products = await apiGet<ApiProduct[]>("/products", { auth: false });
  return products.map(normalizeProduct);
}

export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const nextProduct = await apiPost<ApiProduct>("/products", product);
  return normalizeProduct(nextProduct);
}

export async function updateProduct(product: Product) {
  const { id, ...payload } = product;
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
