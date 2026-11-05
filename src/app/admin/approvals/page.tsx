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
  Lock,
  Wallet,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import ReviewModal from "@/components/ReviewModal";
import { shortenAddress, shortenHash } from "@/lib/crypto";

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

  // AUTH STATE
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // KIỂM TRA QUYỀN ADMIN METAMASK
  const verifyWalletRole = useCallback(async (address: string | null) => {
    if (!address) {
      setConnectedWallet(null);
      setIsAdmin(false);
      setCheckingAuth(false);
      return;
    }

    try {
      setConnectedWallet(address);
      const res = await fetch(`/api/admin/check-role?wallet=${address}`);
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch (err) {
      console.error("Lỗi kiểm tra quyền Admin:", err);
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    async function initWallet() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            await verifyWalletRole(accounts[0]);
          } else {
            setCheckingAuth(false);
          }

          // Lắng nghe sự kiện đổi tài khoản trên MetaMask
          (window as any).ethereum.on("accountsChanged", (newAccounts: string[]) => {
            if (newAccounts && newAccounts.length > 0) {
              verifyWalletRole(newAccounts[0]);
            } else {
              setConnectedWallet(null);
              setIsAdmin(false);
            }
          });
        } catch {
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    }

    initWallet();
  }, [verifyWalletRole]);

  const connectAdminWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          await verifyWalletRole(accounts[0]);
        }
      } catch (err) {
        console.error("Lỗi kết nối ví:", err);
      }
    } else {
      alert("Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt!");
    }
  };

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

      {/* ADMIN PERMISSION STATUS BANNER */}
      {checkingAuth ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Đang kiểm tra quyền hạn ví MetaMask Admin...</span>
        </div>
      ) : !connectedWallet ? (
        /* CHƯA KẾT NỐI VÍ */
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yêu Cầu Kết Nối Ví Quản Trị Viên (Admin)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Khu vực này yêu cầu chữ ký và quyền hạn từ ví của Hội đồng Quản trị để thực hiện thẩm định và cấp chứng nhận.
              </p>
              <p className="text-[11px] font-mono text-amber-400 mt-1">
                Gợi ý tài khoản Admin demo (Hardhat #0): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
              </p>
            </div>
          </div>
          <button
            onClick={connectAdminWallet}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] to-[#CD6116] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:brightness-110 transition"
          >
            <Wallet className="h-4 w-4" />
            <span>Kết Nối Ví Admin</span>
          </button>
        </div>
      ) : !isAdmin ? (
        /* ĐÃ KẾT NỐI VÍ NHƯNG KHÔNG PHẢI VÍ ADMIN (403 FORBIDDEN) */
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-400">Từ Chối Quyền Truy Cập (403 Forbidden)</h3>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  CREATOR / USER
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Địa chỉ ví hiện tại của bạn (<span className="font-mono text-white">{shortenAddress(connectedWallet)}</span>) là tài khoản Tác giả / Người dùng thường, không có quyền thẩm định và phê duyệt hồ sơ của Ban Quản trị.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Vui lòng mở MetaMask và đổi sang ví Admin (<span className="font-mono text-orange-400">0xf39Fd6e5...2266</span>) để mở khóa quyền hạn.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/creator/my-assets"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <span>Về Khu Vực Tác Giả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* VÍ ADMIN HỢP LỆ */
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Quyền Hạn: Hội Đồng Quản Trị (Admin Council)
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
                  XÁC THỰC THÀNH CÔNG
                </span>
              </span>
              <p className="text-[11px] text-slate-300 font-mono">
                Ví Admin: {connectedWallet} • Có toàn quyền phê duyệt và cấp mã số E-Certificate
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30">
            Hợp Lệ
          </span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-slate-400 font-medium">Tổng hồ sơ nộp</p>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-amber-400 font-medium">Chờ thẩm định</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
        </div>

        <div className="rounded-2xl border border-orange-500/30 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-orange-400 font-medium">Đã duyệt (Chờ mint)</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{stats.approved}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-emerald-400 font-medium">Đã lên Blockchain</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.registered}</p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-4 backdrop-blur">
          <p className="text-xs text-rose-400 font-medium">Từ chối / Thu hồi</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.rejected + stats.revoked}</p>
        </div>
      </div>

      {/* CONTROLS & FILTER TABS */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* TABS LỌC THEO TRẠNG THÁI */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Tất cả", count: stats.total },
              { id: "PENDING_APPROVAL", label: "Chờ thẩm định", count: stats.pending },
              { id: "APPROVED", label: "Đã duyệt", count: stats.approved },
              { id: "REGISTERED", label: "Đã lên chuỗi", count: stats.registered },
              { id: "REJECTED", label: "Bị từ chối", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#F6851B] to-[#CD6116] text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-750"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Ô TÌM KIẾM NHANH */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mã băm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-750 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* BẢNG DANH SÁCH HỒ SƠ THẨM ĐỊNH */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-750">
              <tr>
                <th className="px-5 py-3">Tác Phẩm & Tệp Tin</th>
                <th className="px-5 py-3">Tác Giả & Ví Nộp</th>
                <th className="px-5 py-3">Vân Tay SHA-256</th>
                <th className="px-5 py-3">Trạng Thái</th>
                <th className="px-5 py-3">Chứng Nhận E-Cert</th>
                <th className="px-5 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />
                      <span>Đang tải danh sách hồ sơ...</span>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  return (
                    <tr key={asset.id} className="hover:bg-slate-850/50 transition">
                      {/* TÁC PHẨM */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-750">
                            {asset.filePath && asset.mimeType?.startsWith("image/") ? (
                              <Image
                                src={asset.filePath}
                                alt={asset.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-500">
                                <FileText className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white line-clamp-1 max-w-[200px]" title={asset.title}>
                              {asset.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">
                                {asset.category}
                              </span>
                              <span>•</span>
                              <span>{new Date(asset.createdAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TÁC GIẢ */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-200">
                          {asset.creator?.fullName || "Tác giả"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {shortenAddress(asset.currentOwnerWallet)}
                        </div>
                      </td>

                      {/* VÂN TAY SHA-256 */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[11px] text-emerald-400 max-w-[140px] truncate"
                            title={asset.fileHash}
                          >
                            {shortenHash(asset.fileHash)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(asset.fileHash)}
                            title="Sao chép toàn bộ mã SHA-256"
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
                            if (!isAdmin) {
                              alert("Từ chối quyền: Vui lòng kết nối ví MetaMask thuộc Hội đồng Quản trị (Admin) để thực hiện thao tác này!");
                              return;
                            }
                            setSelectedAsset(asset);
                            setModalOpen(true);
                          }}
                          disabled={!isAdmin}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                            isAdmin
                              ? "bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-[#F6851B] hover:text-white cursor-pointer"
                              : "bg-slate-800 border border-slate-750 text-slate-500 cursor-not-allowed opacity-60"
                          }`}
                          title={!isAdmin ? "Yêu cầu kết nối ví Admin" : "Thẩm định hồ sơ"}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isAdmin ? "Thẩm định" : "Khóa quyền"}</span>
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
        adminWallet={connectedWallet || undefined}
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
