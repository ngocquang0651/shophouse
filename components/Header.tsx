"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { getCurrentUser, logout, subscribeToAuthChanges, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = ["Women", "Men", "Luxury", "Sports", "Beauty", "Kids"];

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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="grid size-10 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15 lg:hidden"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          title={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link className="shrink-0 text-xl font-semibold tracking-[0.24em] text-ink" href="/">
          LuxeStore
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              className="text-sm font-medium text-neutral-700 transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
          <Link
            className="text-sm font-medium text-neutral-700 transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            href="/chatbot"
          >
            Chatbot
          </Link>
        </nav>

        <div className="ml-auto hidden w-full max-w-xs items-center border border-neutral-300 px-3 py-2 transition focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10 md:flex">
          <Search className="mr-2 size-4 shrink-0 text-neutral-500" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            type="search"
            placeholder="Search luxury edits"
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-28 truncate text-sm font-medium text-neutral-700">{user.name}</span>
              {user.role === "admin" ? (
                <Link
                  className="grid size-10 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
                  href="/admin/products"
                  aria-label="Open admin products"
                  title="Admin products"
                >
                  <LayoutDashboard className="size-4" />
                </Link>
              ) : null}
              <button
                className="grid size-10 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              className="hidden items-center gap-2 border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white focus:outline-none focus:ring-2 focus:ring-ink/15 sm:flex"
              href="/login"
            >
              <User className="size-4" />
              Login
            </Link>
          )}

          <button
            className="relative grid size-10 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            aria-label="Open cart"
            title="Cart"
          >
            <ShoppingBag className="size-5" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-champagne text-[10px] font-bold text-ink">
              0
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-neutral-200 bg-white px-4 py-4 shadow-soft lg:hidden",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex items-center border border-neutral-300 px-3 py-2">
            <Search className="mr-2 size-4 shrink-0 text-neutral-500" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
              type="search"
              placeholder="Search luxury edits"
              aria-label="Search products"
            />
          </div>

          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                className="border border-neutral-200 px-3 py-3 text-sm font-medium text-neutral-700 transition hover:border-ink hover:text-ink"
                href={`#${item.toLowerCase()}`}
                key={item}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link
              className="border border-neutral-200 px-3 py-3 text-sm font-medium text-neutral-700 transition hover:border-ink hover:text-ink"
              href="/chatbot"
              onClick={() => setMenuOpen(false)}
            >
              Chatbot
            </Link>
          </nav>

          {user ? (
            <div className="grid gap-2">
              {user.role === "admin" ? (
                <Link
                  className="flex w-full items-center justify-center gap-2 border border-neutral-200 px-4 py-3 text-sm font-semibold text-ink transition hover:border-ink"
                  href="/admin/products"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="size-4" />
                  Admin products
                </Link>
              ) : null}
              <button
                className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                type="button"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          ) : (
            <Link
              className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              <User className="size-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
