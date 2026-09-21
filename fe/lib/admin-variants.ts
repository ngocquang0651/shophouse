import { parseWholeNumber } from "@/lib/admin-products";
import type { Audience, ProductType, ProductVariant } from "@/types/product";

export type ColorOption = { name: string; hex: string };

export type VariantEditorState = {
  colors: ColorOption[];
  sizes: string[];
  /** Stock text per colour/size cell. Empty text means "this combination is not sold". */
  stocks: Record<string, string>;
  /** Existing variants by cell, so SKU, price, image and import ids survive edits. */
  originals: Record<string, ProductVariant>;
};

export type SizePreset = { label: string; sizes: string[] };

export type EditorValidation = {
  ok: boolean;
  /** Cells whose stock text is not a whole number, keyed by `cellKey`. */
  invalidCells: string[];
  message?: string;
};

export const DEFAULT_COLOR: ColorOption = { name: "Mặc định", hex: "#171717" };
export const MAX_SIZE_LENGTH = 20;
export const MAX_VARIANTS = 200;

const letterSizeOrder = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];

export function cellKey(color: string, size: string) {
  return `${color}\u0000${size}`;
}

function cleanLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_SIZE_LENGTH);
}

function sizeRank(size: string): [number, number, string] {
  const lower = size.toLowerCase();
  if (lower === "one size" || lower === "freesize") return [3, 0, lower];

  const numeric = lower.match(/^\d+(?:[.,]\d+)?/);
  if (numeric) return [0, Number(numeric[0].replace(",", ".")), lower];

  const letterIndex = letterSizeOrder.indexOf(lower);
  if (letterIndex >= 0) return [1, letterIndex, lower];

  return [2, 0, lower];
}

export function compareSizes(a: string, b: string) {
  const [groupA, valueA, textA] = sizeRank(a);
  const [groupB, valueB, textB] = sizeRank(b);
  if (groupA !== groupB) return groupA - groupB;
  if (valueA !== valueB) return valueA - valueB;
  return textA.localeCompare(textB, "vi");
}

export function sortSizes(sizes: string[]) {
  return [...sizes].sort(compareSizes);
}

export function emptyEditor(): VariantEditorState {
  return { colors: [], sizes: [], stocks: {}, originals: {} };
}

export function variantsToEditor(variants: ProductVariant[] | undefined): VariantEditorState {
  const state = emptyEditor();
  const sizes = new Set<string>();

  for (const variant of variants ?? []) {
    if (!state.colors.some((color) => color.name === variant.color)) {
      state.colors.push({ name: variant.color, hex: variant.colorHex });
    }
    sizes.add(variant.size);

    const key = cellKey(variant.color, variant.size);
    state.stocks[key] = String(variant.stock);
    state.originals[key] = variant;
  }

  state.sizes = sortSizes(Array.from(sizes));
  return state;
}

export function addSizes(state: VariantEditorState, input: string[]): VariantEditorState {
  const existing = new Set(state.sizes.map((size) => size.toLowerCase()));
  const added: string[] = [];

  for (const raw of input) {
    const size = cleanLabel(raw);
    if (size && !existing.has(size.toLowerCase())) {
      existing.add(size.toLowerCase());
      added.push(size);
    }
  }

  if (!added.length) {
    return state;
  }

  return {
    ...state,
    colors: state.colors.length ? state.colors : [DEFAULT_COLOR],
    sizes: sortSizes([...state.sizes, ...added])
  };
}

function withoutCells<T>(record: Record<string, T>, predicate: (color: string, size: string) => boolean): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => {
      const [color = "", size = ""] = key.split("\u0000");
      return !predicate(color, size);
    })
  );
}

export function removeSize(state: VariantEditorState, size: string): VariantEditorState {
  return {
    ...state,
    sizes: state.sizes.filter((item) => item !== size),
    stocks: withoutCells(state.stocks, (_color, cellSize) => cellSize === size),
    originals: withoutCells(state.originals, (_color, cellSize) => cellSize === size)
  };
}

