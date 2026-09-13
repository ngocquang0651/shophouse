"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCommerce } from "@/components/CommerceProvider";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductCardProps = { product: Product };

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isWishlisted, toggleWishlist } = useCommerce();
  const productImage = product.image || product.images?.[0] || "";
  const alternateImage = product.images?.[1];
  const variants = product.variants ?? [];
  const firstAvailableVariant = variants.find((variant) => variant.stock > 0);
  const discount = product.originalPrice && product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const colors = Array.from(new Map(variants.map((variant) => [variant.color, variant])).values());

  function handleQuickAdd() {
    if (firstAvailableVariant) addToCart(product, firstAvailableVariant);
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[5/6] overflow-hidden bg-[#f2f1ee]">
        <Link className="absolute inset-0" href={`/products/${product.slug ?? product.id}`} aria-label={`Xem ${product.name}`}>
          <Image className="object-cover transition duration-500 group-hover:scale-[1.03]" src={productImage} alt={`${product.brand} ${product.name}`} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 72vw" />
          {alternateImage ? <Image className="object-cover opacity-0 transition duration-500 group-hover:opacity-100" src={alternateImage} alt="" fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 72vw" /> : null}
        </Link>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {discount ? <span className="bg-shopo-orange px-2 py-1 text-[10px] font-black text-white">-{discount}%</span> : null}
          <span className="bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-ink">{product.badge}</span>
        </div>
        <button className={`absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white text-ink transition hover:bg-shopo-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-shopo-orange/40 ${isWishlisted(product.id) ? "text-shopo-orange" : ""}`} type="button" aria-label={`Yêu thích ${product.name}`} onClick={() => toggleWishlist(product.id)}>
          <Heart className="size-3.5" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
        </button>
        <button className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-ink px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-shopo-orange focus:outline-none focus:ring-2 focus:ring-shopo-orange/40 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100" type="button" onClick={handleQuickAdd} disabled={!firstAvailableVariant}>
          <ShoppingBag className="size-4" />
          {firstAvailableVariant ? "Thêm nhanh" : "Hết hàng"}
        </button>
      </div>
      <div className="py-2.5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{product.brand}</p>
        <Link className="mt-1 line-clamp-2 block text-[13px] font-bold leading-[1.35] text-ink hover:text-shopo-orange" href={`/products/${product.slug ?? product.id}`}>
          {product.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2"><span className="text-sm font-black text-ink">{formatCurrency(product.price)}</span>{product.originalPrice ? <span className="text-xs text-neutral-400 line-through">{formatCurrency(product.originalPrice)}</span> : null}</div>
        {colors.length ? <div className="mt-3 flex gap-1.5" aria-label="Màu sắc có sẵn">{colors.slice(0, 4).map((variant) => <span className="size-3.5 rounded-full border border-black/15" style={{ backgroundColor: variant.colorHex }} title={variant.color} key={variant.color} />)}</div> : null}
      </div>
    </article>
  );
}
