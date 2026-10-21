import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AssetChain - Nền Tảng Quản Lý Quyền Sở Hữu Tài Sản Số",
  description: "Bảo vệ và minh chứng quyền sở hữu tác phẩm số qua công nghệ Blockchain EVM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

