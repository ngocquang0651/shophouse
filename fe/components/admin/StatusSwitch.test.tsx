import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import type { ProductStatus } from "@/types/product";

afterEach(cleanup);

describe("StatusSwitch", () => {
  it("offers to stop selling an active product", async () => {
    const next: ProductStatus[] = [];
    render(<StatusSwitch status="active" productName="Giày Nike" onChange={(status) => next.push(status)} />);

    const toggle = screen.getByRole("switch", { name: "Ngừng bán Giày Nike" });
    assert.equal(toggle.getAttribute("aria-checked"), "true");
    assert.ok(screen.getByText("Đang bán"));

    await userEvent.click(toggle);
    assert.deepEqual(next, ["inactive"]);
  });

  it("offers to sell an inactive product again", async () => {
    const next: ProductStatus[] = [];
    render(<StatusSwitch status="inactive" productName="Giày Nike" onChange={(status) => next.push(status)} />);

    assert.equal(screen.getByRole("switch", { name: "Bán lại Giày Nike" }).getAttribute("aria-checked"), "false");

    await userEvent.click(screen.getByRole("switch"));
    assert.deepEqual(next, ["active"]);
  });

  it("toggles when the visible words are clicked", async () => {
    const next: ProductStatus[] = [];
    render(<StatusSwitch status="active" productName="Giày Nike" onChange={(status) => next.push(status)} />);

    await userEvent.click(screen.getByText("Đang bán"));
    assert.deepEqual(next, ["inactive"]);
  });

  it("does nothing while disabled", async () => {
    const next: ProductStatus[] = [];
    render(<StatusSwitch status="active" productName="Giày Nike" disabled onChange={(status) => next.push(status)} />);

    await userEvent.click(screen.getByText("Đang bán"));
    assert.deepEqual(next, []);
  });
});
