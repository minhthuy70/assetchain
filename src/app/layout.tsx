import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AssetChain - Nền Tảng Quản Lý Quyền Sở Hữu Tài Sản Số Trên Blockchain",
  description:
    "Hệ thống minh chứng sự tồn tại (Proof of Existence) và bảo vệ tác quyền số bằng công nghệ Blockchain EVM ERC-721",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
