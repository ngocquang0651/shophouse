import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductDeleteDialog } from "@/components/admin/ProductDeleteDialog";
import { makeProduct } from "@/test/fixtures";

afterEach(cleanup);

function setup(products = [makeProduct()], isDeleting = false) {
  const calls: string[] = [];
  render(
    <ProductDeleteDialog
      products={products}
      isDeleting={isDeleting}
      onCancel={() => calls.push("cancel")}
      onConfirm={() => calls.push("confirm")}
    />
  );
  return calls;
}

describe("ProductDeleteDialog", () => {
  it("renders nothing when there is nothing to delete", () => {
    setup([]);
    assert.equal(screen.queryByRole("alertdialog"), null);
  });

  it("names the product, offers the safer alternative, and starts on the safe button", () => {
    setup();

    const dialog = screen.getByRole("alertdialog", { name: "Xoá sản phẩm?" });
    assert.match(dialog.textContent ?? "", /Coach Túi Tabby/);
    assert.match(dialog.textContent ?? "", /Ngừng bán/);
    assert.equal(document.activeElement, screen.getByRole("button", { name: "Giữ lại" }));
  });

  it("previews at most five products and counts the rest", () => {
    const products = Array.from({ length: 8 }, (_, index) => makeProduct({ id: `p${index}`, name: `Mẫu ${index}` }));
    setup(products);

    assert.ok(screen.getByRole("alertdialog", { name: "Xoá 8 sản phẩm?" }));
    assert.equal(screen.getAllByRole("listitem").length, 6);
    assert.ok(screen.getByText("… và 3 sản phẩm khác"));
  });

  it("confirms only from the destructive button", async () => {
    const calls = setup();
    await userEvent.click(screen.getByRole("button", { name: "Xoá vĩnh viễn" }));

    assert.deepEqual(calls, ["confirm"]);
  });

  it("cancels with the safe button and with Escape", async () => {
    const calls = setup();
    await userEvent.click(screen.getByRole("button", { name: "Giữ lại" }));
    await userEvent.keyboard("{Escape}");

    assert.deepEqual(calls, ["cancel", "cancel"]);
  });

  it("cannot be dismissed or repeated while the delete is running", async () => {
    const calls = setup([makeProduct()], true);

    const confirm = screen.getByRole("button", { name: "Đang xoá..." }) as HTMLButtonElement;
    assert.equal(confirm.disabled, true);
    assert.equal(confirm.getAttribute("aria-busy"), "true");
    assert.equal((screen.getByRole("button", { name: "Giữ lại" }) as HTMLButtonElement).disabled, true);

    await userEvent.click(confirm);
    await userEvent.keyboard("{Escape}");
    assert.deepEqual(calls, []);
    assert.ok(screen.getByRole("alertdialog"), "dialog stays open");
  });
});
