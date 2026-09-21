import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultFilters,
  getAriaSort,
  getDiscountPercent,
  getNextSort,
  getProductStatus,
  getStockLabel,
  getStockLevel,
  hasVariantStock,
  parseAdminFilters,
  parseWholeNumber,
  serializeAdminFilters,
  sortKeys,
  type AdminFilters
} from "@/lib/admin-products";
import type { Product } from "@/types/product";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    brand: "Nike",
    name: "Giày chạy bộ",
    category: "Giày Nam",
    price: 1_000_000,
    badge: "New",
    image: "https://example.com/a.jpg",
    stock: 10,
    status: "active",
    ...overrides
  };
}

function filters(overrides: Partial<AdminFilters> = {}): AdminFilters {
  return { ...defaultFilters, ...overrides };
}

describe("parseWholeNumber", () => {
  it("parses plain digits and Vietnamese thousands separators", () => {
    assert.equal(parseWholeNumber("1290000"), 1_290_000);
    assert.equal(parseWholeNumber("1.290.000"), 1_290_000);
    assert.equal(parseWholeNumber(" 0 "), 0);
  });

  it("rejects empty, decimal, negative, misplaced-separator and non-numeric input", () => {
    for (const value of ["", "  ", "1,5", "1.5", "-3", "12.34", "abc", "1e3", "1..000", "٣"]) {
      assert.equal(parseWholeNumber(value), null, `expected null for "${value}"`);
    }
  });
});

describe("getStockLevel / getStockLabel", () => {
  it("treats 0, negative, undefined and NaN as out of stock", () => {
    for (const value of [0, -5, undefined, Number.NaN]) {
      assert.equal(getStockLevel(value), "out");
      assert.equal(getStockLabel(value), "Hết hàng");
    }
  });

  it("flags low stock from 1 up to the threshold", () => {
    assert.equal(getStockLevel(1), "low");
    assert.equal(getStockLevel(3), "low");
    assert.equal(getStockLabel(2), "Sắp hết · còn 2");
  });

  it("reports ok above the threshold", () => {
    assert.equal(getStockLevel(4), "ok");
    assert.equal(getStockLabel(12), "Còn 12");
  });

  it("honours a custom threshold", () => {
    assert.equal(getStockLevel(8, 10), "low");
    assert.equal(getStockLevel(11, 10), "ok");
    assert.equal(getStockLabel(8, 10), "Sắp hết · còn 8");
    assert.equal(getStockLevel(0, 10), "out");
  });
});

describe("getProductStatus / hasVariantStock", () => {
  it("defaults a missing status to active", () => {
    assert.equal(getProductStatus(makeProduct({ status: undefined })), "active");
    assert.equal(getProductStatus(makeProduct({ status: "inactive" })), "inactive");
  });

  it("detects stock tracked per variant", () => {
    const variant = { sku: "A", color: "Đen", colorHex: "#000", size: "39", stock: 1 };
    assert.equal(hasVariantStock(makeProduct({ variants: [variant] })), true);
    assert.equal(hasVariantStock(makeProduct({ variants: [] })), false);
    assert.equal(hasVariantStock(makeProduct({ variants: undefined })), false);
  });
});

describe("getDiscountPercent", () => {
  it("returns a rounded percentage for a real discount", () => {
    assert.equal(getDiscountPercent(700_000, 1_000_000), 30);
    assert.equal(getDiscountPercent(666_667, 1_000_000), 33);
  });

  it("returns null when there is no discount or input is invalid", () => {
    assert.equal(getDiscountPercent(1_000_000, undefined), null);
    assert.equal(getDiscountPercent(1_000_000, 1_000_000), null);
    assert.equal(getDiscountPercent(1_200_000, 1_000_000), null);
    assert.equal(getDiscountPercent(0, 1_000_000), null);
    assert.equal(getDiscountPercent(Number.NaN, 1_000_000), null);
    assert.equal(getDiscountPercent(100, Number.NaN), null);
  });
});

describe("parseAdminFilters / serializeAdminFilters", () => {
  it("returns defaults for an empty query string", () => {
    assert.deepEqual(parseAdminFilters(new URLSearchParams("")), defaultFilters);
  });

  it("round-trips a full set of filters", () => {
    const full = filters({
      query: "giày",
      category: "Giày Nam",
      badge: "Sale",
      status: "inactive",
      stock: "low",
      sort: "price-desc",
      page: 3
    });

    assert.deepEqual(parseAdminFilters(new URLSearchParams(serializeAdminFilters(full))), full);
  });

  it("omits default values from the query string", () => {
    assert.equal(serializeAdminFilters(defaultFilters), "");
    assert.equal(serializeAdminFilters(filters({ query: "  " })), "");
  });

  it("ignores malformed or unexpected values", () => {
    const parsed = parseAdminFilters(
      new URLSearchParams("badge=Hacked&status=deleted&stock=lots&sort=random&page=-2")
    );
    assert.deepEqual(parsed, defaultFilters);
    assert.equal(parseAdminFilters(new URLSearchParams("page=abc")).page, 1);
    assert.equal(parseAdminFilters(new URLSearchParams("page=2.5")).page, 1);
  });

  it("caps very long search queries", () => {
    const parsed = parseAdminFilters(new URLSearchParams({ q: "x".repeat(500) }));
    assert.equal(parsed.query.length, 100);
  });
});

describe("getNextSort / getAriaSort", () => {
  it("flips price and stock between ascending and descending", () => {
    assert.equal(getNextSort("newest", "price"), "price-asc");
    assert.equal(getNextSort("price-asc", "price"), "price-desc");
    assert.equal(getNextSort("price-desc", "price"), "price-asc");
    assert.equal(getNextSort("newest", "stock"), "stock-asc");
    assert.equal(getNextSort("stock-asc", "stock"), "stock-desc");
    assert.equal(getNextSort("stock-desc", "stock"), "stock-asc");
  });

  it("starts a new column ascending regardless of the current sort", () => {
    assert.equal(getNextSort("stock-desc", "price"), "price-asc");
    assert.equal(getNextSort("price-desc", "stock"), "stock-asc");
    assert.equal(getNextSort("price-asc", "name"), "name");
  });

  it("toggles name on and off", () => {
    assert.equal(getNextSort("name", "name"), "newest");
  });

  it("reports the sort state of each column for assistive technology", () => {
    assert.equal(getAriaSort("price-asc", "price"), "ascending");
    assert.equal(getAriaSort("price-desc", "price"), "descending");
    assert.equal(getAriaSort("stock-desc", "stock"), "descending");
    assert.equal(getAriaSort("name", "name"), "ascending");
    assert.equal(getAriaSort("price-asc", "stock"), "none");
    assert.equal(getAriaSort("newest", "name"), "none");
  });

  it("only produces sort keys the API understands", () => {
    for (const current of sortKeys) {
      for (const column of ["name", "price", "stock"] as const) {
        assert.ok((sortKeys as readonly string[]).includes(getNextSort(current, column)));
      }
    }
  });

  it("accepts stock-desc from the URL", () => {
    assert.equal(parseAdminFilters(new URLSearchParams("sort=stock-desc")).sort, "stock-desc");
  });
});
