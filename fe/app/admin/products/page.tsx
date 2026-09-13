import { AdminProductManager } from "@/components/admin/AdminProductManager";
import { CommerceProvider } from "@/components/CommerceProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AdminProductsPage() {
  return (
    <CommerceProvider>
      <Header />
      <main>
        <AdminProductManager />
      </main>
      <Footer />
    </CommerceProvider>
  );
}
