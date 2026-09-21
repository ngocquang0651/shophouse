import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildErrorSummary, fieldIds } from "@/lib/form-errors";

describe("buildErrorSummary", () => {
  it("returns nothing when there are no errors", () => {
    assert.deepEqual(buildErrorSummary({}), []);
    assert.deepEqual(buildErrorSummary({ name: undefined, price: "" }), []);
  });

  it("orders entries as the fields appear in the form, whatever order errors were added", () => {
    const items = buildErrorSummary({ stock: "c", name: "a", price: "b" });
    assert.deepEqual(items.map((item) => item.key), ["name", "price", "stock"]);
  });

  it("points each entry at the element that receives focus", () => {
    const [item] = buildErrorSummary({ editor: "Nhập số lượng." });
    assert.equal(item?.targetId, "product-variants");
    assert.equal(item?.message, "Nhập số lượng.");
  });

  it("ignores fields that are not part of the summary and trims whitespace-only messages", () => {
    assert.deepEqual(buildErrorSummary({ unknown: "x", name: "   " }), []);
  });

  it("maps every summarised field to a distinct id", () => {
    const ids = Object.values(fieldIds);
    assert.equal(new Set(ids).size, ids.length);
  });
});
