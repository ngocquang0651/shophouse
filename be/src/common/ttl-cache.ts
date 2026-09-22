/**
 * A tiny in-process cache for values that are expensive to compute but change
 * rarely, such as the distinct category and brand lists behind the admin
 * filters. It is deliberately per-instance: a second API instance simply warms
 * its own copy. Move this to Redis once more than one instance is running and
 * the staleness window matters.
 */
export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now
  ) {}

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T) {
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
    return value;
  }

  async wrap(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    return this.set(key, await factory());
  }

  /** Called after any write, so the next read reflects it immediately. */
  clear() {
    this.entries.clear();
  }

  get size() {
    return this.entries.size;
  }
}
