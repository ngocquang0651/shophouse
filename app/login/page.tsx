import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-porcelain">
      <div className="mx-auto grid min-h-dvh max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <section className="flex items-center justify-center">
          <div className="w-full max-w-md border border-neutral-200 bg-white p-5 shadow-soft sm:p-8">
            <Link
              className="inline-block text-lg font-semibold tracking-[0.18em] text-ink sm:text-xl sm:tracking-[0.24em]"
              href="/"
            >
              Duy Nhat Store
            </Link>
            <div className="mt-8 sm:mt-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">
                Member Access
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
                Sign in to your edit
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Use one of the demo accounts below to preview the shopping or admin experience.
              </p>
            </div>
            <div className="mt-8">
              <AuthForm />
            </div>
            <div className="mt-6 grid gap-2 border-t border-neutral-200 pt-5 text-sm leading-6 text-neutral-600">
              <p>
                User: <span className="font-semibold text-ink">user@example.com</span> /{" "}
                <span className="font-semibold text-ink">password123</span>
              </p>
              <p>
                Admin: <span className="font-semibold text-ink">admin@example.com</span> /{" "}
                <span className="font-semibold text-ink">admin123</span>
              </p>
            </div>
          </div>
        </section>

        <section className="hidden items-center py-6 lg:flex">
          <div className="relative h-[calc(100dvh-3rem)] max-h-[780px] min-h-[620px] w-full overflow-hidden">
            <Image
              className="object-cover"
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
              alt="Luxury fashion styling"
              fill
              priority
              sizes="55vw"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-8 left-8 max-w-lg text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">
                Curated Daily
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight xl:text-4xl">
                A quieter way to shop statement pieces.
              </h2>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
