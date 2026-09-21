import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RowActionsMenu, type RowActionsMenuProps } from "@/components/admin/RowActionsMenu";

afterEach(cleanup);

function setup(overrides: Partial<RowActionsMenuProps> = {}) {
  const calls: string[] = [];
  render(
    <RowActionsMenu
      productName="Túi Coach"
      status="active"
      onToggleStatus={() => calls.push("toggle")}
      onDelete={() => calls.push("delete")}
      {...overrides}
    />
  );
  return { calls, trigger: screen.getByRole("button", { name: "Thêm thao tác cho Túi Coach" }) };
}

describe("RowActionsMenu", () => {
  it("is closed until the trigger is used", () => {
    setup();
    assert.equal(screen.queryByRole("menu"), null);
  });

  it("opens with click and lists the actions", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);

    assert.ok(screen.getByRole("menu"));
    assert.ok(screen.getByRole("menuitem", { name: "Ngừng bán" }));
    assert.ok(screen.getByRole("menuitem", { name: "Xoá sản phẩm" }));
  });

  it("offers 'Bán lại' for an inactive product", async () => {
    const { trigger } = setup({ status: "inactive" });
    await userEvent.click(trigger);

    assert.ok(screen.getByRole("menuitem", { name: "Bán lại" }));
    assert.equal(screen.queryByRole("menuitem", { name: "Ngừng bán" }), null);
  });

  it("opens with ArrowDown, moves between items, and runs the focused one with Enter", async () => {
    const { trigger, calls } = setup();
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    assert.ok(screen.getByRole("menu"));

    await userEvent.keyboard("{ArrowDown}{Enter}");
    assert.deepEqual(calls, ["delete"]);
    assert.equal(screen.queryByRole("menu"), null);
  });

  it("runs the status action and closes", async () => {
    const { trigger, calls } = setup();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("menuitem", { name: "Ngừng bán" }));

    assert.deepEqual(calls, ["toggle"]);
    assert.equal(screen.queryByRole("menu"), null);
  });

  it("closes with Escape and returns focus to the trigger", async () => {
    const { trigger, calls } = setup();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");

    assert.equal(screen.queryByRole("menu"), null);
    assert.equal(document.activeElement, trigger);
    assert.deepEqual(calls, []);
  });

  it("does not open while disabled", async () => {
    const { trigger } = setup({ disabled: true });
    await userEvent.click(trigger);

    assert.equal(screen.queryByRole("menu"), null);
  });
});
