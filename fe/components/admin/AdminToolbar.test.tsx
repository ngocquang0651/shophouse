import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminToolbar, type AdminToolbarProps } from "@/components/admin/AdminToolbar";
import { defaultFilters, type AdminFilters } from "@/lib/admin-products";

afterEach(cleanup);

function setup(filters: Partial<AdminFilters> = {}, props: Partial<AdminToolbarProps> = {}) {
  const patches: Partial<AdminFilters>[] = [];
  const calls: string[] = [];
  render(
    <AdminToolbar
      filters={{ ...defaultFilters, ...filters }}
      categories={["Túi xách", "Giày"]}
      resultCount={1234}
      onChange={(patch) => patches.push(patch)}
      onCreate={() => calls.push("create")}
      onClear={() => calls.push("clear")}
      {...props}
    />
  );
  return { patches, calls };
}

async function choose(selectName: string, optionName: string) {
  await userEvent.click(screen.getByRole("combobox", { name: selectName }));
  await userEvent.click(screen.getByRole("option", { name: optionName }));
}

describe("AdminToolbar", () => {
  it("shows the Vietnamese-formatted result count", () => {
    setup();
    assert.equal(screen.getByRole("status").textContent, "1.234 sản phẩm");
  });

  it("reports what is typed in the search box", async () => {
    const { patches } = setup();
    await userEvent.type(screen.getByRole("searchbox", { name: "Tìm sản phẩm" }), "a");

    assert.deepEqual(patches, [{ query: "a" }]);
  });

  it("filters by category, label, status, and stock", async () => {
    const { patches } = setup();

    await choose("Lọc theo danh mục", "Giày");
    await choose("Lọc theo nhãn", "Giảm giá");
    await choose("Lọc theo trạng thái", "Ngừng bán");
    await choose("Lọc theo tồn kho", "Hết hàng");

    assert.deepEqual(patches, [{ category: "Giày" }, { badge: "Sale" }, { status: "inactive" }, { stock: "out" }]);
  });

  it("changes the sort order", async () => {
    const { patches } = setup();
    await choose("Sắp xếp", "Giá thấp → cao");

    assert.deepEqual(patches, [{ sort: "price-asc" }]);
  });

  it("clears a filter by choosing 'all' again", async () => {
    const { patches } = setup({ category: "Giày" });
    await choose("Lọc theo danh mục", "Tất cả danh mục");

    assert.deepEqual(patches, [{ category: "" }]);
  });

  it("offers 'Xoá bộ lọc' only while a filter is active", async () => {
    const first = setup();
    assert.equal(screen.queryByRole("button", { name: "Xoá bộ lọc" }), null);
    cleanup();
    void first;

    const { calls } = setup({ status: "inactive" });
    await userEvent.click(screen.getByRole("button", { name: "Xoá bộ lọc" }));
    assert.deepEqual(calls, ["clear"]);
  });

  it("calls onCreate from the primary button", async () => {
    const { calls } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Thêm sản phẩm" }));

    assert.deepEqual(calls, ["create"]);
  });

  it("focuses the search box with '/' but not while typing in another field", async () => {
    setup();
    const search = screen.getByRole("searchbox");

    await userEvent.keyboard("/");
    assert.equal(document.activeElement, search);

    search.blur();
    screen.getByRole("combobox", { name: "Sắp xếp" }).focus();
    await userEvent.keyboard("/");
    assert.notEqual(document.activeElement, search);
  });

  it("survives an empty category list", () => {
    setup({}, { categories: [] });
    assert.ok(screen.getByRole("combobox", { name: "Lọc theo danh mục" }));
  });
});
