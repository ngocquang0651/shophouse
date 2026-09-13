"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCommerce } from "@/components/CommerceProvider";
import { navGroups, promoLinks } from "@/data/navigation";
import { getCurrentUser, getSession, logout, subscribeToAuthChanges, type AuthUser } from "@/lib/auth";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cartCount } = useCommerce();
  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    void getSession().then((session) => setUser(session));
    return subscribeToAuthChanges(sync);
  }, []);
  function submitSearch(event: FormEvent) { event.preventDefault(); if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`; }
  return <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
    <div className="bg-ink px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white">Freeship từ 499K · Đổi size trong 7 ngày · Hotline 1800 1160</div>
    <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <button className="grid size-10 place-items-center lg:hidden" type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><Menu className="size-5" /></button>
      <Link className="text-2xl font-black tracking-[0.16em] text-ink sm:text-3xl" href="/">SHOPO<span className="text-shopo-orange">.</span></Link>
      <form className="hidden max-w-xl flex-1 items-center border border-neutral-200 bg-neutral-50 px-3 py-2 md:flex" onSubmit={submitSearch}><Search className="mr-2 size-4 text-neutral-500" /><input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm giày, dép, dây lưng..." aria-label="Tìm kiếm sản phẩm" /></form>
      <div className="ml-auto flex items-center gap-1"><Link className="grid size-10 place-items-center hover:text-shopo-orange" href="/login" aria-label="Tài khoản"><User className="size-5" /></Link><button className="grid size-10 place-items-center hover:text-shopo-orange" type="button" aria-label="Sản phẩm yêu thích"><Heart className="size-5" /></button><button className="relative grid size-10 place-items-center hover:text-shopo-orange" type="button" aria-label="Giỏ hàng"><ShoppingBag className="size-5" />{cartCount ? <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-shopo-orange text-[10px] font-bold text-white">{cartCount}</span> : null}</button></div>
    </div>
    <div className="hidden border-t border-neutral-100 lg:block"><nav className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Điều hướng chính"><div className="flex">{navGroups.map((group) => <div className="group relative" key={group.label}><Link className="block px-5 py-3 text-sm font-black uppercase tracking-[0.12em] hover:text-shopo-orange" href={group.href}>{group.label}</Link><div className="invisible absolute left-0 top-full w-60 border border-neutral-200 bg-white p-4 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">{group.items.map((item) => <Link className="block py-2 text-sm hover:text-shopo-orange" href={item.href} key={item.label}>{item.label}</Link>)}</div></div>)}</div><div className="flex gap-5">{promoLinks.slice(0, 3).map((link) => <Link className="text-xs font-black uppercase tracking-[0.12em] text-shopo-orange" href={link.href} key={link.label}>{link.label}</Link>)}</div></nav></div>
    <nav className="flex gap-2 overflow-x-auto border-t border-neutral-100 px-4 py-2 lg:hidden">{promoLinks.slice(0, 3).map((link) => <Link className="shrink-0 border border-neutral-200 px-3 py-2 text-xs font-bold" href={link.href} key={link.label}>{link.label}</Link>)}</nav>
    {menuOpen ? <div className="fixed inset-0 z-50 bg-black/45" onClick={() => setMenuOpen(false)}><aside className="h-full w-[min(88vw,380px)] overflow-y-auto bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><strong className="text-xl tracking-[.12em]">SHOPO.</strong><button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X /></button></div><form className="mt-6 flex border border-neutral-200 p-2" onSubmit={submitSearch}><input className="min-w-0 flex-1 outline-none" placeholder="Tìm kiếm" value={query} onChange={(event) => setQuery(event.target.value)} /><button><Search className="size-5" /></button></form><div className="mt-6 grid gap-5">{navGroups.map((group) => <div key={group.label}><Link className="font-black uppercase" href={group.href} onClick={() => setMenuOpen(false)}>{group.label}</Link>{group.items.map((item) => <Link className="mt-3 block text-sm text-neutral-600" href={item.href} onClick={() => setMenuOpen(false)} key={item.label}>{item.label}</Link>)}</div>)}</div>{user ? <button className="mt-8 w-full bg-ink p-3 text-sm font-bold text-white" onClick={() => { logout(); setMenuOpen(false); }}>Đăng xuất</button> : <Link className="mt-8 block bg-shopo-orange p-3 text-center text-sm font-bold text-white" href="/login">Đăng nhập</Link>}</aside></div> : null}
  </header>;
}
