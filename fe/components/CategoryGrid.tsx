import Image from "next/image";
import type { Category } from "@/types/product";

type CategoryGridProps = {
  categories: Category[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8" id="categories">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-juno">Danh mục</p>
          <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Bạn muốn mua gì hôm nay?</h2>
        </div>
        <a className="shrink-0 text-sm font-bold text-juno underline-offset-4 hover:underline" href="#products">
          Xem tất cả
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <a
            className="group relative min-h-48 overflow-hidden bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-juno/30"
            href={`#${category.id}`}
            key={category.id}
          >
            <Image
              className="object-cover transition duration-300 group-hover:scale-105"
              src={category.image}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute inset-x-3 bottom-3 bg-white px-3 py-2 text-center text-sm font-black uppercase text-ink shadow-sm transition group-hover:bg-juno group-hover:text-white">
              {category.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
