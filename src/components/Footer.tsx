import Link from "next/link";
import { ShieldCheck, Github, Cpu, Network, Layers, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/70 text-slate-400 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CỘT 1: THƯƠNG HIỆU & SỨ MỆNH */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AssetChain</span>
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                ERC-721 + Web Crypto
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              Hệ thống đăng ký, thẩm định và quản lý quyền sở hữu tài sản số với cơ chế minh chứng sự tồn tại (Proof of Existence) và bảo vệ tác quyền bất biến trên mạng phân tán EVM.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700/60">
                <Network className="h-3.5 w-3.5 text-indigo-400" /> Mạng Hardhat EVM (31337)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700/60">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> Kiến trúc Local-First 3 Lớp
              </span>
            </div>
          </div>

          {/* CỘT 2: ĐIỀU HƯỚNG NHANH */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Phân hệ chức năng
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/creator" className="hover:text-indigo-400 transition">
                  Đăng ký & Tải tác phẩm
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-emerald-400 transition font-medium text-emerald-400/90">
                  Cổng xác minh 1-Click (0 Gas)
                </Link>
              </li>
              <li>
                <Link href="/admin/approvals" className="hover:text-indigo-400 transition">
                  Cổng thẩm định hồ sơ Admin
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-indigo-400 transition">
                  Bộ sưu tập tác phẩm số
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THÔNG TIN HỌC THUẬT & LIÊN KẾT */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Thông tin học thuật
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="font-medium text-slate-300">
                Bộ môn Mạng & Hệ thống Phân tán
              </p>
              <p className="text-[11px] text-slate-400">
                Chuyên đề Công nghệ Blockchain & Hợp đồng thông minh
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>Kho mã nguồn GitHub</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-8 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} AssetChain Project. Dự án phục vụ mục đích nghiên cứu và bảo vệ đồ án tốt nghiệp.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Proof of Existence (SHA-256)</span>
            <span>•</span>
            <span>MetaMask Web3</span>
            <span>•</span>
            <span>Next.js 14 + SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
