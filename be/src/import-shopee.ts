import "reflect-metadata";
import { config } from "dotenv";
import { connect, disconnect, model } from "mongoose";
import { ProductSchema } from "./products/schemas/product.schema";
import { loadShopeeCatalog } from "./imports/shopee-import";
import { buildSearchText } from "./products/product-query";

config();

const ProductModel = model("Product", ProductSchema);
const apply = process.argv.includes("--apply");
const archiveDemo = process.argv.includes("--archive-demo");

async function run() {
  const report = loadShopeeCatalog();
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", fingerprint: report.fingerprint, products: report.productCount, variants: report.variantCount, categories: report.categories, errors: report.errors }, null, 2));
  if (report.errors.length || !apply) return;

  await connect(process.env.MONGODB_URI ?? "mongodb://localhost:27017/luxestore");
  const now = new Date();
  let created = 0;
  let updated = 0;
  for (const product of report.products) {
    const existing = await ProductModel.findOne({ "source.provider": "shopee", "source.productId": product.source.productId }).lean();
    await ProductModel.updateOne(
      { "source.provider": "shopee", "source.productId": product.source.productId },
      { $set: { ...product, searchText: buildSearchText(product), source: { ...product.source, importedAt: existing?.source?.importedAt ?? now, lastSeenAt: now } } },
      { upsert: true }
    );
    if (existing) updated += 1; else created += 1;
  }
  if (archiveDemo) await ProductModel.updateMany({ "source.provider": { $exists: false } }, { $set: { status: "inactive" } });
  console.log(JSON.stringify({ created, updated, archivedDemo: archiveDemo, result: "success" }, null, 2));
  await disconnect();
}

void run().catch(async (error) => { console.error(error); await disconnect(); process.exit(1); });
