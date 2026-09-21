import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  apiBadgeOptions,
  audienceLabels,
  badgeLabels,
  productTypeLabels,
  statusLabels,
  toApiBadge
} from "@/lib/admin-labels";
import { audiences, productTypes, type ProductBadge } from "@/types/product";

describe("toApiBadge", () => {
  it("maps the storefront Limited badge back to the API Luxury badge", () => {
    assert.equal(toApiBadge("Limited"), "Luxury");
    assert.equal(toApiBadge("Luxury"), "Luxury");
  });

  it("keeps New and Sale unchanged", () => {
    assert.equal(toApiBadge("New"), "New");
    assert.equal(toApiBadge("Sale"), "Sale");
  });

  it("falls back to New for badges the API cannot store", () => {
    assert.equal(toApiBadge("Bestseller"), "New");
  });

  it("only ever returns values the API accepts", () => {
    const allBadges: ProductBadge[] = ["New", "Sale", "Bestseller", "Limited", "Luxury"];
    for (const badge of allBadges) {
      assert.ok(apiBadgeOptions.includes(toApiBadge(badge)));
    }
  });
});

describe("label maps", () => {
  it("cover every status, audience, product type and badge", () => {
    assert.deepEqual(Object.keys(statusLabels).sort(), ["active", "inactive"]);
    assert.deepEqual(Object.keys(audienceLabels).sort(), [...audiences].sort());
    assert.deepEqual(Object.keys(productTypeLabels).sort(), [...productTypes].sort());
    assert.deepEqual(Object.keys(badgeLabels).sort(), ["Bestseller", "Limited", "Luxury", "New", "Sale"]);
  });

  it("use non-empty Vietnamese text", () => {
    const all = [statusLabels, audienceLabels, productTypeLabels, badgeLabels].flatMap((map) => Object.values(map));
    for (const label of all) {
      assert.ok(label.trim().length > 0);
    }
  });
});
