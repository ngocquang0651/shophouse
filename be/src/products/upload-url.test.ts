import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveUploadBaseUrl } from "./upload-url";

describe("resolveUploadBaseUrl", () => {
  it("prefers the configured public API URL", () => {
    assert.equal(resolveUploadBaseUrl("https://api.example.com", "http", "10.0.0.5:4000"), "https://api.example.com");
  });

  it("strips trailing slashes from the configured URL", () => {
    assert.equal(resolveUploadBaseUrl("https://api.example.com//", "http", "x"), "https://api.example.com");
  });

  it("derives the URL from the request when nothing is configured", () => {
    assert.equal(resolveUploadBaseUrl("", "http", "localhost:4000"), "http://localhost:4000");
    assert.equal(resolveUploadBaseUrl("", "https", "api.onrender.com"), "https://api.onrender.com");
  });

  it("falls back to localhost when the request has no host header", () => {
    assert.equal(resolveUploadBaseUrl("", "http", undefined), "http://localhost");
  });
});