export function addColor(state: VariantEditorState, name: string, hex?: string): VariantEditorState {
  const cleaned = cleanLabel(name);
  if (!cleaned || state.colors.some((color) => color.name.toLowerCase() === cleaned.toLowerCase())) {
    return state;
  }

  return { ...state, colors: [...state.colors, { name: cleaned, hex: hex || guessColorHex(cleaned) }] };
}

export function removeColor(state: VariantEditorState, name: string): VariantEditorState {
  return {
    ...state,
    colors: state.colors.filter((color) => color.name !== name),
    stocks: withoutCells(state.stocks, (color) => color === name),
    originals: withoutCells(state.originals, (color) => color === name)
  };
}

const sizeLikePattern = /^\d{1,3}(?:[.,]\d)?(?:\s*[-–]\s*\d{1,3})?(?:\s*(?:nam|nữ|nu|kids|bé))?$/i;

/** True for values such as "39", "38-39" or "40 nam", which are sizes rather than colours. */
export function looksLikeSize(value: string) {
  return sizeLikePattern.test(value.trim());
}

/**
 * Imported products sometimes store the size in the colour field. Suggest swapping
 * when most colours look like sizes and no size does.
 */
export function shouldSuggestSwap(state: VariantEditorState) {
  if (!state.colors.length || !state.sizes.length) return false;
  const sizeLikeColors = state.colors.filter((color) => looksLikeSize(color.name)).length;
  return sizeLikeColors * 2 >= state.colors.length && !state.sizes.some(looksLikeSize);
}

/** Swaps the colour and size roles, keeping SKUs, import ids and stock per cell. */
export function swapAxes(state: VariantEditorState): VariantEditorState {
  const swapKey = (key: string) => {
    const [color = "", size = ""] = key.split("\u0000");
    return cellKey(size, color);
  };

  return {
    colors: state.sizes.map((size) => ({ name: size, hex: DEFAULT_COLOR.hex })),
    sizes: sortSizes(state.colors.map((color) => color.name)),
    stocks: Object.fromEntries(Object.entries(state.stocks).map(([key, text]) => [swapKey(key), text])),
    originals: Object.fromEntries(
      Object.entries(state.originals).map(([key, original]) => [
        swapKey(key),
        { ...original, color: original.size, size: original.color, colorHex: DEFAULT_COLOR.hex }
      ])
    )
  };
}

export function setCell(state: VariantEditorState, color: string, size: string, text: string): VariantEditorState {
  return { ...state, stocks: { ...state.stocks, [cellKey(color, size)]: text } };
}

/** Fills every cell, or only the cells that are still empty, with the same stock. */
export function fillCells(state: VariantEditorState, text: string, mode: "all" | "empty"): VariantEditorState {
  const stocks = { ...state.stocks };

  for (const color of state.colors) {
    for (const size of state.sizes) {
      const key = cellKey(color.name, size);
      if (mode === "all" || !stocks[key]?.trim()) {
        stocks[key] = text;
      }
    }
  }

  return { ...state, stocks };
}

function activeCells(state: VariantEditorState) {
  return state.colors.flatMap((color) =>
    state.sizes.map((size) => ({ color, size, key: cellKey(color.name, size), text: state.stocks[cellKey(color.name, size)]?.trim() ?? "" }))
  );
}

export function validateEditor(state: VariantEditorState): EditorValidation {
  const cells = activeCells(state).filter((cell) => cell.text !== "");
  const invalidCells = cells.filter((cell) => parseWholeNumber(cell.text) === null).map((cell) => cell.key);

  if (!cells.length) {
    return { ok: false, invalidCells, message: "Nhập số lượng cho ít nhất một size. Ô để trống nghĩa là không bán size đó." };
  }

  if (cells.length > MAX_VARIANTS) {
    return { ok: false, invalidCells, message: `Tối đa ${MAX_VARIANTS} biến thể cho một sản phẩm.` };
  }

  if (invalidCells.length) {
    return { ok: false, invalidCells, message: "Số lượng phải là số nguyên từ 0 trở lên." };
  }

  return { ok: true, invalidCells };
}

