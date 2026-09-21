import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickFeatured } from "@/lib/home-products";
import type { Product, ProductTag } from "@/types/product";

function product(id: string, tags?: ProductTag[]): Product {
  return { id, brand: "SHOPO", name: `Product ${id}`, category: "Giày", price: 100000, badge: "New", image: "/x.jpg", tags };
}

const ids = (list: Product[]) => list.map((item) => item.id);

describe("pickFeatured", () => {
  it("returns nothing for an empty catalogue", () => {
    assert.deepEqual(pickFeatured([], "new"), []);
  });

  it("puts tagged products first, keeping catalogue order inside each group", () => {
    const list = [product("a"), product("b", ["new"]), product("c"), product("d", ["new"])];
    assert.deepEqual(ids(pickFeatured(list, "new", 4)), ["b", "d", "a", "c"]);
  });

  it("fills with untagged products when too few are tagged, so the grid is never short", () => {
    const list = [product("a"), product("b"), product("c", ["bestseller"])];
    assert.deepEqual(ids(pickFeatured(list, "bestseller", 3)), ["c", "a", "b"]);
  });

  it("caps the result at the requested count", () => {
    const list = Array.from({ length: 20 }, (_, index) => product(String(index), ["new"]));
    assert.equal(pickFeatured(list, "new", 8).length, 8);
    assert.equal(pickFeatured(list, "new").length, 8);
  });

  it("returns fewer than count when the catalogue is smaller", () => {
    assert.equal(pickFeatured([product("a"), product("b")], "new", 8).length, 2);
  });

  it("skips ids already shown in another section", () => {
    const list = [product("a", ["new"]), product("b", ["new"]), product("c")];
    assert.deepEqual(ids(pickFeatured(list, "new", 3, new Set(["a"]))), ["b", "c"]);
  });

  it("never returns the same id twice, even if the source has duplicates", () => {
    const list = [product("a", ["new"]), product("a", ["new"]), product("b")];
    assert.deepEqual(ids(pickFeatured(list, "new", 5)), ["a", "b"]);
  });

  it("returns nothing for zero, negative or non-finite counts", () => {
    const list = [product("a", ["new"])];
    assert.deepEqual(pickFeatured(list, "new", 0), []);
    assert.deepEqual(pickFeatured(list, "new", -3), []);
    assert.deepEqual(pickFeatured(list, "new", Number.NaN), []);
  });

  it("does not mutate its input", () => {
    const list = [product("a"), product("b", ["new"])];
    const snapshot = ids(list);
    pickFeatured(list, "new");
    assert.deepEqual(ids(list), snapshot);
  });
});
