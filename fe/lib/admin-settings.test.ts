import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_LOW_STOCK_THRESHOLD, MAX_LOW_STOCK_THRESHOLD, clampLowStockThreshold } from "@/lib/admin-settings";

describe("clampLowStockThreshold", () => {
  it("keeps valid whole numbers", () => {
    assert.equal(clampLowStockThreshold(5), 5);
    assert.equal(clampLowStockThreshold(1), 1);
    assert.equal(clampLowStockThreshold(MAX_LOW_STOCK_THRESHOLD), MAX_LOW_STOCK_THRESHOLD);
  });

  it("clamps out-of-range values and rounds down decimals", () => {
    assert.equal(clampLowStockThreshold(0), 1);
    assert.equal(clampLowStockThreshold(-4), 1);
    assert.equal(clampLowStockThreshold(5000), MAX_LOW_STOCK_THRESHOLD);
    assert.equal(clampLowStockThreshold(4.9), 4);
  });

  it("falls back to the default for NaN and infinity", () => {
    assert.equal(clampLowStockThreshold(Number.NaN), DEFAULT_LOW_STOCK_THRESHOLD);
    assert.equal(clampLowStockThreshold(Number.POSITIVE_INFINITY), DEFAULT_LOW_STOCK_THRESHOLD);
  });
});
