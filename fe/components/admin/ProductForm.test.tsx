import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductForm, type ProductFormProps, type ProductFormValues } from "@/components/admin/ProductForm";
import { makeProduct } from "@/test/fixtures";

const realConfirm = window.confirm;
let confirmAnswer = true;
let confirmMessages: string[] = [];

beforeEach(() => {
  confirmAnswer = true;
  confirmMessages = [];
  window.confirm = (message?: string) => {
    confirmMessages.push(message ?? "");
    return confirmAnswer;
  };
});

afterEach(() => {
  cleanup();
  window.confirm = realConfirm;
});

function setup(props: Partial<ProductFormProps> = {}) {
  const closes: number[] = [];
  const submitted: ProductFormValues[] = [];

  render(
    <ProductForm
      product={null}
      open
      categoryOptions={["Túi xách", "Giày"]}
      brandOptions={["Coach", "Nike"]}
      lowStockThreshold={5}
      onClose={() => closes.push(1)}
      onSubmit={(values) => {
        submitted.push(values);
      }}
      {...props}
    />
  );

  return { closes, submitted };
}

describe("ProductForm", () => {
  it("renders nothing while closed", () => {
    setup({ open: false });
    assert.equal(screen.queryByRole("dialog"), null);
  });

  it("opens as a named modal dialog with focus on the first field", () => {
    setup();

    assert.ok(screen.getByRole("dialog", { name: "Thêm sản phẩm mới" }));
    assert.equal(document.activeElement, screen.getByLabelText(/Tên sản phẩm/));
  });

  it("titles the dialog for editing and prefills the fields", () => {
    setup({ product: makeProduct({ variants: undefined }) });

    assert.ok(screen.getByRole("dialog", { name: "Sửa sản phẩm" }));
    assert.equal((screen.getByLabelText(/Tên sản phẩm/) as HTMLInputElement).value, "Túi Tabby");
    assert.equal((screen.getByLabelText(/Giá bán/) as HTMLInputElement).value, "1500000");
    assert.match(screen.getByRole("combobox", { name: /Danh mục/ }).textContent ?? "", /Túi xách/);
  });

  it("lists every problem in an error summary when saving an empty form", async () => {
    const { submitted } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Lưu sản phẩm" }));

    const summary = screen.getByRole("alert", { name: /Vui lòng kiểm tra/ });
    assert.equal(document.activeElement, summary);
    for (const message of ["Vui lòng nhập tên sản phẩm.", "Vui lòng nhập thương hiệu.", "Vui lòng chọn danh mục.", "Thêm ít nhất một ảnh sản phẩm."]) {
      assert.ok(within(summary).getByText(message), message);
    }
    assert.equal(submitted.length, 0);
    assert.equal(screen.getByLabelText(/Tên sản phẩm/).getAttribute("aria-invalid"), "true");
  });

  it("moves focus to the field named in the summary", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Lưu sản phẩm" }));
    await userEvent.click(screen.getByRole("button", { name: "Vui lòng chọn danh mục." }));

    assert.equal(document.activeElement, screen.getByRole("combobox", { name: /Danh mục/ }));
  });

  it("validates prices", async () => {
    setup({ product: makeProduct({ variants: undefined }) });

    const price = screen.getByLabelText(/Giá bán/);
    await userEvent.clear(price);
    await userEvent.type(price, "0");
    const original = screen.getByLabelText(/Giá gốc/);
    await userEvent.type(original, "100");
    await userEvent.click(screen.getByRole("button", { name: "Lưu sản phẩm" }));

    assert.ok(screen.getAllByText("Giá bán phải là số nguyên lớn hơn 0.").length >= 1);
  });

  it("saves a valid product with a plain stock number", async () => {
    const { submitted } = setup();

    await userEvent.type(screen.getByLabelText(/Tên sản phẩm/), "Túi Mới");
    await userEvent.type(screen.getByLabelText(/Thương hiệu/), "Coach");
    await userEvent.click(screen.getByRole("combobox", { name: /Danh mục/ }));
    await userEvent.click(screen.getByRole("option", { name: "Giày" }));
    await userEvent.type(screen.getByLabelText(/Giá bán/), "990000");

    await userEvent.click(screen.getByRole("button", { name: /Thêm ảnh từ đường link/ }));
    await userEvent.type(screen.getByLabelText("Đường link ảnh"), "https://example.com/x.jpg");
    await userEvent.click(screen.getByRole("button", { name: "Thêm ảnh" }));

    await userEvent.click(screen.getByRole("checkbox"));
    const stock = screen.getByLabelText(/Số lượng tồn kho/);
    await userEvent.clear(stock);
    await userEvent.type(stock, "7");

    await userEvent.click(screen.getByRole("button", { name: "Lưu sản phẩm" }));

    assert.equal(submitted.length, 1);
    const [values] = submitted;
    assert.equal(values?.name, "Túi Mới");
    assert.equal(values?.brand, "Coach");
    assert.equal(values?.category, "Giày");
    assert.equal(values?.price, 990000);
    assert.equal(values?.stock, 7);
    assert.equal(values?.image, "https://example.com/x.jpg");
  });

  it("closes straight away with Escape when nothing was typed", async () => {
    const { closes } = setup();
    await userEvent.keyboard("{Escape}");

    assert.equal(closes.length, 1);
    assert.deepEqual(confirmMessages, []);
  });

  it("asks before discarding changes and keeps the form if the answer is no", async () => {
    confirmAnswer = false;
    const { closes } = setup();

    await userEvent.type(screen.getByLabelText(/Tên sản phẩm/), "Dở dang");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Huỷ" }));

    assert.equal(confirmMessages.length, 2);
    assert.equal(closes.length, 0);
    assert.equal((screen.getByLabelText(/Tên sản phẩm/) as HTMLInputElement).value, "Dở dang");
  });

  it("discards changes when the answer is yes", async () => {
    const { closes } = setup();

    await userEvent.type(screen.getByLabelText(/Tên sản phẩm/), "Dở dang");
    await userEvent.click(screen.getByRole("button", { name: "Đóng biểu mẫu" }));

    assert.equal(closes.length, 1);
  });

  it("is not closed by a click on the backdrop", async () => {
    const { closes } = setup();
    const dialog = screen.getByRole("dialog");

    await userEvent.click(dialog.parentElement as HTMLElement);

    assert.equal(closes.length, 0);
    assert.ok(screen.getByRole("dialog"));
  });

  it("locks the form while saving", async () => {
    const { closes } = setup({ isSaving: true });

    const save = screen.getByRole("button", { name: "Đang lưu..." }) as HTMLButtonElement;
    assert.equal(save.disabled, true);
    assert.equal((screen.getByRole("button", { name: "Huỷ" }) as HTMLButtonElement).disabled, true);

    await userEvent.keyboard("{Escape}");
    assert.equal(closes.length, 0);
  });

  it("swaps the plain stock field for the size editor", async () => {
    setup();

    assert.ok(screen.getByLabelText("Thêm size"), "size editor is on by default");

    await userEvent.click(screen.getByRole("checkbox"));
    assert.equal(screen.queryByLabelText("Thêm size"), null);
    assert.ok(screen.getByLabelText(/Số lượng tồn kho/));
  });
});
