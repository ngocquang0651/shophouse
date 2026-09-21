"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { ExternalLink, LogOut, Package, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };

/** Add an entry here when a new admin page exists; the sidebar and top bar pick it up. */
export const adminNav: AdminNavItem[] = [{ href: "/admin/products", label: "Sản phẩm", icon: Package }];

export type AdminShellProps = {
  user: AuthUser;
  onLogout: () => void;
  currentPath?: string;
  children: ReactNode;
};

function Brand() {
  return (
    <Link className="text-xl font-black tracking-[0.16em] text-ink" href="/admin/products" aria-label="SHOPO - Quản trị">
      SHOPO<span className="text-shopo-orange">.</span>
    </Link>
  );
}

function NavLinks({ currentPath, layout }: { currentPath: string; layout: "side" | "top" }) {
  return (
    <nav className={layout === "side" ? "grid gap-1" : "flex items-center overflow-x-auto"} aria-label="Điều hướng quản trị">
      {adminNav.map((item) => {
        const current = currentPath.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            className={
              layout === "side"
                ? `flex h-11 items-center gap-3 rounded-field px-3 text-sm font-semibold transition ${
                    current ? "bg-ink text-white" : "text-neutral-700 hover:bg-smoke"
                  }`
                : `inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold ${
                    current ? "border-shopo-orange text-ink" : "border-transparent text-neutral-600"
                  }`
            }
            href={item.href}
            aria-current={current ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ user, onLogout, currentPath = "/admin/products", children }: AdminShellProps) {
  // Sticky header and the floating bulk bar must never hide the element that has keyboard focus.
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingTop = "7rem";
    root.style.scrollPaddingBottom = "7rem";
    return () => {
      root.style.scrollPaddingTop = "";
      root.style.scrollPaddingBottom = "";
    };
  }, []);

  return (
    <div className="admin-scope min-h-screen bg-porcelain lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-field focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        href="#main-content"
      >
        Bỏ qua để đến nội dung chính
      </a>
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-neutral-200 bg-white p-4 lg:flex">
        <div className="flex items-center gap-2 px-2 pb-6 pt-2">
          <Brand />
          <Badge className="py-1 font-semibold text-neutral-700">Quản trị</Badge>
        </div>
        <NavLinks currentPath={currentPath} layout="side" />

        <div className="mt-auto grid gap-2 border-t border-neutral-200 pt-4">
          <Button className="h-10 justify-start gap-3 font-medium text-neutral-700" variant="ghost" asChild>
            <Link href="/">
              <ExternalLink aria-hidden="true" />
              Xem cửa hàng
            </Link>
          </Button>
          <div className="px-3 py-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-neutral-600" title={user.email}>{user.email}</p>
          </div>
          <Button className="h-10 justify-start gap-3" variant="outline" type="button" onClick={onLogout}>
            <LogOut aria-hidden="true" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Brand />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/" aria-label="Xem cửa hàng">
                  <ExternalLink className="!size-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" type="button" onClick={onLogout} aria-label="Đăng xuất">
                <LogOut aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="border-t border-neutral-100 px-2 sm:px-4">
            <NavLinks currentPath={currentPath} layout="top" />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
