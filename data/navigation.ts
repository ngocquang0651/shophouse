import type { LucideIcon } from "lucide-react";
import { Gift, Percent, Sparkles, Store, Truck } from "lucide-react";

export type NavGroup = {
  label: string;
  href: string;
  items: string[];
};

export type PromoLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navGroups: NavGroup[] = [
  {
    label: "Giày",
    href: "#giay",
    items: ["Tất cả Giày", "Giày cao gót", "Giày xăng đan", "Giày búp bê", "Sneakers", "Dép guốc"]
  },
  {
    label: "Túi",
    href: "#tui",
    items: ["Tất cả Túi", "Túi cỡ nhỏ", "Túi cỡ trung", "Túi cỡ lớn", "Balo", "Ví - Clutch"]
  },
  {
    label: "Phụ Kiện",
    href: "#phu-kien",
    items: ["Mắt kính", "Nón", "Móc khóa", "Phụ kiện tóc", "Vớ", "Túi mỹ phẩm"]
  },
  {
    label: "Quần Áo",
    href: "#quan-ao",
    items: ["Đầm & Jumpsuit", "Áo nữ", "Quần nữ", "Váy nữ", "Áo khoác", "Đồ công sở"]
  },
  {
    label: "Beauty",
    href: "#beauty",
    items: ["Trang điểm", "Chăm sóc da", "Chăm sóc cơ thể", "Chăm sóc tóc", "Dụng cụ làm đẹp"]
  },
  {
    label: "Quà Tặng",
    href: "#qua-tang",
    items: ["Set quà tặng", "Best sellers", "Dưới 500K", "Quà sinh nhật", "Quà công sở"]
  }
];

export const promoLinks: PromoLink[] = [
  { label: "Hàng mới về", href: "#new-arrivals", icon: Sparkles },
  { label: "Clearance Sale", href: "#sale", icon: Percent },
  { label: "Quà tặng", href: "#qua-tang", icon: Gift },
  { label: "Giao nhanh", href: "#service", icon: Truck },
  { label: "Cửa hàng", href: "#stores", icon: Store }
];
