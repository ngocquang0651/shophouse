"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/types/product";

export type CartItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CommerceContextValue = {
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  addToCart: (product: Product, variant: ProductVariant) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const CART_KEY = "shopo-cart";
const WISHLIST_KEY = "shopo-wishlist";

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"));
    setWishlist(JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]"));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }, [hydrated, wishlist]);

  const value = useMemo<CommerceContextValue>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    addToCart(product, variant) {
      setCart((current) => {
        const lineId = `${product.id}-${variant.sku}`;
        const existing = current.find((item) => item.lineId === lineId);
        if (existing) return current.map((item) => item.lineId === lineId ? { ...item, quantity: Math.min(item.quantity + 1, item.maxQuantity) } : item);
        return [...current, { lineId, productId: product.id, slug: product.slug ?? product.id, name: product.name, brand: product.brand, image: variant.image ?? product.image, color: variant.color, size: variant.size, sku: variant.sku, price: variant.price ?? product.price, quantity: 1, maxQuantity: variant.stock }];
      });
    },
    updateQuantity(lineId, quantity) {
      setCart((current) => current.map((item) => item.lineId === lineId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) } : item));
    },
    removeFromCart(lineId) { setCart((current) => current.filter((item) => item.lineId !== lineId)); },
    toggleWishlist(productId) { setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]); },
    isWishlisted(productId) { return wishlist.includes(productId); }
  }), [cart, wishlist]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider.");
  return context;
}
