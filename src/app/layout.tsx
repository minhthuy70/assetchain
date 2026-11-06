import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AssetChain - Nền Tảng Đăng Ký & Quản Lý Quyền Sở Hữu Tài Sản Số Trên Blockchain",
  description:
    "Hệ thống minh chứng sự tồn tại (Proof of Existence) và bảo vệ tác quyền số bằng công nghệ Blockchain EVM ERC-721",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark scroll-smooth ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-[#F6851B] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
