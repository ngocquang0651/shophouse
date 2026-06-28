import Image from "next/image";
import { BrandSection } from "@/components/BrandSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import { getPublicProducts } from "@/lib/product-store";
import type { Product } from "@/types/product";

const categoryShowcases = [
  { id: "giay", title: "Giày", subtitle: "Cao gót, sandal, sneakers" },
  { id: "tui", title: "Túi", subtitle: "Túi nhỏ, tote, clutch" },
  { id: "phu-kien", title: "Phụ Kiện", subtitle: "Kính, ví, phụ kiện tóc" },
  { id: "quan-ao", title: "Quần Áo", subtitle: "Đầm, áo, blazer" },
  { id: "beauty", title: "Beauty", subtitle: "Trang điểm, chăm sóc da" },
  { id: "qua-tang", title: "Set Quà Tặng", subtitle: "Quà xinh cho mọi dịp" }
];

async function getHomeProducts() {
  try {
    return await getPublicProducts();
  } catch {
    return fallbackProducts;
  }
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-juno">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{title}</h2>
      </div>
      <a className="shrink-0 text-sm font-bold text-juno underline-offset-4 hover:underline" href="#products">
        Xem tất cả
      </a>
    </div>
  );
}

function ProductSection({
  id,
  eyebrow,
  title,
  products,
  limit = 10
}: {
  id: string;
  eyebrow: string;
  title: string;
  products: Product[];
  limit?: number;
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8" id={id}>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const products = await getHomeProducts();
  const saleProducts = products.filter((product) => product.badge === "Sale");

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryGrid categories={categories} />
        <ProductSection id="new-arrivals" eyebrow="Vừa cập bến" title="Hàng mới về" products={products} />

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8" id="sale">
          <div className="grid overflow-hidden bg-blush lg:grid-cols-[0.86fr_1.14fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-juno">Clearance Sale</p>
              <h2 className="mt-3 max-w-lg text-3xl font-black leading-tight text-ink sm:text-4xl">
                Mua sale dễ hơn với giá, badge và màu đặt ngay trên card
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-700">
                Khu ưu đãi được tách riêng, nổi bật bằng nền hồng nhạt và CTA đỏ để giống nhịp campaign sale của các storefront thời trang.
              </p>
              <a className="mt-6 inline-flex bg-juno px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-700" href="#products">
                Săn deal
              </a>
            </div>
            <div className="relative min-h-[300px]">
              <Image
                className="object-cover"
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
                alt="Fashion sale campaign"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
          </div>
        </section>

        {saleProducts.length ? <ProductSection id="products" eyebrow="Ưu đãi" title="Clearance Sale" products={saleProducts} limit={5} /> : null}
        <BrandSection brands={brands} />

        <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Danh mục nổi bật" title="Mua theo nhóm sản phẩm" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryShowcases.map((category) => (
              <a className="flex items-center justify-between border border-neutral-200 bg-white p-5 transition hover:border-juno hover:bg-blush" href="#products" id={category.id} key={category.id}>
                <span>
                  <span className="block text-xl font-black text-ink">{category.title}</span>
                  <span className="mt-1 block text-sm text-neutral-600">{category.subtitle}</span>
                </span>
                <span className="text-sm font-black uppercase text-juno">Xem tất cả</span>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-neutral-50">
          <div className="mx-auto grid max-w-[1440px] gap-px px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              ["Giao diện full page", "Các section dùng max-width rộng, hero full-bleed và nền trắng/đỏ để tạo cảm giác gần hơn với storefront Juno."],
              ["Shopping first", "Danh mục, sale, hàng mới và grid sản phẩm được đưa lên sớm để người dùng vào mua nhanh."],
              ["Mobile rõ ràng", "Quick links, drawer menu, product grid hai cột và floating contact giúp thao tác nhanh trên điện thoại."]
            ].map(([title, copy]) => (
              <article className="bg-white p-6" key={title}>
                <h2 className="text-xl font-black text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
