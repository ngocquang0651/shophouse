import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addColor,
  addSizes,
  cellKey,
  compareSizes,
  editorToVariants,
  emptyEditor,
  fillCells,
  getEditorTotal,
  getSizePresets,
  getSoldOutSizes,
  guessColorHex,
  looksLikeSize,
  makeSkuBase,
  removeColor,
  removeSize,
  setCell,
  shouldSuggestSwap,
  sortSizes,
  swapAxes,
  validateEditor,
  variantsToEditor
} from "@/lib/admin-variants";
import type { ProductVariant } from "@/types/product";

function variant(color: string, size: string, stock: number, extra: Partial<ProductVariant> = {}): ProductVariant {
  return { sku: `SKU-${color}-${size}`, color, colorHex: "#171717", size, stock, ...extra };
}

describe("sortSizes / compareSizes", () => {
  it("sorts numeric sizes numerically, not alphabetically", () => {
    assert.deepEqual(sortSizes(["40", "9", "100", "38"]), ["9", "38", "40", "100"]);
  });

  it("orders letter sizes logically and puts One size last", () => {
    assert.deepEqual(sortSizes(["One size", "XL", "S", "M", "L"]), ["S", "M", "L", "XL", "One size"]);
  });

  it("keeps labelled sizes next to their number and unknown text after numbers", () => {
    assert.deepEqual(sortSizes(["Đen", "39 nữ", "38-39", "40"]), ["38-39", "39 nữ", "40", "Đen"]);
  });

  it("does not mutate the input", () => {
    const input = ["40", "38"];
    sortSizes(input);
    assert.deepEqual(input, ["40", "38"]);
    assert.equal(compareSizes("38", "38"), 0);
  });
});

describe("variantsToEditor", () => {
  it("returns an empty editor for no variants", () => {
    assert.deepEqual(variantsToEditor(undefined), emptyEditor());
    assert.deepEqual(variantsToEditor([]), emptyEditor());
  });

  it("builds colours, sorted sizes and stock cells", () => {
    const editor = variantsToEditor([variant("Đen", "40", 2), variant("Đen", "38", 0), variant("Nâu", "38", 5)]);

    assert.deepEqual(editor.colors.map((color) => color.name), ["Đen", "Nâu"]);
    assert.deepEqual(editor.sizes, ["38", "40"]);
    assert.equal(editor.stocks[cellKey("Đen", "40")], "2");
    assert.equal(editor.stocks[cellKey("Đen", "38")], "0");
    assert.equal(editor.stocks[cellKey("Nâu", "40")], undefined);
  });
});

describe("addSizes / removeSize", () => {
  it("adds a default colour with the first sizes and de-duplicates case-insensitively", () => {
    const editor = addSizes(emptyEditor(), ["39", " 38 ", "39", "", "one SIZE", "One Size"]);

    assert.deepEqual(editor.sizes, ["38", "39", "one SIZE"]);
    assert.deepEqual(editor.colors.map((color) => color.name), ["Mặc định"]);
  });

  it("returns the same state when nothing new is added", () => {
    const editor = addSizes(emptyEditor(), ["39"]);
    assert.equal(addSizes(editor, ["39", "  "]), editor);
  });

  it("truncates very long size names", () => {
    const editor = addSizes(emptyEditor(), ["x".repeat(100)]);
    assert.equal(editor.sizes[0]?.length, 20);
  });

  it("removing a size drops its cells and original variants", () => {
    const editor = removeSize(variantsToEditor([variant("Đen", "38", 1), variant("Đen", "39", 2)]), "38");

    assert.deepEqual(editor.sizes, ["39"]);
    assert.equal(cellKey("Đen", "38") in editor.stocks, false);
    assert.equal(cellKey("Đen", "38") in editor.originals, false);
    assert.equal(cellKey("Đen", "39") in editor.originals, true);
  });
});

describe("addColor / removeColor", () => {
  it("adds a colour with a guessed hex and ignores blanks and duplicates", () => {
    let editor = addColor(emptyEditor(), "Đỏ");
    assert.deepEqual(editor.colors, [{ name: "Đỏ", hex: "#dc2626" }]);

    editor = addColor(editor, "  đỏ ");
    editor = addColor(editor, "   ");
    assert.equal(editor.colors.length, 1);
  });

  it("uses an explicit hex when given", () => {
    assert.equal(addColor(emptyEditor(), "Rêu", "#445544").colors[0]?.hex, "#445544");
  });

  it("removing a colour drops its cells", () => {
    const editor = removeColor(variantsToEditor([variant("Đen", "38", 1), variant("Nâu", "38", 2)]), "Đen");

    assert.deepEqual(editor.colors.map((color) => color.name), ["Nâu"]);
    assert.equal(cellKey("Đen", "38") in editor.stocks, false);
  });
});

