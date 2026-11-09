import Link from "next/link";
import {
  Zap,
  Lock,
  FileCheck2,
  ArrowRight,
  QrCode,
} from "lucide-react";
import FileDropzone from "@/components/FileDropzone";

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F6851B]" />
            <span className="type-caption text-slate-300 font-medium">Chuẩn Quản Trị Quyền Sở Hữu Kỹ Thuật Số EVM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-tight">
            Đăng Ký & Xác Thực Quyền Sở Hữu Tài Sản Số
          </h1>

          <p className="type-subhead max-w-xl mx-auto">
            Bảo chứng quyền tác giả thông qua cơ chế Proof of Existence trên chuỗi khối, thẩm định hồ sơ minh bạch và cấp Chứng nhận số (E-Certificate) kèm mã QR xác minh 0 Gas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              href="/creator"
              className="btn-primary"
            >
              <span>Đăng ký tác phẩm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/verify"
              className="btn-secondary"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-[#F6851B]" />
              <span>Cổng xác minh tệp</span>
            </Link>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-surface p-3.5 text-center">
            <div className="text-lg font-semibold text-white font-mono">0 Gas</div>
            <div className="type-caption mt-0.5">Xác minh tệp công khai</div>
          </div>
          <div className="card-surface p-3.5 text-center">
            <div className="text-lg font-semibold text-white font-mono">256-bit</div>
            <div className="type-caption mt-0.5">Băm mật mã SHA-256</div>
          </div>
          <div className="card-surface p-3.5 text-center">
            <div className="text-lg font-semibold text-white font-mono">ERC-721</div>
            <div className="type-caption mt-0.5">Định danh Token on-chain</div>
          </div>
          <div className="card-surface p-3.5 text-center">
            <div className="text-lg font-semibold text-white font-mono">&lt; 0.05s</div>
            <div className="type-caption mt-0.5">Xử lý Web Crypto RAM</div>
          </div>
        </div>

        {/* INTERACTIVE DEMO: CLIENT-SIDE SHA-256 FINGERPRINTING */}
        <div className="mt-14 max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="type-h2">
              Thử nghiệm băm dấu vân tay số
            </h2>
            <p className="type-caption text-slate-400 mt-1">
              Kéo thả tệp tin bất kỳ để kiểm tra tốc độ sinh mã băm SHA-256 trực tiếp trong trình duyệt
            </p>
          </div>

          <FileDropzone showVerifyLink />
        </div>
      </section>

      {/* 3 CORE PILLARS SECTION */}
      <section className="border-t border-slate-800 bg-slate-900/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="type-label">
              Kiến trúc hệ thống
            </span>
            <p className="type-h2 mt-1">
              Ba lớp bảo chứng an toàn và tối ưu tài nguyên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card-surface p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-[#F6851B]">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="type-h3">
                1. Web Crypto API Client-Side
              </h3>
              <p className="type-body leading-relaxed">
                Tệp gốc được băm nhị phân SHA-256 trong bộ nhớ tạm của trình duyệt. Không tải tệp thô lên máy chủ để băm, đảm bảo quyền riêng tư và tiết kiệm tài nguyên CPU.
              </p>
            </div>

            <div className="card-surface p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-purple-400">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="type-h3">
                2. Sổ Cái EVM Bất Biến
              </h3>
              <p className="type-body leading-relaxed">
                Smart Contract lưu giữ `tokenId`, `bytes32 contentHash`, mốc thời gian khối và địa chỉ ví tác giả. Ngăn chặn triệt để hành vi trùng lặp hoặc đăng ký giả mạo.
              </p>
            </div>

            <div className="card-surface p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                <QrCode className="h-4 w-4" />
              </div>
              <h3 className="type-h3">
                3. E-Certificate & QR Động
              </h3>
              <p className="type-body leading-relaxed">
                Hệ thống tự động phát hành Chứng nhận điện tử định dạng PDF độ phân giải cao kèm mã QR tra cứu on-chain, cho phép đối chiếu tính nguyên bản 0 Gas từ camera điện thoại.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
