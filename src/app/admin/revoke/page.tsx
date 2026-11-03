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
} from "lucide-react";
import contractInfo from "@/contracts/AssetRegistry.json";

export default function AdminRevokePage() {
  const [tokenId, setTokenId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredAssets, setRegisteredAssets] = useState<any[]>([]);

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

      // 2. Gửi lệnh cập nhật off-chain
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: Number(tokenId), reason: reason.trim() }),
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
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="VD: 1"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Lý do thu hồi bản quyền (*):</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Phát hiện vi phạm bản quyền tác giả ban đầu..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{loading ? "Đang thực thi lệnh..." : "Xác Nhận Thu Hồi Bản Quyền"}</span>
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
                  onClick={() => setTokenId(String(asset.tokenId))}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700"
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