describe("setCell / fillCells", () => {
  const base = addSizes(addColor(emptyEditor(), "Đen"), ["38", "39"]);

  it("sets a single cell without touching the others", () => {
    const editor = setCell(base, "Đen", "38", "4");
    assert.equal(editor.stocks[cellKey("Đen", "38")], "4");
    assert.equal(editor.stocks[cellKey("Đen", "39")], undefined);
  });

  it("fills only empty cells or every cell", () => {
    const partly = setCell(base, "Đen", "38", "9");
    assert.equal(fillCells(partly, "5", "empty").stocks[cellKey("Đen", "38")], "9");
    assert.equal(fillCells(partly, "5", "empty").stocks[cellKey("Đen", "39")], "5");
    assert.equal(fillCells(partly, "5", "all").stocks[cellKey("Đen", "38")], "5");
  });

  it("does not create cells for colours or sizes that do not exist", () => {
    assert.deepEqual(fillCells(emptyEditor(), "5", "all").stocks, {});
  });
});

describe("validateEditor / getEditorTotal", () => {
  const base = addSizes(emptyEditor(), ["38", "39", "40"]);

  it("requires at least one filled cell", () => {
    assert.equal(validateEditor(emptyEditor()).ok, false);
    assert.equal(validateEditor(base).ok, false);
  });

  it("accepts blanks (not sold) and zero (sold out)", () => {
    const editor = setCell(setCell(base, "Mặc định", "38", "0"), "Mặc định", "39", "5");
    assert.deepEqual(validateEditor(editor), { ok: true, invalidCells: [] });
  });

  it("flags decimals, negatives and text, and reports the cells", () => {
    for (const bad of ["1.5", "-2", "abc", "1,5"]) {
      const editor = setCell(setCell(base, "Mặc định", "38", "3"), "Mặc định", "40", bad);
      const result = validateEditor(editor);
      assert.equal(result.ok, false, `expected "${bad}" to fail`);
      assert.deepEqual(result.invalidCells, [cellKey("Mặc định", "40")]);
    }
  });

  it("totals valid cells and ignores blanks and invalid text", () => {
    let editor = setCell(base, "Mặc định", "38", "3");
    editor = setCell(editor, "Mặc định", "39", "1.290");
    editor = setCell(editor, "Mặc định", "40", "oops");
    assert.equal(getEditorTotal(editor), 1293);
  });
});

describe("editorToVariants", () => {
  it("keeps SKU, price and import ids of existing variants and only updates stock", () => {
    const original = variant("Đen", "39", 5, { price: 99000, sourceVariantId: "abc", sourceLabel: "Đen,39", image: "http://x/y.jpg" });
    const editor = setCell(variantsToEditor([original]), "Đen", "39", "12");

    assert.deepEqual(editorToVariants(editor, "BASE"), [{ ...original, stock: 12 }]);
  });

  it("creates new variants with readable, unique SKUs", () => {
    let editor = addSizes(addColor(emptyEditor(), "Xanh đen"), ["38", "39"]);
    editor = fillCells(editor, "2", "all");

    const variants = editorToVariants(editor, "GIAY-DA");
    assert.deepEqual(variants.map((item) => item.sku), ["GIAY-DA-XANH-DEN-38", "GIAY-DA-XANH-DEN-39"]);
    assert.deepEqual(variants.map((item) => item.stock), [2, 2]);
    assert.equal(variants[0]?.colorHex, "#1e3a8a");
  });

  it("avoids SKU collisions with existing variants", () => {
    const existing = variant("Đen", "38", 1, { sku: "BASE-DEN-39" });
    let editor = variantsToEditor([existing]);
    editor = addSizes(editor, ["39"]);
    editor = setCell(editor, "Đen", "39", "4");

    const skus = editorToVariants(editor, "BASE").map((item) => item.sku);
    assert.equal(new Set(skus).size, skus.length);
    assert.ok(skus.includes("BASE-DEN-39-2"));
  });

  it("skips blank cells (not sold) but keeps zero (sold out)", () => {
    let editor = addSizes(emptyEditor(), ["38", "39"]);
    editor = setCell(editor, "Mặc định", "38", "0");

    const variants = editorToVariants(editor, "B");
    assert.equal(variants.length, 1);
    assert.equal(variants[0]?.stock, 0);
  });

  it("returns nothing for an empty editor and skips invalid text", () => {
    assert.deepEqual(editorToVariants(emptyEditor(), "B"), []);
    const editor = setCell(addSizes(emptyEditor(), ["38"]), "Mặc định", "38", "abc");
    assert.deepEqual(editorToVariants(editor, "B"), []);
  });
});

