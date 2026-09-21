import type { Product } from "@/types/product";

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    brand: "Coach",
    name: "Túi Tabby",
    category: "Túi xách",
    price: 1500000,
    badge: "New",
    image: "https://example.com/a.jpg",
    stock: 12,
    status: "active",
    ...overrides
  };
}
