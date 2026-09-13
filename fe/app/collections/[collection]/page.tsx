import { CommerceProvider } from "@/components/CommerceProvider";
import { CatalogPage } from "@/components/CatalogPage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { products as fallbackProducts } from "@/data/products";
import { getCatalogProducts } from "@/lib/product-store";

const collectionInfo = { "new-arrivals": { tag: "new", title: "New Arrivals" }, "best-sellers": { tag: "bestseller", title: "Best Sellers" }, sale: { tag: "sale", title: "Sale" } } as const;

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const info = collectionInfo[collection as keyof typeof collectionInfo] ?? collectionInfo["new-arrivals"];
  let products = fallbackProducts.filter((product) => product.tags?.includes(info.tag));
  try {
    const result = await getCatalogProducts({ tag: info.tag });
    products = result.items;
  } catch {
    // The fallback catalog keeps collection routes usable while the API is offline.
  }
  return <CommerceProvider><Header /><CatalogPage products={products} title={info.title} /><Footer /></CommerceProvider>;
}
