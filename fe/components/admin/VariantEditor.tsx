"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseWholeNumber } from "@/lib/admin-products";
import {
  addColor,
  addSizes,
  cellKey,
  editorToVariants,
  fillCells,
  getEditorTotal,
  getSizePresets,
  getSoldOutSizes,
  guessColorHex,
  removeColor,
  removeSize,
  setCell,
  shouldSuggestSwap,
  swapAxes,
  type VariantEditorState
} from "@/lib/admin-variants";
import { cn } from "@/lib/utils";
import type { Audience, ProductType } from "@/types/product";

export type VariantEditorProps = {
  state: VariantEditorState;
  onChange: (state: VariantEditorState) => void;
  audience: Audience | undefined;
  productType: ProductType | undefined;
  lowStockThreshold: number;
  invalidCells: string[];
  error?: string;
  disabled?: boolean;
};

const chipClass = "inline-flex items-center gap-1.5 rounded-field border border-input bg-background py-0.5 pl-2.5 pr-0.5 text-sm text-ink";

export function VariantEditor({ state, onChange, audience, productType, lowStockThreshold, invalidCells, error, disabled = false }: VariantEditorProps) {
  const [sizeDraft, setSizeDraft] = useState("");
  const [colorDraft, setColorDraft] = useState("");
  const [colorHex, setColorHex] = useState("#171717");
  const [fillDraft, setFillDraft] = useState("");

  const presets = useMemo(() => getSizePresets(audience, productType), [audience, productType]);
  const total = getEditorTotal(state);
  const soldOutSizes = useMemo(() => getSoldOutSizes(editorToVariants(state, "X")), [state]);
  const invalid = new Set(invalidCells);
  const hasMatrix = state.colors.length > 0 && state.sizes.length > 0;
  const suggestSwap = shouldSuggestSwap(state);

  function submitSizes() {
    onChange(addSizes(state, sizeDraft.split(/[,;\n]/)));
    setSizeDraft("");
  }

  function submitColor() {
    onChange(addColor(state, colorDraft, colorHex));
    setColorDraft("");
    setColorHex("#171717");
  }

  return (
    <div className="grid gap-5" aria-describedby={error ? "variant-editor-error" : undefined}>
      <div>
        <p className="text-sm font-medium text-neutral-800">Size</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {state.sizes.map((size) => (
            <span className={chipClass} key={size}>
              {size}
              <button
                className="grid size-8 place-items-center rounded-control text-neutral-600 hover:text-red-700"
                type="button"
                aria-label={`Xoá size ${size}`}
                disabled={disabled}
                onClick={() => onChange(removeSize(state, size))}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          {state.sizes.length === 0 ? <span className="text-sm text-neutral-600">Chưa có size nào.</span> : null}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            className="sm:w-64"
            placeholder="Nhập size, ví dụ 38, 39, 40"
            aria-label="Thêm size"
            value={sizeDraft}
            disabled={disabled}
            onChange={(event) => setSizeDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSizes();
              }
            }}
          />
          <Button className="shrink-0" variant="outline" type="button" disabled={disabled || !sizeDraft.trim()} onClick={submitSizes}>
            <Plus className="mr-1 inline size-4" aria-hidden="true" />
            Thêm size
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-600">Thêm nhanh:</span>
          {presets.map((preset) => (
            <button
              className="rounded-field border border-dashed border-input px-2.5 py-1 text-neutral-800 transition hover:border-foreground hover:bg-porcelain disabled:opacity-50"
              type="button"
              key={preset.label}
              disabled={disabled}
              onClick={() => onChange(addSizes(state, preset.sizes))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-800">Màu sắc</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {state.colors.map((color) => (
            <span className={chipClass} key={color.name}>
              <span className="size-4 rounded-control border border-border" style={{ backgroundColor: color.hex }} aria-hidden="true" />
              {color.name}
              <button
                className="grid size-8 place-items-center rounded-control text-neutral-600 hover:text-red-700"
                type="button"
                aria-label={`Xoá màu ${color.name}`}
                disabled={disabled}
                onClick={() => onChange(removeColor(state, color.name))}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          {state.colors.length === 0 ? <span className="text-sm text-neutral-600">Chưa có màu nào. Thêm size trước sẽ tự tạo màu “Mặc định”.</span> : null}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            className="sm:w-64"
            placeholder="Tên màu, ví dụ Đen, Nâu, Kem"
            aria-label="Thêm màu"
            value={colorDraft}
            disabled={disabled}
            onChange={(event) => {
              setColorDraft(event.target.value);
              setColorHex(guessColorHex(event.target.value));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitColor();
              }
            }}
          />
          <input
            className="h-11 w-12 shrink-0 cursor-pointer rounded-field border border-input bg-background p-1 hover:border-foreground disabled:opacity-50"
            type="color"
            aria-label="Chọn mã màu"
            value={colorHex}
            disabled={disabled}
            onChange={(event) => setColorHex(event.target.value)}
          />
          <Button className="shrink-0" variant="outline" type="button" disabled={disabled || !colorDraft.trim()} onClick={submitColor}>
            <Plus className="mr-1 inline size-4" aria-hidden="true" />
            Thêm màu
          </Button>
        </div>
      </div>

      {suggestSwap ? (
        <div className="flex flex-col gap-2 rounded-field border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between" role="status">
          <span>Có vẻ các con số ({state.colors.slice(0, 3).map((color) => color.name).join(", ")}…) là size chứ không phải màu.</span>
          <Button className="shrink-0" variant="outline" type="button" disabled={disabled} onClick={() => onChange(swapAxes(state))}>
            Đổi chỗ Màu ↔ Size
          </Button>
        </div>
      ) : null}

      {hasMatrix ? (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-neutral-800 sm:mr-auto">Số lượng tồn kho theo size</p>
            <Input
              className="w-24"
              inputMode="numeric"
              placeholder="Số lượng"
              aria-label="Số lượng để điền hàng loạt"
              value={fillDraft}
              disabled={disabled}
              onChange={(event) => setFillDraft(event.target.value)}
            />
            <Button className="shrink-0" variant="outline" type="button" disabled={disabled || parseWholeNumber(fillDraft) === null} onClick={() => onChange(fillCells(state, fillDraft, "empty"))}>
              Điền ô trống
            </Button>
            <Button className="shrink-0" variant="outline" type="button" disabled={disabled || parseWholeNumber(fillDraft) === null} onClick={() => onChange(fillCells(state, fillDraft, "all"))}>
              Điền tất cả
            </Button>
          </div>

          <div className="mt-2 overflow-x-auto rounded-card border border-border">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Số lượng tồn kho theo màu và size. Ô để trống nghĩa là không bán.</caption>
              <thead className="bg-porcelain text-xs font-semibold text-neutral-700">
                <tr>
                  <th className="sticky left-0 z-10 min-w-28 bg-porcelain px-3 py-2 text-left" scope="col">Màu \ Size</th>
                  {state.sizes.map((size) => (
                    <th className="min-w-16 px-2 py-2 text-center" scope="col" key={size}>{size}</th>
                  ))}
                  <th className="min-w-16 px-3 py-2 text-right" scope="col">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {state.colors.map((color) => {
                  const rowTotal = state.sizes.reduce((sum, size) => sum + (parseWholeNumber(state.stocks[cellKey(color.name, size)] ?? "") ?? 0), 0);

                  return (
                    <tr key={color.name}>
                      <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium text-ink" scope="row">
                        <span className="flex items-center gap-2">
                          <span className="size-3.5 shrink-0 rounded-control border border-border" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                          <span className="max-w-32 truncate">{color.name}</span>
                        </span>
                      </th>
                      {state.sizes.map((size) => {
                        const key = cellKey(color.name, size);
                        const text = state.stocks[key] ?? "";
                        const parsed = text.trim() === "" ? null : parseWholeNumber(text);
                        const isInvalid = invalid.has(key);
                        const tone = isInvalid
                          ? "border-red-500 bg-red-50"
                          : parsed === null
                            ? "border-input bg-neutral-50"
                            : parsed <= 0
                              ? "border-red-300 bg-red-50 text-red-800"
                              : parsed <= lowStockThreshold
                                ? "border-amber-300 bg-amber-50 text-amber-900"
                                : "border-input bg-background";

                        return (
                          <td className="px-1.5 py-1.5 text-center" key={size}>
                            <input
                              className={cn("h-11 w-14 rounded-control border text-center tabular-nums transition-colors hover:border-foreground focus:border-foreground disabled:opacity-50 lg:h-9", tone)}
                              inputMode="numeric"
                              placeholder="—"
                              aria-label={`${color.name}, size ${size}: số lượng`}
                              aria-invalid={isInvalid}
                              value={text}
                              disabled={disabled}
                              onChange={(event) => onChange(setCell(state, color.name, size, event.target.value))}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-ink">{rowTotal.toLocaleString("vi-VN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-sm text-neutral-600">
            <strong className="tabular-nums text-ink">Tổng: {total.toLocaleString("vi-VN")} sản phẩm.</strong>{" "}
            Ô để trống = không bán size đó. Ô bằng 0 = hết hàng.
            {soldOutSizes.length ? <span className="ml-1 text-red-700">Hết hàng: size {soldOutSizes.join(", ")}.</span> : null}
          </p>
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-input bg-porcelain px-4 py-6 text-center text-sm text-neutral-600">
          Thêm ít nhất một size để bắt đầu nhập tồn kho theo size.
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-700" id="variant-editor-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
