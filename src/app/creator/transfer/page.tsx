"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Wallet,
  Clock,
  ExternalLink,
} from "lucide-react";
import { shortenAddress, shortenHash } from "@/lib/crypto";
import { transferAssetOnChain } from "@/lib/onchain";

function TransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAssetId = searchParams.get("assetId");

  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [currentWallet, setCurrentWallet] = useState<string>("");
  const [toWallet, setToWallet] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [transferring, setTransferring] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // 1. Nhận diện ví MetaMask & lấy danh sách tác phẩm On-Chain
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let walletAddr = "";

      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            walletAddr = accounts[0].address;
            setCurrentWallet(walletAddr);
          }
        } catch (err) {
          console.error(err);
        }
      }

      try {
        const url = new URL("/api/assets", window.location.origin);
        if (walletAddr) url.searchParams.set("wallet", walletAddr);
        url.searchParams.set("status", "REGISTERED");

        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success && data.data) {
          setAssets(data.data);
          if (initialAssetId) {
            const found = data.data.find((a: any) => a.id === initialAssetId);
            if (found) setSelectedAsset(found);
          } else if (data.data.length > 0) {
            setSelectedAsset(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Lỗi nạp danh sách tài sản chuyển nhượng:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [initialAssetId]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedAsset) {
      setErrorMsg("Vui lòng chọn tác phẩm cần chuyển nhượng!");
      return;
    }

    if (!toWallet.trim() || !toWallet.startsWith("0x") || toWallet.length !== 42) {
      setErrorMsg("Địa chỉ ví người nhận không hợp lệ (Phải đúng chuẩn EVM 42 ký tự 0x...)!");
      return;
    }

    if (toWallet.toLowerCase() === currentWallet.toLowerCase()) {
      setErrorMsg("Không thể chuyển nhượng cho chính địa chỉ ví hiện tại!");
      return;
    }

    setTransferring(true);

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("Vui lòng kết nối ví MetaMask để thực hiện giao dịch chuyển nhượng on-chain!");
      }

      // A. Gọi Smart Contract on-chain
      const receipt = await transferAssetOnChain(
        toWallet.trim(),
        selectedAsset.tokenId
      );

      // B. Đồng bộ vào SQLite Backend
      const res = await fetch(`/api/assets/${selectedAsset.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toWallet: toWallet.trim(),
          txHash: receipt.txHash,
          blockNumber: receipt.blockNumber,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Lỗi đồng bộ chuyển nhượng vào CSDL");
      }

      setSuccessData({
        assetTitle: selectedAsset.title,
        tokenId: selectedAsset.tokenId,
        toWallet: toWallet.trim(),
        txHash: receipt.txHash,
        blockNumber: receipt.blockNumber,
      });
    } catch (err: any) {
      console.error("Lỗi chuyển nhượng:", err);
      setErrorMsg(err.reason || err.message || "Giao dịch MetaMask thất bại hoặc bị từ chối.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Send className="h-4 w-4 text-[#F6851B]" />
            <span>Chuyển Giao Quyền Tác Phẩm & NFT On-Chain</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Chuyển Nhượng Quyền Sở Hữu Tác Phẩm
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Chuyển nhượng Token NFT ERC-721 trực tiếp trên Blockchain EVM và lưu vết bất biến trong lịch sử nguồn gốc (Provenance).
          </p>
        </div>

        <Link
          href="/creator/my-assets"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-750 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white hover:border-orange-500 transition self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* SUCCESS SCREEN */}
      {successData ? (
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-slate-900/95 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white">Chuyển Nhượng On-Chain Thành Công!</h2>
            <p className="text-xs text-slate-300">
              Quyền sở hữu tác phẩm <strong className="text-white">&ldquo;{successData.assetTitle}&rdquo;</strong> (Token #{successData.tokenId}) đã được chuyển nhượng thành công trên Blockchain.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Ví chủ sở hữu mới:</span>
              <span className="font-mono text-orange-400 font-bold">{shortenAddress(successData.toWallet)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Khối giao dịch (Block):</span>
              <span className="text-white font-mono">#{successData.blockNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Transaction Hash:</span>
              <span className="font-mono text-emerald-400 font-bold">{shortenHash(successData.txHash)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/creator/my-assets"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] to-[#E2761B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:brightness-110"
            >
              <span>Về bảng điều khiển</span>
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                setToWallet("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-850 border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span>Chuyển nhượng tác phẩm khác</span>
            </button>
          </div>
        </div>
      ) : (
        /* TRANSFER FORM */
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* SENDER WALLET BADGE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Wallet className="h-4 w-4 text-[#F6851B]" />
              <span className="text-slate-300">
                Ví người gửi (Chủ sở hữu hiện tại):{" "}
                <strong className="font-mono text-white text-xs">{currentWallet || "Chưa kết nối MetaMask"}</strong>
              </span>
            </div>
            <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
              Hardhat 31337
            </span>
          </div>

          {/* CHOOSE ASSET */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-bold">1</span>
              <span>Chọn Tác Phẩm Cần Chuyển Nhượng</span>
            </div>

            {loading ? (
              <div className="h-20 rounded-2xl bg-slate-850 animate-pulse" />
            ) : assets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-300 bg-slate-950/70 rounded-2xl border border-slate-800">
                Bạn chưa có tác phẩm nào ở trạng thái <span className="text-emerald-400 font-bold">REGISTERED</span> trên Blockchain. Hãy mint NFT trước!
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedAsset?.id || ""}
                  onChange={(e) => {
                    const a = assets.find((item) => item.id === e.target.value);
                    setSelectedAsset(a || null);
                  }}
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      Token #{a.tokenId} — {a.title} ({a.category})
                    </option>
                  ))}
                </select>

                {selectedAsset && (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      <Image
                        src={selectedAsset.filePath}
                        alt={selectedAsset.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{selectedAsset.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Hash: {shortenHash(selectedAsset.fileHash)} • Token #{selectedAsset.tokenId}
                      </p>
                      <p className="text-[11px] text-orange-300 font-mono">
                        Chủ sở hữu hiện tại: {shortenAddress(selectedAsset.currentOwnerWallet)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RECIPIENT WALLET & WARNING */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-bold">2</span>
              <span>Địa Chỉ Ví Người Nhận Mới</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200">
                Địa chỉ ví Ethereum / EVM đích (*):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={toWallet}
                  onChange={(e) => setToWallet(e.target.value)}
                  placeholder="VD: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Collector test #3)"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Nhập địa chỉ ví Ethereum công khai gồm 42 ký tự (Bắt đầu bằng `0x`).
              </p>
            </div>

            {/* CAUTION WARNING */}
            <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/25 text-xs text-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">Lưu ý tính bất biến của Blockchain:</span>
                <p className="leading-relaxed text-[11px]">
                  Hành động chuyển nhượng là vĩnh viễn và không thể đảo ngược trên Smart Contract EVM. Người nhận mới sẽ trở thành chủ sở hữu độc quyền của NFT bản quyền này.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-xs text-rose-300 border border-rose-500/30">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={transferring || !selectedAsset || !toWallet.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] via-[#E2761B] to-[#CD6116] px-6 py-3 text-xs font-bold text-white shadow-xl shadow-orange-500/25 transition hover:brightness-110 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{transferring ? "Đang ký giao dịch trên MetaMask..." : "Xác Nhận Chuyển Nhượng"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function TransferPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Đang tải trang chuyển nhượng...</div>}>
      <TransferContent />
    </Suspense>
  );
}
