import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

afterEach(cleanup);

describe("Checkbox", () => {
  it("toggles with click and Space", async () => {
    const changes: unknown[] = [];
    render(<Checkbox aria-label="Chọn" checked={false} onCheckedChange={(value) => changes.push(value)} />);

    const box = screen.getByRole("checkbox", { name: "Chọn" });
    await userEvent.click(box);
    box.focus();
    await userEvent.keyboard(" ");

    assert.deepEqual(changes, [true, true]);
  });

  it("reports the mixed state for a partial selection", () => {
    render(<Checkbox aria-label="Chọn tất cả" checked="indeterminate" onCheckedChange={() => undefined} />);

    assert.equal(screen.getByRole("checkbox").getAttribute("aria-checked"), "mixed");
  });

  it("ignores clicks while disabled", async () => {
    let changes = 0;
    render(<Checkbox aria-label="Chọn" disabled onCheckedChange={() => (changes += 1)} />);

    await userEvent.click(screen.getByRole("checkbox"));
    assert.equal(changes, 0);
  });
});

describe("Switch", () => {
  it("exposes its state and toggles with click and Space", async () => {
    const changes: boolean[] = [];
    render(<Switch aria-label="Đang bán" checked onCheckedChange={(value) => changes.push(value)} />);

    const toggle = screen.getByRole("switch", { name: "Đang bán" });
    assert.equal(toggle.getAttribute("aria-checked"), "true");

    await userEvent.click(toggle);
    toggle.focus();
    await userEvent.keyboard(" ");

    assert.deepEqual(changes, [false, false]);
  });

  it("ignores clicks while disabled", async () => {
    let changes = 0;
    render(<Switch aria-label="Đang bán" disabled onCheckedChange={() => (changes += 1)} />);

    await userEvent.click(screen.getByRole("switch"));
    assert.equal(changes, 0);
  });
});
