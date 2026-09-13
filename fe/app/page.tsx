import Image from "next/image";
import Link from "next/link";
import { CommerceProvider } from "@/components/CommerceProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import { getPublicProducts } from "@/lib/product-store";
import type { Product } from "@/types/product";

async function getHomeProducts() { try { return await getPublicProducts(); } catch { return fallbackProducts; } }
function SectionTitle({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) { return <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">{title}</h2></div><Link className="text-xs font-black uppercase tracking-[.12em] underline decoration-shopo-orange decoration-2 underline-offset-4" href={href}>Xem tất cả</Link></div>; }
function ProductSection({ eyebrow, title, products, href }: { eyebrow: string; title: string; products: Product[]; href: string }) { return <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8"><SectionTitle eyebrow={eyebrow} title={title} href={href} /><div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>; }

export default async function Home() {
  const products = await getHomeProducts();
  const newProducts = products.filter((product) => product.tags?.includes("new"));
  const bestProducts = products.filter((product) => product.tags?.includes("bestseller"));
  return <CommerceProvider><Header /><main><Hero />
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8"><SectionTitle eyebrow="Chọn nhịp của bạn" title="Shop theo đối tượng" href="/women/shoes" /><div className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">{categories.slice(0, 3).map((category) => <Link className="group relative min-w-[78%] snap-start overflow-hidden bg-ink lg:min-w-0" href={category.href} key={category.id}><div className="relative aspect-[4/5]"><Image className="object-cover opacity-75 transition duration-500 group-hover:scale-105" src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 33vw, 78vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-3xl font-black tracking-[-.05em]">{category.name}</p><p className="mt-2 text-sm text-white/75">{category.description}</p></div></div></Link>)}</div></section>
    <ProductSection eyebrow="Drop vừa cập bến" title="Sản phẩm mới" products={newProducts.length ? newProducts : products} href="/collections/new-arrivals" />
    <section className="bg-[#f4f3f0]"><div className="mx-auto grid max-w-[1440px] overflow-hidden px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8"><div className="relative min-h-[360px]"><Image className="object-cover" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1300&q=85" alt="SHOPO editorial lookbook" fill sizes="(min-width: 1024px) 50vw, 100vw" /></div><div className="flex flex-col justify-center bg-shopo-orange p-8 text-white sm:p-12"><p className="text-xs font-black uppercase tracking-[.18em]">The finishing move</p><h2 className="mt-4 text-4xl font-black leading-none tracking-[-.05em] sm:text-5xl">Một chiếc belt.<br />Đổi cả outfit.</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/80">Dây lưng SHOPO là điểm nhấn nhỏ, nhưng đủ để thiết lập mood cho cả ngày.</p><Link className="mt-8 inline-flex w-fit bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.14em]" href="/women/belts">Khám phá dây lưng</Link></div></div></section>
    <ProductSection eyebrow="Được chọn nhiều nhất" title="Best sellers" products={bestProducts.length ? bestProducts : products} href="/collections/best-sellers" />
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-px bg-neutral-200 md:grid-cols-3">{[["Đổi size dễ dàng", "Thử fit mới, đổi size trong 7 ngày."],["Giao nhanh", "Lên đơn nhanh cho mọi hành trình."],["Tư vấn chuẩn", "Tìm đôi vừa chân, đúng chất riêng."]].map(([title, text]) => <article className="bg-white p-7" key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p></article>)}</div></section>
  </main><Footer /></CommerceProvider>;
}
