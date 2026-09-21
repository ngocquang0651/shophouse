import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { contact } from "@/data/contact";
import { products as fallbackProducts } from "@/data/products";
import { pickFeatured } from "@/lib/home-products";
import { getPublicProducts } from "@/lib/product-store";
import type { Product } from "@/types/product";

interface SectionTitleProps { eyebrow: string; title: string; href: string }
interface ProductSectionProps extends SectionTitleProps { products: Product[] }

async function getHomeProducts() { try { return await getPublicProducts(); } catch { return fallbackProducts; } }

function SectionTitle({ eyebrow, title, href }: SectionTitleProps) {
  return <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">{eyebrow}</p><h2 className="mt-1.5 text-2xl font-black tracking-[-.04em] text-ink sm:text-4xl">{title}</h2></div><Link className="group/all -mr-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-control px-2 text-xs font-black uppercase tracking-[.1em] hover:text-shopo-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shopo-orange" href={href}>Xem tất cả<ArrowRight className="size-4 transition-transform group-hover/all:translate-x-0.5" aria-hidden="true" /></Link></div>;
}

function ProductSection({ eyebrow, title, products, href }: ProductSectionProps) {
  if (!products.length) return null;
  return <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"><SectionTitle eyebrow={eyebrow} title={title} href={href} /><div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}

export default async function Home() {
  const products = await getHomeProducts();
  const newProducts = pickFeatured(products, "new");
  const bestProducts = pickFeatured(products, "bestseller", undefined, new Set(newProducts.map((product) => product.id)));
  return <><Header /><main><Hero />
    <ProductSection eyebrow="Drop vừa cập bến" title="Sản phẩm mới" products={newProducts} href="/collections/new-arrivals" />
    <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8"><SectionTitle eyebrow="Chọn nhịp của bạn" title="Shop theo đối tượng" href="/women/shoes" /><div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">{categories.slice(0, 3).map((category) => <Link className="group relative min-w-[72%] snap-start overflow-hidden rounded-card bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shopo-orange sm:min-w-[45%] lg:min-w-0" href={category.href} key={category.id}><div className="relative aspect-[4/3]"><Image className="object-cover opacity-80 transition duration-500 group-hover:scale-105 motion-reduce:transition-none" src={category.image} alt="" fill sizes="(min-width: 1024px) 33vw, 72vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" /><div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white"><div className="min-w-0"><p className="text-2xl font-black tracking-[-.04em] sm:text-3xl">{category.name}</p><p className="mt-1 text-sm text-white/90">{category.description}</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:bg-shopo-orange group-hover:text-white"><ArrowUpRight className="size-4" aria-hidden="true" /></span></div></div></Link>)}</div></section>
    <ProductSection eyebrow="Được chọn nhiều nhất" title="Best sellers" products={bestProducts} href="/collections/best-sellers" />
    <section className="bg-[#f4f3f0]"><div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"><div className="grid overflow-hidden rounded-card lg:grid-cols-2"><div className="relative min-h-[300px] sm:min-h-[360px]"><Image className="object-cover" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1300&q=85" alt="SHOPO editorial lookbook" fill sizes="(min-width: 1024px) 50vw, 100vw" /></div><div className="flex flex-col justify-center bg-shopo-orange p-8 text-white sm:p-12"><p className="text-xs font-black uppercase tracking-[.18em]">The finishing move</p><h2 className="mt-4 text-4xl font-black leading-none tracking-[-.05em] sm:text-5xl">Một chiếc belt.<br />Đổi cả outfit.</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/90">Dây lưng SHOPO là điểm nhấn nhỏ, nhưng đủ để thiết lập mood cho cả ngày.</p><Link className="mt-8 inline-flex min-h-12 w-fit items-center rounded-control bg-ink px-5 py-3 text-xs font-black uppercase tracking-[.14em] transition hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="/women/belts">Khám phá dây lưng</Link></div></div></div></section>
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8" id="lien-he"><div className="flex flex-col gap-6 rounded-card bg-ink p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-xl"><p className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">Tư vấn trực tiếp</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-4xl">Chưa biết chọn đôi nào?</h2><p className="mt-3 text-sm leading-6 text-white/80">Nói với SHOPO nhu cầu và phong cách của bạn, đội ngũ sẽ gợi ý mẫu phù hợp.</p></div><div className="flex flex-col gap-3 sm:flex-row"><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-shopo-orange px-5 py-3 text-sm font-black uppercase tracking-[.1em] transition hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={contact.hotlineHref}><Phone className="size-4" aria-hidden="true" />{contact.hotline}</a><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-white/60 px-5 py-3 text-sm font-black uppercase tracking-[.1em] transition hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={contact.emailHref}><Mail className="size-4" aria-hidden="true" />Gửi email</a></div></div></section>
  </main><Footer /></>;
}
