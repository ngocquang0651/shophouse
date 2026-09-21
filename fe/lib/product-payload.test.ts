import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCreatePayload, buildUpdatePayload, type ProductWriteValues } from "@/lib/product-payload";

function values(overrides: Partial<ProductWriteValues> = {}): ProductWriteValues {
  return {
    name: "Giày",
    brand: "Nike",
    category: "Giày Nam",
    audience: "men",
    productType: "shoes",
    price: 500_000,
    badge: "Limited",
    image: "https://example.com/a.jpg",
    images: ["https://example.com/a.jpg"],
    description: "",
    stock: 5,
    status: "active",
    ...overrides
  };
}

describe("buildCreatePayload", () => {
  it("converts the storefront Limited badge back to the API Luxury badge", () => {
    assert.equal(buildCreatePayload(values()).badge, "Luxury");
  });

  it("omits originalPrice when there is no discount", () => {
    assert.equal("originalPrice" in buildCreatePayload(values()), false);
    assert.equal("originalPrice" in buildCreatePayload(values({ originalPrice: 0 })), false);
    assert.equal(buildCreatePayload(values({ originalPrice: 800_000 })).originalPrice, 800_000);
  });

  it("only sends fields the API accepts", () => {
    const risky = { ...values(), media: [{ url: "x" }], tags: ["sale"], source: { provider: "shopee" }, slug: "x" } as ProductWriteValues;
    const payload = buildCreatePayload(risky);

    for (const key of ["media", "tags", "source", "slug", "id", "createdAt"]) {
      assert.equal(key in payload, false, `${key} must not be sent`);
    }
  });

  it("defaults missing description, stock, status and variants", () => {
    const payload = buildCreatePayload(values({ description: undefined, stock: undefined, status: undefined, variants: undefined }));
    assert.deepEqual([payload.description, payload.stock, payload.status, payload.variants], ["", 0, "active", []]);
  });
});

describe("buildUpdatePayload", () => {
  it("sends originalPrice null when the discount is cleared", () => {
    assert.equal(buildUpdatePayload(values()).originalPrice, null);
    assert.equal(buildUpdatePayload(values({ originalPrice: undefined })).originalPrice, null);
    assert.equal(buildUpdatePayload(values({ originalPrice: 900_000 })).originalPrice, 900_000);
  });

  it("keeps import metadata on variants but drops unknown properties and empty values", () => {
    const payload = buildUpdatePayload(
      values({
        variants: [
          {
            sku: "A",
            color: "Đen",
            colorHex: "#000",
            size: "39",
            stock: 2,
            sourceVariantId: "123",
            sourceLabel: "Đen,39",
            image: "",
            gtin: undefined,
            ...({ _id: "abc", extra: true } as object)
          }
        ]
      })
    );

    assert.deepEqual(payload.variants, [
      { sku: "A", color: "Đen", colorHex: "#000", size: "39", stock: 2, sourceVariantId: "123", sourceLabel: "Đen,39" }
    ]);
  });

  it("keeps a variant price of zero", () => {
    const payload = buildUpdatePayload(values({ variants: [{ sku: "A", color: "c", colorHex: "#000", size: "s", stock: 0, price: 0 }] }));
    assert.equal(payload.variants[0]?.price, 0);
  });
});
