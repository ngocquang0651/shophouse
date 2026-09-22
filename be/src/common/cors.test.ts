import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCorsOriginCheck, isOriginAllowed } from "./cors";

const allowed = ["https://shop.example.com"];

describe("isOriginAllowed", () => {
  it("allows same-origin and tool requests that send no Origin header", () => {
    assert.equal(isOriginAllowed(undefined, allowed, false), true);
    assert.equal(isOriginAllowed("", allowed, false), true);
  });

  it("allows a configured origin", () => {
    assert.equal(isOriginAllowed("https://shop.example.com", allowed, false), true);
  });

  it("rejects an unknown origin", () => {
    assert.equal(isOriginAllowed("https://evil.example.com", allowed, false), false);
  });

  it("rejects an origin that only shares a suffix with a configured one", () => {
    assert.equal(isOriginAllowed("https://evil-shop.example.com", allowed, false), false);
    assert.equal(isOriginAllowed("https://shop.example.com.evil.test", allowed, false), false);
  });

  it("allows any localhost port only while localhost is enabled", () => {
    assert.equal(isOriginAllowed("http://localhost:3001", allowed, true), true);
    assert.equal(isOriginAllowed("http://127.0.0.1:5173", allowed, true), true);
    assert.equal(isOriginAllowed("http://localhost:3001", allowed, false), false);
    assert.equal(isOriginAllowed("http://127.0.0.1:5173", allowed, false), false);
  });

  it("does not treat a hostname that merely contains localhost as local", () => {
    assert.equal(isOriginAllowed("http://localhost.evil.test:3000", allowed, true), false);
    assert.equal(isOriginAllowed("https://localhost:3000", allowed, true), false);
  });

  it("rejects everything when no origin is configured", () => {
    assert.equal(isOriginAllowed("https://shop.example.com", [], false), false);
  });
});

describe("buildCorsOriginCheck", () => {
  it("calls back with true for an allowed origin", () => {
    const check = buildCorsOriginCheck(allowed, { allowLocalhost: false });
    const calls: Array<[Error | null, boolean | undefined]> = [];

    check("https://shop.example.com", (error, allow) => calls.push([error, allow]));

    assert.deepEqual(calls, [[null, true]]);
  });

  it("calls back with an error naming the rejected origin", () => {
    const check = buildCorsOriginCheck(allowed, { allowLocalhost: false });
    const calls: Array<[Error | null, boolean | undefined]> = [];

    check("https://evil.example.com", (error, allow) => calls.push([error, allow]));

    assert.equal(calls.length, 1);
    assert.ok(calls[0][0] instanceof Error);
    assert.match(calls[0][0].message, /https:\/\/evil\.example\.com is not allowed by CORS/);
    assert.equal(calls[0][1], false);
  });
});
