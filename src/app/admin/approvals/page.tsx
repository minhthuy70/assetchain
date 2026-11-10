"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Eye,
  Lock,
  Wallet,
  ArrowRight,
  FileCheck2,
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

  const fetchAssets = useCallback(
    async (walletOverride?: string) => {
      const walletToUse = walletOverride || connectedWallet;
      if (!walletToUse) {
        setAssets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = new URL("/api/admin/assets", window.location.origin);
        url.searchParams.set("wallet", walletToUse);
        if (activeTab !== "ALL") url.searchParams.set("status", activeTab);
        if (searchQuery.trim()) url.searchParams.set("query", searchQuery.trim());

        const res = await fetch(url.toString(), {
          headers: {
            "x-admin-wallet": walletToUse,
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAssets(data.data);
          if (data.stats) setStats(data.stats);
        } else {
          setAssets([]);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách admin:", err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    },
    [connectedWallet, activeTab, searchQuery]
  );

  const verifyWalletRole = useCallback(
    async (address: string | null) => {
      if (!address) {
        setConnectedWallet(null);
        setIsAdmin(false);
        setCheckingAuth(false);
        setAssets([]);
        return;
      }

      try {
        setConnectedWallet(address);
        const res = await fetch(`/api/admin/check-role?wallet=${address}`);
        const data = await res.json();
        const authorized = !!data.isAdmin;
        setIsAdmin(authorized);
        if (authorized) {
          fetchAssets(address);
        } else {
          setAssets([]);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra quyền Admin:", err);
        setIsAdmin(false);
        setAssets([]);
      } finally {
        setCheckingAuth(false);
      }
    },
    [fetchAssets]
  );

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
              setAssets([]);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
            Chờ thẩm định
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center rounded bg-[#F6851B]/10 px-2 py-0.5 text-[11px] font-medium text-[#F6851B] border border-[#F6851B]/20">
            Đã duyệt (Chờ mint)
          </span>
        );
      case "REGISTERED":
        return (
          <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
            On-Chain
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
            Từ chối
          </span>
        );
      case "REVOKED":
        return (
          <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700">
            Đã thu hồi
          </span>
        );
      default:
        return <span className="type-caption text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="type-label text-slate-500">
            Phân hệ Quản trị viên (Admin Council)
          </span>
          <h1 className="type-h1 mt-1">
            Cổng Thẩm Định & Phê Duyệt Hồ Sơ
          </h1>
          <p className="type-subhead mt-0.5">
            Xem xét tính nguyên bản, phê duyệt cấp mã số E-Certificate trước khi đưa lên Blockchain EVM.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => fetchAssets()}
            disabled={loading}
            className="btn-secondary self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
        )}
      </div>

      {/* ADMIN AUTH STATE NOTIFICATION */}
      {checkingAuth ? (
        <div className="card-surface p-6 flex items-center justify-center gap-3 type-caption text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          <span>Đang kiểm tra quyền hạn ví MetaMask Quản trị viên...</span>
        </div>
      ) : !connectedWallet ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-white">Yêu Cầu Kết Nối Ví Quản Trị Viên (Admin)</p>
                <p className="type-caption mt-0.5 text-slate-400">
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

          {/* SECURE PLACEHOLDER FOR UNAUTHENTICATED USERS */}
          <div className="card-surface p-12 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="type-h3 text-slate-200">Dữ Liệu Thẩm Định Bản Quyền Đã Được Khóa Bảo Mật</h3>
              <p className="type-caption text-slate-400 max-w-md mx-auto leading-relaxed">
                Toàn bộ danh sách hồ sơ nộp bản quyền, thông tin cá nhân tác giả và dấu vân tay số SHA-256 được bảo vệ nghiêm ngặt. Vui lòng kết nối ví Quản trị viên để truy cập.
              </p>
            </div>
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-rose-400">Từ Chối Quyền Truy Cập (403 Forbidden)</p>
                <p className="type-caption mt-0.5 text-slate-400">
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

          {/* SECURE PLACEHOLDER FOR NON-ADMINS */}
          <div className="card-surface p-12 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="type-h3 text-slate-200">Không Đủ Quyền Hạn Truy Cập Bảng Điều Khiển Admin</h3>
              <p className="type-caption text-slate-400 max-w-md mx-auto leading-relaxed">
                Hồ sơ tác phẩm, thông tin liên hệ và mã băm bản quyền chỉ dành riêng cho các thành viên được chỉ định thuộc Hội đồng Quản trị AssetChain.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* FULL ADMIN INTERFACE (ONLY SHOWN WHEN AUTHENTICATED) */
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-200">Đã xác thực Ví Quản trị viên:</span>
              <span className="font-mono text-slate-400">{connectedWallet}</span>
            </div>
            <span className="type-label text-emerald-400 font-mono">ADMIN COUNCIL</span>
          </div>

          {/* METRICS STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="card-surface p-3.5">
              <div className="type-caption">Tổng hồ sơ</div>
              <div className="text-lg font-semibold text-white font-mono mt-0.5">{stats.total}</div>
            </div>
            <div className="card-surface p-3.5 border-amber-500/20">
              <div className="type-caption text-amber-400">Chờ thẩm định</div>
              <div className="text-lg font-semibold text-amber-400 font-mono mt-0.5">{stats.pending}</div>
            </div>
            <div className="card-surface p-3.5 border-[#F6851B]/20">
              <div className="type-caption text-[#F6851B]">Đã duyệt (Chờ mint)</div>
              <div className="text-lg font-semibold text-[#F6851B] font-mono mt-0.5">{stats.approved}</div>
            </div>
            <div className="card-surface p-3.5 border-emerald-500/20">
              <div className="type-caption text-emerald-400">Đã lên Blockchain</div>
              <div className="text-lg font-semibold text-emerald-400 font-mono mt-0.5">{stats.registered}</div>
            </div>
            <div className="card-surface p-3.5 border-rose-500/20">
              <div className="type-caption text-rose-400">Từ chối / Thu hồi</div>
              <div className="text-lg font-semibold text-rose-400 font-mono mt-0.5">{stats.rejected + stats.revoked}</div>
            </div>
          </div>

          {/* CONTROLS & TABLE */}
          <div className="card-surface p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* TABS (INCLUDES REVOKED) */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "Tất cả", count: stats.total },
                  { id: "PENDING_APPROVAL", label: "Chờ thẩm định", count: stats.pending },
                  { id: "APPROVED", label: "Đã duyệt", count: stats.approved },
                  { id: "REGISTERED", label: "Đã lên chuỗi", count: stats.registered },
                  { id: "REJECTED", label: "Bị từ chối", count: stats.rejected },
                  { id: "REVOKED", label: "Đã thu hồi", count: stats.revoked },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-800 text-white font-medium border border-slate-700"
                        : "text-slate-400 hover:text-white hover:bg-slate-850 font-normal"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="type-caption font-mono">
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
                <thead className="bg-slate-900 type-label border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Tác phẩm</th>
                    <th className="px-4 py-2.5">Tác giả & Ví</th>
                    <th className="px-4 py-2.5">Mã băm SHA-256</th>
                    <th className="px-4 py-2.5">Trạng thái</th>
                    <th className="px-4 py-2.5">Chứng nhận</th>
                    <th className="px-4 py-2.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 type-body">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center type-caption text-slate-500">
                        Đang tải danh sách hồ sơ...
                      </td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center type-caption text-slate-500">
                        Không có hồ sơ nào trong mục này.
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset) => {
                      const isImage = asset.mimeType?.startsWith("image/");
                      return (
                        <tr key={asset.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded bg-slate-900 border border-slate-800 shrink-0">
                                {isImage && asset.filePath ? (
                                  <Image
                                    src={asset.filePath}
                                    alt={asset.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-medium text-white truncate max-w-[180px]">
                                  {asset.title}
                                </p>
                                <span className="type-caption text-slate-500">
                                  {asset.category}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="font-medium text-slate-200">
                                {asset.creator?.fullName || "Ẩn danh"}
                              </p>
                              <p className="type-code text-slate-500">
                                {shortenAddress(asset.currentOwnerWallet)}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 type-code text-slate-400">
                              <span>{shortenHash(asset.fileHash)}</span>
                              <button
                                onClick={() => copyToClipboard(asset.fileHash)}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Sao chép SHA-256"
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
                          </td>

                          <td className="px-4 py-3">
                            {asset.certificate ? (
                              <div className="flex items-center gap-1.5">
                                <span className="type-code text-slate-300">
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
                              <span className="type-caption text-slate-600">Chưa cấp</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setModalOpen(true);
                              }}
                              className="btn-secondary py-1 px-2.5 text-xs font-medium"
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
        </div>
      )}

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
