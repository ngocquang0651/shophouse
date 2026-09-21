import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminProductTable, type AdminProductTableProps } from "@/components/admin/AdminProductTable";
import { makeProduct } from "@/test/fixtures";
import type { Product } from "@/types/product";

afterEach(cleanup);

type Calls = { edit: string[]; toggle: string[]; toggleAll: number; sort: string[]; patch: unknown[] };

function setup(props: Partial<AdminProductTableProps> = {}) {
  const calls: Calls = { edit: [], toggle: [], toggleAll: 0, sort: [], patch: [] };
  const products: Product[] = props.products ?? [makeProduct(), makeProduct({ id: "p2", name: "Giày Air", stock: 0, status: "inactive" })];

  render(
    <AdminProductTable
      products={products}
      selectedIds={[]}
      busy={false}
      lowStockThreshold={5}
      sort="newest"
      onSort={(sort) => calls.sort.push(sort)}
      onEdit={(product) => calls.edit.push(product.id)}
      onDelete={() => undefined}
      onPatch={(product, patch) => {
        calls.patch.push([product.id, patch]);
      }}
      onToggle={(id) => calls.toggle.push(id)}
      onToggleAll={() => (calls.toggleAll += 1)}
      {...props}
    />
  );

  return { calls, table: screen.getByRole("table") };
}

describe("AdminProductTable", () => {
  it("lists every product in the table with its state", () => {
    const { table } = setup();
    const rows = within(table).getAllByRole("row");

    assert.equal(rows.length, 3, "header plus two products");
    assert.match(rows[1]?.textContent ?? "", /Túi Tabby/);
    assert.match(rows[2]?.textContent ?? "", /Hết hàng/);
  });

  it("renders an empty list without rows", () => {
    const { table } = setup({ products: [] });
    assert.equal(within(table).getAllByRole("row").length, 1);
  });

  it("opens the editor when a row is clicked", async () => {
    const { calls, table } = setup();
    await userEvent.click(within(table).getAllByRole("row")[1] as HTMLElement);

    assert.deepEqual(calls.edit, ["p1"]);
  });

  it("does not open the editor when the checkbox, switch, or their labels are used", async () => {
    const { calls, table } = setup();

    await userEvent.click(within(table).getByRole("checkbox", { name: "Chọn Túi Tabby" }));
    await userEvent.click(within(table).getByRole("switch", { name: "Ngừng bán Túi Tabby" }));
    await userEvent.click(within(table).getAllByText("Đang bán")[0] as HTMLElement);

    assert.deepEqual(calls.edit, []);
    assert.deepEqual(calls.toggle, ["p1"]);
    assert.deepEqual(calls.patch, [
      ["p1", { status: "inactive" }],
      ["p1", { status: "inactive" }]
    ]);
  });

  it("selects every visible product from the header checkbox", async () => {
    const { calls, table } = setup();
    await userEvent.click(within(table).getByRole("checkbox", { name: "Chọn tất cả sản phẩm đang hiển thị" }));

    assert.equal(calls.toggleAll, 1);
  });

  it("shows the header checkbox as checked, mixed, or clear", () => {
    const products = [makeProduct(), makeProduct({ id: "p2", name: "Giày Air" })];
    const state = (selectedIds: string[]) => {
      cleanup();
      const { table } = setup({ products, selectedIds });
      return within(table).getByRole("checkbox", { name: /Chọn tất cả/ }).getAttribute("aria-checked");
    };

    assert.equal(state([]), "false");
    assert.equal(state(["p1"]), "mixed");
    assert.equal(state(["p1", "p2"]), "true");
  });

  it("sorts by the header buttons and reports aria-sort", async () => {
    const { calls, table } = setup({ sort: "price-asc" });

    const priceHeader = within(table).getByRole("columnheader", { name: /Giá bán/ });
    assert.equal(priceHeader.getAttribute("aria-sort"), "ascending");

    await userEvent.click(within(priceHeader).getByRole("button"));
    assert.deepEqual(calls.sort, ["price-desc"]);
  });

  it("commits an edited price inline", async () => {
    const { calls, table } = setup();
    const input = within(table).getByRole("textbox", { name: "Giá bán của Túi Tabby" });

    await userEvent.clear(input);
    await userEvent.type(input, "2000000{Enter}");

    assert.deepEqual(calls.patch, [["p1", { price: 2000000 }]]);
  });

  it("rejects an invalid inline price and keeps the old one", async () => {
    const { calls, table } = setup();
    const input = within(table).getByRole("textbox", { name: "Giá bán của Túi Tabby" });

    await userEvent.clear(input);
    await userEvent.type(input, "abc{Enter}");

    assert.deepEqual(calls.patch, []);
    assert.equal(input.getAttribute("aria-invalid"), "true");
  });

  it("shows sold-out sizes for products tracked per size", () => {
    const product = makeProduct({
      stock: 3,
      variants: [
        { sku: "A-1", color: "Đen", colorHex: "#000000", size: "38", stock: 3 },
        { sku: "A-2", color: "Đen", colorHex: "#000000", size: "39", stock: 0 }
      ]
    });
    const { table } = setup({ products: [product] });

    assert.match(table.textContent ?? "", /Hết size: 39/);
  });
});