export function getEditorTotal(state: VariantEditorState) {
  return activeCells(state).reduce((total, cell) => total + (parseWholeNumber(cell.text) ?? 0), 0);
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

export function makeSkuBase(name: string) {
  return slugPart(name).slice(0, 16) || "SP";
}

/** Turns the editor back into API variants, keeping metadata of variants that already existed. */
export function editorToVariants(state: VariantEditorState, skuBase: string): ProductVariant[] {
  const usedSkus = new Set(Object.values(state.originals).map((variant) => variant.sku));
  const variants: ProductVariant[] = [];

  for (const cell of activeCells(state)) {
    if (cell.text === "") continue;

    const stock = parseWholeNumber(cell.text);
    if (stock === null) continue;

    const original = state.originals[cell.key];
    if (original) {
      variants.push({ ...original, stock });
      continue;
    }

    const baseSku = [skuBase, slugPart(cell.color.name), slugPart(cell.size)].filter(Boolean).join("-");
    let sku = baseSku;
    for (let suffix = 2; usedSkus.has(sku); suffix += 1) {
      sku = `${baseSku}-${suffix}`;
    }
    usedSkus.add(sku);

    variants.push({ sku, color: cell.color.name, colorHex: cell.color.hex, size: cell.size, stock });
  }

  return variants;
}

/** Sizes whose stock is zero across every colour, for the product list. */
export function getSoldOutSizes(variants: ProductVariant[] | undefined) {
  const totals = new Map<string, number>();

  for (const variant of variants ?? []) {
    totals.set(variant.size, (totals.get(variant.size) ?? 0) + variant.stock);
  }

  return sortSizes(Array.from(totals.entries()).filter(([, total]) => total <= 0).map(([size]) => size));
}

const colorHexByKeyword: [string, string][] = [
  ["xanh navy", "#1e3a8a"],
  ["xanh den", "#1e3a8a"],
  ["xanh la", "#16a34a"],
  ["xanh luc", "#16a34a"],
  ["xanh duong", "#2563eb"],
  ["xanh bien", "#2563eb"],
  ["xanh", "#2563eb"],
  ["den", "#171717"],
  ["trang", "#ffffff"],
  ["xam", "#9ca3af"],
  ["ghi", "#9ca3af"],
  ["do", "#dc2626"],
  ["hong", "#f472b6"],
  ["cam", "#f97316"],
  ["vang", "#eab308"],
  ["tim", "#9333ea"],
  ["nau", "#7c4a2d"],
  ["kem", "#e7d8c0"],
  ["be", "#e7d8c0"],
  ["bac", "#c0c0c0"]
];

export function guessColorHex(name: string) {
  const normalized = slugPart(name).toLowerCase().replace(/-/g, " ");
  const match = colorHexByKeyword.find(([keyword]) => normalized === keyword || normalized.startsWith(`${keyword} `) || normalized.endsWith(` ${keyword}`) || normalized.includes(` ${keyword} `));
  return match?.[1] ?? "#9ca3af";
}

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, index) => String(from + index * step));

export function getSizePresets(audience: Audience | undefined, productType: ProductType | undefined): SizePreset[] {
  const oneSize: SizePreset = { label: "Một size", sizes: ["One size"] };

  if (productType === "shoes") {
    const women: SizePreset = { label: "Giày nữ 35–40", sizes: range(35, 40) };
    const men: SizePreset = { label: "Giày nam 38–44", sizes: range(38, 44) };
    const kids: SizePreset = { label: "Giày trẻ em 25–35", sizes: range(25, 35) };

    if (audience === "women") return [women, oneSize];
    if (audience === "men") return [men, oneSize];
    if (audience === "kids") return [kids, oneSize];
    return [women, men, kids, oneSize];
  }

  if (productType === "belts") {
    return [{ label: "Dây lưng 90–115", sizes: range(90, 115, 5) }, oneSize];
  }

  return [oneSize];
}
