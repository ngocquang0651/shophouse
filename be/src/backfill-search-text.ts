import "reflect-metadata";
import { config } from "dotenv";
import { connect, disconnect, model } from "mongoose";
import { ProductSchema } from "./products/schemas/product.schema";
import { buildSearchText } from "./products/product-query";
import { buildUniqueSlug, slugifyProductName } from "./products/product-slug";

config();

const ProductModel = model("Product", ProductSchema);
const apply = process.argv.includes("--apply");

/**
 * Repairs catalog documents written before `slug` and `searchText` existed, then
 * syncs the indexes that depend on them. Safe to run repeatedly: it only writes
 * documents whose stored value differs from the computed one.
 */
async function run() {
  await connect(process.env.MONGODB_URI ?? "mongodb://localhost:27017/luxestore");

  const products = await ProductModel.find({}, { name: 1, brand: 1, category: 1, tags: 1, slug: 1, searchText: 1 })
    .lean()
    .exec();

  const takenSlugs = new Set(products.map((product) => product.slug).filter(Boolean));
  const updates: { _id: unknown; changes: Record<string, string> }[] = [];

  for (const product of products) {
    const changes: Record<string, string> = {};

    if (!product.slug) {
      const slug = await buildUniqueSlug(slugifyProductName(product.name ?? ""), (candidate) =>
        Promise.resolve(takenSlugs.has(candidate))
      );
      takenSlugs.add(slug);
      changes.slug = slug;
    }

    const searchText = buildSearchText(product);
    if (searchText !== product.searchText) {
      changes.searchText = searchText;
    }

    if (Object.keys(changes).length) {
      updates.push({ _id: product._id, changes });
    }
  }

  const missingSlugs = updates.filter((update) => update.changes.slug).length;
  console.log(
    JSON.stringify(
      { mode: apply ? "apply" : "dry-run", scanned: products.length, toUpdate: updates.length, missingSlugs },
      null,
      2
    )
  );

  if (!apply) {
    await disconnect();
    return;
  }

  if (updates.length) {
    const result = await ProductModel.bulkWrite(
      updates.map((update) => ({
        updateOne: { filter: { _id: update._id }, update: { $set: update.changes } }
      }))
    );
    console.log(JSON.stringify({ modified: result.modifiedCount }, null, 2));
  }

  await ProductModel.syncIndexes();
  console.log("Indexes synced.");
  await disconnect();
}

void run().catch(async (error) => {
  console.error(error);
  await disconnect();
  process.exit(1);
});
