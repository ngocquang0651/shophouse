import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const productImage = product.image || product.images?.[0] || "";
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article className="group border border-transparent transition hover:border-neutral-200 hover:shadow-soft">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          className="object-cover transition duration-300 group-hover:scale-105"
          src={productImage}
          alt={`${product.brand} ${product.name}`}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {discount ? <span className="bg-juno px-2 py-1 text-xs font-black text-white">-{discount}%</span> : null}
          <span className="bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink shadow-sm">
            {product.badge}
          </span>
        </div>
        <button
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-juno hover:text-white focus:outline-none focus:ring-2 focus:ring-juno/30"
          type="button"
          aria-label={`Save ${product.name}`}
          title="Yêu thích"
        >
          <Heart className="size-4" />
        </button>
        <button
          className="absolute inset-x-2 bottom-2 hidden items-center justify-center gap-2 bg-juno px-3 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-juno/30 sm:flex sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          type="button"
        >
          <ShoppingBag className="size-4" />
          Thêm nhanh
        </button>
      </div>
      <div className="bg-white p-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500">{product.brand}</p>
        <h3 className="mt-1 min-h-11 text-sm font-medium leading-5 text-neutral-800">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-black text-juno">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-sm text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>
        {product.colors?.length ? (
          <div className="mt-3 flex items-center gap-1.5" aria-label="Available colors">
            {product.colors.slice(0, 4).map((color) => (
              <span className="size-4 rounded-full border border-neutral-300" style={{ backgroundColor: color }} key={color} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
