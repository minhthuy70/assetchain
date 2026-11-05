"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  ExternalLink,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Eye,
  Sparkles,
} from "lucide-react";
import ReviewModal from "@/components/ReviewModal";

export default function AdminApprovalsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    registered: 0,
    rejected: 0,
    revoked: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/assets", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("status", activeTab);
      if (searchQuery.trim()) url.searchParams.set("query", searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách admin:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-inset ring-amber-500/30">
            <Clock className="h-3 w-3" /> Chờ thẩm định
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-400 ring-1 ring-inset ring-orange-500/30">
            <CheckCircle2 className="h-3 w-3" /> Đã duyệt (Chờ mint)
          </span>
        );
      case "REGISTERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
            <Sparkles className="h-3 w-3" /> Đã lên Blockchain
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400 ring-1 ring-inset ring-rose-500/30">
            <XCircle className="h-3 w-3" /> Bị từ chối
          </span>
        );
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-400 ring-1 ring-inset ring-orange-500/30">
            <ShieldAlert className="h-3 w-3" /> Đã thu hồi
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-[#F6851B]" />
            <span>Phân hệ Quản trị viên (Admin Council)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Cổng Thẩm Định & Phê Duyệt Hồ Sơ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Thẩm định tính toàn vẹn tác phẩm, phê duyệt và cấp số chứng nhận điện tử (E-Certificate) trước khi đưa lên Blockchain EVM.
          </p>
        </div>

        <button
          onClick={fetchAssets}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-slate-900 border border-slate-750 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-orange-500 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-orange-400 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-slate-400 font-medium">Tổng hồ sơ nộp</p>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 backdrop-blur">
          <p className="text-xs text-amber-300 font-bold">Đang chờ thẩm định</p>
          <p className="text-2xl font-black text-amber-300 mt-1">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 backdrop-blur">
          <p className="text-xs text-orange-400 font-bold">Đã phê duyệt (Chờ mint)</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 backdrop-blur">
          <p className="text-xs text-emerald-400 font-bold">Đã lên Blockchain (NFT)</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.registered}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 backdrop-blur col-span-2 lg:col-span-1">
          <p className="text-xs text-rose-300 font-bold">Từ chối / Thu hồi</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.rejected + stats.revoked}</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING_APPROVAL", label: `Chờ duyệt (${stats.pending})` },
            { id: "APPROVED", label: "Đã duyệt" },
            { id: "REGISTERED", label: "Đã lên chuỗi" },
            { id: "REJECTED", label: "Bị từ chối" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#F6851B] to-[#E2761B] text-white shadow-md shadow-orange-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tác phẩm, mã hash, ví..."
            className="w-full rounded-xl border border-slate-750 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 uppercase tracking-wider text-[11px] text-slate-400 font-bold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Tác phẩm</th>
                <th scope="col" className="px-5 py-3.5">Tác giả / Ví</th>
                <th scope="col" className="px-5 py-3.5">Mã băm SHA-256</th>
                <th scope="col" className="px-5 py-3.5">Trạng thái</th>
                <th scope="col" className="px-5 py-3.5">Chứng nhận</th>
                <th scope="col" className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />
                      <span>Đang tải danh sách hồ sơ thẩm định...</span>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Không có hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const isImage = asset.mimeType?.startsWith("image/");
                  return (
                    <tr key={asset.id} className="transition hover:bg-slate-850/60">
                      {/* CỘT TÁC PHẨM */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                            {isImage ? (
                              <Image
                                src={asset.filePath}
                                alt={asset.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <FileText className="h-6 w-6 text-orange-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white line-clamp-1">{asset.title}</p>
                            <span className="text-[10px] text-slate-400 uppercase">{asset.category} • {(asset.fileSize / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT TÁC GIẢ */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-200">{asset.creator?.fullName || "Tác giả"}</p>
                        <p className="font-mono text-[11px] text-orange-300">
                          {asset.currentOwnerWallet.slice(0, 6)}...{asset.currentOwnerWallet.slice(-4)}
                        </p>
                      </td>

                      {/* CỘT HASH SHA-256 */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                          <span>{asset.fileHash.slice(0, 10)}...{asset.fileHash.slice(-8)}</span>
                          <button
                            onClick={() => copyToClipboard(asset.fileHash)}
                            title="Sao chép toàn bộ mã băm SHA-256"
                            className="rounded p-1 hover:bg-slate-750 text-slate-400 hover:text-white"
                          >
                            {copiedHash === asset.fileHash ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-5 py-3.5">
                        {getStatusBadge(asset.status)}
                        {asset.rejectionReason && (
                          <p className="text-[10px] text-rose-400 mt-0.5 line-clamp-1" title={asset.rejectionReason}>
                            Lý do: {asset.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* CHỨNG NHẬN */}
                      <td className="px-5 py-3.5">
                        {asset.certificate ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-orange-400 font-bold">
                              {asset.certificate.certificateNumber}
                            </span>
                            <a
                              href={`/api/certificate/${asset.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Tải E-Certificate PDF"
                              className="text-slate-400 hover:text-orange-400 transition"
                            >
                              <FileCheck2 className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Chưa cấp</span>
                        )}
                      </td>

                      {/* THAO TÁC */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 px-3.5 py-1.5 text-xs font-bold text-orange-400 hover:bg-[#F6851B] hover:text-white transition shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Thẩm định</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      <ReviewModal
        asset={selectedAsset}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAsset(null);
        }}
        onSuccess={() => {
          fetchAssets();
        }}
      />
    </div>
  );
}
