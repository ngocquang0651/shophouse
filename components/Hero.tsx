import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="bg-porcelain" id="luxury">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-champagne">Luxury Collection</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Luxe Haven
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-700 sm:text-lg">
            Shop an edit of polished bags, tailored silhouettes, fine accents, and elevated everyday icons.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
              href="#products"
            >
              Shop New In
            </Link>
            <Link
              className="inline-flex items-center justify-center border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
              href="#brands"
            >
              Top Brands
            </Link>
          </div>
        </div>

        <div className="grid min-h-[360px] grid-cols-5 grid-rows-5 gap-3 sm:min-h-[460px]">
          <div className="relative col-span-3 row-span-5">
            <Image
              className="object-cover"
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
              alt="Model wearing a luxury fashion look"
              fill
              priority
              sizes="(min-width: 1024px) 38vw, 60vw"
            />
          </div>
          <div className="relative col-span-2 row-span-3">
            <Image
              className="object-cover"
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85"
              alt="Luxury leather handbag"
              fill
              sizes="(min-width: 1024px) 25vw, 40vw"
            />
          </div>
          <div className="col-span-2 row-span-2 flex flex-col justify-end bg-ink p-5 text-white">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">This week</span>
            <span className="mt-2 text-2xl font-semibold">Up to 35% off selected icons</span>
          </div>
        </div>
      </div>
    </section>
  );
}
