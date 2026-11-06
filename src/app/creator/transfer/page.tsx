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
  Wallet,
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

      const receipt = await transferAssetOnChain(
        toWallet.trim(),
        selectedAsset.tokenId
      );

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quyền Sở Hữu On-Chain
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Chuyển Nhượng Quyền Sở Hữu Tác Phẩm
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chuyển giao NFT ERC-721 trực tiếp trên EVM và cập nhật chuỗi sở hữu (Provenance).
          </p>
        </div>

        <Link
          href="/creator/my-assets"
          className="btn-secondary self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Danh sách</span>
        </Link>
      </div>

      {/* SUCCESS SCREEN */}
      {successData ? (
        <div className="card-surface p-8 text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Chuyển Nhượng On-Chain Thành Công</h2>
            <p className="text-xs text-slate-400">
              Quyền sở hữu tác phẩm &ldquo;{successData.assetTitle}&rdquo; (Token #{successData.tokenId}) đã được bàn giao thành công.
            </p>
          </div>

          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-left max-w-md mx-auto space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Chủ sở hữu mới:</span>
              <span className="font-mono text-slate-200">{shortenAddress(successData.toWallet)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Khối Block:</span>
              <span className="font-mono text-slate-300">#{successData.blockNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Transaction Hash:</span>
              <span className="font-mono text-slate-300">{shortenHash(successData.txHash)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <Link
              href="/creator/my-assets"
              className="btn-primary"
            >
              <span>Về bảng điều khiển</span>
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                setToWallet("");
              }}
              className="btn-secondary"
            >
              <span>Chuyển nhượng thêm</span>
            </button>
          </div>
        </div>
      ) : (
        /* TRANSFER FORM */
        <form onSubmit={handleTransfer} className="space-y-5">
          {/* SENDER WALLET */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              <span>Ví người gửi:</span>
              <span className="font-mono text-white font-medium">{currentWallet || "Chưa kết nối MetaMask"}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Hardhat 31337</span>
          </div>

          {/* CHOOSE ASSET */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">1</span>
              <span>Chọn tác phẩm cần chuyển nhượng</span>
            </div>

            {loading ? (
              <div className="h-12 rounded-lg bg-slate-950 animate-pulse" />
            ) : assets.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950 rounded-lg border border-slate-800">
                Chưa có tác phẩm nào đạt trạng thái REGISTERED trên Blockchain.
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedAsset?.id || ""}
                  onChange={(e) => {
                    const a = assets.find((item) => item.id === e.target.value);
                    setSelectedAsset(a || null);
                  }}
                  className="input-base cursor-pointer font-medium"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      Token #{a.tokenId} — {a.title} ({a.category})
                    </option>
                  ))}
                </select>

                {selectedAsset && (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-900 border border-slate-850 shrink-0">
                      <Image
                        src={selectedAsset.filePath}
                        alt={selectedAsset.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0 text-xs">
                      <h4 className="font-semibold text-white truncate">{selectedAsset.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Hash: {shortenHash(selectedAsset.fileHash)} • Token #{selectedAsset.tokenId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RECIPIENT WALLET */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">2</span>
              <span>Địa chỉ ví người nhận mới</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">
                Địa chỉ ví Ethereum / EVM đích (*):
              </label>
              <input
                type="text"
                required
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
                placeholder="0x..."
                className="input-base font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Địa chỉ ví công khai gồm 42 ký tự (Bắt đầu bằng `0x`).
              </p>
            </div>

            {/* CAUTION WARNING */}
            <div className="rounded-lg bg-amber-500/5 p-3 border border-amber-500/20 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-amber-300 font-semibold">Tính bất biến: </span>
                Giao dịch chuyển nhượng trên Smart Contract là vĩnh viễn và không thể hoàn tác.
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20">
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={transferring || !selectedAsset || !toWallet.trim()}
                className="btn-primary"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{transferring ? "Đang ký giao dịch MetaMask..." : "Xác Nhận Chuyển Nhượng"}</span>
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Đang tải trang chuyển nhượng...</div>}>
      <TransferContent />
    </Suspense>
  );
}
