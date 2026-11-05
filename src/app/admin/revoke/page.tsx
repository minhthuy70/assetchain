"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  FileCheck2,
  Lock,
  Wallet,
  ArrowRight,
  ShieldCheck,
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
      // 1. Nếu có kết nối ví Admin MetaMask, gọi hàm contract.revokeAsset on-chain
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          if (contractInfo && contractInfo.address) {
            const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
            console.log("Calling contract.revokeAsset on-chain...");
            const tx = await contract.revokeAsset(Number(tokenId), reason.trim());
            await tx.wait();
          }
        } catch (chainErr: any) {
          console.warn("Lưu ý: Không thể ký MetaMask on-chain (có thể ví hiện tại không phải Admin owner). Tiến hành đồng bộ off-chain.");
        }
      }

      // 2. Gửi lệnh cập nhật off-chain kèm adminWallet
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

      setSuccessMsg(`Đã thu hồi thành công chứng nhận Token #${tokenId}. Bản in PDF và cổng tra cứu sẽ hiển thị cảnh báo đỏ/cam ngay lập tức!`);
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" />
          <span>Quyền Hạn Đặc Biệt • Cơ Quan Quản Trị</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Thu Hồi Quyền Bản Quyền Tác Phẩm (Revoke Asset)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hủy bỏ hiệu lực chứng nhận on-chain và đóng dấu cảnh báo đối với các tác phẩm phát hiện vi phạm bản quyền hoặc có tranh chấp pháp lý.
        </p>
      </div>

      {/* ADMIN STATUS BANNER */}
      {checkingAuth ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Đang kiểm tra quyền hạn ví MetaMask Admin...</span>
        </div>
      ) : !connectedWallet ? (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yêu Cầu Kết Nối Ví Quản Trị Viên (Admin)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Lệnh thu hồi quyền bản quyền yêu cầu quyền hạn Deployer/Owner của Smart Contract.
              </p>
              <p className="text-[11px] font-mono text-amber-400 mt-1">
                Gợi ý tài khoản Admin (Hardhat #0): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
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
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-400">Từ Chối Quyền Truy Cập (403 Forbidden)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Địa chỉ ví hiện tại (<span className="font-mono text-white">{shortenAddress(connectedWallet)}</span>) không có quyền Quản trị viên (Admin Council).
              </p>
            </div>
          </div>
          <Link
            href="/creator/my-assets"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            <span>Về Bảng Điều Khiển</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Quyền Hạn: Hội Đồng Quản Trị (Admin Council)
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
                  ĐÃ XÁC THỰC
                </span>
              </span>
              <p className="text-[11px] text-slate-300 font-mono">
                Ví Admin: {connectedWallet}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="rounded-3xl border border-rose-500/30 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Lệnh Thu Hồi On-Chain</h3>
            <p className="text-xs text-slate-400">Hành động này sẽ cập nhật biến trạng thái `isRevoked = true` trong Smart Contract</p>
          </div>
        </div>

        <form onSubmit={handleRevoke} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Token ID (*):</label>
              <input
                type="number"
                required
                disabled={!isAdmin}
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="VD: 1"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Lý do thu hồi bản quyền (*):</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Phát hiện vi phạm bản quyền tác giả ban đầu..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/20 p-3 text-xs text-rose-300 border border-rose-500/30">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-500/20 p-3 text-xs text-emerald-300 border border-emerald-500/30">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !isAdmin}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-lg transition ${
                isAdmin
                  ? "bg-rose-600 shadow-rose-600/30 hover:bg-rose-700 cursor-pointer"
                  : "bg-slate-800 border border-slate-750 text-slate-500 cursor-not-allowed opacity-50"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{loading ? "Đang thực thi lệnh..." : isAdmin ? "Xác Nhận Thu Hồi Bản Quyền" : "Yêu Cầu Quyền Admin"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK SELECTION LIST */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-xs uppercase font-bold text-slate-400">
          Danh sách tác phẩm đã lên chuỗi (Chọn nhanh Token ID)
        </h3>
        {registeredAssets.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có tác phẩm nào đạt trạng thái REGISTERED.</p>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {registeredAssets.map((asset) => (
              <div key={asset.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white mr-2">Token #{asset.tokenId}:</span>
                  <span className="text-slate-300">{asset.title}</span>
                  <span className="text-slate-500 text-[10px] ml-2">({asset.currentOwnerWallet.slice(0, 8)}...)</span>
                </div>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setTokenId(String(asset.tokenId))}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Chọn Token #{asset.tokenId}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
