"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  Compass,
  FileCheck,
  ShieldAlert,
  PlusCircle,
  Globe,
  ChevronDown,
} from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F6851B] via-purple-600 to-violet-500 p-0.5 shadow-lg shadow-orange-500/20 transition group-hover:scale-105 group-hover:shadow-orange-500/35">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-[#F6851B] transition group-hover:rotate-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-purple-300 transition">
                AssetChain
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400 ring-1 ring-inset ring-orange-500/30">
                <Sparkles className="h-2.5 w-2.5" /> Web3
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
                className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "text-white bg-slate-850 border border-slate-700 shadow-sm"
                    : item.highlight
                    ? "text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 font-semibold border border-orange-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-850/70"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-[17px] h-[2px] rounded-full bg-gradient-to-r from-[#F6851B] to-purple-500 shadow-sm shadow-orange-500/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: LANGUAGE PILL + WALLET BUTTON */}
        <div className="hidden md:flex items-center gap-3">
          {/* NÚT NGÔN NGỮ THIẾT KẾ ĐẶC TRƯNG TỪ ẢNH METAMASK */}
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#EEDCFF] px-3 py-1.5 text-xs font-bold text-[#2B0054] shadow-sm transition hover:bg-[#E5CBFF] cursor-default select-none">
            <span>Tiếng Việt</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </div>

          <WalletButton />
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-4 space-y-2 backdrop-blur-2xl">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-xl transition ${
                  isActive
                    ? "text-white bg-slate-800 font-bold border border-slate-700"
                    : item.highlight
                    ? "text-orange-400 bg-orange-500/10 font-bold border border-orange-500/20"
                    : "text-slate-300 hover:bg-slate-850 hover:text-white"
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
