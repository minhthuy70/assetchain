"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  ShieldAlert,
  Lock,
  Wallet,
  ArrowRight,
} from "lucide-react";
import contractInfo from "@/contracts/AssetRegistry.json";
import { shortenAddress } from "@/lib/crypto";

export default function AdminRevokePage() {
  const [tokenId, setTokenId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredAssets, setRegisteredAssets] = useState<any[]>([]);

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
      const res = await fetch("/api/admin/assets?status=REGISTERED");
      const data = await res.json();
      if (data.success) {
        setRegisteredAssets(data.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchRegistered();
  }, [fetchRegistered]);

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
                onChange={(e) => setTokenId(e.target.value)}
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
                placeholder="Nhập lý do chi tiết..."
                className="input-base"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300 border border-emerald-500/20">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !isAdmin}
              className="btn-danger"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{loading ? "Đang xử lý..." : "Xác Nhận Thu Hồi Bản Quyền"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK SELECTION LIST */}
      <div className="card-surface p-4 space-y-3">
        <h3 className="type-label">
          Tác phẩm đã ghi danh on-chain
        </h3>
        {registeredAssets.length === 0 ? (
          <p className="type-caption text-slate-500">Chưa có tác phẩm nào ở trạng thái REGISTERED.</p>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {registeredAssets.map((asset) => (
              <div key={asset.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="type-code text-white font-medium mr-2">Token #{asset.tokenId}:</span>
                  <span className="type-body text-slate-300">{asset.title}</span>
                  <span className="type-code text-slate-500 text-[10px] ml-2">({shortenAddress(asset.currentOwnerWallet)})</span>
                </div>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setTokenId(String(asset.tokenId))}
                  className="btn-ghost py-1 px-2 type-caption"
                >
                  Chọn #{asset.tokenId}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
