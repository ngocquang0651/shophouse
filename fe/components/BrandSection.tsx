import type { Brand } from "@/types/product";

type BrandSectionProps = {
  brands: Brand[];
};

export function BrandSection({ brands }: BrandSectionProps) {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50" id="brands">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-juno">Thương hiệu</p>
            <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Top brands</h2>
          </div>
          <a className="shrink-0 text-sm font-bold text-juno underline-offset-4 hover:underline" href="#products">
            Xem sản phẩm
          </a>
        </div>

        <div className="grid grid-cols-2 border-l border-t border-neutral-200 bg-white sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <a
              className="flex min-h-20 items-center justify-center border-b border-r border-neutral-200 px-4 text-center text-sm font-black uppercase tracking-[0.1em] text-neutral-800 transition hover:bg-juno hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-juno/30"
              href="#products"
              key={brand.id}
            >
              {brand.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
