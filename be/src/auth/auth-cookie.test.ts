import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_AUTH_COOKIE_MAX_AGE_MS, buildAuthCookieOptions, parseCookieMaxAge } from "./auth-cookie";

describe("buildAuthCookieOptions", () => {
  it("keeps the local development cookie lax and not secure", () => {
    assert.deepEqual(buildAuthCookieOptions({ isProduction: false, sameSite: "lax" }), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/"
    });
  });

  it("marks the cookie secure in production", () => {
    const options = buildAuthCookieOptions({ isProduction: true, sameSite: "lax" });
    assert.equal(options.secure, true);
    assert.equal(options.sameSite, "lax");
  });

  it("always marks SameSite=None cookies secure, even outside production", () => {
    assert.equal(buildAuthCookieOptions({ isProduction: false, sameSite: "none" }).secure, true);
    assert.equal(buildAuthCookieOptions({ isProduction: true, sameSite: "none" }).secure, true);
  });

  it("passes strict through unchanged", () => {
    assert.equal(buildAuthCookieOptions({ isProduction: true, sameSite: "strict" }).sameSite, "strict");
  });

  it("is always httpOnly on the root path", () => {
    for (const sameSite of ["lax", "strict", "none"] as const) {
      const options = buildAuthCookieOptions({ isProduction: true, sameSite });
      assert.equal(options.httpOnly, true);
      assert.equal(options.path, "/");
    }
  });
});

describe("parseCookieMaxAge", () => {
  it("uses the provided positive number", () => {
    assert.equal(parseCookieMaxAge("3600000"), 3_600_000);
  });

  it("falls back to the default for missing, empty and malformed values", () => {
    for (const value of [undefined, "", "   ", "abc", "NaN", "Infinity"]) {
      assert.equal(parseCookieMaxAge(value), DEFAULT_AUTH_COOKIE_MAX_AGE_MS);
    }
  });

  it("falls back to the default for zero and negative values", () => {
    assert.equal(parseCookieMaxAge("0"), DEFAULT_AUTH_COOKIE_MAX_AGE_MS);
    assert.equal(parseCookieMaxAge("-1"), DEFAULT_AUTH_COOKIE_MAX_AGE_MS);
  });
});
