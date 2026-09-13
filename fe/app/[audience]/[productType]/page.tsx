import { CommerceProvider } from "@/components/CommerceProvider";
import { CatalogPage } from "@/components/CatalogPage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { products as fallbackProducts } from "@/data/products";
import { getCatalogProducts } from "@/lib/product-store";
import type { ProductType } from "@/types/product";

const validAudiences = ["women", "men", "kids"] as const;
const validTypes = ["shoes", "belts"] as const;

export default async function CollectionPage({ params }: { params: Promise<{ audience: string; productType: string }> }) {
  const { audience, productType } = await params;
  const safeAudience = validAudiences.includes(audience as (typeof validAudiences)[number]) ? audience as (typeof validAudiences)[number] : "women";
  const safeType = validTypes.includes(productType as (typeof validTypes)[number]) ? productType as ProductType : "shoes";
  let products = fallbackProducts.filter((product) => product.audience === safeAudience && product.productType === safeType);
  try { const result = await getCatalogProducts({ audience: safeAudience, type: safeType }); if (result.items.length) products = result.items; } catch { /* Static catalog keeps shopping usable while the API is unavailable. */ }
  const audienceLabel = { women: "Nữ", men: "Nam", kids: "Trẻ em" }[safeAudience];
  const typeLabel = safeType === "shoes" ? "Giày dép" : "Dây lưng";
  return <CommerceProvider><Header /><CatalogPage products={products} audience={safeAudience} productType={safeType} title={`${typeLabel} ${audienceLabel}`} /><Footer /></CommerceProvider>;
}
