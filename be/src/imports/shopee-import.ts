import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";

export type ImportedVariant = {
  sku: string;
  sourceVariantId: string;
  sourceLabel: string;
  gtin?: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
};

export type ImportedProduct = {
  source: {
    provider: "shopee";
    productId: string;
    categoryPath: string;
    fingerprint: string;
  };
  slug: string;
  brand: string;
  name: string;
  audience: "women" | "men" | "kids" | "unisex";
  productType: "shoes" | "belts" | "wallets" | "food";
  category: string;
  tags: string[];
  price: number;
  image: string;
  images: string[];
  badge: "New";
  variants: ImportedVariant[];
  stock: number;
  status: "active";
  sizeGuideKey: "women-shoes" | "men-shoes" | "kids-shoes" | "belts";
};

type SalesRow = Record<string, string | number>;

export type ShopeeImportReport = {
  fingerprint: string;
  products: ImportedProduct[];
  productCount: number;
  variantCount: number;
  errors: string[];
  categories: Record<string, number>;
};

const sourceRoot = resolve(process.cwd(), "imports");
const defaultSalesFile = resolve(sourceRoot, "product_list.xlsx");
const defaultMediaFile = resolve(sourceRoot, "produc_images.xlsx");

function readRows(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
  const headers = rows[0].map((header) => String(header));
  return rows.slice(6).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))) as SalesRow[];
}

function asString(value: string | number | undefined) {
  return String(value ?? "").trim();
}

function asNumber(value: string | number | undefined) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getTaxonomy(categoryPath: string): Pick<ImportedProduct, "audience" | "productType" | "category" | "sizeGuideKey"> {
  const normalized = categoryPath.toLowerCase();
  const isKids = normalized.includes("baby") || normalized.includes("kids");
  const isWomen = normalized.includes("women");
  const isMen = normalized.includes("men");

  if (normalized.includes("belt")) return { audience: isKids ? "kids" : isWomen ? "women" : "men", productType: "belts", category: "belts", sizeGuideKey: "belts" };
  if (normalized.includes("wallet") || normalized.includes("bag")) return { audience: isWomen ? "women" : isMen ? "men" : "unisex", productType: "wallets", category: "wallets", sizeGuideKey: "belts" };
  if (normalized.includes("food") || normalized.includes("fruit")) return { audience: "unisex", productType: "food", category: "fresh-food", sizeGuideKey: "belts" };
  return { audience: isKids ? "kids" : isWomen ? "women" : "men", productType: "shoes", category: normalized.includes("sandal") ? "sandals" : normalized.includes("sneaker") ? "sneakers" : "shoes", sizeGuideKey: isKids ? "kids-shoes" : isWomen ? "women-shoes" : "men-shoes" };
}

function parseVariant(row: SalesRow, productId: string): ImportedVariant {
  const sourceVariantId = asString(row.et_title_variation_id);
  const sourceLabel = asString(row.et_title_variation_name);
  const [rawColor = "Mặc định", rawSize = "One size"] = sourceLabel.split(",").map((value) => value.trim());
  return {
    sku: `SHOPEE-${productId}-${sourceVariantId}`,
    sourceVariantId,
    sourceLabel,
    ...(asString(row.ps_gtin_code) ? { gtin: asString(row.ps_gtin_code) } : {}),
    color: rawColor || "Mặc định",
    colorHex: "#171717",
    size: rawSize || "One size",
    stock: asNumber(row.et_title_variation_stock),
    price: asNumber(row.et_title_variation_price)
  };
}

export function loadShopeeCatalog(salesFile = defaultSalesFile, mediaFile = defaultMediaFile): ShopeeImportReport {
  const salesRows = readRows(salesFile);
  const mediaRows = readRows(mediaFile);
  const mediaByProductId = new Map(mediaRows.map((row) => [asString(row.et_title_product_id), row]));
  const salesByProductId = new Map<string, SalesRow[]>();
  const errors: string[] = [];

  for (const row of salesRows) {
    const productId = asString(row.et_title_product_id);
    if (!productId) continue;
    const rows = salesByProductId.get(productId) ?? [];
    rows.push(row);
    salesByProductId.set(productId, rows);
  }

  const products: ImportedProduct[] = [];
  const categories: Record<string, number> = {};
  for (const [productId, rows] of salesByProductId) {
    const media = mediaByProductId.get(productId);
    if (!media) { errors.push(`Missing media row for product ${productId}.`); continue; }
    const name = asString(rows[0].et_title_product_name);
    const coverImage = asString(media.ps_item_cover_image);
    const variants = rows.map((row) => parseVariant(row, productId));
    if (!name || !coverImage || variants.some((variant) => !variant.sourceVariantId || !Number.isFinite(variant.price) || !Number.isFinite(variant.stock))) {
      errors.push(`Invalid required data for product ${productId}.`);
      continue;
    }
    const categoryPath = asString(media.et_title_product_category);
    const taxonomy = getTaxonomy(categoryPath);
    const images = Array.from(new Set([coverImage, ...Array.from({ length: 8 }, (_, index) => asString(media[`ps_item_image.${index + 1}`])).filter(Boolean)]));
    const fingerprint = createHash("sha256").update(JSON.stringify({ productId, name, categoryPath, images, variants })).digest("hex");
    categories[taxonomy.category] = (categories[taxonomy.category] ?? 0) + 1;
    products.push({
      source: { provider: "shopee", productId, categoryPath, fingerprint },
      slug: `${slugify(name)}-${productId}`,
      brand: "Duy Nhật Store",
      name,
      ...taxonomy,
      tags: [],
      price: Math.min(...variants.map((variant) => variant.price)),
      image: coverImage,
      images,
      badge: "New",
      variants,
      stock: variants.reduce((total, variant) => total + variant.stock, 0),
      status: "active"
    });
  }

  const fingerprint = createHash("sha256").update(`${createHash("sha256").update(readFileSync(salesFile)).digest("hex")}:${createHash("sha256").update(readFileSync(mediaFile)).digest("hex")}`).digest("hex");
  return { fingerprint, products, productCount: products.length, variantCount: products.reduce((total, product) => total + product.variants.length, 0), errors, categories };
}
