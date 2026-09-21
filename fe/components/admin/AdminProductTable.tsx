"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ImageOff, Pencil } from "lucide-react";
import { InlineNumberField } from "@/components/admin/InlineNumberField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { badgeLabels } from "@/lib/admin-labels";
import {
  getAriaSort,
  getDiscountPercent,
  getNextSort,
  getProductStatus,
  getStockLabel,
  getStockLevel,
  hasVariantStock,
  type SortColumn,
  type SortKey
} from "@/lib/admin-products";
import { getSoldOutSizes } from "@/lib/admin-variants";
import type { ProductQuickPatch } from "@/lib/product-store";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

export type AdminProductTableProps = {
  products: Product[];
  selectedIds: string[];
  busy: boolean;
  lowStockThreshold: number;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPatch: (product: Product, patch: ProductQuickPatch) => void | Promise<void>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
};

type RowProps = {
  product: Product;
  selected: boolean;
  busy: boolean;
  lowStockThreshold: number;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPatch: (product: Product, patch: ProductQuickPatch) => void | Promise<void>;
  onToggle: () => void;
};

const INTERACTIVE_SELECTOR = "button, input, select, textarea, a, label, [role='menu'], [role='switch'], [role='checkbox']";

export function AdminProductTable({ products, selectedIds, busy, lowStockThreshold, sort, onSort, onEdit, onDelete, onPatch, onToggle, onToggleAll }: AdminProductTableProps) {
  const allSelected = products.length > 0 && products.every((product) => selectedIds.includes(product.id));
  const someSelected = !allSelected && products.some((product) => selectedIds.includes(product.id));

  return (
    <>
      <ul className="grid gap-3 lg:hidden" aria-label="Danh sách sản phẩm">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedIds.includes(product.id)}
            busy={busy}
            lowStockThreshold={lowStockThreshold}
            onEdit={onEdit}
            onDelete={onDelete}
            onPatch={onPatch}
            onToggle={() => onToggle(product.id)}
          />
        ))}
      </ul>

      <Card className="hidden lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Danh sách sản phẩm</caption>
          <thead className="bg-porcelain text-xs font-semibold text-neutral-700">
            <tr>
              <th className="w-12 px-4 py-3" scope="col">
                <SelectionCheckbox checked={allSelected ? true : someSelected ? "indeterminate" : false} onChange={onToggleAll} label="Chọn tất cả sản phẩm đang hiển thị" />
              </th>
              <SortableHeader label="Sản phẩm" column="name" sort={sort} onSort={onSort} />
              <SortableHeader className="w-44" label="Giá bán" column="price" sort={sort} onSort={onSort} />
              <SortableHeader className="w-44" label="Tồn kho" column="stock" sort={sort} onSort={onSort} />
              <th className="w-40 px-3 py-3" scope="col">Trạng thái</th>
              <th className="w-32 px-4 py-3 text-right" scope="col"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                busy={busy}
                lowStockThreshold={lowStockThreshold}
                onEdit={onEdit}
                onDelete={onDelete}
                onPatch={onPatch}
                onToggle={() => onToggle(product.id)}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

type SortableHeaderProps = {
  label: string;
  column: SortColumn;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  className?: string;
};

function SortableHeader({ label, column, sort, onSort, className }: SortableHeaderProps) {
  const ariaSort = getAriaSort(sort, column);
  const Icon = ariaSort === "ascending" ? ArrowUp : ariaSort === "descending" ? ArrowDown : ArrowUpDown;

  return (
    <th className={`px-3 py-1 ${className ?? ""}`} scope="col" aria-sort={ariaSort}>
      <button
        className="inline-flex min-h-9 items-center gap-1.5 rounded-control font-semibold text-neutral-700 transition hover:text-ink"
        type="button"
        onClick={() => onSort(getNextSort(sort, column))}
      >
        {label}
        <Icon className={`size-3.5 ${ariaSort === "none" ? "text-neutral-600" : "text-ink"}`} aria-hidden="true" />
      </button>
    </th>
  );
}

function SelectionCheckbox({ checked, onChange, label }: { checked: boolean | "indeterminate"; onChange: () => void; label: string }) {
  return <Checkbox checked={checked} onCheckedChange={onChange} aria-label={label} />;
}

function ProductThumb({ product }: { product: Product }) {
  const src = product.image || product.images?.[0] || "";

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-field bg-neutral-100 sm:size-16">
      {src ? (
        <Image className="object-cover" src={src} alt="" fill sizes="64px" />
      ) : (
        <span className="grid size-full place-items-center text-neutral-600">
          <ImageOff className="size-5" aria-label="Chưa có ảnh" />
        </span>
      )}
    </div>
  );
}

function ProductIdentity({ product, onEdit }: { product: Product; onEdit: (product: Product) => void }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <button
          className="block max-w-full rounded-control text-left"
          type="button"
          onClick={() => onEdit(product)}
          title={product.name}
        >
          <span className="line-clamp-2 break-words text-sm font-semibold text-ink">{product.name}</span>
        </button>
        <p className="mt-0.5 truncate text-xs text-neutral-600" title={`${product.brand} · ${product.category}`}>
          {product.brand} · {product.category}
        </p>
        <Badge className="mt-1">{badgeLabels[product.badge]}</Badge>
      </div>
    </div>
  );
}

