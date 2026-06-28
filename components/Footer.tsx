import Link from "next/link";
import { Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const supportLinks = ["Hướng dẫn chọn size", "Câu hỏi thường gặp", "Chính sách đổi trả", "Thanh toán giao nhận", "Chính sách bảo mật", "Khách hàng thân thiết"];
const companyLinks = ["Cửa hàng", "Luxe Magazine", "Về LuxeStore", "Tuyển dụng"];

export function Footer() {
  return (
    <>
      <footer className="border-t border-neutral-200 bg-white text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.1fr_1.1fr_1.2fr] lg:px-8">
          <div>
            <Link className="text-3xl font-black tracking-[0.18em] text-juno" href="/">
              LUXE
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-600">
              Fashion ecommerce concept với nhịp mua sắm nhanh, danh mục rõ, sản phẩm dày và chăm sóc khách hàng dễ thấy.
            </p>
            <div className="mt-5 flex gap-2">
              <a className="grid size-10 place-items-center border border-neutral-200 text-neutral-700 transition hover:border-juno hover:text-juno" href="#" aria-label="Facebook">
                <Facebook className="size-4" />
              </a>
              <a className="grid size-10 place-items-center border border-neutral-200 text-neutral-700 transition hover:border-juno hover:text-juno" href="#" aria-label="Messenger">
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Company links">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">Về LuxeStore</h2>
            <div className="mt-4 grid gap-3">
              {companyLinks.map((link) => (
                <a className="text-sm text-neutral-600 transition hover:text-juno" href="#" key={link}>
                  {link}
                </a>
              ))}
            </div>
          </nav>

          <nav aria-label="Support links">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">Hỗ trợ khách hàng</h2>
            <div className="mt-4 grid gap-3">
              {supportLinks.map((link) => (
                <a className="text-sm text-neutral-600 transition hover:text-juno" href="#" key={link}>
                  {link}
                </a>
              ))}
            </div>
          </nav>

          <div id="service">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">Gọi mua hàng Online</h2>
            <div className="mt-4 grid gap-3 text-sm text-neutral-600">
              <p className="flex items-center gap-2 text-xl font-black text-juno">
                <Phone className="size-5" />
                1800 1160
              </p>
              <p>Tất cả các ngày trong tuần, 08:00 - 21:00</p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-juno" />
                cskh@luxestore.test
              </p>
              <p className="flex items-center gap-2" id="stores">
                <MapPin className="size-4 text-juno" />
                Hệ thống cửa hàng toàn quốc
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 text-xs text-neutral-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© LuxeStore concept storefront.</p>
            <div className="flex gap-4">
              <a className="hover:text-juno" href="#">Privacy</a>
              <a className="hover:text-juno" href="#">Terms</a>
              <a className="hover:text-juno" href="#">Help</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-4 z-50 grid gap-2">
        <a className="grid size-12 place-items-center rounded-full bg-[#0084ff] text-white shadow-soft transition hover:scale-105" href="#" aria-label="Messenger">
          <MessageCircle className="size-5" />
        </a>
        <a className="grid size-12 place-items-center rounded-full bg-juno text-white shadow-soft transition hover:scale-105" href="tel:18001160" aria-label="Call hotline">
          <Phone className="size-5" />
        </a>
      </div>
    </>
  );
}
