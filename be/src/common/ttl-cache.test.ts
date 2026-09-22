import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TtlCache } from "./ttl-cache";

function clock(start = 0) {
  let current = start;
  return { now: () => current, advance: (ms: number) => (current += ms) };
}

describe("TtlCache", () => {
  it("returns undefined for a key that was never set", () => {
    assert.equal(new TtlCache<string>(1000).get("missing"), undefined);
  });

  it("returns a value inside the ttl and forgets it after", () => {
    const time = clock();
    const cache = new TtlCache<string>(1000, time.now);
    cache.set("k", "v");

    time.advance(999);
    assert.equal(cache.get("k"), "v");

    time.advance(1);
    assert.equal(cache.get("k"), undefined);
    assert.equal(cache.size, 0);
  });

  it("calls the factory once while the entry is fresh", async () => {
    const time = clock();
    const cache = new TtlCache<string[]>(1000, time.now);
    let calls = 0;
    const factory = () => {
      calls += 1;
      return Promise.resolve(["a"]);
    };

    assert.deepEqual(await cache.wrap("facets", factory), ["a"]);
    assert.deepEqual(await cache.wrap("facets", factory), ["a"]);
    assert.equal(calls, 1);

    time.advance(1001);
    await cache.wrap("facets", factory);
    assert.equal(calls, 2);
  });

  it("caches an empty array rather than treating it as a miss", async () => {
    const cache = new TtlCache<string[]>(1000);
    let calls = 0;

    await cache.wrap("empty", () => {
      calls += 1;
      return Promise.resolve([]);
    });
    await cache.wrap("empty", () => {
      calls += 1;
      return Promise.resolve([]);
    });

    assert.equal(calls, 1);
  });

  it("keeps separate keys apart", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("a", "1");
    cache.set("b", "2");

    assert.equal(cache.get("a"), "1");
    assert.equal(cache.get("b"), "2");
  });

  it("drops everything on clear, so a write is visible immediately", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("a", "1");
    cache.clear();

    assert.equal(cache.get("a"), undefined);
    assert.equal(cache.size, 0);
  });

  it("does not serve an entry from a zero ttl", () => {
    const time = clock();
    const cache = new TtlCache<string>(0, time.now);
    cache.set("a", "1");

    assert.equal(cache.get("a"), undefined);
  });
});
