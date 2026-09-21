import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, type SelectOption } from "@/components/ui/select";

afterEach(cleanup);

const options: SelectOption[] = [
  { value: "", label: "Tất cả danh mục" },
  { value: "bags", label: "Túi xách" },
  { value: "shoes", label: "Giày" }
];

describe("Select", () => {
  it("shows the label of the selected option", () => {
    render(<Select aria-label="Danh mục" value="shoes" options={options} onValueChange={() => undefined} />);

    assert.equal(screen.getByRole("combobox", { name: "Danh mục" }).textContent?.includes("Giày"), true);
  });

  it("treats an option with an empty value as the 'no filter' choice", () => {
    render(<Select aria-label="Danh mục" value="" options={options} onValueChange={() => undefined} />);

    assert.equal(screen.getByRole("combobox").textContent?.includes("Tất cả danh mục"), true);
  });

  it("falls back to the placeholder when nothing matches", () => {
    render(
      <Select aria-label="Danh mục" placeholder="Chọn danh mục" value="" options={options.slice(1)} onValueChange={() => undefined} />
    );

    assert.equal(screen.getByRole("combobox").textContent?.includes("Chọn danh mục"), true);
  });

  it("opens with the keyboard and reports the chosen value", async () => {
    const chosen: string[] = [];
    render(<Select aria-label="Danh mục" value="" options={options} onValueChange={(value) => chosen.push(value)} />);

    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{Enter}");
    assert.equal(screen.getAllByRole("option").length, 3);

    await userEvent.click(screen.getByRole("option", { name: "Túi xách" }));
    assert.deepEqual(chosen, ["bags"]);
  });

  it("reports an empty string, not the internal sentinel, when 'all' is chosen", async () => {
    const chosen: string[] = [];
    render(<Select aria-label="Danh mục" value="shoes" options={options} onValueChange={(value) => chosen.push(value)} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Tất cả danh mục" }));

    assert.deepEqual(chosen, [""]);
  });

  it("exposes invalid and disabled state to assistive tech", () => {
    const { rerender } = render(<Select aria-label="Danh mục" invalid value="" options={options} onValueChange={() => undefined} />);
    assert.equal(screen.getByRole("combobox").getAttribute("aria-invalid"), "true");

    rerender(<Select aria-label="Danh mục" disabled value="" options={options} onValueChange={() => undefined} />);
    assert.equal((screen.getByRole("combobox") as HTMLButtonElement).disabled, true);
  });

  it("does not open when disabled", async () => {
    render(<Select aria-label="Danh mục" disabled value="" options={options} onValueChange={() => undefined} />);

    await userEvent.click(screen.getByRole("combobox"));
    assert.equal(screen.queryAllByRole("option").length, 0);
  });

  it("handles an empty option list without crashing", async () => {
    render(<Select aria-label="Danh mục" placeholder="Chưa có danh mục" value="" options={[]} onValueChange={() => undefined} />);

    assert.equal(screen.getByRole("combobox").textContent?.includes("Chưa có danh mục"), true);
  });
});
