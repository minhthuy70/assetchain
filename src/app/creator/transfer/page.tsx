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
        console.error(err);
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
      setErrorMsg("Vui lòng chọn tài sản cần chuyển nhượng!");
      return;
    }

    if (!selectedAsset.tokenId) {
      setErrorMsg("Tài sản này chưa được mint on-chain nên không thể chuyển nhượng!");
      return;
    }

    const cleanToWallet = toWallet.trim();

    // Kiểm tra tính hợp lệ của địa chỉ ví
    if (!ethers.isAddress(cleanToWallet)) {
      setErrorMsg("Địa chỉ ví người nhận không hợp lệ (sai định dạng Ethereum 0x...)!");
      return;
    }

    if (cleanToWallet.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      setErrorMsg("Không thể chuyển nhượng tới địa chỉ rác 0x000...!");
      return;
    }

    if (
      currentWallet &&
      cleanToWallet.toLowerCase() === currentWallet.toLowerCase()
    ) {
      setErrorMsg("Bạn đang nhập chính địa chỉ ví hiện tại của mình!");
      return;
    }

    const confirmTransfer = window.confirm(
      `CẢNH BÁO: Bạn sắp chuyển vĩnh viễn Token #${selectedAsset.tokenId} ("${selectedAsset.title}") sang ví ${cleanToWallet}.\n\nHành động này trên Blockchain KHÔNG THỂ đảo ngược. Bạn có chắc chắn muốn tiếp tục?`
    );

    if (!confirmTransfer) return;

    setTransferring(true);

    try {
      // 1. Thực hiện gọi hợp đồng thông minh qua MetaMask
      const { txHash, blockNumber } = await transferAssetOnChain(
        cleanToWallet,
        selectedAsset.tokenId
      );

      // 2. Đồng bộ hóa sự kiện vào cơ sở dữ liệu SQLite
      const syncRes = await fetch(`/api/assets/${selectedAsset.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toWallet: cleanToWallet,
          txHash,
          blockNumber,
        }),
      });

      const syncData = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncData.error || "Lỗi đồng bộ chuyển nhượng vào hệ thống!");
      }

      setSuccessData({
        assetTitle: selectedAsset.title,
        tokenId: selectedAsset.tokenId,
        toWallet: cleanToWallet,
        txHash,
        blockNumber,
      });
    } catch (err: any) {
      console.error("Lỗi chuyển nhượng:", err);
      setErrorMsg(err.reason || err.message || "Giao dịch MetaMask thất bại!");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/creator/my-assets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Chuyển Nhượng Quyền Sở Hữu (NFT Transfer)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chuyển giao quyền sở hữu NFT ERC-721 sang địa chỉ ví người thụ hưởng mới trên Blockchain.
          </p>
        </div>
      </div>

      {successData ? (
        /* SUCCESS NOTIFICATION */
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-emerald-950/20 p-8 backdrop-blur-xl shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Chuyển Quyền Thành Công!</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Tác phẩm <span className="font-semibold text-white">&ldquo;{successData.assetTitle}&rdquo;</span> (Token #{successData.tokenId}) đã được chuyển giao thành công trên mạng EVM.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-4 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Chủ sở hữu mới:</span>
              <span className="text-emerald-400 font-bold">{shortenAddress(successData.toWallet)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Mã giao dịch:</span>
              <span className="text-slate-200">{shortenHash(successData.txHash)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Khối Block:</span>
              <span className="text-slate-200">#{successData.blockNumber}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/creator/my-assets"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              <span>Về Bảng Điều Khiển</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* ASSET SELECTOR */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">1</span>
              <span>Chọn Tác Phẩm Cần Chuyển Nhượng</span>
            </div>

            {loading ? (
              <div className="h-20 rounded-2xl bg-slate-800/40 animate-pulse" />
            ) : assets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                Bạn chưa có tác phẩm nào ở trạng thái <span className="text-emerald-400 font-semibold">REGISTERED</span> trên Blockchain. Hãy mint NFT trước!
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedAsset?.id || ""}
                  onChange={(e) => {
                    const a = assets.find((item) => item.id === e.target.value);
                    setSelectedAsset(a || null);
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
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
                      <p className="text-[11px] text-slate-500 font-mono">
                        Chủ sở hữu hiện tại: {shortenAddress(selectedAsset.currentOwnerWallet)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RECIPIENT WALLET & WARNING */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">2</span>
              <span>Địa Chỉ Ví Người Nhận Mới</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Địa chỉ ví Ethereum / EVM đích (*):
              </label>
              <div className="relative">
                <Wallet className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={toWallet}
                  onChange={(e) => setToWallet(e.target.value)}
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* BLOCKCHAIN IMMUTABILITY WARNING */}
            <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/25 text-amber-300 text-xs">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Lưu ý bảo mật quan trọng:</span>
                <p className="text-slate-400 leading-relaxed">
                  Giao dịch chuyển nhượng NFT sẽ thay đổi hàm <code className="text-amber-400">ownerOf(tokenId)</code> vĩnh viễn trên Smart Contract. Hãy kiểm tra chính xác địa chỉ ví đích trước khi ký xác nhận trên MetaMask!
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
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
