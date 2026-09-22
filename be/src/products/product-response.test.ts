import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Types } from "mongoose";
import { ProductBadge } from "../common/enums/product-badge.enum";
import { ProductStatus } from "../common/enums/product-status.enum";
import {
  PRODUCT_LIST_PROJECTION,
  toAdminProductResponse,
  toProductDetail,
  toProductListItem,
  toVariantResponse
} from "./product-response";

const objectId = new Types.ObjectId("6aa6cad9650f8a4819f2adb8");

function rawProduct(overrides: Record<string, unknown> = {}) {
  return {
    _id: objectId,
    __v: 3,
    name: "Giày da nam",
    brand: "SHOPO",
    slug: "giay-da-nam",
    audience: "men",
    productType: "shoes",
    category: "Giày tây",
    tags: ["new"],
    price: 890000,
    originalPrice: 1200000,
    image: "https://cdn.test/a.jpg",
    images: ["https://cdn.test/a.jpg"],
    badge: ProductBadge.Sale,
    stock: 7,
    status: ProductStatus.Active,
    variants: [{ sku: "A-41", color: "Đen", colorHex: "#000", size: "41", stock: 7, _id: objectId }],
    description: "Mô tả",
    material: "Da bò",
    details: ["Bảo hành 12 tháng"],
    searchText: "giay da nam shopo",
    source: { provider: "shopee", productId: "123", fingerprint: "abc", importRunId: "run-1" },
    ...overrides
  };
}

describe("toProductListItem", () => {
  it("exposes id instead of _id and drops internal fields", () => {
    const item = toProductListItem(rawProduct());

    assert.equal(item.id, objectId.toString());
    assert.equal("_id" in item, false);
    assert.equal("__v" in item, false);
    assert.equal("source" in item, false);
    assert.equal("searchText" in item, false);
    assert.equal("description" in item, false);
  });

  it("keeps every field the storefront renders", () => {
    const item = toProductListItem(rawProduct());

    assert.equal(item.name, "Giày da nam");
    assert.equal(item.brand, "SHOPO");
    assert.equal(item.slug, "giay-da-nam");
    assert.equal(item.price, 890000);
    assert.equal(item.originalPrice, 1200000);
    assert.equal(item.badge, ProductBadge.Sale);
    assert.deepEqual(item.tags, ["new"]);
    assert.equal(item.variants.length, 1);
  });

  it("omits originalPrice entirely when the product is not discounted", () => {
    const item = toProductListItem(rawProduct({ originalPrice: undefined }));

    assert.equal("originalPrice" in item, false);
  });

  it("falls back to safe defaults for missing, null and malformed values", () => {
    const item = toProductListItem({ _id: objectId, price: "not-a-number", tags: null, images: "nope" });

    assert.equal(item.name, "");
    assert.equal(item.price, 0);
    assert.equal(item.stock, 0);
    assert.deepEqual(item.tags, []);
    assert.deepEqual(item.images, []);
    assert.deepEqual(item.variants, []);
  });

  it("returns an empty id when the document has neither _id nor id", () => {
    assert.equal(toProductListItem({ name: "x" }).id, "");
  });

  it("accepts a document that already uses id", () => {
    assert.equal(toProductListItem({ id: "abc", name: "x" }).id, "abc");
  });

  it("drops non-string entries from string arrays", () => {
    assert.deepEqual(toProductListItem({ _id: objectId, tags: ["new", 5, null, "sale"] }).tags, ["new", "sale"]);
  });

  it("projects exactly the fields the list response maps", () => {
    const projected = Object.keys(PRODUCT_LIST_PROJECTION);
    const mapped = Object.keys(toProductListItem(rawProduct())).filter((key) => key !== "id");

    assert.deepEqual([...mapped].sort(), [...projected].sort());
  });
});

describe("toVariantResponse", () => {
  it("drops the mongo subdocument id and import-only fields", () => {
    const variant = toVariantResponse({
      sku: "A-41",
      color: "Đen",
      colorHex: "#000",
      size: "41",
      stock: 2,
      _id: objectId,
      sourceVariantId: "v1",
      sourceLabel: "Đen,41"
    });

    assert.deepEqual(variant, { sku: "A-41", color: "Đen", colorHex: "#000", size: "41", stock: 2 });
  });

  it("keeps an optional per-variant image and price", () => {
    const variant = toVariantResponse({ sku: "a", color: "b", colorHex: "#fff", size: "1", stock: 0, price: 10, image: "https://cdn.test/v.jpg" });

    assert.equal(variant.price, 10);
    assert.equal(variant.image, "https://cdn.test/v.jpg");
  });

  it("defaults a malformed variant instead of throwing", () => {
    assert.deepEqual(toVariantResponse({}), { sku: "", color: "", colorHex: "", size: "", stock: 0 });
  });
});

describe("toProductDetail", () => {
  it("adds the description fields but still hides internals", () => {
    const detail = toProductDetail(rawProduct());

    assert.equal(detail.description, "Mô tả");
    assert.equal(detail.material, "Da bò");
    assert.deepEqual(detail.details, ["Bảo hành 12 tháng"]);
    assert.equal("source" in detail, false);
    assert.equal("searchText" in detail, false);
  });

  it("defaults a missing description to an empty string", () => {
    assert.equal(toProductDetail({ _id: objectId }).description, "");
  });
});

describe("toAdminProductResponse", () => {
  it("adds timestamps and a trimmed source block", () => {
    const createdAt = new Date("2026-01-02T03:04:05.000Z");
    const admin = toAdminProductResponse(rawProduct({ createdAt, updatedAt: createdAt }));

    assert.equal(admin.createdAt, createdAt.toISOString());
    assert.deepEqual(admin.source, { provider: "shopee", productId: "123" });
  });

  it("omits the source block for a product that was not imported", () => {
    const admin = toAdminProductResponse(rawProduct({ source: undefined }));

    assert.equal("source" in admin, false);
  });

  it("never leaks searchText or __v", () => {
    const admin = toAdminProductResponse(rawProduct());

    assert.equal("searchText" in admin, false);
    assert.equal("__v" in admin, false);
  });
});
