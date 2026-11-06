"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, ArrowRight } from "lucide-react";

export default function CreatorHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <span className="type-label">
          Creator Portal
        </span>
        <h1 className="type-h1 mt-1">
          Khu Vực Dành Cho Tác Giả & Nhà Sáng Tạo
        </h1>
        <p className="type-subhead mt-1">
          Băm nhị phân SHA-256 client-side, nộp hồ sơ thẩm định và mint NFT ERC-721 trên Blockchain EVM.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ACTION CARD 1: ĐĂNG KÝ MỚI */}
        <Link
          href="/creator/register"
          className="card-surface p-6 flex flex-col justify-between hover:border-slate-700 transition-colors group"
        >
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-[#F6851B]">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="type-h3 group-hover:text-[#F6851B] transition-colors">
                Đăng Ký Tác Phẩm Mới
              </h2>
              <p className="type-body mt-1.5 text-slate-400">
                Tải lên tệp ảnh hoặc tài liệu, tính mã băm SHA-256 trực tiếp trong trình duyệt bằng Web Crypto API và gửi hồ sơ thẩm định.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-[#F6851B]">
            <span>Bắt đầu nộp hồ sơ</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* ACTION CARD 2: BẢNG ĐIỀU KHIỂN */}
        <Link
          href="/creator/my-assets"
          className="card-surface p-6 flex flex-col justify-between hover:border-slate-700 transition-colors group"
        >
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="type-h3 group-hover:text-slate-200 transition-colors">
                Bảng Điều Khiển Của Tôi
              </h2>
              <p className="type-body mt-1.5 text-slate-400">
                Quản lý danh sách tác phẩm, thực hiện giao dịch MetaMask mint NFT on-chain, xem chứng nhận E-Certificate và chuyển nhượng.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:text-white">
            <span>Vào bảng điều khiển</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
