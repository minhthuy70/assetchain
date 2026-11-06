"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Eye,
  Sparkles,
  Lock,
  Wallet,
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
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
            Chờ thẩm định
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#F6851B]/10 px-2 py-0.5 text-[11px] font-medium text-[#F6851B] border border-[#F6851B]/20">
            Đã duyệt (Chờ mint)
          </span>
        );
      case "REGISTERED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
            On-Chain
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
            Từ chối
          </span>
        );
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700">
            Đã thu hồi
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Phân hệ Quản trị viên (Admin Council)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Cổng Thẩm Định & Phê Duyệt Hồ Sơ
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Xem xét tính nguyên bản, phê duyệt cấp mã số E-Certificate trước khi đưa lên Blockchain EVM.
          </p>
        </div>

        <button
          onClick={fetchAssets}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ADMIN AUTH STATE NOTIFICATION */}
      {checkingAuth ? (
        <div className="card-surface p-3 flex items-center gap-2.5 text-xs text-slate-400">
          <div className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          <span>Đang kiểm tra quyền hạn ví MetaMask...</span>
        </div>
      ) : !connectedWallet ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Yêu Cầu Kết Nối Ví Quản Trị Viên (Admin)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Khu vực này yêu cầu chữ ký từ tài khoản Admin. Mặc định demo (Hardhat #0): <code className="text-amber-400 font-mono">0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code>
              </p>
            </div>
          </div>
          <button
            onClick={connectAdminWallet}
            className="btn-primary shrink-0"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Kết Nối Ví Admin</span>
          </button>
        </div>
      ) : !isAdmin ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-400">Từ Chối Quyền Truy Cập (403 Forbidden)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ví hiện tại ({shortenAddress(connectedWallet)}) không thuộc danh sách Admin. Vui lòng chuyển sang ví Admin trên MetaMask.
              </p>
            </div>
          </div>
          <Link
            href="/creator/my-assets"
            className="btn-secondary shrink-0"
          >
            <span>Về Bảng Điều Khiển Tác Giả</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">Đã xác thực Ví Quản trị viên:</span>
            <span className="font-mono text-slate-400">{connectedWallet}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">ADMIN COUNCIL</span>
        </div>
      )}

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card-surface p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Tổng hồ sơ</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{stats.total}</div>
        </div>
        <div className="card-surface p-3.5 border-amber-500/20">
          <div className="text-[11px] font-medium text-amber-400">Chờ thẩm định</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{stats.pending}</div>
        </div>
        <div className="card-surface p-3.5 border-[#F6851B]/20">
          <div className="text-[11px] font-medium text-[#F6851B]">Đã duyệt (Chờ mint)</div>
          <div className="text-xl font-bold text-[#F6851B] font-mono mt-0.5">{stats.approved}</div>
        </div>
        <div className="card-surface p-3.5 border-emerald-500/20">
          <div className="text-[11px] font-medium text-emerald-400">Đã lên Blockchain</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{stats.registered}</div>
        </div>
        <div className="card-surface p-3.5 border-rose-500/20">
          <div className="text-[11px] font-medium text-rose-400">Từ chối / Thu hồi</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">{stats.rejected + stats.revoked}</div>
        </div>
      </div>

      {/* CONTROLS & TABLE */}
      <div className="card-surface p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* TABS */}
          <div className="flex flex-wrap gap-1.5">
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
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white font-semibold border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mã băm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-8"
            />
          </div>
        </div>

        {/* AUDIT DATA TABLE */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Tác phẩm</th>
                <th className="px-4 py-3 font-semibold">Tác giả & Ví</th>
                <th className="px-4 py-3 font-semibold">Mã băm SHA-256</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Chứng nhận</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Đang tải danh sách hồ sơ...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Không có hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  return (
                    <tr key={asset.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-900 border border-slate-800">
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
                                <FileText className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white line-clamp-1 max-w-[180px]">
                              {asset.title}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {asset.category} • {new Date(asset.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">
                          {asset.creator?.fullName || "Tác giả"}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {shortenAddress(asset.currentOwnerWallet)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                          <span>{shortenHash(asset.fileHash)}</span>
                          <button
                            onClick={() => copyToClipboard(asset.fileHash)}
                            title="Sao chép toàn bộ mã SHA-256"
                            className="text-slate-500 hover:text-slate-200"
                          >
                            {copiedHash === asset.fileHash ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(asset.status)}
                        {asset.rejectionReason && (
                          <p className="text-[10px] text-rose-400 mt-0.5 line-clamp-1 max-w-[160px]" title={asset.rejectionReason}>
                            {asset.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {asset.certificate ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-300 font-medium">
                              {asset.certificate.certificateNumber}
                            </span>
                            <a
                              href={`/api/certificate/${asset.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Tải E-Certificate PDF"
                              className="text-slate-400 hover:text-[#F6851B] transition-colors"
                            >
                              <FileCheck2 className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Chưa cấp</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (!isAdmin) {
                              alert("Yêu cầu kết nối ví MetaMask thuộc Hội đồng Quản trị (Admin)!");
                              return;
                            }
                            setSelectedAsset(asset);
                            setModalOpen(true);
                          }}
                          disabled={!isAdmin}
                          className={isAdmin ? "btn-secondary py-1 px-2.5 text-xs" : "btn-ghost py-1 px-2.5 text-xs opacity-50 cursor-not-allowed"}
                        >
                          <Eye className="h-3 w-3" />
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
