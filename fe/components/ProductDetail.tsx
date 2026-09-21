"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Ruler } from "lucide-react";
import { useState } from "react";
import { contact } from "@/data/contact";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductDetailProps { product: Product }

const outlineFocus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shopo-orange";

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color ?? "");
  const variants = product.variants ?? [];
  const colors = Array.from(new Map(variants.map((variant) => [variant.color, variant])).values());
  const sizes = variants.filter((variant) => variant.color === selectedColor);
  const media = product.images?.length ? product.images : [product.image];
  const details = product.details ?? [];
  const mailHref = `${contact.emailHref}?subject=${encodeURIComponent(`Tư vấn sản phẩm: ${product.name}`)}`;

  function selectColor(color: string, image?: string) {
    setSelectedColor(color);
    const index = image ? media.indexOf(image) : -1;
    if (index >= 0) setSelectedImage(index);
  }

  return <main className="mx-auto max-w-[1440px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-12">
    <nav className="text-xs font-bold uppercase tracking-[.12em] text-neutral-600" aria-label="Breadcrumb"><Link className="hover:text-shopo-orange" href="/">Trang chủ</Link> / <Link className="hover:text-shopo-orange" href={`/${product.audience}/${product.productType}`}>{product.productType === "belts" ? "Dây lưng" : "Giày dép"}</Link> / {product.name}</nav>
    <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
      <section>
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-[#f2f1ee]"><Image className="object-cover" src={media[selectedImage] ?? media[0]} alt={`${product.brand} ${product.name}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" /></div>
        {media.length > 1 ? <div className="mt-3 flex gap-2 overflow-x-auto p-1">{media.map((image, index) => <button className={`relative size-20 shrink-0 overflow-hidden rounded-control border-2 ${selectedImage === index ? "border-shopo-orange" : "border-transparent"} ${outlineFocus}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={selectedImage === index} key={image}><Image className="object-cover" src={image} alt="" fill sizes="80px" /></button>)}</div> : null}
      </section>
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <p className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">{product.brand}</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">{product.name}</h1>
        <div className="mt-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-neutral-600">Giá tham khảo</p><div className="mt-1 flex items-baseline gap-3"><strong className="text-2xl tabular-nums">{formatCurrency(product.price)}</strong>{product.originalPrice ? <span className="tabular-nums text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span> : null}</div></div>
        {product.description ? <p className="mt-5 text-sm leading-6 text-neutral-700">{product.description}</p> : null}
        {colors.length ? <div className="mt-7 border-t border-neutral-200 pt-6"><h2 className="text-sm font-black">Màu sắc: {selectedColor}</h2><div className="mt-3 flex flex-wrap gap-2">{colors.map((variant) => <button className={`flex min-h-11 items-center gap-2 rounded-control border px-3 py-2 text-xs font-bold ${selectedColor === variant.color ? "border-ink" : "border-neutral-200 hover:border-neutral-400"} ${outlineFocus}`} type="button" aria-pressed={selectedColor === variant.color} onClick={() => selectColor(variant.color, variant.image)} key={variant.color}><span className="size-3.5 rounded-full border border-black/15" style={{ backgroundColor: variant.colorHex }} aria-hidden="true" />{variant.color}</button>)}</div></div> : null}
        {sizes.length ? <div className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-black">Size hiện có</h2><a className={`inline-flex min-h-11 items-center gap-1 rounded-control text-xs font-bold text-shopo-orange ${outlineFocus}`} href="#size-guide"><Ruler className="size-4" aria-hidden="true" />Hướng dẫn size</a></div><ul className="mt-2 flex flex-wrap gap-2">{sizes.map((variant) => <li className={`grid min-h-11 min-w-12 place-items-center rounded-control border px-4 text-sm font-bold ${variant.stock > 0 ? "border-neutral-300" : "border-neutral-200 text-neutral-500 line-through"}`} key={variant.sku}>{variant.size}{variant.stock <= 0 ? <span className="sr-only"> (tạm hết)</span> : null}</li>)}</ul></div> : null}
        <div className="mt-7 rounded-card border border-neutral-200 bg-neutral-50 p-5"><h2 className="text-sm font-black">Muốn thử hoặc mua mẫu này?</h2><p className="mt-1 text-sm leading-6 text-neutral-700">Liên hệ SHOPO để được tư vấn size và nơi có hàng.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><a className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control bg-shopo-orange px-4 py-3 text-sm font-black uppercase tracking-[.1em] text-white transition hover:bg-ink ${outlineFocus}`} href={contact.hotlineHref}><Phone className="size-4" aria-hidden="true" />Gọi {contact.hotline}</a><a className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control border border-ink px-4 py-3 text-sm font-black uppercase tracking-[.1em] transition hover:bg-ink hover:text-white ${outlineFocus}`} href={mailHref}><Mail className="size-4" aria-hidden="true" />Gửi email</a></div></div>
        <div className="mt-7 divide-y border-y border-neutral-200 text-sm">
          <details open><summary className={`cursor-pointer py-4 font-black ${outlineFocus}`}>Thông tin sản phẩm</summary><p className="pb-4 leading-6 text-neutral-700">{product.material ? `Chất liệu: ${product.material}. ` : ""}{details.join(" · ")}</p></details>
          <details><summary className={`cursor-pointer py-4 font-black ${outlineFocus}`}>Bảo quản</summary><p className="pb-4 leading-6 text-neutral-700">{product.careInstructions ?? "Bảo quản nơi khô thoáng."}</p></details>
        </div>
      </aside>
    </div>
    <section className="mt-14 border-t border-neutral-200 pt-8" id="size-guide"><p className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">Size guide</p><h2 className="mt-2 text-3xl font-black">Chọn vừa chân, đi thật chất.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">Đo chiều dài bàn chân hoặc vòng eo vào cuối ngày, sau đó chọn size gần nhất. Nếu bạn nằm giữa hai size, SHOPO khuyên chọn size lớn hơn để thoải mái hơn.</p></section>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur lg:hidden"><a className={`flex min-h-12 items-center justify-center gap-2 rounded-control bg-shopo-orange px-4 text-sm font-black uppercase tracking-[.1em] text-white ${outlineFocus}`} href={contact.hotlineHref}><Phone className="size-4" aria-hidden="true" />Gọi tư vấn {contact.hotline}</a></div>
  </main>;
}
