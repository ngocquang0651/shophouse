"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Save, Trash2, X } from "lucide-react";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  apiBadgeOptions,
  audienceLabels,
  badgeLabels,
  productTypeLabels,
  statusLabels,
  toApiBadge,
  type ApiBadge
} from "@/lib/admin-labels";
import { getDiscountPercent, parseWholeNumber } from "@/lib/admin-products";
import { buildErrorSummary } from "@/lib/form-errors";
import {
  editorToVariants,
  emptyEditor,
  makeSkuBase,
  validateEditor,
  variantsToEditor,
  type VariantEditorState
} from "@/lib/admin-variants";
import type { ProductWriteValues } from "@/lib/product-payload";
import { uploadProductImages } from "@/lib/product-store";
import { cn, formatCurrency } from "@/lib/utils";
import { audiences, productTypes, type Product, type ProductStatus } from "@/types/product";

export type ProductFormValues = ProductWriteValues;

export type ProductFormProps = {
  product: Product | null;
  open: boolean;
  categoryOptions: string[];
  brandOptions: string[];
  lowStockThreshold: number;
  onClose: () => void;
  onSubmit: (product: ProductFormValues, productId?: string) => void | Promise<void>;
  isSaving?: boolean;
};

type ProductFormState = {
  name: string;
  brand: string;
  audience: NonNullable<Product["audience"]>;
  productType: NonNullable<Product["productType"]>;
  category: string;
  price: string;
  originalPrice: string;
  images: string[];
  badge: ApiBadge;
  description: string;
  stock: string;
  status: ProductStatus;
  useVariants: boolean;
  editor: VariantEditorState;
};

type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyState: ProductFormState = {
  name: "",
  brand: "",
  audience: "unisex",
  productType: "shoes",
  category: "",
  price: "",
  originalPrice: "",
  images: [],
  badge: "New",
  description: "",
  stock: "0",
  status: "active",
  useVariants: true,
  editor: emptyEditor()
};

const statusChoices = (Object.keys(statusLabels) as ProductStatus[]).map((status) => ({ value: status, label: statusLabels[status] }));
const badgeChoices = apiBadgeOptions.map((badge) => ({ value: badge, label: badgeLabels[badge] }));
const audienceChoices = audiences.map((audience) => ({ value: audience, label: audienceLabels[audience] }));
const productTypeChoices = productTypes.map((productType) => ({ value: productType, label: productTypeLabels[productType] }));

