import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

afterEach(cleanup);

describe("Button", () => {
  it("fires onClick and defaults to the primary look", async () => {
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>Lưu</Button>);

    const button = screen.getByRole("button", { name: "Lưu" });
    await userEvent.click(button);

    assert.equal(clicks, 1);
    assert.equal(button.dataset.variant, "default");
    assert.match(button.className, /bg-primary/);
  });

  it("is blocked and marked busy while loading", async () => {
    let clicks = 0;
    render(
      <Button loading onClick={() => (clicks += 1)}>
        Đang lưu
      </Button>
    );

    const button = screen.getByRole("button", { name: "Đang lưu" });
    await userEvent.click(button);

    assert.equal(clicks, 0);
    assert.equal((button as HTMLButtonElement).disabled, true);
    assert.equal(button.getAttribute("aria-busy"), "true");
    assert.ok(button.querySelector("svg.animate-spin"), "spinner is shown");
  });

  it("does not fire when disabled", async () => {
    let clicks = 0;
    render(
      <Button disabled onClick={() => (clicks += 1)}>
        Xoá
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Xoá" }));
    assert.equal(clicks, 0);
  });

  it("renders as the child element with asChild", () => {
    render(
      <Button asChild variant="outline">
        <a href="#danh-sach">Danh sách</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Danh sách" });
    assert.equal(link.getAttribute("href"), "#danh-sach");
    assert.match(link.className, /border-input/);
    assert.equal(link.getAttribute("aria-busy"), null);
  });

  it("lets className override a variant class instead of stacking it", () => {
    render(<Button className="h-9">Nhỏ</Button>);

    const { className } = screen.getByRole("button", { name: "Nhỏ" });
    assert.match(className, /\bh-9\b/);
    assert.doesNotMatch(className, /\bh-11\b/);
  });
});
