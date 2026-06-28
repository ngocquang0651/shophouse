export type ProductBadge = "New" | "Sale" | "Luxury";
export type ProductStatus = "active" | "inactive";

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge: ProductBadge;
  image: string;
  images?: string[];
  colors?: string[];
  description?: string;
  stock?: number;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
};

export type Brand = {
  id: string;
  name: string;
};
