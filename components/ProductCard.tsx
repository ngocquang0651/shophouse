import Image from "next/image";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const productImage = product.image || product.images?.[0] || "";

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          className="object-cover transition duration-300 group-hover:scale-105"
          src={productImage}
          alt={`${product.brand} ${product.name}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
        <span className="absolute left-3 top-3 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink shadow-sm">
          {product.badge}
        </span>
        <button
          className="absolute right-3 top-3 grid size-9 place-items-center bg-white text-ink shadow-sm transition hover:bg-ink hover:text-white focus:outline-none focus:ring-2 focus:ring-ink/20"
          type="button"
          aria-label={`Save ${product.name}`}
          title="Save"
        >
          <Heart className="size-4" />
        </button>
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-900">{product.brand}</p>
            <h3 className="mt-1 text-sm leading-6 text-neutral-700">{product.name}</h3>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold text-ink">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-sm text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
