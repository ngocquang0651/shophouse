import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { connect, disconnect, model } from "mongoose";
import { ProductBadge } from "./common/enums/product-badge.enum";
import { ProductStatus } from "./common/enums/product-status.enum";
import { seedProducts as storefrontProducts } from "./catalog-seed";
import { UserRole } from "./common/enums/user-role.enum";
import { ProductSchema } from "./products/schemas/product.schema";
import { UserSchema } from "./users/schemas/user.schema";

config();

const UserModel = model("User", UserSchema);
const ProductModel = model("Product", ProductSchema);

const demoAdmin = {
  name: "Store Admin",
  email: "admin",
  password: "1",
  role: UserRole.Admin
};

const legacyAdminEmail = "admin@example.com";

const seedUsers = [
  {
    name: "Luxe Member",
    email: "user@example.com",
    password: "password123",
    role: UserRole.User
  }
];

const seedProducts = storefrontProducts.map((product) => {
  const { id, ...catalogProduct } = product;
  void id;

  return {
    ...catalogProduct,
    badge: product.badge === "Sale" ? ProductBadge.Sale : ProductBadge.New,
    images: product.images ?? [product.image],
    stock: product.variants?.reduce((total, variant) => total + variant.stock, 0) ?? product.stock ?? 0,
    status: ProductStatus.Active
  };
});

async function seed() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/luxestore";
  await connect(mongoUri);

  const [admin, legacyAdmin] = await Promise.all([
    UserModel.findOne({ email: demoAdmin.email }),
    UserModel.findOne({ email: legacyAdminEmail })
  ]);

  if (admin && legacyAdmin) {
    throw new Error(
      `Both demo admin accounts exist (${demoAdmin.email} and ${legacyAdminEmail}). Remove or reconcile one before seeding.`
    );
  }

  const password = await bcrypt.hash(demoAdmin.password, 10);
  if (admin) {
    await UserModel.updateOne(
      { _id: admin._id },
      { name: demoAdmin.name, password, role: demoAdmin.role }
    );
  } else if (legacyAdmin) {
    await UserModel.updateOne(
      { _id: legacyAdmin._id },
      { ...demoAdmin, password }
    );
  } else {
    await UserModel.create({ ...demoAdmin, password });
  }

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
