import Link from "next/link";
import { ShieldCheck, Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F6851B] text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-sm text-white tracking-tight">AssetChain</span>
              <span className="rounded bg-slate-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                EVM 31337
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Hệ thống đăng ký, thẩm định và bảo chứng quyền sở hữu tài sản số với cơ chế Proof of Existence trên mạng EVM.
            </p>
          </div>

          {/* CỘT 2: ĐIỀU HƯỚNG */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Chức năng
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/explore" className="hover:text-slate-200 transition-colors">
                  Khám phá tác phẩm
                </Link>
              </li>
              <li>
                <Link href="/creator" className="hover:text-slate-200 transition-colors">
                  Đăng ký tác phẩm
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-[#F6851B] transition-colors">
                  Xác minh tệp (0 Gas)
                </Link>
              </li>
              <li>
                <Link href="/admin/approvals" className="hover:text-slate-200 transition-colors">
                  Cổng thẩm định Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỌC THUẬT & LIÊN KẾT */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Học thuật & Mã nguồn
            </h4>
            <p className="text-xs text-slate-400">
              Bộ môn Mạng & Hệ thống Phân tán<br />
              Chuyên đề Blockchain 2026
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/minhthuy70/assetchain"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© 2026 AssetChain. Bảo vệ tác quyền số trên nền tảng Smart Contract.</span>
          <span className="font-mono text-[10px]">Local-First Monorepo</span>
        </div>
      </div>
    </footer>
  );
}
