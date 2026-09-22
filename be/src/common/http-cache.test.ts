import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEtag, buildPublicCacheControl, etagMatches } from "./http-cache";

describe("buildEtag", () => {
  it("is stable for the same body and different for a changed one", () => {
    const body = [{ id: "1", name: "Giày" }];

    assert.equal(buildEtag(body), buildEtag([{ id: "1", name: "Giày" }]));
    assert.notEqual(buildEtag(body), buildEtag([{ id: "1", name: "Giay" }]));
  });

  it("marks the tag as weak", () => {
    assert.match(buildEtag({}), /^W\/".+"$/);
  });

  it("handles empty, null and undefined bodies", () => {
    assert.equal(buildEtag(undefined), buildEtag(null));
    assert.ok(buildEtag([]));
  });

  it("distinguishes an empty array from an empty object", () => {
    assert.notEqual(buildEtag([]), buildEtag({}));
  });
});

describe("etagMatches", () => {
  const etag = buildEtag({ a: 1 });

  it("returns false when the header is absent or empty", () => {
    assert.equal(etagMatches(undefined, etag), false);
    assert.equal(etagMatches("", etag), false);
  });

  it("matches the identical tag", () => {
    assert.equal(etagMatches(etag, etag), true);
  });

  it("matches a strong tag sent back for a weak one", () => {
    assert.equal(etagMatches(etag.replace(/^W\//, ""), etag), true);
  });

  it("matches one candidate inside a list", () => {
    assert.equal(etagMatches(`W/"other", ${etag}`, etag), true);
  });

  it("matches the wildcard", () => {
    assert.equal(etagMatches("*", etag), true);
  });

  it("does not match a different tag", () => {
    assert.equal(etagMatches('W/"different"', etag), false);
  });
});

describe("buildPublicCacheControl", () => {
  it("formats the directives a shared cache expects", () => {
    assert.equal(buildPublicCacheControl(60, 300), "public, max-age=60, stale-while-revalidate=300");
  });

  it("supports a zero max-age", () => {
    assert.equal(buildPublicCacheControl(0, 0), "public, max-age=0, stale-while-revalidate=0");
  });
});
