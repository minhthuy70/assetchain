"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  Menu,
  X,
  Compass,
  FileCheck,
  ShieldAlert,
  PlusCircle,
} from "lucide-react";
import WalletButton from "./WalletButton";

const NAV_ITEMS = [
  { name: "Khám phá", href: "/explore", icon: Compass },
  { name: "Đăng ký tác phẩm", href: "/creator", icon: PlusCircle },
  { name: "Xác minh tệp", href: "/verify", icon: FileCheck, highlight: true },
  { name: "Thẩm định Admin", href: "/admin/approvals", icon: ShieldAlert },
  { name: "Thu hồi", href: "/admin/revoke", icon: ShieldAlert },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-2.5 transition opacity-95 hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6851B] text-white shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">
              AssetChain
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              v1.0
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-white bg-slate-850 border border-slate-800"
                    : item.highlight
                    ? "text-[#F6851B] hover:text-[#E2761B] hover:bg-slate-900 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: WALLET BUTTON */}
        <div className="hidden md:flex items-center gap-3">
          <WalletButton />
        </div>

        {/* MOBILE TOGGLE */}
        <div className="flex md:hidden items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-850 text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
