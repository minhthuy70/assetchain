"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Search,
  FileCheck2,
  RefreshCw,
  FileText,
  Download,
} from "lucide-react";
import { shortenAddress } from "@/lib/crypto";

export default function ExplorePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      url.searchParams.set("status", "REGISTERED");
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="type-h1">
          Thư Viện Tác Phẩm Số Đã Xác Thực
        </h1>
        <p className="type-subhead mt-0.5">
          Danh mục tác phẩm số đã qua thẩm định và ghi nhận quyền sở hữu vĩnh viễn trên sổ cái Blockchain EVM.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "ART", label: "Digital Art" },
            { id: "PHOTOGRAPHY", label: "Nhiếp ảnh" },
            { id: "DESIGN", label: "Graphic Design" },
            { id: "DOCUMENT", label: "Tài liệu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                category === tab.id
                  ? "bg-slate-800 text-white font-medium border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-850 font-normal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tác phẩm, tác giả..."
            className="input-base pl-8"
          />
        </div>
      </div>

      {/* ASSET GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#F6851B]" />
          <p className="type-caption">Đang tải danh mục tác phẩm...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-1.5 bg-slate-900/30">
          <Compass className="h-7 w-7 mx-auto text-slate-600" />
          <h3 className="type-h3 text-white">Chưa có tác phẩm nào phù hợp</h3>
          <p className="type-caption text-slate-400">
            Hãy thử chọn danh mục khác hoặc xóa bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset) => {
            const isImage = asset.mimeType?.startsWith("image/");
            const isRegistered = asset.status === "REGISTERED";

            return (
              <div
                key={asset.id}
                className="card-surface overflow-hidden flex flex-col justify-between hover:border-slate-750 transition-colors"
              >
                <div>
                  {/* PREVIEW */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <Image
                        src={asset.filePath}
                        alt={asset.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-slate-600" />
                    )}
                    <span className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 type-code text-slate-200 border border-white/10 backdrop-blur-sm">
                      {isRegistered ? `#Token ${asset.tokenId}` : asset.status}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="p-4 space-y-1.5">
                    <span className="type-label">
                      {asset.category}
                    </span>
                    <h3 className="type-h3 line-clamp-1">
                      {asset.title}
                    </h3>
                    <p className="type-body text-slate-400 line-clamp-2">
                      {asset.description || "Tác phẩm số đã ghi nhận bản quyền."}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between type-caption">
                      <span className="text-slate-300 font-medium">
                        {asset.creator?.fullName || "Tác giả"}
                      </span>
                      <span className="type-code text-slate-500">
                        {shortenAddress(asset.currentOwnerWallet)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="border-t border-slate-800 p-3 bg-slate-950/40 flex items-center gap-2">
                  {asset.certificate ? (
                    <a
                      href={`/api/certificate/${asset.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary flex-1 py-1.5 text-[11px]"
                    >
                      <Download className="h-3 w-3" />
                      <span>E-Cert PDF</span>
                    </a>
                  ) : null}

                  <Link
                    href={`/verify?hash=${asset.fileHash}`}
                    className="btn-primary flex-1 py-1.5 text-[11px]"
                  >
                    <FileCheck2 className="h-3 w-3" />
                    <span>Xác minh</span>
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
