"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Sparkles, Menu, X, Compass, FileCheck, ShieldAlert, PlusCircle } from "lucide-react";
import WalletButton from "./WalletButton";

const NAV_ITEMS = [
  { name: "Trang chủ", href: "/" },
  { name: "Đăng ký tác phẩm", href: "/creator", icon: PlusCircle },
  { name: "Khám phá", href: "/explore", icon: Compass },
  { name: "Cổng xác minh 1-Click", href: "/verify", icon: FileCheck, highlight: true },
  { name: "Quản trị thẩm định", href: "/admin/approvals", icon: ShieldAlert },
  { name: "Thu hồi", href: "/admin/revoke", icon: ShieldAlert },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/25 transition group-hover:shadow-indigo-500/40">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-emerald-400 transition group-hover:scale-110" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition">
                AssetChain
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                <Sparkles className="h-2.5 w-2.5" /> EVM
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Bảo chứng quyền số bất biến
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "text-white bg-slate-800 shadow-sm shadow-slate-900/50"
                    : item.highlight
                    ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-[17px] h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ACTION / WALLET BUTTON */}
        <div className="hidden md:flex items-center gap-3">
          <WalletButton />
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-4 space-y-2 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? "text-white bg-slate-800"
                    : item.highlight
                    ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

