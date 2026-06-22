import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { connect, disconnect, model } from "mongoose";
import { ProductBadge } from "./common/enums/product-badge.enum";
import { ProductStatus } from "./common/enums/product-status.enum";
import { UserRole } from "./common/enums/user-role.enum";
import { ProductSchema } from "./products/schemas/product.schema";
import { UserSchema } from "./users/schemas/user.schema";

config();

const UserModel = model("User", UserSchema);
const ProductModel = model("Product", ProductSchema);

const seedUsers = [
  {
    name: "Store Admin",
    email: "admin@example.com",
    password: "admin123",
    role: UserRole.Admin
  },
  {
    name: "Luxe Member",
    email: "user@example.com",
    password: "password123",
    role: UserRole.User
  }
];

const seedProducts = [
  {
    id: "structured-leather-tote",
    brand: "Coach",
    name: "Structured Leather Tote",
    category: "Women's Bags",
    price: 520,
    originalPrice: 650,
    badge: ProductBadge.Sale,
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "silk-midi-dress",
    brand: "BOSS",
    name: "Silk Blend Midi Dress",
    category: "Women's Clothing",
    price: 780,
    badge: ProductBadge.Luxury,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "gold-tone-hoops",
    brand: "Kate Spade",
    name: "Gold-Tone Signature Hoops",
    category: "Fine Jewellery",
    price: 148,
    badge: ProductBadge.New,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "minimal-leather-sneaker",
    brand: "Lacoste",
    name: "Minimal Leather Sneaker",
    category: "Men",
    price: 170,
    originalPrice: 220,
    badge: ProductBadge.Sale,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "tailored-wool-blazer",
    brand: "COS",
    name: "Tailored Wool Blazer",
    category: "Women",
    price: 390,
    badge: ProductBadge.Luxury,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "chain-strap-crossbody",
    brand: "Michael Kors",
    name: "Chain Strap Crossbody",
    category: "Women's Bags",
    price: 295,
    originalPrice: 425,
    badge: ProductBadge.Sale,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "premium-running-shoe",
    brand: "New Balance",
    name: "Premium Suede Running Shoe",
    category: "Sports",
    price: 210,
    badge: ProductBadge.New,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cashmere-polo",
    brand: "Calvin Klein",
    name: "Cashmere Polo Knit",
    category: "Men",
    price: 240,
    badge: ProductBadge.Luxury,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80"
  }
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/luxestore";
  await connect(mongoUri);

  for (const user of seedUsers) {
    const existingUser = await UserModel.findOne({ email: user.email });
    if (!existingUser) {
      await UserModel.create({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      });
    }
  }

  for (const product of seedProducts) {
    const existingProduct = await ProductModel.findOne({ name: product.name, brand: product.brand });
    if (!existingProduct) {
      await ProductModel.create({
        ...product,
        images: [product.image],
        description: `${product.brand} ${product.name} curated for the LuxeStore luxury edit.`,
        stock: 12,
        status: ProductStatus.Active
      });
    }
  }

  await disconnect();
  console.log("Seed completed.");
}

void seed().catch(async (error) => {
  console.error(error);
  await disconnect();
  process.exit(1);
});