function toFormState(product: Product | null): ProductFormState {
  if (!product) {
    return emptyState;
  }

  const gallery = product.images?.length ? product.images : [];
  const images = [product.image, ...gallery.filter((url) => url !== product.image)].filter(Boolean);

  return {
    name: product.name,
    brand: product.brand,
    audience: product.audience ?? "unisex",
    productType: product.productType ?? "shoes",
    category: product.category,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : "",
    images,
    badge: toApiBadge(product.badge),
    description: product.description ?? "",
    stock: String(product.stock ?? 0),
    status: product.status ?? "active",
    useVariants: (product.variants?.length ?? 0) > 0,
    editor: variantsToEditor(product.variants)
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProductForm({ product, open, categoryOptions, brandOptions, lowStockThreshold, onClose, onSubmit, isSaving = false }: ProductFormProps) {
  const [initialState] = useState(() => toFormState(product));
  const [form, setForm] = useState<ProductFormState>(initialState);
  const initial = initialState;
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [invalidCells, setInvalidCells] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  function requestClose() {
    if (isSaving) {
      return;
    }

    if (dirty && !window.confirm("Bạn có thay đổi chưa lưu. Đóng và bỏ các thay đổi này?")) {
      return;
    }

    onClose();
  }

  const categoryChoices = useMemo(
    () => Array.from(new Set([...categoryOptions, form.category].filter(Boolean))),
    [categoryOptions, form.category]
  );

  if (!open) {
    return null;
  }

  function updateField<Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  function validate() {
    const nextErrors: ProductFormErrors = {};
    const price = parseWholeNumber(form.price);
    const originalPrice = form.originalPrice.trim() ? parseWholeNumber(form.originalPrice) : undefined;
    const stock = parseWholeNumber(form.stock);
    const variantCheck = form.useVariants ? validateEditor(form.editor) : null;

    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên sản phẩm.";
    if (!form.brand.trim()) nextErrors.brand = "Vui lòng nhập thương hiệu.";
    if (!form.category.trim()) nextErrors.category = "Vui lòng chọn danh mục.";
    if (!form.images.length) nextErrors.images = "Thêm ít nhất một ảnh sản phẩm.";
    if (price === null || price <= 0) nextErrors.price = "Giá bán phải là số nguyên lớn hơn 0.";
    if (originalPrice === null || (originalPrice !== undefined && originalPrice <= 0)) {
      nextErrors.originalPrice = "Giá gốc phải là số nguyên lớn hơn 0.";
    } else if (originalPrice !== undefined && price !== null && originalPrice <= price) {
      nextErrors.originalPrice = "Giá gốc phải cao hơn giá bán. Để trống nếu không giảm giá.";
    }
    if (!form.useVariants && stock === null) nextErrors.stock = "Tồn kho phải là số nguyên từ 0 trở lên.";
    if (variantCheck && !variantCheck.ok) nextErrors.editor = variantCheck.message;

    setInvalidCells(variantCheck?.invalidCells ?? []);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // Focus the summary first: it lists every problem and links to each field.
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return false;
    }

    return true;
  }

  async function handleUpload(files: FileList | null) {
    const selected = files ? Array.from(files) : [];
    if (!selected.length) {
      return;
    }

    if (form.images.length + selected.length > MAX_IMAGES) {
      setUploadError(`Mỗi sản phẩm tối đa ${MAX_IMAGES} ảnh.`);
      return;
    }

    const tooLarge = selected.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setUploadError(`Ảnh "${tooLarge.name}" lớn hơn 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const urls = await uploadProductImages(selected);
      setForm((current) => ({ ...current, images: [...current.images, ...urls] }));
      setErrors((current) => ({ ...current, images: undefined }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không tải được ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  }

  function addImageFromUrl() {
    const value = urlDraft.trim();

    if (!isHttpUrl(value)) {
      setUploadError("Đường link ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    if (form.images.includes(value)) {
      setUploadError("Ảnh này đã được thêm.");
      return;
    }

    if (form.images.length >= MAX_IMAGES) {
      setUploadError(`Mỗi sản phẩm tối đa ${MAX_IMAGES} ảnh.`);
      return;
    }

    setUploadError("");
    setUrlDraft("");
    setForm((current) => ({ ...current, images: [...current.images, value] }));
    setErrors((current) => ({ ...current, images: undefined }));
  }

  function removeImage(url: string) {
    setForm((current) => ({ ...current, images: current.images.filter((image) => image !== url) }));
  }

  function setPrimaryImage(url: string) {
    setForm((current) => ({ ...current, images: [url, ...current.images.filter((image) => image !== url)] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isUploading || !validate()) {
      return;
    }

    const price = parseWholeNumber(form.price) ?? 0;
    const originalPrice = form.originalPrice.trim() ? parseWholeNumber(form.originalPrice) ?? undefined : undefined;
    const variants = form.useVariants ? editorToVariants(form.editor, makeSkuBase(form.name)) : [];
    const stock = form.useVariants ? variants.reduce((total, variant) => total + variant.stock, 0) : parseWholeNumber(form.stock) ?? 0;

    void onSubmit(
      {
        name: form.name.trim(),
        brand: form.brand.trim(),
        audience: form.audience,
        productType: form.productType,
        category: form.category.trim(),
        price,
        originalPrice,
        image: form.images[0] ?? "",
        images: form.images,
        badge: form.badge,
        description: form.description.trim(),
        stock,
        status: form.status,
        variants
      },
      product?.id
    );
  }

  const priceValue = parseWholeNumber(form.price);
  const originalValue = form.originalPrice.trim() ? parseWholeNumber(form.originalPrice) : null;
  const discount = priceValue !== null && originalValue !== null ? getDiscountPercent(priceValue, originalValue) : null;
  const busy = isSaving || isUploading;
  const errorSummary = buildErrorSummary(errors);

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      {/* A long form: clicking the backdrop must never throw away typing, so only Esc / Huỷ / X close it. */}
      <DialogContent
        className="max-w-4xl scroll-pb-24"
        aria-describedby={undefined}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("product-name")?.focus();
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:px-6">
            <DialogTitle className="text-xl font-semibold text-ink">{product ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
            <DialogClose asChild>
              <Button variant="outline" size="icon" type="button" disabled={isSaving} aria-label="Đóng biểu mẫu" title="Đóng">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>

          <div className="grid gap-8 p-5 sm:p-6">
            {errorSummary.length > 0 ? (
              <div
                ref={summaryRef}
                role="alert"
                tabIndex={-1}
                aria-labelledby="form-error-title"
                className="rounded-card border border-red-600 bg-red-50 p-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-red-700"
              >
                <h3 className="text-sm font-semibold text-red-900" id="form-error-title">
                  Vui lòng kiểm tra {errorSummary.length} mục sau
                </h3>
                <ul className="mt-2 grid gap-1 text-sm">
                  {errorSummary.map((item) => (
                    <li key={item.key}>
                      <button
                        className="min-h-8 rounded-control text-left text-red-900 underline underline-offset-2"
                        type="button"
                        onClick={() => document.getElementById(item.targetId)?.focus()}
                      >
                        {item.message}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Section title="Thông tin cơ bản">
              <Field id="product-name" label="Tên sản phẩm" required error={errors.name}>
                <Input
                  id="product-name"
                  
                  data-autofocus
                  autoComplete="off"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "product-name-error" : undefined}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="product-brand" label="Thương hiệu" required error={errors.brand}>
                  <Input
                    id="product-brand"
                    
                    list="brand-options"
                    autoComplete="off"
                    value={form.brand}
                    aria-invalid={Boolean(errors.brand)}
                    aria-describedby={errors.brand ? "product-brand-error" : undefined}
                    onChange={(event) => updateField("brand", event.target.value)}
                  />
                  <datalist id="brand-options">
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </Field>

                <Field id="product-category" label="Danh mục" required error={errors.category}>
                  <Select
                    id="product-category"
                    placeholder="Chọn danh mục"
                    value={form.category}
                    options={categoryChoices.map((category) => ({ value: category, label: category }))}
                    invalid={Boolean(errors.category)}
                    aria-describedby={errors.category ? "product-category-error" : undefined}
                    onValueChange={(category) => updateField("category", category)}
                  />
                </Field>
              </div>

              <Field id="product-description" label="Mô tả">
                <Textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </Field>
            </Section>

            <Section title="Hình ảnh" hint={`Ảnh đầu tiên là ảnh đại diện. Tối đa ${MAX_IMAGES} ảnh, mỗi ảnh không quá 5MB.`}>
              <div id="product-images" tabIndex={-1} data-invalid={Boolean(errors.images)} className="grid gap-3">
                <div className="flex flex-wrap gap-3">
                  <label className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring")}>
                    {isUploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
                    {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={busy}
                      onChange={(event) => {
                        void handleUpload(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <Button className="px-2 font-medium text-neutral-700" variant="link" type="button" aria-expanded={showUrlInput} onClick={() => setShowUrlInput((current) => !current)}>
                    <Link2 aria-hidden="true" />
                    Thêm ảnh từ đường link
                  </Button>
                </div>

                {showUrlInput ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="https://..."
                      inputMode="url"
                      aria-label="Đường link ảnh"
                      value={urlDraft}
                      onChange={(event) => setUrlDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addImageFromUrl();
                        }
                      }}
                    />
                    <Button className="shrink-0" variant="outline" type="button" onClick={addImageFromUrl}>
                      Thêm ảnh
                    </Button>
                  </div>
                ) : null}

                {uploadError ? <p className="text-sm text-red-700" role="alert">{uploadError}</p> : null}
                {errors.images ? <p className="text-sm text-red-700" id="product-images-error">{errors.images}</p> : null}

                {form.images.length ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {form.images.map((url, index) => (
                      <li className="group relative aspect-square overflow-hidden rounded-card border border-border bg-neutral-100" key={url}>
                        <Image className="object-cover" src={url} alt={`Ảnh sản phẩm ${index + 1}`} fill sizes="160px" />
                        {index === 0 ? (
                          <Badge className="absolute left-2 top-2 bg-white py-1 font-semibold text-ink">Ảnh đại diện</Badge>
                        ) : null}
                        <div className="absolute inset-x-2 bottom-2 flex gap-2">
                          {index !== 0 ? (
                            <Button
                              className="h-10 flex-1 border-transparent px-2 text-xs hover:bg-ink hover:text-white"
                              variant="outline"
                              type="button"
                              onClick={() => setPrimaryImage(url)}
                            >
                              Đặt làm ảnh chính
                            </Button>
                          ) : (
                            <span className="flex-1" />
                          )}
                          <Button
                            className="size-10 border-transparent text-red-700 hover:border-red-700 hover:bg-red-700 hover:text-white"
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => removeImage(url)}
                            aria-label={`Xoá ảnh ${index + 1}`}
                            title="Xoá ảnh"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Section>

            <Section title="Giá bán">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="product-price" label="Giá bán (₫)" required error={errors.price} hint={priceValue ? formatCurrency(priceValue) : undefined}>
                  <Input
                    id="product-price"
                    
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.price}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errors.price ? "product-price-error" : undefined}
                    onChange={(event) => updateField("price", event.target.value)}
                  />
                </Field>

                <Field
                  id="product-original-price"
                  label="Giá gốc (₫)"
                  error={errors.originalPrice}
                  hint={discount ? `Giảm ${discount}% so với giá gốc` : "Chỉ nhập khi sản phẩm đang giảm giá"}
                >
                  <Input
                    id="product-original-price"
                    
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.originalPrice}
                    aria-invalid={Boolean(errors.originalPrice)}
                    aria-describedby={errors.originalPrice ? "product-original-price-error" : undefined}
                    onChange={(event) => updateField("originalPrice", event.target.value)}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Tồn kho">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={form.useVariants}
                  onCheckedChange={(checked) => updateField("useVariants", checked === true)}
                />
                <span>
                  <span className="font-medium text-neutral-800">Sản phẩm có nhiều size hoặc màu</span>
                  <span className="block text-neutral-600">Quản lý tồn kho riêng cho từng size để khách chỉ đặt được size còn hàng.</span>
                </span>
              </label>

              {!form.useVariants && initial.useVariants && initial.editor.colors.length > 0 ? (
                <p className="rounded-field border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                  Các size và màu hiện có sẽ bị xoá khi bạn lưu. Bật lại ô trên nếu muốn giữ.
                </p>
              ) : null}

              {form.useVariants ? (
                <div id="product-variants" tabIndex={-1} data-invalid={Boolean(errors.editor)}>
                  <VariantEditor
                    state={form.editor}
                    onChange={(editor) => {
                      setForm((current) => ({ ...current, editor }));
                      setInvalidCells([]);
                      setErrors((current) => (current.editor ? { ...current, editor: undefined } : current));
                    }}
                    audience={form.audience}
                    productType={form.productType}
                    lowStockThreshold={lowStockThreshold}
                    invalidCells={invalidCells}
                    error={errors.editor}
                    disabled={isSaving}
                  />
                </div>
              ) : (
                <div className="max-w-xs">
                  <Field id="product-stock" label="Số lượng tồn kho" required error={errors.stock}>
                    <Input
                      id="product-stock"
                      
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.stock}
                      aria-invalid={Boolean(errors.stock)}
                      aria-describedby={errors.stock ? "product-stock-error" : undefined}
                      onChange={(event) => updateField("stock", event.target.value)}
                    />
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Hiển thị">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="product-status" label="Trạng thái">
                  <Select
                    id="product-status"
                    value={form.status}
                    options={statusChoices}
                    onValueChange={(status) => updateField("status", status as ProductStatus)}
                  />
                </Field>

                <Field id="product-badge" label="Nhãn hiển thị">
                  <Select
                    id="product-badge"
                    value={form.badge}
                    options={badgeChoices}
                    onValueChange={(badge) => updateField("badge", badge as ApiBadge)}
                  />
                </Field>
              </div>

              <details className="rounded-card border border-border bg-porcelain px-4 py-3 text-sm">
                <summary className="cursor-pointer rounded-control font-medium text-neutral-800">
                  Vị trí trên cửa hàng (nâng cao)
                </summary>
                <p className="mt-2 text-neutral-600">Quyết định sản phẩm xuất hiện ở mục nào khi khách duyệt cửa hàng.</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field id="product-audience" label="Dành cho">
                    <Select
                      id="product-audience"
                      value={form.audience}
                      options={audienceChoices}
                      onValueChange={(audience) => updateField("audience", audience as ProductFormState["audience"])}
                    />
                  </Field>

                  <Field id="product-type" label="Loại sản phẩm">
                    <Select
                      id="product-type"
                      value={form.productType}
                      options={productTypeChoices}
                      onValueChange={(productType) => updateField("productType", productType as ProductFormState["productType"])}
                    />
                  </Field>
                </div>
              </details>
            </Section>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-end sm:rounded-b-dialog sm:px-6">
            {dirty ? <p className="text-sm text-neutral-600 sm:mr-auto">Có thay đổi chưa lưu</p> : null}
            <Button variant="outline" type="button" onClick={requestClose} disabled={isSaving}>
              Huỷ
            </Button>
            <Button className="px-5" type="submit" disabled={busy} loading={isSaving}>
              {isSaving ? null : <Save aria-hidden="true" />}
              {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="grid min-w-0 gap-4">
      <legend className="mb-1 text-base font-semibold text-ink">{title}</legend>
      {hint ? <p className="-mt-2 text-sm text-neutral-600">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  required = false,
  error,
  hint,
  children
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800" htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-red-600" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-neutral-600">{hint}</p>
      ) : null}
    </div>
  );
}
