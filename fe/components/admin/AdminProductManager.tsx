"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, ChevronLeft, ChevronRight, ShieldAlert, Trash2 } from "lucide-react";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { ProductDeleteDialog } from "@/components/admin/ProductDeleteDialog";
import { ProductForm } from "@/components/admin/ProductForm";
import { ApiError } from "@/lib/api";
import { getCurrentUser, getSession, isAdmin, logout, subscribeToAuthChanges, type AuthUser } from "@/lib/auth";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/product-store";
import type { Product, ProductBadge, ProductStatus } from "@/types/product";

export function AdminProductManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [badge, setBadge] = useState<"" | ProductBadge>("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const handleApiFailure = useCallback((apiError: unknown) => {
    if (apiError instanceof ApiError && apiError.status === 401) {
      logout();
      setError("Your session expired. Please sign in again.");
      return;
    }

    if (apiError instanceof ApiError && apiError.status === 403) {
      setError("You do not have permission to manage products.");
      return;
    }

    setError(apiError instanceof Error ? apiError.message : "Something went wrong.");
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError("");

    try {
      setProducts(await getProducts());
    } catch (loadError) {
      handleApiFailure(loadError);
    } finally {
      setLoadingProducts(false);
    }
  }, [handleApiFailure]);

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
    if (!isAdmin(user)) {
      return;
    }

    void loadProducts();
  }, [loadProducts, user]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) || product.id.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !category || product.category === category;
      const matchesBadge = !badge || product.badge === badge;
      const matchesStatus = !status || (product.status ?? "active") === status;

      return matchesQuery && matchesCategory && matchesBadge && matchesStatus;
    });
  }, [badge, category, products, query, status]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));

  useEffect(() => { setPage(1); setSelectedIds([]); }, [query, category, badge, status]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  function toggleSelection(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleVisibleSelection() {
    const visibleIds = visibleProducts.map((product) => product.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])));
  }
  async function handleBulkDelete() {
    if (!selectedProducts.length) return;
    setSavingProduct(true);
    try { await Promise.all(selectedProducts.map((product) => deleteProduct(product.id))); setSelectedIds([]); await loadProducts(); } catch (deleteError) { handleApiFailure(deleteError); } finally { setSavingProduct(false); }
  }
  async function handleBulkArchive() {
    if (!selectedProducts.length) return;
    setSavingProduct(true);
    try { await Promise.all(selectedProducts.map((product) => updateProduct({ ...product, status: "inactive" }))); setSelectedIds([]); await loadProducts(); } catch (archiveError) { handleApiFailure(archiveError); } finally { setSavingProduct(false); }
  }

  function handleCreateClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleSaveProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">, productId?: string) {
    setSavingProduct(true);
    setError("");

    try {
      if (productId) {
        const currentProduct = products.find((item) => item.id === productId);
        if (currentProduct) {
          await updateProduct({ ...currentProduct, ...product });
        }
      } else {
        await createProduct(product);
      }

      setFormOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (saveError) {
      handleApiFailure(saveError);
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteConfirm() {
    if (deletingProduct) {
      setError("");

      try {
        await deleteProduct(deletingProduct.id);
        setDeletingProduct(null);
        await loadProducts();
      } catch (deleteError) {
        handleApiFailure(deleteError);
      }
    }
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
        title="Admin access required"
        copy="Sign in with the admin account to manage the product catalogue."
        actionHref="/login"
        actionLabel="Go to login"
      />
    );
  }

  if (!isAdmin(user)) {
    return (
      <AccessMessage
        title="Unauthorized"
        copy="Your current account can shop the store, but it cannot access product management."
        actionHref="/"
        actionLabel="Back to store"
      />
    );
  }

  return (
    <section className="bg-porcelain">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">
              Admin Console
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Product management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Add, edit, delete, and filter LuxeStore products. Changes are stored in MongoDB through the NestJS API.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="flex h-11 items-center justify-center border border-neutral-300 px-4 text-sm font-semibold text-ink transition hover:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
              href="/"
            >
              Back to store
            </Link>
            <button
              className="h-11 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total products" value={products.length} />
            <Stat label="Active" value={products.filter((product) => (product.status ?? "active") === "active").length} />
            <Stat label="Low stock" value={products.filter((product) => (product.stock ?? 0) <= 3).length} />
          </div>

          <AdminToolbar
            query={query}
            category={category}
            badge={badge}
            status={status}
            categories={categories}
            onQueryChange={setQuery}
            onCategoryChange={setCategory}
            onBadgeChange={setBadge}
            onStatusChange={setStatus}
             onCreate={handleCreateClick}
             onClear={() => { setQuery(""); setCategory(""); setBadge(""); setStatus(""); }}
             resultCount={filteredProducts.length}
           />

          <div className="flex flex-col gap-3 border border-neutral-200 bg-ink px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm"><span className="grid size-7 place-items-center bg-white/10"><Check className="size-4" /></span><span><strong>{selectedIds.length}</strong> selected</span><button className="text-xs text-white/60 underline underline-offset-4 hover:text-white" type="button" onClick={() => setSelectedIds([])} disabled={!selectedIds.length}>Clear selection</button></div>
            <div className="flex gap-2"><button className="inline-flex h-9 items-center gap-2 border border-white/20 px-3 text-xs font-bold uppercase tracking-[0.1em] transition hover:bg-white/10 disabled:opacity-40" type="button" onClick={() => void handleBulkArchive()} disabled={!selectedIds.length || savingProduct}><Archive className="size-3.5" />Archive</button><button className="inline-flex h-9 items-center gap-2 bg-red-600 px-3 text-xs font-bold uppercase tracking-[0.1em] transition hover:bg-red-500 disabled:opacity-40" type="button" onClick={() => void handleBulkDelete()} disabled={!selectedIds.length || savingProduct}><Trash2 className="size-3.5" />Delete</button></div>
          </div>

          {loadingProducts ? (
            <div className="h-52 animate-pulse bg-smoke" />
          ) : (
            <AdminProductTable products={visibleProducts} onEdit={handleEditClick} onDelete={setDeletingProduct} selectedIds={selectedIds} onToggle={toggleSelection} onToggleAll={toggleVisibleSelection} />
          )}
          {filteredProducts.length > 0 ? <div className="flex flex-col gap-3 border-x border-b border-neutral-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-neutral-500">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length.toLocaleString()}</p><div className="flex items-center gap-2"><button className="grid size-9 place-items-center border border-neutral-200 transition hover:border-ink disabled:opacity-40" type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft className="size-4" /></button><span className="min-w-20 text-center text-xs font-bold uppercase tracking-[0.1em]">Page {page} / {pageCount}</span><button className="grid size-9 place-items-center border border-neutral-200 transition hover:border-ink disabled:opacity-40" type="button" onClick={() => setPage((current) => current + 1)} disabled={page === pageCount} aria-label="Next page"><ChevronRight className="size-4" /></button></div></div> : null}
        </div>
      </div>

      <ProductForm
        open={formOpen}
        product={editingProduct}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        isSaving={savingProduct}
      />
      <ProductDeleteDialog product={deletingProduct} onCancel={() => setDeletingProduct(null)} onConfirm={handleDeleteConfirm} />
    </section>
  );
}

function AccessMessage({ title, copy, actionHref, actionLabel }: { title: string; copy: string; actionHref: string; actionLabel: string }) {
  return (
    <section className="min-h-[60vh] bg-porcelain">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="grid size-14 place-items-center bg-white text-ink shadow-soft">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">{copy}</p>
        <Link
          className="mt-6 flex h-11 items-center justify-center bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-ink/20"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
