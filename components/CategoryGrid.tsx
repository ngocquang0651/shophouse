import Image from "next/image";
import type { Category } from "@/types/product";

type CategoryGridProps = {
  categories: Category[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" id="women">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Categories</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Shop by edit</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-neutral-600">
          Quick paths into the pieces shoppers reach for first.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {categories.map((category) => (
          <a
            className="group relative min-h-36 overflow-hidden bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-ink/20 sm:min-h-44 lg:col-span-1"
            href="#products"
            key={category.id}
          >
            <Image
              className="object-cover transition duration-300 group-hover:scale-105"
              src={category.image}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 11vw, (min-width: 640px) 33vw, 50vw"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">{category.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
