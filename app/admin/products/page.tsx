import { AdminProductManager } from "@/components/admin/AdminProductManager";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AdminProductsPage() {
  return (
    <>
      <Header />
      <main>
        <AdminProductManager />
      </main>
      <Footer />
    </>
  );
}
