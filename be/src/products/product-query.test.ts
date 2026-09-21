import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductStatus } from "../common/enums/product-status.enum";
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  buildAdminFilter,
  buildAdminSort,
  buildDiacriticInsensitivePattern,
  clampLowStockThreshold,
  escapeRegex,
  parseAdminListQuery,
  stripDiacritics
} from "./product-query";

function matches(query: string, text: string) {
  return new RegExp(buildDiacriticInsensitivePattern(query), "i").test(text);
}

describe("stripDiacritics / escapeRegex", () => {
  it("removes Vietnamese diacritics and lowercases", () => {
    assert.equal(stripDiacritics("Giày ĐEN Nữ"), "giay den nu");
    assert.equal(stripDiacritics(""), "");
  });

  it("escapes regex metacharacters", () => {
    assert.equal(escapeRegex("a.b*c(d)"), "a\\.b\\*c\\(d\\)");
  });
});

describe("buildDiacriticInsensitivePattern", () => {
  it("matches with or without diacritics, in either case", () => {
    assert.ok(matches("giay", "Giày Nam Cao Cấp"));
    assert.ok(matches("giày", "Giày Nam"));
    assert.ok(matches("GIAY", "giày"));
    assert.ok(matches("den", "Đen"));
    assert.ok(matches("đen", "Đen"));
    assert.ok(matches("duong", "Dép Đường Phố"));
  });

  it("does not match unrelated text", () => {
    assert.equal(matches("sandal", "Giày Nam"), false);
    assert.equal(matches("giay", "Dây lưng"), false);
  });

  it("treats regex metacharacters literally", () => {
    assert.ok(matches("a.b", "a.b"));
    assert.equal(matches("a.b", "axb"), false);
    assert.doesNotThrow(() => buildDiacriticInsensitivePattern("(((["));
  });
});

describe("parseAdminListQuery", () => {
  it("applies safe defaults for an empty query", () => {
    assert.deepEqual(parseAdminListQuery({}), {
      q: "",
      category: "",
      badge: "",
      status: "",
      stock: "",
      sort: "newest",
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD
    });
  });

  it("accepts valid values", () => {
    const parsed = parseAdminListQuery({
      q: "  giày  ",
      status: "inactive",
      stock: "low",
      sort: "price-desc",
      page: "3",
      pageSize: "50",
      lowStockThreshold: "5",
      category: "Giày Nam",
      badge: "Sale"
    });

    assert.equal(parsed.q, "giày");
    assert.equal(parsed.status, "inactive");
    assert.equal(parsed.stock, "low");
    assert.equal(parsed.sort, "price-desc");
    assert.equal(parsed.page, 3);
    assert.equal(parsed.pageSize, 50);
    assert.equal(parsed.lowStockThreshold, 5);
  });

  it("falls back for malformed, negative, decimal and unexpected values", () => {
    const parsed = parseAdminListQuery({
      status: "deleted",
      stock: "lots",
      sort: "random",
      page: "-2",
      pageSize: "0",
      lowStockThreshold: "abc"
    });

    assert.equal(parsed.status, "");
    assert.equal(parsed.stock, "");
    assert.equal(parsed.sort, "newest");
    assert.equal(parsed.page, 1);
    assert.equal(parsed.pageSize, DEFAULT_PAGE_SIZE);
    assert.equal(parsed.lowStockThreshold, DEFAULT_LOW_STOCK_THRESHOLD);
    assert.equal(parseAdminListQuery({ page: "2.5" }).page, 1);
    assert.equal(parseAdminListQuery({ sort: "stock-desc" }).sort, "stock-desc");
  });

  it("caps page size, query length, and repeated parameters", () => {
    assert.equal(parseAdminListQuery({ pageSize: "100000" }).pageSize, MAX_PAGE_SIZE);
    assert.equal(parseAdminListQuery({ q: "x".repeat(500) }).q.length, 100);
    assert.equal(parseAdminListQuery({ status: ["active", "inactive"] }).status, "active");
  });
});

describe("clampLowStockThreshold", () => {
  it("keeps the threshold between 1 and 100", () => {
    assert.equal(clampLowStockThreshold(undefined), DEFAULT_LOW_STOCK_THRESHOLD);
    assert.equal(clampLowStockThreshold(0), 1);
    assert.equal(clampLowStockThreshold(-5), 1);
    assert.equal(clampLowStockThreshold(7), 7);
    assert.equal(clampLowStockThreshold(9999), 100);
  });
});

describe("buildAdminFilter", () => {
  const base = parseAdminListQuery({});

  it("is empty when nothing is filtered, so inactive products are included", () => {
    assert.deepEqual(buildAdminFilter(base), {});
  });

  it("filters by exact category, badge and status", () => {
    const filter = buildAdminFilter({ ...base, category: "Giày Nam", badge: "Sale", status: ProductStatus.Inactive });
    assert.equal(filter.category, "Giày Nam");
    assert.equal(filter.badge, "Sale");
    assert.equal(filter.status, "inactive");
  });

  it("uses the threshold for low stock and zero for out of stock", () => {
    assert.deepEqual(buildAdminFilter({ ...base, stock: "low", lowStockThreshold: 5 }).stock, { $gt: 0, $lte: 5 });
    assert.deepEqual(buildAdminFilter({ ...base, stock: "out" }).stock, { $lte: 0 });
  });

  it("searches name, brand and variant SKU, and also the id when it looks like one", () => {
    const text = buildAdminFilter({ ...base, q: "coach" });
    assert.equal(text.$or?.length, 3);

    const withId = buildAdminFilter({ ...base, q: "6a381f03993831690c52b99c" });
    assert.equal(withId.$or?.length, 4);
  });
});

describe("buildAdminSort", () => {
  it("always adds _id as a tie-breaker for stable pagination", () => {
    for (const key of ["newest", "name", "price-asc", "price-desc", "stock-asc", "stock-desc"] as const) {
      assert.ok("_id" in buildAdminSort(key));
    }
  });

  it("orders by the requested field and direction", () => {
    assert.deepEqual(buildAdminSort("price-desc"), { price: -1, _id: 1 });
    assert.deepEqual(buildAdminSort("stock-asc"), { stock: 1, _id: 1 });
    assert.deepEqual(buildAdminSort("stock-desc"), { stock: -1, _id: 1 });
    assert.deepEqual(buildAdminSort("newest"), { createdAt: -1, _id: -1 });
  });
});
