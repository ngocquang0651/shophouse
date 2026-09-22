import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductStatus } from "../common/enums/product-status.enum";
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PUBLIC_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  buildAdminFilter,
  buildAdminSort,
  buildDiacriticInsensitivePattern,
  buildFallbackSearchFilter,
  buildSearchText,
  buildTextSearchFilter,
  clampLowStockThreshold,
  escapeRegex,
  isPaginated,
  normalizeSearchTerm,
  parseAdminListQuery,
  parsePublicListQuery,
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

describe("normalizeSearchTerm", () => {
  it("returns an empty string for missing, empty and whitespace-only input", () => {
    assert.equal(normalizeSearchTerm(undefined), "");
    assert.equal(normalizeSearchTerm(""), "");
    assert.equal(normalizeSearchTerm("   "), "");
  });

  it("trims and caps the term at the maximum length", () => {
    assert.equal(normalizeSearchTerm("  giay  "), "giay");
    assert.equal(normalizeSearchTerm("a".repeat(MAX_SEARCH_LENGTH + 50)).length, MAX_SEARCH_LENGTH);
  });
});

describe("buildSearchText", () => {
  it("joins the searchable fields, lowercased and without diacritics", () => {
    assert.equal(
      buildSearchText({ name: "Giày Đen", brand: "SHOPO", category: "Giày tây", tags: ["Sale"] }),
      "giay den shopo giay tay sale"
    );
  });

  it("skips missing parts and collapses the gaps they leave", () => {
    assert.equal(buildSearchText({ name: "Giày" }), "giay");
    assert.equal(buildSearchText({ name: "Giày", category: "Tây" }), "giay tay");
  });

  it("returns an empty string for an empty product", () => {
    assert.equal(buildSearchText({}), "");
    assert.equal(buildSearchText({ tags: [] }), "");
  });

  it("collapses repeated whitespace", () => {
    assert.equal(buildSearchText({ name: "Giày   da    nam" }), "giay da nam");
  });
});

describe("buildTextSearchFilter", () => {
  it("searches the text index with the normalized term", () => {
    assert.deepEqual(buildTextSearchFilter("Giày Đen"), { $text: { $search: "giay den" } });
  });
});

describe("buildFallbackSearchFilter", () => {
  it("matches the normalized text, plus name and brand for un-backfilled products", () => {
    const filter = buildFallbackSearchFilter("giay");
    const conditions = filter.$or as Array<Record<string, RegExp>>;

    assert.equal(conditions.length, 3);
    assert.ok(conditions[0].searchText.test("giay da nam"));
    assert.ok(conditions[1].name.test("Giày da nam"));
    assert.ok(conditions[2].brand.test("GIAY VIET"));
  });

  it("matches a partial word, which the text index cannot", () => {
    const pattern = (buildFallbackSearchFilter("iayd").$or as Array<{ searchText: RegExp }>)[0].searchText;

    assert.ok(pattern.test("giayda nam"));
  });

  it("escapes metacharacters in every branch", () => {
    const conditions = buildFallbackSearchFilter("(a+)+$").$or as Array<Record<string, RegExp>>;

    assert.equal(conditions[0].searchText.test("aaaaaaaaaaaaaaaa"), false);
    assert.ok(conditions[0].searchText.test("x (a+)+$ y"));
  });
});

describe("parsePublicListQuery", () => {
  it("leaves pagination off when neither page nor pageSize is given", () => {
    const query = parsePublicListQuery({});

    assert.equal(query.page, undefined);
    assert.equal(query.pageSize, undefined);
    assert.equal(isPaginated(query), false);
  });

  it("turns pagination on when only page is given", () => {
    const query = parsePublicListQuery({ page: "3" });

    assert.equal(query.page, 3);
    assert.equal(query.pageSize, DEFAULT_PUBLIC_PAGE_SIZE);
    assert.equal(isPaginated(query), true);
  });

  it("turns pagination on when only pageSize is given", () => {
    const query = parsePublicListQuery({ pageSize: "10" });

    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 10);
  });

  it("caps pageSize and floors page at 1", () => {
    assert.equal(parsePublicListQuery({ pageSize: "5000" }).pageSize, MAX_PAGE_SIZE);
    assert.equal(parsePublicListQuery({ page: "0" }).page, 1);
    assert.equal(parsePublicListQuery({ page: "-4" }).page, 1);
  });

  it("falls back to defaults for malformed pagination values", () => {
    assert.equal(parsePublicListQuery({ page: "abc" }).page, undefined);
    assert.equal(parsePublicListQuery({ pageSize: "1.5" }).pageSize, undefined);
    assert.equal(parsePublicListQuery({ pageSize: "0" }).pageSize, DEFAULT_PUBLIC_PAGE_SIZE);
  });

  it("reads the search term from q or search and trims it", () => {
    assert.equal(parsePublicListQuery({ q: "  giay  " }).search, "giay");
    assert.equal(parsePublicListQuery({ search: " dep " }).search, "dep");
  });

  it("prefers q when both are present", () => {
    assert.equal(parsePublicListQuery({ q: "giay", search: "dep" }).search, "giay");
  });

  it("takes the first value when a parameter repeats", () => {
    assert.equal(parsePublicListQuery({ category: ["A", "B"] }).category, "A");
  });

  it("defaults every filter to an empty string", () => {
    const query = parsePublicListQuery({});

    assert.deepEqual(
      { ...query },
      { search: "", category: "", badge: "", audience: "", type: "", tag: "" }
    );
  });
});
