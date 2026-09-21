import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { cellKey, emptyEditor, variantsToEditor, type VariantEditorState } from "@/lib/admin-variants";

afterEach(cleanup);

function Harness({ initial = emptyEditor(), invalidCells = [] }: { initial?: VariantEditorState; invalidCells?: string[] }) {
  const [state, setState] = useState(initial);

  return (
    <VariantEditor state={state} onChange={setState} audience="unisex" productType="shoes" lowStockThreshold={5} invalidCells={invalidCells} />
  );
}

describe("VariantEditor", () => {
  it("asks for a size before showing the stock matrix", () => {
    render(<Harness />);

    assert.ok(screen.getByText("Thêm ít nhất một size để bắt đầu nhập tồn kho theo size."));
    assert.equal(screen.queryByRole("table"), null);
  });

  it("keeps 'Thêm size' disabled until something is typed", async () => {
    render(<Harness />);
    const add = screen.getByRole("button", { name: /Thêm size/ }) as HTMLButtonElement;
    assert.equal(add.disabled, true);

    await userEvent.type(screen.getByLabelText("Thêm size"), "38");
    assert.equal(add.disabled, false);
  });

  it("adds comma-separated sizes with Enter and builds the matrix", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText("Thêm size"), "38, 39, 38{Enter}");

    assert.ok(screen.getByRole("table"));
    assert.ok(screen.getByRole("columnheader", { name: "38" }));
    assert.ok(screen.getByRole("columnheader", { name: "39" }));
    assert.equal(screen.getAllByRole("columnheader", { name: "38" }).length, 1, "duplicates are ignored");
    assert.equal((screen.getByLabelText("Thêm size") as HTMLInputElement).value, "");
  });

  it("totals the stock typed into the matrix and marks zero as sold out", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText("Thêm size"), "38, 39{Enter}");

    const cells = screen.getAllByPlaceholderText("—");
    await userEvent.type(cells[0] as HTMLElement, "4");
    await userEvent.type(cells[1] as HTMLElement, "0");

    assert.match(document.body.textContent ?? "", /Tổng: 4 sản phẩm/);
    assert.match(document.body.textContent ?? "", /Hết hàng: size 39/);
  });

  it("removes a size", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText("Thêm size"), "38, 39{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "Xoá size 38" }));

    assert.equal(screen.queryByRole("columnheader", { name: "38" }), null);
    assert.ok(screen.getByRole("columnheader", { name: "39" }));
  });

  it("marks invalid cells for assistive tech", () => {
    const seeded = variantsToEditor([{ sku: "A-1", color: "Đen", colorHex: "#111111", size: "38", stock: 1 }]);
    render(<Harness initial={seeded} invalidCells={[cellKey("Đen", "38")]} />);

    assert.equal(screen.getByRole("textbox", { name: "Đen, size 38: số lượng" }).getAttribute("aria-invalid"), "true");
  });
});
