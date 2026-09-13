import { CommerceProvider } from "@/components/CommerceProvider";
import { CatalogPage } from "@/components/CatalogPage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { products as fallbackProducts } from "@/data/products";
import { getCatalogProducts } from "@/lib/product-store";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let products = fallbackProducts.filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(query.toLowerCase()));
  try { const result = await getCatalogProducts({ q: query }); if (result.items.length || !query) products = result.items; } catch { /* Static catalog is intentional for local/offline previews. */ }
  return <CommerceProvider><Header /><CatalogPage products={products} title="Tìm kiếm" query={query} /><Footer /></CommerceProvider>;
}
