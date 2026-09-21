export const DEFAULT_LOW_STOCK_THRESHOLD = 3;
export const MAX_LOW_STOCK_THRESHOLD = 100;

const LOW_STOCK_KEY = "shopo-admin-low-stock-threshold";

export function clampLowStockThreshold(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_LOW_STOCK_THRESHOLD;
  return Math.min(MAX_LOW_STOCK_THRESHOLD, Math.max(1, Math.floor(value)));
}

/** Per-browser preference; falls back to the default when storage is unavailable. */
export function readLowStockThreshold() {
  try {
    const stored = window.localStorage.getItem(LOW_STOCK_KEY);
    return stored === null ? DEFAULT_LOW_STOCK_THRESHOLD : clampLowStockThreshold(Number(stored));
  } catch {
    return DEFAULT_LOW_STOCK_THRESHOLD;
  }
}

export function saveLowStockThreshold(value: number) {
  try {
    window.localStorage.setItem(LOW_STOCK_KEY, String(clampLowStockThreshold(value)));
  } catch {
    // Storage can be blocked; the threshold then only lasts for this visit.
  }
}
