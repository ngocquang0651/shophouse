import { notFound } from "next/navigation";
import { CommerceProvider } from "@/components/CommerceProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductDetail } from "@/components/ProductDetail";
import { products as fallbackProducts } from "@/data/products";
import { getProductBySlug } from "@/lib/product-store";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = fallbackProducts.find((item) => item.slug === slug);
  try { product = await getProductBySlug(slug); } catch { /* The local catalogue supports previewing every seeded product without an API. */ }
  if (!product) notFound();
  return <CommerceProvider><Header /><ProductDetail product={product} /><Footer /></CommerceProvider>;
}
