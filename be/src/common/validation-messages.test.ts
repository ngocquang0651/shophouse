import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ValidationError } from "class-validator";
import { translateValidationErrors } from "./validation-messages";

function error(property: string, constraints?: Record<string, string>, children?: ValidationError[]) {
  return { property, constraints, children } as ValidationError;
}

describe("translateValidationErrors", () => {
  it("returns an empty list when there are no errors", () => {
    assert.deepEqual(translateValidationErrors([]), []);
  });

  it("translates common constraints using field labels", () => {
    const messages = translateValidationErrors([
      error("stock", { min: "stock must not be less than 0" }),
      error("name", { isString: "name must be a string" }),
      error("image", { isUrl: "image must be a URL address" }),
      error("badge", { isEnum: "badge must be one of the following values: New, Sale, Luxury" })
    ]);

    assert.deepEqual(messages, [
      "Tồn kho phải từ 0 trở lên.",
      "Tên sản phẩm phải là chuỗi ký tự.",
      "Ảnh đại diện phải là đường link hợp lệ (bắt đầu bằng http:// hoặc https://).",
      "Nhãn không hợp lệ."
    ]);
  });

  it("explains unknown properties as unsupported", () => {
    assert.deepEqual(translateValidationErrors([error("media", { whitelistValidation: "property media should not exist" })]), [
      "media không được hỗ trợ."
    ]);
  });

  it("describes nested variant errors with a 1-based position", () => {
    const messages = translateValidationErrors([
      error("variants", undefined, [error("2", undefined, [error("stock", { min: "stock must not be less than 0" })])])
    ]);

    assert.deepEqual(messages, ["Biến thể #3 Tồn kho phải từ 0 trở lên."]);
  });

  it("falls back to the property name and a generic message for unknown fields and constraints", () => {
    assert.deepEqual(translateValidationErrors([error("mystery", { customRule: "custom" })]), ["mystery không hợp lệ."]);
  });

  it("removes duplicate messages", () => {
    const messages = translateValidationErrors([
      error("images", { isUrl: "each value in images must be a URL address" }),
      error("images", { isUrl: "each value in images must be a URL address" })
    ]);

    assert.equal(messages.length, 1);
  });
});
