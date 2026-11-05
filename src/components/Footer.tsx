import Link from "next/link";
import { ShieldCheck, Github, Cpu, Network, Layers, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 text-slate-400 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CỘT 1: THƯƠNG HIỆU & SỨ MỆNH */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-[#F6851B] ring-1 ring-orange-500/30">
                <ShieldCheck className="h-5 w-5 text-[#F6851B]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AssetChain</span>
              <span className="rounded-lg bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/20">
                ERC-721 + Web Crypto
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 max-w-md">
              Hệ thống đăng ký, thẩm định và quản lý quyền sở hữu tài sản số với cơ chế minh chứng sự tồn tại (Proof of Existence) và bảo vệ tác quyền bất biến trên mạng phân tán EVM.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-200 border border-slate-750">
                <Network className="h-3.5 w-3.5 text-[#F6851B]" /> Mạng Hardhat EVM (31337)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-200 border border-slate-750">
                <Layers className="h-3.5 w-3.5 text-purple-400" /> Kiến trúc Local-First 3 Lớp
              </span>
            </div>
          </div>

          {/* CỘT 2: ĐIỀU HƯỚNG NHANH */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Phân hệ chức năng
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/creator" className="hover:text-orange-400 transition">
                  Đăng ký & Tải tác phẩm
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-orange-300 transition font-bold text-orange-400">
                  Cổng xác minh 1-Click (0 Gas)
                </Link>
              </li>
              <li>
                <Link href="/admin/approvals" className="hover:text-orange-400 transition">
                  Hội đồng thẩm định Admin
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-orange-400 transition">
                  Khám phá tác phẩm đã cấp chứng nhận
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THÔNG TIN HỌC THUẬT & LIÊN KẾT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Thông tin học thuật
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bộ môn Mạng & Hệ thống Phân tán<br />
              Đồ án Tốt nghiệp / Chuyên đề Blockchain 2026
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/minhthuy70/assetchain"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
              >
                <Github className="h-4 w-4 text-orange-400" />
                <span>Mã nguồn trên GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-[11px] text-slate-400">
          © 2026 AssetChain. Bản quyền học thuật và kiến trúc bảo vệ tác quyền số trên nền tảng Blockchain EVM.
        </div>
      </div>
    </footer>
  );
}
