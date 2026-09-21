import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminProductManager } from "@/components/admin/AdminProductManager";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm | SHOPO"
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-porcelain" />}>
      <AdminProductManager />
    </Suspense>
  );
}
