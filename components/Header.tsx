"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  User,
  X
} from "lucide-react";
import { navGroups, promoLinks } from "@/data/navigation";
import { getCurrentUser, logout, subscribeToAuthChanges, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const campaignLinks = ["Hàng mới về", "Clearance Sale", "Happy Friday", "Bộ sưu tập", "Magazine"];

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getCurrentUser());
    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="bg-juno text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center px-4 py-2 text-center text-xs font-semibold sm:px-6">
          Miễn phí giao hàng từ 499K · Đổi trả trong 7 ngày · Hotline 1800 1160
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="grid size-10 place-items-center border border-neutral-200 text-ink transition hover:border-juno hover:text-juno focus:outline-none focus:ring-2 focus:ring-juno/20 lg:hidden"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          title={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link className="shrink-0 text-2xl font-black tracking-[0.18em] text-juno sm:text-3xl" href="/">
          LUXE
        </Link>

        <div className="hidden w-full max-w-xl items-center border border-neutral-300 bg-neutral-50 px-3 py-2 transition focus-within:border-juno focus-within:bg-white focus-within:ring-2 focus-within:ring-juno/10 md:flex">
          <Search className="mr-2 size-4 shrink-0 text-neutral-500" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            type="search"
            placeholder="Tìm kiếm sản phẩm, danh mục, thương hiệu..."
            aria-label="Search products"
          />
        </div>

        <div className="ml-auto hidden items-center gap-4 text-xs font-semibold text-neutral-700 lg:flex">
          <a className="inline-flex items-center gap-1.5 transition hover:text-juno" href="#stores">
            <MapPin className="size-4" />
            Cửa hàng
          </a>
          {user ? (
            <>
              <span className="max-w-28 truncate">{user.name}</span>
              {user.role === "admin" ? (
                <Link className="transition hover:text-juno" href="/admin/products" aria-label="Open admin products">
                  <LayoutDashboard className="size-5" />
                </Link>
              ) : null}
              <button className="transition hover:text-juno" type="button" onClick={handleLogout} aria-label="Log out">
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Link className="inline-flex items-center gap-1.5 transition hover:text-juno" href="/login">
              <User className="size-4" />
              Tài khoản
            </Link>
          )}
        </div>

        <button
          className="relative grid size-10 place-items-center text-ink transition hover:text-juno focus:outline-none focus:ring-2 focus:ring-juno/20"
          type="button"
          aria-label="Open wishlist"
          title="Wishlist"
        >
          <Heart className="size-5" />
        </button>
        <button
          className="relative grid size-10 place-items-center text-ink transition hover:text-juno focus:outline-none focus:ring-2 focus:ring-juno/20"
          type="button"
          aria-label="Open cart"
          title="Cart"
        >
          <ShoppingBag className="size-5" />
          <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-juno text-[10px] font-bold text-white">
            0
          </span>
        </button>
      </div>

      <div className="hidden border-t border-neutral-200 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {navGroups.map((group) => (
              <div className="group relative" key={group.label}>
                <a
                  className="inline-flex items-center gap-1 px-4 py-3 text-sm font-bold uppercase text-neutral-800 transition hover:text-juno focus:outline-none focus:ring-2 focus:ring-juno/20"
                  href={group.href}
                >
                  {group.label}
                  <ChevronDown className="size-3.5 transition group-hover:rotate-180" />
                </a>
                <div className="invisible absolute left-0 top-full grid w-[720px] grid-cols-[1fr_1fr_1.2fr] gap-6 border border-neutral-200 bg-white p-6 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-juno">{group.label}</p>
                    <div className="grid gap-2">
                      {group.items.map((item) => (
                        <a className="text-sm text-neutral-700 transition hover:text-juno" href="#products" key={item}>
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Nổi bật</p>
                    <div className="grid gap-2">
                      {campaignLinks.slice(0, 4).map((item) => (
                        <a className="text-sm text-neutral-700 transition hover:text-juno" href="#new-arrivals" key={item}>
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blush p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-juno">Deal hôm nay</p>
                    <p className="mt-3 text-2xl font-bold leading-tight text-ink">Giảm đến 50% cho mẫu chọn lọc</p>
                    <a className="mt-5 inline-flex bg-juno px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white" href="#sale">
                      Mua ngay
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </nav>
          <nav className="flex items-center gap-5" aria-label="Campaign navigation">
            {campaignLinks.slice(0, 3).map((item) => (
              <a className="text-sm font-bold text-juno transition hover:text-ink" href="#new-arrivals" key={item}>
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50 lg:hidden">
        <nav className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Mobile quick links">
          {promoLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            return (
              <a className="inline-flex shrink-0 items-center gap-1.5 bg-white px-3 py-2 text-xs font-bold text-neutral-800 shadow-sm" href={link.href} key={link.label}>
                <Icon className="size-3.5 text-juno" />
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>

      <div className={cn("border-t border-neutral-200 bg-white px-4 py-4 shadow-soft lg:hidden", menuOpen ? "block" : "hidden")}>
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center border border-neutral-300 bg-neutral-50 px-3 py-2">
            <Search className="mr-2 size-4 shrink-0 text-neutral-500" />
            <input className="w-full bg-transparent text-sm outline-none" type="search" placeholder="Tìm sản phẩm" aria-label="Search products" />
          </div>

          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navGroups.map((group) => (
              <div className="border border-neutral-200 p-3" key={group.label}>
                <a className="font-bold uppercase text-ink" href={group.href} onClick={() => setMenuOpen(false)}>
                  {group.label}
                </a>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {group.items.slice(0, 4).map((item) => (
                    <a className="bg-neutral-50 px-2.5 py-2 text-xs font-medium text-neutral-700" href="#products" key={item} onClick={() => setMenuOpen(false)}>
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {user ? (
            <button className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-bold text-white" type="button" onClick={handleLogout}>
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          ) : (
            <Link className="flex w-full items-center justify-center gap-2 bg-juno px-4 py-3 text-sm font-bold text-white" href="/login" onClick={() => setMenuOpen(false)}>
              <User className="size-4" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
