"use client";

import Image from "next/image";
import { Check, Edit3, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

type AdminProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
};

export function AdminProductTable({ products, onEdit, onDelete, selectedIds, onToggle, onToggleAll }: AdminProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-ink">No products found</h2>
        <p className="mt-2 text-sm text-neutral-600">Adjust the filters or add a new product to the catalogue.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead className="bg-porcelain text-xs uppercase tracking-[0.14em] text-neutral-600">
            <tr>
              <th className="w-12 px-4 py-4"><SelectionBox checked={products.length > 0 && products.every((product) => selectedIds.includes(product.id))} onChange={onToggleAll} label="Select all visible products" /></th>
              <th className="px-4 py-4 font-semibold">Product</th>
              <th className="px-4 py-4 font-semibold">Category</th>
              <th className="px-4 py-4 font-semibold">Pricing</th>
              <th className="px-4 py-4 font-semibold">Badge</th>
              <th className="px-4 py-4 font-semibold">Inventory</th>
              <th className="px-4 py-4 font-semibold">Status</th>
              <th className="px-4 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} selected={selectedIds.includes(product.id)} onToggle={() => onToggle(product.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectionBox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" aria-label={label} aria-pressed={checked} onClick={onChange} className={`grid size-5 place-items-center border transition ${checked ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-transparent hover:border-ink"}`}><Check className="size-3.5" /></button>;
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  selected,
  onToggle
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  selected: boolean;
  onToggle: () => void;
}) {
  const productImage = product.image || product.images?.[0] || "";

  return (
    <tr className={`align-middle transition-colors ${selected ? "bg-[#fffaf4]" : "hover:bg-[#fcfbf9]"}`}>
      <td className="px-4 py-4"><SelectionBox checked={selected} onChange={onToggle} label={`Select ${product.name}`} /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative size-16 overflow-hidden bg-neutral-100">
            <Image
              className="object-cover"
              src={productImage}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="64px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">{product.brand}</p>
            <p className="mt-1 max-w-64 truncate text-sm font-medium text-ink">{product.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-neutral-700">{product.category}</td>
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-xs text-neutral-500 line-through">{formatCurrency(product.originalPrice)}</span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex bg-smoke px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
          {product.badge}
        </span>
      </td>
      <td className="px-4 py-4"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${(product.stock ?? 0) <= 3 ? "bg-red-500" : "bg-emerald-500"}`} /><span className={`text-sm ${(product.stock ?? 0) <= 3 ? "font-semibold text-red-700" : "text-neutral-700"}`}>{product.stock ?? 0} in stock</span></div>{(product.stock ?? 0) <= 3 ? <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">Low stock</span> : null}</td>
      <td className="px-4 py-4">
        <span className={product.status === "inactive" ? "text-sm font-medium text-neutral-500" : "text-sm font-medium text-green-700"}>
          {product.status ?? "active"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            className="grid size-9 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.name}`}
            title="Edit"
          >
            <Edit3 className="size-4" />
          </button>
          <button
            className="grid size-9 place-items-center border border-neutral-200 text-red-700 transition hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-700/15"
            type="button"
            onClick={() => onDelete(product)}
            aria-label={`Delete ${product.name}`}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
