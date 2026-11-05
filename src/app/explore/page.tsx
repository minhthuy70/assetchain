"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  FileCheck2,
  ExternalLink,
  RefreshCw,
  FileText,
  User,
  Hash,
  Download,
} from "lucide-react";

export default function ExplorePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      if (category !== "ALL") url.searchParams.set("category", category);
      if (searchQuery.trim()) url.searchParams.set("query", searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-1.5 text-xs font-bold text-orange-400 ring-1 ring-inset ring-orange-500/30">
          <Compass className="h-3.5 w-3.5 text-[#F6851B]" />
          <span>Thư Viện Tác Phẩm Số Minh Chứng Quyền Sở Hữu</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Khám Phá Tài Sản Số Đã Xác Thực
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Bộ sưu tập các tác phẩm hội họa số, nhiếp ảnh và sáng tạo đồ họa đã qua quy trình thẩm định nghiêm ngặt và khắc dấu mốc thời gian vĩnh cửu trên Blockchain EVM.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-y border-slate-800 py-4">
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "Tất cả tác phẩm" },
            { id: "ART", label: "Digital Art" },
            { id: "PHOTOGRAPHY", label: "Nhiếp ảnh" },
            { id: "DESIGN", label: "Graphic Design" },
            { id: "DOCUMENT", label: "Tài liệu số" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                category === tab.id
                  ? "bg-gradient-to-r from-[#F6851B] to-[#E2761B] text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-750"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tác phẩm, tác giả..."
            className="w-full rounded-xl border border-slate-750 bg-slate-950/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>
      </div>

      {/* ASSET GRID */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-orange-400" />
          <p className="text-sm font-semibold">Đang tải bộ sưu tập tác phẩm...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-16 text-center space-y-4 bg-slate-900/40">
          <Compass className="h-12 w-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">Chưa có tác phẩm nào phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không tìm thấy tác phẩm trong danh mục này. Hãy thử chọn danh mục khác hoặc tìm kiếm từ khóa khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const isImage = asset.mimeType?.startsWith("image/");
            const isRegistered = asset.status === "REGISTERED";

            return (
              <div
                key={asset.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/10 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* PREVIEW */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <Image
                        src={asset.filePath}
                        alt={asset.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-slate-600" />
                    )}
                    <span className="absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur-md bg-slate-950/85 text-orange-400 border border-orange-500/30">
                      {isRegistered ? `#Token ${asset.tokenId}` : asset.status}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      {asset.category}
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-purple-300 transition">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {asset.description || "Tác phẩm số đã bảo chứng quyền sở hữu."}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <User className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-slate-200">{asset.creator?.fullName || "Tác giả gốc"}</span>
                      </span>
                      <span className="font-mono text-[11px] text-orange-300">
                        {asset.currentOwnerWallet.slice(0, 6)}...{asset.currentOwnerWallet.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="border-t border-slate-800 p-4 bg-slate-950/60 flex items-center gap-2">
                  {asset.certificate ? (
                    <a
                      href={`/api/certificate/${asset.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-850 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition border border-slate-700"
                    >
                      <Download className="h-3.5 w-3.5 text-orange-400" />
                      <span>Tải E-Cert</span>
                    </a>
                  ) : null}

                  <Link
                    href={`/verify?hash=${asset.fileHash}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F6851B] to-[#E2761B] px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Xác minh 1-Click</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
