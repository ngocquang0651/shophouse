import { BrandSection } from "@/components/BrandSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/types/product";

const contentSections = [
  {
    title: "Duy Nhat Store",
    copy: "A focused luxury destination for refined wardrobe updates, signature accessories, and elevated essentials.",
  },
  {
    title: "Discover Exclusivity",
    copy: "Explore limited edits from leading labels, styled for everyday shopping clarity and quick product comparison.",
  },
  {
    title: "Authentic Luxury",
    copy: "Every product in this mock storefront is presented with crisp details, brand-first hierarchy, and transparent pricing.",
  },
  {
    title: "Luxury for Less",
    copy: "Sale badges and original pricing make premium finds easy to spot without losing the clean boutique feel.",
  },
];

type ApiProduct = Omit<Product, "id"> & {
  _id?: string;
  id?: string;
};

async function getHomeProducts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${apiUrl}/products`, { cache: "no-store" });
    if (!response.ok) {
      return fallbackProducts;
    }

    const products = (await response.json()) as ApiProduct[];
    return products.map((product) => ({
      ...product,
      id: product.id ?? product._id ?? "",
      images: product.images?.length ? product.images : [product.image].filter(Boolean)
    }));
  } catch {
    return fallbackProducts;
  }
}

export default async function Home() {
  const products = await getHomeProducts();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryGrid categories={categories} />
        <BrandSection brands={brands} />

        <section
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
          id="products"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">
                Product Edit
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Luxury fashion picks
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              Crisp cards, visible pricing, and clear badges keep the storefront
              practical for real shopping.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="bg-porcelain">
          <div className="mx-auto grid max-w-7xl gap-px px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {contentSections.map((section) => (
              <article className="bg-white p-6" key={section.title}>
                <h2 className="text-xl font-semibold text-ink">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
