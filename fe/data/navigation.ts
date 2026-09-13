import type { LucideIcon } from "lucide-react";
import { Flame, Percent, Sparkles, Store, Truck } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href: string;
  items: NavItem[];
};

export type PromoLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navGroups: NavGroup[] = [
  {
    label: "Nữ",
    href: "/women/shoes",
    items: [
      { label: "Giày dép", href: "/women/shoes" },
      { label: "Sandal & Mule", href: "/women/shoes?category=sandals" },
      { label: "Sneaker", href: "/women/shoes?category=sneakers" },
      { label: "Dây lưng", href: "/women/belts" }
    ]
  },
  {
    label: "Nam",
    href: "/men/shoes",
    items: [
      { label: "Giày dép", href: "/men/shoes" },
      { label: "Sneaker", href: "/men/shoes?category=sneakers" },
      { label: "Sandal", href: "/men/shoes?category=sandals" },
      { label: "Dây lưng", href: "/men/belts" }
    ]
  },
  {
    label: "Trẻ em",
    href: "/kids/shoes",
    items: [
      { label: "Giày dép", href: "/kids/shoes" },
      { label: "Dép quai ngang", href: "/kids/shoes?category=slides" },
      { label: "Dây lưng", href: "/kids/belts" }
    ]
  }
];

export const promoLinks: PromoLink[] = [
  { label: "Mới về", href: "/collections/new-arrivals", icon: Sparkles },
  { label: "Best sellers", href: "/collections/best-sellers", icon: Flame },
  { label: "Sale", href: "/collections/sale", icon: Percent },
  { label: "Giao nhanh", href: "/#service", icon: Truck },
  { label: "Cửa hàng", href: "/#stores", icon: Store }
];
