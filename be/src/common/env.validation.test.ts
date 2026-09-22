import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEV_JWT_SECRET, splitOrigins, validateEnv } from "./env.validation";

const strongSecret = "s".repeat(32);

function env(overrides: Record<string, unknown> = {}) {
  return {
    MONGODB_URI: "mongodb://localhost:27017/luxestore",
    JWT_SECRET: DEV_JWT_SECRET,
    ...overrides
  };
}

describe("validateEnv", () => {
  it("applies defaults when optional values are missing", () => {
    const config = validateEnv(env());

    assert.equal(config.NODE_ENV, "development");
    assert.equal(config.PORT, 4000);
    assert.equal(config.JWT_EXPIRES_IN, "7d");
    assert.equal(config.FRONTEND_URL, "http://localhost:3000");
    assert.equal(config.FRONTEND_URLS, "");
  });

  it("keeps provided values and coerces the port to a number", () => {
    const config = validateEnv(
      env({ NODE_ENV: "test", PORT: "5001", JWT_EXPIRES_IN: "900s", FRONTEND_URL: "https://shop.example.com" })
    );

    assert.equal(config.NODE_ENV, "test");
    assert.equal(config.PORT, 5001);
    assert.equal(config.JWT_EXPIRES_IN, "900s");
    assert.equal(config.FRONTEND_URL, "https://shop.example.com");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(validateEnv(env({ JWT_SECRET: `  ${strongSecret}  ` })).JWT_SECRET, strongSecret);
  });

  it("rejects a missing MONGODB_URI", () => {
    assert.throws(() => validateEnv(env({ MONGODB_URI: "" })), /MONGODB_URI is required/);
  });

  it("rejects a MONGODB_URI with the wrong scheme", () => {
    assert.throws(() => validateEnv(env({ MONGODB_URI: "postgres://localhost/db" })), /mongodb:\/\//);
  });

  it("rejects a missing JWT_SECRET", () => {
    assert.throws(() => validateEnv(env({ JWT_SECRET: "" })), /JWT_SECRET is required/);
  });

  it("rejects a nullish or non-string JWT_SECRET", () => {
    assert.throws(() => validateEnv(env({ JWT_SECRET: undefined })), /JWT_SECRET is required/);
    assert.throws(() => validateEnv(env({ JWT_SECRET: 12345 })), /JWT_SECRET is required/);
  });

  it("allows the development secret outside production", () => {
    assert.equal(validateEnv(env({ NODE_ENV: "development" })).JWT_SECRET, DEV_JWT_SECRET);
  });

  it("rejects the development secret in production", () => {
    assert.throws(
      () => validateEnv(env({ NODE_ENV: "production" })),
      /JWT_SECRET must not be the development default/
    );
  });

  it("rejects a short JWT_SECRET in production", () => {
    assert.throws(() => validateEnv(env({ NODE_ENV: "production", JWT_SECRET: "short-secret" })), /at least 32/);
  });

  it("accepts a strong JWT_SECRET in production", () => {
    assert.equal(validateEnv(env({ NODE_ENV: "production", JWT_SECRET: strongSecret })).JWT_SECRET, strongSecret);
  });

  it("rejects an unknown NODE_ENV", () => {
    assert.throws(() => validateEnv(env({ NODE_ENV: "staging" })), /NODE_ENV must be one of/);
  });

  it("rejects out-of-range and non-integer ports", () => {
    assert.throws(() => validateEnv(env({ PORT: "0" })), /PORT must be an integer/);
    assert.throws(() => validateEnv(env({ PORT: "65536" })), /PORT must be an integer/);
    assert.throws(() => validateEnv(env({ PORT: "4000.5" })), /PORT must be an integer/);
    assert.throws(() => validateEnv(env({ PORT: "abc" })), /PORT must be an integer/);
  });

  it("rejects a malformed JWT_EXPIRES_IN", () => {
    assert.throws(() => validateEnv(env({ JWT_EXPIRES_IN: "forever" })), /JWT_EXPIRES_IN must be a duration/);
  });

  it("rejects malformed frontend origins", () => {
    assert.throws(() => validateEnv(env({ FRONTEND_URL: "not-a-url" })), /FRONTEND_URL must be an http/);
    assert.throws(
      () => validateEnv(env({ FRONTEND_URLS: "http://localhost:3000,ftp://example.com" })),
      /FRONTEND_URLS contains an invalid origin/
    );
  });

  it("reports every problem at once", () => {
    assert.throws(
      () => validateEnv({ MONGODB_URI: "", JWT_SECRET: "", PORT: "abc" }),
      (error: Error) => {
        assert.match(error.message, /MONGODB_URI is required/);
        assert.match(error.message, /JWT_SECRET is required/);
        assert.match(error.message, /PORT must be an integer/);
        return true;
      }
    );
  });
});

describe("splitOrigins", () => {
  it("returns an empty list for empty, missing and separator-only values", () => {
    assert.deepEqual(splitOrigins(""), []);
    assert.deepEqual(splitOrigins(undefined), []);
    assert.deepEqual(splitOrigins(" , , "), []);
  });

  it("trims each origin and drops blanks", () => {
    assert.deepEqual(splitOrigins(" http://a.test , ,http://b.test "), ["http://a.test", "http://b.test"]);
  });
});
