import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps { product: Product }

const IMAGE_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 72vw";

export function ProductCard({ product }: ProductCardProps) {
  const productImage = product.image || product.images?.[0] || "";
  const alternateImage = product.images?.[1];
  const variants = product.variants ?? [];
  const soldOut = variants.length > 0 && variants.every((variant) => variant.stock <= 0);
  const discount = product.originalPrice && product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const colors = Array.from(new Map(variants.map((variant) => [variant.color, variant])).values());

  return (
    <article>
      <Link className="group block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shopo-orange" href={`/products/${product.slug ?? product.id}`}>
        <div className="relative aspect-[5/6] overflow-hidden rounded-card bg-[#f2f1ee]">
          <Image className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" src={productImage} alt={`${product.brand} ${product.name}`} fill sizes={IMAGE_SIZES} />
          {alternateImage ? <Image className="object-cover opacity-0 transition duration-500 group-hover:opacity-100 motion-reduce:transition-none" src={alternateImage} alt="" fill sizes={IMAGE_SIZES} /> : null}
          {soldOut ? (
            <div className="absolute inset-0 grid place-items-center bg-white/55">
              <span className="rounded-control bg-ink px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Hết hàng</span>
            </div>
          ) : null}
          <div className="absolute left-3 top-3 flex gap-1.5">
            {discount ? <span className="rounded-control bg-shopo-orange px-2 py-1 text-[11px] font-black text-white">-{discount}%</span> : null}
            <span className="rounded-control bg-white px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-ink">{product.badge}</span>
          </div>
          <span className="absolute inset-x-3 bottom-3 hidden items-center justify-between rounded-control bg-white px-3 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-ink opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:flex" aria-hidden="true">Xem chi tiết<ArrowUpRight className="size-4" /></span>
        </div>
        <div className="pt-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-600">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-sm font-bold leading-[1.3] text-ink transition-colors group-hover:text-shopo-orange">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2"><span className="text-base font-black tabular-nums text-ink">{formatCurrency(product.price)}</span>{product.originalPrice ? <span className="text-xs tabular-nums text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span> : null}</div>
          {colors.length ? <div className="mt-2.5 flex items-center gap-1.5" role="img" aria-label={`Có ${colors.length} màu: ${colors.map((variant) => variant.color).join(", ")}`}>{colors.slice(0, 4).map((variant) => <span className="size-3.5 rounded-full border border-black/15" style={{ backgroundColor: variant.colorHex }} key={variant.color} />)}{colors.length > 4 ? <span className="text-xs font-bold text-neutral-600">+{colors.length - 4}</span> : null}</div> : null}
        </div>
      </Link>
    </article>
  );
}