function PriceEditor({ product, busy, onPatch }: Pick<RowProps, "product" | "busy" | "onPatch">) {
  const discount = getDiscountPercent(product.price, product.originalPrice);

  return (
    <div>
      <InlineNumberField
        className="w-32"
        value={product.price}
        min={1}
        suffix="₫"
        label={`Giá bán của ${product.name}`}
        disabled={busy}
        onCommit={(price) => onPatch(product, { price })}
      />
      {product.originalPrice ? (
        <p className="mt-1 text-xs text-neutral-600">
          <span className="line-through">{formatCurrency(product.originalPrice)}</span>
          {discount ? <span className="ml-1.5 font-semibold text-shopo-orange">-{discount}%</span> : null}
        </p>
      ) : null}
    </div>
  );
}

function StockEditor({ product, busy, lowStockThreshold, onEdit, onPatch }: Pick<RowProps, "product" | "busy" | "lowStockThreshold" | "onEdit" | "onPatch">) {
  const level = getStockLevel(product.stock, lowStockThreshold);
  const tone = level === "out" ? "text-red-700" : level === "low" ? "text-amber-700" : "text-neutral-600";

  if (hasVariantStock(product)) {
    const soldOutSizes = getSoldOutSizes(product.variants);
    const shown = soldOutSizes.slice(0, 4).join(", ");
    const more = soldOutSizes.length - 4;

    return (
      <div>
        <button
          className="flex min-h-11 items-center rounded-control text-left lg:min-h-8"
          type="button"
          onClick={() => onEdit(product)}
          aria-label={`Sửa tồn kho theo size của ${product.name}`}
        >
          <span className="text-sm font-semibold tabular-nums text-ink">{(product.stock ?? 0).toLocaleString("vi-VN")}</span>
          <span className={`ml-2 text-xs font-medium ${tone}`}>{level === "ok" ? "" : getStockLabel(product.stock, lowStockThreshold)}</span>
        </button>
        {soldOutSizes.length ? (
          <p className="mt-1 text-xs font-medium text-red-700">
            Hết size: {shown}
            {more > 0 ? ` +${more}` : ""}
          </p>
        ) : (
          <p className="mt-1 text-xs text-neutral-600">{product.variants?.length ?? 0} biến thể</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <InlineNumberField
        className="w-20"
        value={product.stock ?? 0}
        min={0}
        label={`Tồn kho của ${product.name}`}
        disabled={busy}
        onCommit={(stock) => onPatch(product, { stock })}
      />
      <p className={`mt-1 text-xs font-medium ${tone}`}>{getStockLabel(product.stock, lowStockThreshold)}</p>
    </div>
  );
}

function ProductRow({ product, selected, busy, lowStockThreshold, onEdit, onDelete, onPatch, onToggle }: RowProps) {
  const status = getProductStatus(product);

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>) {
    if (!(event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
      onEdit(product);
    }
  }

  return (
    <tr
      className={`cursor-pointer align-middle transition-colors ${selected ? "bg-selected" : "hover:bg-paper"} ${
        status === "inactive" ? "opacity-70" : ""
      }`}
      onClick={handleRowClick}
    >
      <td className="px-4 py-3">
        <SelectionCheckbox checked={selected} onChange={onToggle} label={`Chọn ${product.name}`} />
      </td>
      <td className="max-w-0 px-3 py-3">
        <ProductIdentity product={product} onEdit={onEdit} />
      </td>
      <td className="px-3 py-3">
        <PriceEditor product={product} busy={busy} onPatch={onPatch} />
      </td>
      <td className="px-3 py-3">
        <StockEditor product={product} busy={busy} lowStockThreshold={lowStockThreshold} onEdit={onEdit} onPatch={onPatch} />
      </td>
      <td className="px-3 py-3">
        <StatusSwitch status={status} productName={product.name} disabled={busy} onChange={(next) => onPatch(product, { status: next })} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-sm" type="button" onClick={() => onEdit(product)} aria-label={`Sửa ${product.name}`} title="Sửa">
            <Pencil aria-hidden="true" />
          </Button>
          <RowActionsMenu
            productName={product.name}
            status={status}
            disabled={busy}
            onToggleStatus={() => onPatch(product, { status: status === "active" ? "inactive" : "active" })}
            onDelete={() => onDelete(product)}
          />
        </div>
      </td>
    </tr>
  );
}

function ProductCard({ product, selected, busy, lowStockThreshold, onEdit, onDelete, onPatch, onToggle }: RowProps) {
  const status = getProductStatus(product);

  return (
    <li className={`rounded-card border bg-background p-3 ${selected ? "border-foreground" : "border-border"} ${status === "inactive" ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <SelectionCheckbox checked={selected} onChange={onToggle} label={`Chọn ${product.name}`} />
        </div>
        <div className="min-w-0 flex-1">
          <ProductIdentity product={product} onEdit={onEdit} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3">
        <div>
          <p className="mb-1 text-xs font-semibold text-neutral-600">Giá bán</p>
          <PriceEditor product={product} busy={busy} onPatch={onPatch} />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-neutral-600">Tồn kho</p>
          <StockEditor product={product} busy={busy} lowStockThreshold={lowStockThreshold} onEdit={onEdit} onPatch={onPatch} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <StatusSwitch status={status} productName={product.name} disabled={busy} onChange={(next) => onPatch(product, { status: next })} />
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => onEdit(product)}>
            <Pencil aria-hidden="true" />
            Sửa
          </Button>
          <RowActionsMenu
            productName={product.name}
            status={status}
            disabled={busy}
            onToggleStatus={() => onPatch(product, { status: status === "active" ? "inactive" : "active" })}
            onDelete={() => onDelete(product)}
          />
        </div>
      </div>
    </li>
  );
}
