"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, PackageOpen, RefreshCw, SearchX, ShieldAlert } from "lucide-react";
import { AdminBulkBar } from "@/components/admin/AdminBulkBar";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminToast, type AdminToastState } from "@/components/admin/AdminToast";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { ProductDeleteDialog } from "@/components/admin/ProductDeleteDialog";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { brands } from "@/data/brands";
import { categories as storeCategories } from "@/data/categories";
import {
  getProductStatus,
  parseAdminFilters,
  serializeAdminFilters,
  type AdminFilters
} from "@/lib/admin-products";
import { DEFAULT_LOW_STOCK_THRESHOLD, clampLowStockThreshold, readLowStockThreshold, saveLowStockThreshold } from "@/lib/admin-settings";
import { ApiError } from "@/lib/api";
import { getCurrentUser, getSession, isAdmin, logout, subscribeToAuthChanges, type AuthUser } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getAdminSummary,
  patchProduct,
  updateProduct,
  type AdminProductPage,
  type ProductQuickPatch
} from "@/lib/product-store";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductStatus } from "@/types/product";

export function AdminProductManager() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<AdminProductPage | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState<AdminFilters>(() => parseAdminFilters(searchParams));
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [lowStockThreshold, setLowStockThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [thresholdReady, setThresholdReady] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<Product[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const toastCounter = useRef(0);
  const requestCounter = useRef(0);
  const latestRequest = useRef({ filters, threshold: lowStockThreshold });

  const showToast = useCallback((tone: AdminToastState["tone"], message: string, action?: { label: string; run: () => void }) => {
    toastCounter.current += 1;
    setToast({ id: toastCounter.current, tone, message, actionLabel: action?.label, onAction: action?.run });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const describeFailure = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        logout();
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }
      if (error.status === 403) return "Tài khoản này không có quyền quản lý sản phẩm.";
      if (error.status === 0) return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.";
      return error.message;
    }

    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }, []);

  const loadProducts = useCallback(
    async (options: { silent?: boolean } = {}) => {
      requestCounter.current += 1;
      const requestId = requestCounter.current;
      const { filters: requestFilters, threshold } = latestRequest.current;

      if (!options.silent) setLoadingProducts(true);
      setLoadError("");

      try {
        const result = await getAdminProducts(requestFilters, threshold);
        if (requestId === requestCounter.current) setData(result);
      } catch (error) {
        if (requestId === requestCounter.current) setLoadError(describeFailure(error));
      } finally {
        if (requestId === requestCounter.current) setLoadingProducts(false);
      }
    },
    [describeFailure]
  );

  const refreshSummary = useCallback(async () => {
    try {
      const summary = await getAdminSummary(latestRequest.current.threshold);
      setData((current) => (current ? { ...current, summary } : current));
    } catch {
      // The counters catch up on the next full load.
    }
  }, []);

  useEffect(() => {
    const syncUser = () => {
      setUser(getCurrentUser());
      setHydrated(true);
    };
    syncUser();
    void getSession().then((session) => setUser(session));
    return subscribeToAuthChanges(syncUser);
  }, []);

  useEffect(() => {
    setLowStockThreshold(readLowStockThreshold());
    setThresholdReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => window.clearTimeout(timer);
  }, [filters.query]);

  useEffect(() => {
    latestRequest.current = { filters: { ...filters, query: debouncedQuery }, threshold: lowStockThreshold };
  });

  const requestKey = JSON.stringify([debouncedQuery, filters.category, filters.badge, filters.status, filters.stock, filters.sort, filters.page, lowStockThreshold]);

  useEffect(() => {
    if (!isAdmin(user) || !thresholdReady) {
      return;
    }

    void loadProducts();
  }, [loadProducts, requestKey, thresholdReady, user]);

  useEffect(() => {
    const query = serializeAdminFilters(filters);
    const { pathname, search } = window.location;
    const target = query ? `${pathname}?${query}` : pathname;

    if (target !== `${pathname}${search}`) {
      window.history.replaceState(window.history.state, "", target);
    }
  }, [filters]);

  useEffect(() => {
    if (data && data.page !== filters.page) {
      setFilters((current) => ({ ...current, page: data.page }));
    }
  }, [data, filters.page]);

  const products = useMemo(() => data?.items ?? [], [data]);
  const filterCategories = useMemo(
    () => [...(data?.categories ?? [])].sort((a, b) => a.localeCompare(b, "vi")),
    [data]
  );
  const formCategories = useMemo(
    () => Array.from(new Set([...storeCategories.map((category) => category.name), ...filterCategories])),
    [filterCategories]
  );
  const formBrands = useMemo(
    () => Array.from(new Set([...brands.map((brand) => brand.name), ...(data?.brands ?? [])])).sort((a, b) => a.localeCompare(b, "vi")),
    [data]
  );

  const selectedProducts = useMemo(() => products.filter((product) => selectedIds.includes(product.id)), [products, selectedIds]);
  const hasActiveFilters = Boolean(filters.query || filters.category || filters.badge || filters.status || filters.stock);

  const updateFilters = useCallback((patch: Partial<AdminFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
    setSelectedIds([]);
  }, []);

  const clearFilters = useCallback(() => {
    updateFilters({ query: "", category: "", badge: "", status: "", stock: "" });
  }, [updateFilters]);

  function changePage(page: number) {
    setFilters((current) => ({ ...current, page }));
    setSelectedIds([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleVisibleSelection() {
    const visibleIds = products.map((product) => product.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  const applyLocalPatch = useCallback((id: string, patch: ProductQuickPatch) => {
    setData((current) =>
      current
        ? { ...current, items: current.items.map((product) => (product.id === id ? { ...product, ...patch } : product)) }
        : current
    );
  }, []);

  const handleUndo = useCallback(
    async (id: string, previous: ProductQuickPatch) => {
      applyLocalPatch(id, previous);
      try {
        await patchProduct(id, previous);
        showToast("success", "Đã hoàn tác thay đổi.");
        void refreshSummary();
      } catch (error) {
        showToast("error", describeFailure(error));
        void loadProducts({ silent: true });
      }
    },
    [applyLocalPatch, describeFailure, loadProducts, refreshSummary, showToast]
  );

  const handlePatch = useCallback(
    async (product: Product, patch: ProductQuickPatch) => {
      const previous: ProductQuickPatch = {};
      if (patch.price !== undefined) previous.price = product.price;
      if (patch.stock !== undefined) previous.stock = product.stock ?? 0;
      if (patch.status !== undefined) previous.status = getProductStatus(product);

      applyLocalPatch(product.id, patch);

      try {
        await patchProduct(product.id, patch);
        void refreshSummary();
        showToast("success", describePatch(product.name, patch), {
          label: "Hoàn tác",
          run: () => void handleUndo(product.id, previous)
        });
      } catch (error) {
        applyLocalPatch(product.id, previous);
        showToast("error", describeFailure(error));
      }
    },
    [applyLocalPatch, describeFailure, handleUndo, refreshSummary, showToast]
  );

  function handleThresholdChange(value: number) {
    const next = clampLowStockThreshold(value);
    setLowStockThreshold(next);
    saveLowStockThreshold(next);
  }

  async function handleBulkStatus(status: ProductStatus) {
    const targets = selectedProducts.filter((product) => getProductStatus(product) !== status);
    if (!targets.length) {
      return;
    }

    setBulkBusy(true);
    const results = await Promise.allSettled(targets.map((product) => patchProduct(product.id, { status })));
    const succeeded = targets.filter((_, index) => results[index]?.status === "fulfilled");
    const firstFailure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");

    setSelectedIds([]);
    await loadProducts({ silent: true });
    setBulkBusy(false);

    const verb = status === "inactive" ? "ngừng bán" : "bán lại";

    if (firstFailure) {
      showToast("error", `Đã ${verb} ${succeeded.length}/${targets.length} sản phẩm. ${describeFailure(firstFailure.reason)}`);
      return;
    }

    const previousStatus: ProductStatus = status === "inactive" ? "active" : "inactive";
    showToast("success", `Đã ${verb} ${succeeded.length} sản phẩm.`, {
      label: "Hoàn tác",
      run: () => {
        void Promise.allSettled(succeeded.map((product) => patchProduct(product.id, { status: previousStatus }))).then(() =>
          loadProducts({ silent: true })
        );
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteTargets.length) {
      return;
    }

    setIsDeleting(true);
    const results = await Promise.allSettled(deleteTargets.map((product) => deleteProduct(product.id)));
    const deletedIds = deleteTargets.filter((_, index) => results[index]?.status === "fulfilled").map((product) => product.id);
    const firstFailure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");

    setDeleteTargets([]);
    setSelectedIds((current) => current.filter((id) => !deletedIds.includes(id)));
    await loadProducts({ silent: true });
    setIsDeleting(false);

    if (firstFailure) {
      showToast("error", `Đã xoá ${deletedIds.length}/${results.length} sản phẩm. ${describeFailure(firstFailure.reason)}`);
      return;
    }

    showToast("success", deletedIds.length === 1 ? "Đã xoá sản phẩm." : `Đã xoá ${deletedIds.length} sản phẩm.`);
  }

  async function handleSaveProduct(values: ProductFormValues, productId?: string) {
    setSavingProduct(true);

    try {
      if (productId) {
        await updateProduct(productId, values);
      } else {
        await createProduct(values);
      }

      setFormOpen(false);
      setEditingProduct(null);
      await loadProducts({ silent: true });
      showToast("success", productId ? "Đã lưu thay đổi." : "Đã thêm sản phẩm mới.");
    } catch (error) {
      showToast("error", describeFailure(error));
    } finally {
      setSavingProduct(false);
    }
  }

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse bg-smoke" />
      </section>
    );
  }

  if (!user) {
    return (
      <AccessMessage
        title="Cần đăng nhập"
        copy="Vui lòng đăng nhập bằng tài khoản quản trị để quản lý sản phẩm."
        actionHref="/login"
        actionLabel="Đến trang đăng nhập"
      />
    );
  }

  if (!isAdmin(user)) {
    return (
      <AccessMessage
        title="Không có quyền truy cập"
        copy="Tài khoản hiện tại chỉ dùng để mua sắm, không thể quản lý sản phẩm."
        actionHref="/"
        actionLabel="Về cửa hàng"
      />
    );
  }

  const busy = bulkBusy || savingProduct;
  const hasLoaded = data !== null;
  const showSkeleton = loadingProducts && !hasLoaded;
  const isEmptyCatalogue = data !== null && data.summary.total === 0;
  const resultCount = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const pageStart = data ? (data.page - 1) * data.pageSize : 0;

  return (
    <AdminShell user={user} onLogout={logout}>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Sản phẩm</h1>
            <p className="mt-1 text-sm text-neutral-600">Cập nhật giá, tồn kho và trạng thái bán hàng ngay trong bảng.</p>
          </div>
          <Button className="shrink-0" variant="outline" type="button" onClick={() => void loadProducts()} disabled={loadingProducts}>
            <RefreshCw className={loadingProducts ? "animate-spin" : ""} aria-hidden="true" />
            <span className="hidden sm:inline">Tải lại</span>
            <span className="sr-only sm:hidden">Tải lại danh sách</span>
          </Button>
        </div>

        <div className="mt-6 grid gap-5">
          {loadError ? (
            <div className="flex flex-col gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span>{loadError}</span>
              <Button className="shrink-0 border-red-600 text-red-800 hover:border-red-700" variant="outline" type="button" onClick={() => void loadProducts()}>
                Thử lại
              </Button>
            </div>
          ) : null}

          {!data && !loadError ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((item) => (
                <div className="h-[5.5rem] animate-pulse bg-smoke" key={item} />
              ))}
            </div>
          ) : null}

          {data ? (
            <AdminStats
              summary={data.summary}
              selection={{ status: filters.status, stock: filters.stock }}
              lowStockThreshold={lowStockThreshold}
              onSelect={(selection) => updateFilters(selection)}
              onLowStockThresholdChange={handleThresholdChange}
            />
          ) : null}

          <AdminToolbar
            filters={filters}
            categories={filterCategories}
            resultCount={resultCount}
            onChange={updateFilters}
            onCreate={openCreateForm}
            onClear={clearFilters}
          />

          {showSkeleton ? (
            <div className="grid gap-3" aria-busy="true" aria-label="Đang tải sản phẩm">
              {[0, 1, 2, 3].map((item) => (
                <div className="h-20 animate-pulse bg-smoke" key={item} />
              ))}
            </div>
          ) : isEmptyCatalogue ? (
            <EmptyState
              icon={<PackageOpen className="size-6" aria-hidden="true" />}
              title="Chưa có sản phẩm nào"
              copy="Thêm sản phẩm đầu tiên để bắt đầu bán hàng."
              actionLabel="Thêm sản phẩm đầu tiên"
              onAction={openCreateForm}
            />
          ) : hasLoaded && resultCount === 0 ? (
            <EmptyState
              icon={<SearchX className="size-6" aria-hidden="true" />}
              title="Không tìm thấy sản phẩm phù hợp"
              copy="Thử đổi từ khoá hoặc bỏ bớt bộ lọc."
              actionLabel={hasActiveFilters ? "Xoá bộ lọc" : undefined}
              onAction={clearFilters}
            />
          ) : hasLoaded ? (
            <div className={loadingProducts ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loadingProducts}>
              <AdminProductTable
                products={products}
                selectedIds={selectedIds}
                busy={busy}
                lowStockThreshold={lowStockThreshold}
                sort={filters.sort}
                onSort={(sort) => updateFilters({ sort })}
                onEdit={openEditForm}
                onDelete={(product) => setDeleteTargets([product])}
                onPatch={handlePatch}
                onToggle={toggleSelection}
                onToggleAll={toggleVisibleSelection}
              />
              <nav className="mt-3 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Phân trang">
                <p className="tabular-nums text-neutral-600">
                  Hiển thị {(pageStart + 1).toLocaleString("vi-VN")}–{(pageStart + products.length).toLocaleString("vi-VN")} trong{" "}
                  {resultCount.toLocaleString("vi-VN")} sản phẩm
                </p>
                {pageCount > 1 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Trang trước"
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <span className="min-w-24 text-center font-medium tabular-nums">
                      Trang {currentPage} / {pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      aria-label="Trang sau"
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </nav>
            </div>
          ) : null}
        </div>
      </div>

      <AdminBulkBar
        count={selectedProducts.length}
        busy={busy}
        canArchive={selectedProducts.some((product) => getProductStatus(product) === "active")}
        canRestore={selectedProducts.some((product) => getProductStatus(product) === "inactive")}
        onArchive={() => void handleBulkStatus("inactive")}
        onRestore={() => void handleBulkStatus("active")}
        onDelete={() => setDeleteTargets(selectedProducts)}
        onClear={() => setSelectedIds([])}
      />

      <ProductForm
        key={formOpen ? (editingProduct?.id ?? "new") : "closed"}
        open={formOpen}
        product={editingProduct}
        categoryOptions={formCategories}
        brandOptions={formBrands}
        lowStockThreshold={lowStockThreshold}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        isSaving={savingProduct}
      />
      <ProductDeleteDialog
        products={deleteTargets}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTargets([])}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <AdminToast toast={toast} onDismiss={dismissToast} />
    </AdminShell>
  );
}

function describePatch(productName: string, patch: ProductQuickPatch) {
  if (patch.status === "inactive") return `Đã ngừng bán “${productName}”.`;
  if (patch.status === "active") return `Đã bán lại “${productName}”.`;
  if (patch.price !== undefined) return `Đã đổi giá “${productName}” thành ${formatCurrency(patch.price)}.`;
  if (patch.stock !== undefined) return `Đã cập nhật tồn kho “${productName}”: ${patch.stock}.`;
  return "Đã cập nhật sản phẩm.";
}

function EmptyState({
  icon,
  title,
  copy,
  actionLabel,
  onAction
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-card border border-dashed border-input bg-background px-4 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-porcelain text-neutral-600">{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-neutral-600">{copy}</p>
      {actionLabel ? (
        <Button className="mt-5 px-5" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function AccessMessage({ title, copy, actionHref, actionLabel }: { title: string; copy: string; actionHref: string; actionLabel: string }) {
  return (
    <section className="min-h-screen bg-porcelain">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-xl font-black tracking-[0.16em] text-ink">
          SHOPO<span className="text-shopo-orange">.</span>
        </p>
        <span className="mt-8 grid size-14 place-items-center rounded-card border border-border bg-background text-ink">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">{copy}</p>
        <Button className="mt-6 px-5" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
