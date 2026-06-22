"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { ImagePlus, Save, Trash2, X } from "lucide-react";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { uploadProductImages } from "@/lib/product-store";
import { cn } from "@/lib/utils";
import type { Product, ProductBadge, ProductStatus } from "@/types/product";

type ProductFormProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, "id" | "createdAt" | "updatedAt">, productId?: string) => void | Promise<void>;
  isSaving?: boolean;
};

type ProductFormState = {
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  image: string;
  images: string[];
  badge: ProductBadge;
  description: string;
  stock: string;
  status: ProductStatus;
};

type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;

const badgeOptions: ProductBadge[] = ["New", "Sale", "Luxury"];
const statusOptions: ProductStatus[] = ["active", "inactive"];

const emptyState: ProductFormState = {
  name: "",
  brand: "",
  category: "",
  price: "",
  originalPrice: "",
  image: "",
  images: [],
  badge: "Luxury",
  description: "",
  stock: "0",
  status: "active"
};

export function ProductForm({ product, open, onClose, onSubmit, isSaving = false }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(emptyState);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const brandOptions = useMemo(() => brands.map((brand) => brand.name), []);
  const categoryOptions = useMemo(() => categories.map((category) => category.name), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setUploadError("");
    setForm(
      product
        ? {
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: String(product.price),
            originalPrice: product.originalPrice ? String(product.originalPrice) : "",
            image: product.image,
            images: product.images?.length ? product.images : [product.image].filter(Boolean),
            badge: product.badge,
            description: product.description ?? "",
            stock: String(product.stock ?? 0),
            status: product.status ?? "active"
          }
        : emptyState
    );
  }, [open, product]);

  if (!open) {
    return null;
  }

  function updateField<Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors: ProductFormErrors = {};
    const images = form.images.filter(Boolean);
    const price = Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;
    const stock = Number(form.stock);

    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!images.length && !form.image.trim()) nextErrors.image = "Upload at least one image or add an image URL.";
    if (!form.price || Number.isNaN(price) || price <= 0) nextErrors.price = "Price must be greater than 0.";
    if (originalPrice !== undefined && (Number.isNaN(originalPrice) || originalPrice <= 0)) {
      nextErrors.originalPrice = "Original price must be greater than 0.";
    }
    if (!form.stock || Number.isNaN(stock) || stock < 0) nextErrors.stock = "Stock cannot be negative.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const urls = await uploadProductImages(Array.from(files));
      setForm((current) => {
        const nextImages = [...current.images, ...urls];
        return {
          ...current,
          image: current.image || nextImages[0] || "",
          images: nextImages
        };
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload images.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm((current) => {
      const nextImages = current.images.filter((image) => image !== url);
      return {
        ...current,
        image: current.image === url ? nextImages[0] ?? "" : current.image,
        images: nextImages
      };
    });
  }

  function setPrimaryImage(url: string) {
    setForm((current) => ({
      ...current,
      image: url,
      images: [url, ...current.images.filter((image) => image !== url)]
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    onSubmit(
      {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        image: form.image.trim() || form.images[0],
        images: form.images.length ? form.images : [form.image.trim()].filter(Boolean),
        badge: form.badge,
        description: form.description.trim(),
        stock: Number(form.stock),
        status: form.status
      },
      product?.id
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6" role="dialog" aria-modal="true">
      <form className="mx-auto w-full max-w-3xl bg-white p-5 shadow-soft sm:p-6" onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
              Product Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {product ? "Edit product" : "Add product"}
            </h2>
          </div>
          <button
            className="grid size-9 place-items-center border border-neutral-200 text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close product form"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Product name" error={errors.name}>
            <input className={inputClass(errors.name)} value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </Field>

          <Field label="Brand" error={errors.brand}>
            <input className={inputClass(errors.brand)} list="brand-options" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} />
            <datalist id="brand-options">
              {brandOptions.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </Field>

          <Field label="Category" error={errors.category}>
            <select className={inputClass(errors.category)} value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Product images" error={errors.image}>
              <div className="grid gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className={inputClass(errors.image)}
                    placeholder="https://example.com/image.jpg"
                    value={form.image}
                    onBlur={(event) => {
                      const value = event.target.value;
                      if (!value.startsWith("http")) {
                        return;
                      }

                      setForm((current) => ({
                        ...current,
                        images: value && !current.images.includes(value) ? [value, ...current.images] : current.images
                      }));
                    }}
                    onChange={(event) => updateField("image", event.target.value)}
                  />
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 border border-neutral-300 px-4 text-sm font-semibold text-ink transition hover:border-ink">
                    <ImagePlus className="size-4" />
                    {isUploading ? "Uploading..." : "Upload"}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isSaving || isUploading}
                      onChange={(event) => void handleUpload(event.target.files)}
                    />
                  </label>
                </div>
                {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}
                {form.images.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {form.images.map((url) => (
                      <div className="group relative aspect-square overflow-hidden border border-neutral-200 bg-neutral-100" key={url}>
                        <Image className="object-cover" src={url} alt="Product upload" fill sizes="160px" />
                        {form.image === url ? (
                          <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
                            Primary
                          </span>
                        ) : null}
                        <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                          <button
                            className="h-9 flex-1 bg-white px-2 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
                            type="button"
                            onClick={() => setPrimaryImage(url)}
                          >
                            Main
                          </button>
                          <button
                            className="grid size-9 place-items-center bg-white text-red-700 transition hover:bg-red-700 hover:text-white"
                            type="button"
                            onClick={() => removeImage(url)}
                            aria-label="Remove image"
                            title="Remove image"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
          </div>

          <Field label="Price" error={errors.price}>
            <input className={inputClass(errors.price)} min="0" step="1" type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
          </Field>

          <Field label="Original price" error={errors.originalPrice}>
            <input className={inputClass(errors.originalPrice)} min="0" step="1" type="number" value={form.originalPrice} onChange={(event) => updateField("originalPrice", event.target.value)} />
          </Field>

          <Field label="Badge">
            <select className={inputClass()} value={form.badge} onChange={(event) => updateField("badge", event.target.value as ProductBadge)}>
              {badgeOptions.map((badge) => (
                <option key={badge} value={badge}>
                  {badge}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select className={inputClass()} value={form.status} onChange={(event) => updateField("status", event.target.value as ProductStatus)}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Stock" error={errors.stock}>
            <input className={inputClass(errors.stock)} min="0" step="1" type="number" value={form.stock} onChange={(event) => updateField("stock", event.target.value)} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                className="min-h-28 w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 border border-neutral-300 px-4 text-sm font-semibold text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            type="button"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
            type="submit"
            disabled={isSaving}
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="block space-y-2">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      {children}
      {error ? <span className="block text-sm text-red-700">{error}</span> : null}
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "h-11 w-full border bg-white px-3 text-sm outline-none transition hover:border-neutral-500 focus:border-ink focus:ring-2 focus:ring-ink/10",
    error ? "border-red-300" : "border-neutral-300"
  );
}
