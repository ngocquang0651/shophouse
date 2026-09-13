import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHOPO | Giày dép & Dây lưng",
  description: "SHOPO — giày dép và dây lưng cho mọi nhịp sống."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
