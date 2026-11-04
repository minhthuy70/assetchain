"use client";

import Link from "next/link";
import { Sparkles, LayoutDashboard, PlusCircle, ShieldCheck, ArrowRight, Layers, FileCheck2, Cpu } from "lucide-react";

export default function CreatorHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cổng Dành Cho Nhà Sáng Tạo & Tác Giả (Creator Portal)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Bảo Vệ & Khắc Dấu Quyền Sở Hữu Tài Sản Số
        </h1>
        <p className="text-sm text-slate-400">
          Hệ thống băm SHA-256 client-side tức thì, nộp hồ sơ thẩm định và mint NFT chuẩn ERC-721 bất biến trên Blockchain EVM cục bộ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* ACTION CARD 1: ĐĂNG KÝ MỚI */}
        <Link
          href="/creator/register"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10"
        >
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
              <PlusCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                Đăng Ký Tác Phẩm Mới
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tải lên tệp ảnh hoặc tài liệu, băm mã SHA-256 client-side trong &lt; 0.05s bằng Web Crypto API và nộp hồ sơ xét duyệt.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-400">
            <span>Bắt đầu nộp hồ sơ</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ACTION CARD 2: BẢNG ĐIỀU KHIỂN */}
        <Link
          href="/creator/my-assets"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10"
        >
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Bảng Điều Khiển Của Tôi
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Quản lý các hồ sơ đã nộp, kích hoạt giao dịch MetaMask mint NFT on-chain, xem chứng nhận và thực hiện chuyển nhượng.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>Truy cập bảng điều khiển</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
