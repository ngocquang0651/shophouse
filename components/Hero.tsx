import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, RefreshCw, Truck } from "lucide-react";

const serviceItems = [
  { label: "Freeship từ 499K", icon: Truck },
  { label: "Đổi trả 7 ngày", icon: RefreshCw },
  { label: "Deal mới mỗi tuần", icon: BadgePercent }
];

export function Hero() {
  return (
    <section className="bg-white" id="luxury">
      <div className="relative min-h-[520px] overflow-hidden">
        <Image
          className="object-cover"
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85"
          alt="Fashion campaign with bags, shoes and seasonal styling"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1440px] items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            <p className="inline-flex bg-juno px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">Vừa cập bến</p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Mua nhanh giày, túi và phụ kiện mỗi ngày
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/90">
              Giao diện tập trung vào banner lớn, danh mục rõ, sản phẩm dày và giá nổi bật như trải nghiệm fashion ecommerce Việt Nam.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 bg-juno px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white/40"
                href="#new-arrivals"
              >
                Mua ngay
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center border border-white bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:bg-white hover:text-ink focus:outline-none focus:ring-2 focus:ring-white/40"
                href="#sale"
              >
                Xem sale
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-neutral-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {serviceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div className="flex items-center justify-center gap-3 py-4 text-sm font-bold text-neutral-800" key={item.label}>
                <Icon className="size-5 text-juno" />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