describe("getSoldOutSizes", () => {
  it("lists sizes that are at zero across every colour", () => {
    const sold = getSoldOutSizes([
      variant("Đen", "39", 0),
      variant("Nâu", "39", 0),
      variant("Đen", "40", 0),
      variant("Nâu", "40", 3),
      variant("Đen", "38", 0)
    ]);

    assert.deepEqual(sold, ["38", "39"]);
  });

  it("handles missing and empty variants", () => {
    assert.deepEqual(getSoldOutSizes(undefined), []);
    assert.deepEqual(getSoldOutSizes([]), []);
  });
});

describe("guessColorHex / makeSkuBase / getSizePresets", () => {
  it("recognises Vietnamese colour names with or without diacritics", () => {
    assert.equal(guessColorHex("Đen"), "#171717");
    assert.equal(guessColorHex("trắng"), "#ffffff");
    assert.equal(guessColorHex("Xanh navy"), "#1e3a8a");
    assert.equal(guessColorHex("Nâu bò"), "#7c4a2d");
    assert.equal(guessColorHex("Màu lạ"), "#9ca3af");
    assert.equal(guessColorHex(""), "#9ca3af");
  });

  it("builds a short SKU base and falls back for unusable names", () => {
    assert.equal(makeSkuBase("Giày Đế Bằng Cao Cấp Nữ"), "GIAY-DE-BANG-CAO");
    assert.equal(makeSkuBase("!!!"), "SP");
    assert.equal(makeSkuBase(""), "SP");
  });

  it("offers size presets that match the product type and audience", () => {
    assert.deepEqual(getSizePresets("women", "shoes").map((preset) => preset.label), ["Giày nữ 35–40", "Một size"]);
    assert.deepEqual(getSizePresets("men", "shoes")[0]?.sizes, ["38", "39", "40", "41", "42", "43", "44"]);
    assert.deepEqual(getSizePresets("unisex", "shoes").length, 4);
    assert.deepEqual(getSizePresets(undefined, "belts")[0]?.sizes, ["90", "95", "100", "105", "110", "115"]);
    assert.deepEqual(getSizePresets(undefined, undefined), [{ label: "Một size", sizes: ["One size"] }]);
  });
});

describe("looksLikeSize / shouldSuggestSwap / swapAxes", () => {
  it("recognises size-like values", () => {
    for (const value of ["39", "38-39", "40 nam", "36 nữ", "7.5", " 42 "]) assert.equal(looksLikeSize(value), true, value);
    for (const value of ["Đen", "Xanh navy", "", "One size", "123456"]) assert.equal(looksLikeSize(value), false, value);
  });

  it("suggests a swap only when colours look like sizes and sizes do not", () => {
    const swapped = variantsToEditor([variant("36", "One size", 1), variant("37", "One size", 2), variant("Đen", "One size", 3)]);
    assert.equal(shouldSuggestSwap(swapped), true);
    assert.equal(shouldSuggestSwap(variantsToEditor([variant("Đen", "39", 1), variant("Nâu", "40", 1)])), false);
    assert.equal(shouldSuggestSwap(variantsToEditor([variant("39", "40", 1)])), false);
    assert.equal(shouldSuggestSwap(emptyEditor()), false);
  });

  it("swaps colour and size while keeping SKU, import id and stock", () => {
    const original = variant("37", "One size", 4, { sourceVariantId: "v1" });
    const swapped = swapAxes(variantsToEditor([original, variant("38", "One size", 0)]));

    assert.deepEqual(swapped.sizes, ["37", "38"]);
    assert.deepEqual(swapped.colors.map((color) => color.name), ["One size"]);
    assert.equal(swapped.stocks[cellKey("One size", "37")], "4");

    const variants = editorToVariants(swapped, "B");
    assert.deepEqual(variants.map((item) => [item.color, item.size, item.stock]), [["One size", "37", 4], ["One size", "38", 0]]);
    assert.equal(variants[0]?.sku, original.sku);
    assert.equal(variants[0]?.sourceVariantId, "v1");
  });

  it("swapping twice restores the original layout", () => {
    const start = variantsToEditor([variant("Đen", "39", 1), variant("Nâu", "40", 2)]);
    const back = swapAxes(swapAxes(start));

    assert.deepEqual(back.sizes, start.sizes);
    assert.deepEqual(back.colors.map((color) => color.name), start.colors.map((color) => color.name));
    assert.deepEqual(back.stocks, start.stocks);
  });
});
