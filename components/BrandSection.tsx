import type { Brand } from "@/types/product";

type BrandSectionProps = {
  brands: Brand[];
};

export function BrandSection({ brands }: BrandSectionProps) {
  return (
    <section className="border-y border-neutral-200 bg-white" id="brands">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Top Brands</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Names worth knowing</h2>
          </div>
          <a className="text-sm font-semibold text-ink underline-offset-4 hover:underline" href="#products">
            View product edit
          </a>
        </div>

        <div className="mt-7 grid grid-cols-2 border-l border-t border-neutral-200 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <a
              className="flex min-h-24 items-center justify-center border-b border-r border-neutral-200 px-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-neutral-800 transition hover:bg-porcelain hover:text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ink/15"
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
