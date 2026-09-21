import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/data/contact";

const columns = [
  { title: "Khám phá", links: [{ label: "Giày nữ", href: "/women/shoes" }, { label: "Giày nam", href: "/men/shoes" }, { label: "Giày trẻ em", href: "/kids/shoes" }, { label: "Dây lưng", href: "/men/belts" }] },
  { title: "Bộ sưu tập", links: [{ label: "Sản phẩm mới", href: "/collections/new-arrivals" }, { label: "Best sellers", href: "/collections/best-sellers" }, { label: "Sale", href: "/collections/sale" }, { label: "Tìm kiếm", href: "/search" }] }
];

export function Footer() {
  return <footer className="bg-ink text-white"><div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8"><div><Link className="text-3xl font-black tracking-[.16em]" href="/">SHOPO<span className="text-shopo-orange">.</span></Link><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Made for the everyday move. Giày dép và dây lưng cho nhịp sống của bạn.</p></div>{columns.map((column) => <nav key={column.title}><h2 className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">{column.title}</h2><div className="mt-4 grid gap-3">{column.links.map((link) => <Link className="text-sm text-white/80 hover:text-white" href={link.href} key={link.label}>{link.label}</Link>)}</div></nav>)}<div><h2 className="text-xs font-black uppercase tracking-[.16em] text-shopo-orange">Liên hệ</h2><p className="mt-4 text-sm leading-6 text-white/65">Cần tư vấn chọn mẫu hoặc size? Gọi hoặc gửi email cho SHOPO.</p><div className="mt-4 grid gap-1 text-sm text-white/80"><a className="inline-flex min-h-10 items-center gap-2 hover:text-white" href={contact.hotlineHref}><Phone className="size-4 text-shopo-orange" aria-hidden="true" />{contact.hotline}</a><a className="inline-flex min-h-10 items-center gap-2 hover:text-white" href={contact.emailHref}><Mail className="size-4 text-shopo-orange" aria-hidden="true" />{contact.email}</a><p className="inline-flex min-h-10 items-center gap-2"><MapPin className="size-4 text-shopo-orange" aria-hidden="true" />Cửa hàng toàn quốc</p></div></div></div><div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">© 2026 SHOPO. Designed for every move.</div></footer>;
}
