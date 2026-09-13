import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-[#f5f1ea] text-[#171717]">
      <div className="mx-auto grid min-h-dvh max-w-[1320px] gap-10 px-5 py-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12 lg:py-10">
        <section className="flex items-center justify-center py-8 lg:py-0">
          <div className="w-full max-w-md">
            <Link
              className="inline-block text-xl font-black tracking-[0.2em] text-[#171717] sm:text-2xl"
              href="/"
            >
              SHOPO<span className="text-[#c94a20]">.</span>
            </Link>
            <div className="mt-20 sm:mt-24">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c94a20]">
                Welcome back
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#171717] sm:text-5xl">
                Đăng nhập
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-600">
                Truy cập không gian mua sắm được tuyển chọn riêng cho bạn.
              </p>
            </div>
            <div className="mt-10">
              <AuthForm />
            </div>
          </div>
        </section>

        <section className="hidden items-center lg:flex">
          <div className="relative h-[calc(100dvh-5rem)] max-h-[820px] min-h-[620px] w-full overflow-hidden bg-[#d8cfc2]">
            <Image
              className="object-cover"
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
              alt="Luxury fashion styling"
              fill
              priority
              sizes="55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-10 left-10 max-w-lg text-white">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f2c2a9]">
                SHOPO / 2026
              </p>
              <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Những lựa chọn làm nên nhịp riêng.
              </h2>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
