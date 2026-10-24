import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  FileCheck2,
  ArrowRight,
  Sparkles,
  QrCode,
  Layers,
} from "lucide-react";
import FileDropzone from "@/components/FileDropzone";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND DECORATIVE GRADIENTS */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-48 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/30 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Đồ án Chuyên đề Blockchain • Tiêu chuẩn ERC-721 EVM</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
            Nền Tảng Đăng Ký & Quản Lý{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Quyền Sở Hữu Tài Sản Số
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Bảo vệ tác quyền bất biến thông qua cơ chế minh chứng sự tồn tại (
            <strong className="text-white font-semibold">Proof of Existence</strong>), thẩm định hồ sơ minh bạch của hội đồng quản trị và phát hành{" "}
            <strong className="text-emerald-400 font-semibold">Chứng nhận điện tử (E-Certificate)</strong> tích hợp mã QR xác thực tức thì.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/creator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 hover:shadow-indigo-500/40"
            >
              <span>Bắt đầu đăng ký tác phẩm</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-5 py-3 text-sm font-semibold text-emerald-400 ring-1 ring-slate-700/80 backdrop-blur transition hover:bg-slate-800 hover:text-emerald-300"
            >
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <span>Cổng xác minh 1-Click (0 Gas)</span>
            </Link>
          </div>
        </div>

        {/* INTERACTIVE DEMO: CLIENT-SIDE SHA-256 FINGERPRINTING */}
        <div className="mt-16">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              Khu Vực Thử Nghiệm Tức Thì
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Thử Nghiệm Băm Dấu Vân Tay Số (SHA-256)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              Kéo thả bất kỳ file ảnh hoặc tài liệu vào khung bên dưới. Trình duyệt của bạn sẽ tự động tính mã băm SHA-256 nhị phân bằng Web Crypto API trong mili-giây.
            </p>
          </div>

          <FileDropzone />
        </div>
      </section>

      {/* 3 CORE PILLARS SECTION */}
      <section className="border-t border-slate-800/60 bg-slate-900/40 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
              Kiến Trúc Đột Phá 3 Lớp
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Tại sao AssetChain an toàn & tối ưu hiệu năng?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PILLAR 1 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition duration-300 hover:border-indigo-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">
                1. Web Crypto API Client-Side
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                File gốc được tính mã băm SHA-256 trực tiếp trong RAM trình duyệt của người dùng. Server không phải băm tệp lớn, tiết kiệm 100% chi phí CPU và bảo vệ tính riêng tư.
              </p>
            </div>

            {/* PILLAR 2 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition duration-300 hover:border-emerald-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">
                2. Blockchain EVM Bất Biến
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Smart Contract lưu giữ `tokenId`, `bytes32 contentHash`, mốc thời gian và địa chỉ tác giả. Ngăn chặn triệt để hành vi đăng ký trùng lặp hoặc mạo danh tác phẩm.
              </p>
            </div>

            {/* PILLAR 3 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition duration-300 hover:border-violet-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 mb-5">
                <QrCode className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">
                3. E-Certificate & QR Động
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Tự động sinh file PDF Chứng nhận Sở hữu số chất lượng cao với mã QR tra cứu công khai. Cho phép xác thực thật/giả tức thì với 0 Gas qua RPC.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
