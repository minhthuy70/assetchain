"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import {
  ShieldAlert,
  Lock,
  Wallet,
  ArrowRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
} from "lucide-react";
import contractInfo from "@/contracts/AssetRegistry.json";
import { shortenAddress, shortenHash } from "@/lib/crypto";

export default function AdminRevokePage() {
  const [tokenId, setTokenId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredAssets, setRegisteredAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"ALL" | "REGISTERED" | "REVOKED">("ALL");

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

  const fetchRegistered = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/assets");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Lấy tất cả các tài sản đã có Token ID trên chuỗi (REGISTERED và REVOKED)
        const onchainAssets = data.data.filter(
          (a: any) => a.tokenId !== null && (a.status === "REGISTERED" || a.status === "REVOKED")
        );
        setRegisteredAssets(onchainAssets);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách tài sản on-chain:", err);
    }
  }, []);

  useEffect(() => {
    fetchRegistered();
  }, [fetchRegistered]);

  // Tìm tài sản tương ứng với Token ID đang nhập
  const selectedAssetPreview = useMemo(() => {
    if (!tokenId.trim()) return null;
    const num = Number(tokenId.trim());
    if (isNaN(num)) return null;
    return registeredAssets.find((a) => a.tokenId === num) || null;
  }, [tokenId, registeredAssets]);

  // Bộ lọc tìm kiếm nhanh danh sách gợi ý
  const filteredAssets = useMemo(() => {
    return registeredAssets.filter((asset) => {
      if (filterTab === "REGISTERED" && asset.status !== "REGISTERED") return false;
      if (filterTab === "REVOKED" && asset.status !== "REVOKED") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTokenId = String(asset.tokenId).includes(q);
      const matchTitle = asset.title?.toLowerCase().includes(q);
      const matchWallet = asset.currentOwnerWallet?.toLowerCase().includes(q);
      const matchHash = asset.fileHash?.toLowerCase().includes(q);
      return matchTokenId || matchTitle || matchWallet || matchHash;
    });
  }, [registeredAssets, filterTab, searchQuery]);

  const activeCount = registeredAssets.filter((a) => a.status === "REGISTERED").length;
  const revokedCount = registeredAssets.filter((a) => a.status === "REVOKED").length;

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg("Từ chối quyền: Vui lòng kết nối ví MetaMask thuộc Hội đồng Quản trị (Admin)!");
      return;
    }

    if (!tokenId || !reason.trim()) {
      setErrorMsg("Vui lòng cung cấp đầy đủ Token ID và Lý do thu hồi!");
      return;
    }

    // Chặn trùng lặp: Nếu tác phẩm đã bị thu hồi trước đó
    if (selectedAssetPreview && selectedAssetPreview.status === "REVOKED") {
      setErrorMsg(
        `Tác phẩm Token #${selectedAssetPreview.tokenId} đã bị thu hồi trước đó! (Lý do: ${selectedAssetPreview.rejectionReason || "Đã hủy hiệu lực"}). Không thể thu hồi lần 2.`
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          if (contractInfo && contractInfo.address) {
            const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
            const tx = await contract.revokeAsset(Number(tokenId), reason.trim());
            await tx.wait();
          }
        } catch (chainErr: any) {
          console.warn("Lưu ý: Không thể ký MetaMask on-chain. Tiến hành đồng bộ off-chain.");
        }
      }

      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-wallet": connectedWallet || "",
        },
        body: JSON.stringify({
          tokenId: Number(tokenId),
          reason: reason.trim(),
          adminWallet: connectedWallet,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể thu hồi tài sản");

      setSuccessMsg(`Đã thu hồi chứng nhận Token #${tokenId}. Cổng tra cứu và file PDF sẽ cập nhật trạng thái cảnh báo.`);
      setReason("");
      setTokenId("");
      fetchRegistered();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-5">
        <span className="type-label text-rose-400">
          Quyền Hạn Đặc Biệt
        </span>
        <h1 className="type-h1 mt-1">
          Thu Hồi Quyền Bản Quyền Tác Phẩm (Revoke)
        </h1>
        <p className="type-subhead mt-1">
          Hủy bỏ hiệu lực chứng nhận on-chain đối với các tác phẩm phát hiện vi phạm bản quyền hoặc có tranh chấp pháp lý.
        </p>
      </div>

      {/* ADMIN STATUS BANNER */}
      {checkingAuth ? (
        <div className="card-surface p-3.5 flex items-center gap-2.5 type-caption text-slate-400">
          <div className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          <span>Đang kiểm tra quyền hạn ví Admin...</span>
        </div>
      ) : !connectedWallet ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="type-h3 text-white">Yêu Cầu Kết Nối Ví Quản Trị Viên (Admin)</p>
              <p className="type-caption text-slate-400 mt-0.5">
                Lệnh thu hồi yêu cầu quyền hạn Deployer/Owner của Smart Contract.
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
              <p className="type-h3 text-rose-400">Từ Chối Quyền Truy Cập (403 Forbidden)</p>
              <p className="type-caption text-slate-400 mt-0.5">
                Ví hiện tại ({shortenAddress(connectedWallet)}) không có quyền thu hồi tài sản.
              </p>
            </div>
          </div>
          <Link
            href="/creator/my-assets"
            className="btn-secondary shrink-0"
          >
            <span>Về Bảng Điều Khiển</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="type-caption font-medium text-slate-200">Ví Admin đã kết nối:</span>
            <span className="type-code text-slate-400">{connectedWallet}</span>
          </div>
          <span className="type-label text-emerald-400 font-medium">ADMIN PRIVILEGE</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className="card-surface p-5 space-y-4">
        <div>
          <h3 className="type-h3">Lệnh thu hồi trên Smart Contract</h3>
          <p className="type-caption text-slate-400 mt-0.5">Hành động này sẽ cập nhật `isRevoked = true` trong Smart Contract</p>
        </div>

        <form onSubmit={handleRevoke} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="type-caption font-medium text-slate-300 mb-1.5 block">Token ID (*):</label>
              <input
                type="number"
                required
                disabled={!isAdmin}
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="VD: 1"
                className="input-base font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="type-caption font-medium text-slate-300 mb-1.5 block">Lý do thu hồi bản quyền (*):</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do chi tiết (VD: Tranh chấp bản quyền, đạo nhái...)"
                className="input-base"
              />
            </div>
          </div>

          {/* REAL-TIME PREVIEW OF SELECTED TOKEN */}
          {selectedAssetPreview && (
            <div
              className={`rounded-lg p-3 border text-xs space-y-1.5 ${
                selectedAssetPreview.status === "REVOKED"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-slate-950 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedAssetPreview.status === "REVOKED" ? (
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-medium text-white">
                    Token #{selectedAssetPreview.tokenId}: {selectedAssetPreview.title}
                  </span>
                </div>
                <span
                  className={`type-caption font-medium rounded px-1.5 py-0.5 ${
                    selectedAssetPreview.status === "REVOKED"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {selectedAssetPreview.status === "REVOKED" ? "ĐÃ BỊ THU HỒI" : "HỢP LỆ ON-CHAIN"}
                </span>
              </div>

              {selectedAssetPreview.status === "REVOKED" ? (
                <p className="type-caption text-rose-400">
                  ⚠️ Cảnh báo: Tác phẩm này đã bị thu hồi trước đó. Lý do: &ldquo;{selectedAssetPreview.rejectionReason || "Không rõ"}&rdquo;. Không thể thu hồi lại!
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 type-caption pt-0.5">
                  <span>Chủ sở hữu: <code className="text-slate-300 font-mono">{shortenAddress(selectedAssetPreview.currentOwnerWallet)}</code></span>
                  <span>Mã hash: <code className="text-slate-300 font-mono">{shortenHash(selectedAssetPreview.fileHash)}</code></span>
                  <span>Danh mục: {selectedAssetPreview.category}</span>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={
                loading ||
                !isAdmin ||
                !tokenId ||
                !reason.trim() ||
                selectedAssetPreview?.status === "REVOKED"
              }
              className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{loading ? "Đang xử lý..." : "Xác Nhận Thu Hồi Bản Quyền"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK SELECTION LIST WITH SEARCH & TABS */}
      <div className="card-surface p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
          <div>
            <h3 className="type-label text-slate-200">
              Danh mục tác phẩm on-chain ({registeredAssets.length})
            </h3>
            <p className="type-caption text-slate-400 mt-0.5">
              Chọn nhanh tác phẩm để điền Token ID vào biểu mẫu thu hồi
            </p>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "ALL", label: `Tất cả (${registeredAssets.length})` },
              { id: "REGISTERED", label: `Có hiệu lực (${activeCount})` },
              { id: "REVOKED", label: `Đã thu hồi (${revokedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`rounded px-2.5 py-1 text-[11px] transition-colors ${
                  filterTab === tab.id
                    ? "bg-slate-800 text-white font-medium border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Token ID (#1, #2...), tiêu đề tác phẩm, địa chỉ ví..."
            className="input-base pl-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* ASSET LIST TABLE */}
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center type-caption text-slate-500 bg-slate-950/40 rounded-lg border border-slate-850">
            {searchQuery
              ? "Không tìm thấy tác phẩm on-chain nào khớp với từ khóa tìm kiếm."
              : "Chưa có tác phẩm nào ghi nhận trên chuỗi khối."}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 text-xs">
            {filteredAssets.map((asset) => {
              const isRevoked = asset.status === "REVOKED";
              const isSelected = String(asset.tokenId) === tokenId;

              return (
                <div
                  key={asset.id}
                  className={`py-2.5 px-2 flex items-center justify-between rounded-md transition-colors ${
                    isSelected
                      ? "bg-slate-850 border border-slate-700"
                      : "hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {asset.filePath && asset.mimeType?.startsWith("image/") ? (
                        <Image
                          src={asset.filePath}
                          alt={asset.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <FileText className="h-4 w-4 text-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">
                          Token #{asset.tokenId}
                        </span>
                        <span className="text-slate-300 truncate max-w-[180px] sm:max-w-xs" title={asset.title}>
                          {asset.title}
                        </span>
                        {isRevoked ? (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-medium text-rose-400 border border-rose-500/20"
                            title={`Lý do: ${asset.rejectionReason || "Đã thu hồi"}`}
                          >
                            ĐÃ THU HỒI
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                            ON-CHAIN
                          </span>
                        )}
                      </div>

                      <div className="type-caption text-slate-500 flex items-center gap-2">
                        <span>Ví: <code className="text-slate-400">{shortenAddress(asset.currentOwnerWallet)}</code></span>
                        <span>•</span>
                        <span>{asset.category}</span>
                        {isRevoked && asset.rejectionReason && (
                          <>
                            <span>•</span>
                            <span className="text-rose-400 truncate max-w-[160px]" title={asset.rejectionReason}>
                              Lý do: {asset.rejectionReason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isRevoked ? (
                      <button
                        type="button"
                        disabled
                        className="rounded px-2.5 py-1 text-[11px] font-medium text-slate-500 bg-slate-900 border border-slate-800 cursor-not-allowed opacity-60"
                      >
                        Đã thu hồi
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => {
                          setTokenId(String(asset.tokenId));
                          setErrorMsg(null);
                        }}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-[#F6851B] text-white"
                            : "btn-secondary"
                        }`}
                      >
                        {isSelected ? "Đang chọn" : `Chọn #${asset.tokenId}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}