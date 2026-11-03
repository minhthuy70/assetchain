"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  XCircle,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Send,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { hexToBytes32 } from "@/lib/crypto";
import contractInfo from "@/contracts/AssetRegistry.json";

export default function MyAssetsDashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchMyAssets = useCallback(async (currentWallet?: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      if (currentWallet) url.searchParams.set("wallet", currentWallet);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const acc = accounts[0].address;
            setWallet(acc);
            fetchMyAssets(acc);
            return;
          }
        } catch {}
      }
      fetchMyAssets();
    }
    init();
  }, [fetchMyAssets]);

  const handleMintOnChain = async (asset: any) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Vui lòng mở tiện ích MetaMask!");
      return;
    }

    setMintingId(asset.id);
    setMintError(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      if (!contractInfo || !contractInfo.address) {
        throw new Error("Chưa tìm thấy Smart Contract address. Vui lòng deploy contract!");
      }

      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
      const bytes32Hash = hexToBytes32(asset.fileHash);

      const metadataUri = JSON.stringify({
        title: asset.title,
        description: asset.description,
        image: asset.filePath,
        fileHash: asset.fileHash,
      });

      // 1. Gọi giao dịch registerAsset trên Smart Contract
      const tx = await contract.registerAsset(userAddress, metadataUri, bytes32Hash);
      const receipt = await tx.wait();

      // 2. Tìm Token ID từ event
      let tokenId = 1;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === "AssetRegistered") {
            tokenId = Number(parsed.args.tokenId);
            break;
          }
        } catch {}
      }

      // 3. Đồng bộ lại vào SQLite Database
      const syncRes = await fetch(`/api/assets/${asset.id}/sync-onchain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          ownerWallet: userAddress,
        }),
      });

      const syncData = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncData.error || "Lỗi đồng bộ dữ liệu sau khi mint");
      }

      // 4. Tải lại danh sách
      await fetchMyAssets(wallet);
    } catch (err: any) {
      console.error("Lỗi mint on-chain:", err);
      setMintError(err.reason || err.message || "Giao dịch MetaMask thất bại");
    } finally {
      setMintingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <LayoutDashboard className="h-4 w-4" />
            <span>Không Gian Làm Việc Tác Giả</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Bộ Sưu Tập Tác Phẩm Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi trạng thái xét duyệt của hội đồng quản trị, kích hoạt mint NFT on-chain và tải E-Certificate.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => fetchMyAssets(wallet)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>

          <Link
            href="/creator"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nộp tác phẩm mới</span>
          </Link>
        </div>
      </div>

      {mintError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{mintError}</span>
        </div>
      )}

      {/* ASSET CARDS GRID */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
          <p className="text-sm">Đang tải danh sách tác phẩm của bạn...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-16 text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">Chưa có tác phẩm nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bạn chưa nộp tác phẩm nào. Hãy bấm nút dưới đây để nộp và băm mã SHA-256 ngay bây giờ!
          </p>
          <Link
            href="/creator"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng ký tác phẩm đầu tiên</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const isImage = asset.mimeType?.startsWith("image/");
            const isApproved = asset.status === "APPROVED";
            const isRegistered = asset.status === "REGISTERED";
            const isPending = asset.status === "PENDING_APPROVAL";
            const isRejected = asset.status === "REJECTED";

            return (
              <div
                key={asset.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* IMAGE PREVIEW */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <Image
                        src={asset.filePath}
                        alt={asset.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-slate-600" />
                    )}
                    <span className="absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-md bg-slate-900/80 text-slate-300 border border-slate-700">
                      {asset.category}
                    </span>
                  </div>

                  {/* BODY INFO */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition">
                      {asset.title}
                    </h3>

                    {/* STATUS BADGE */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/30">
                          <Clock className="h-3 w-3" /> Chờ Admin duyệt
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 ring-1 ring-inset ring-blue-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Đã duyệt • Sẵn sàng mint
                        </span>
                      )}
                      {isRegistered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                          <Sparkles className="h-3 w-3" /> Token #{asset.tokenId} On-Chain
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 ring-1 ring-inset ring-rose-500/30">
                          <XCircle className="h-3 w-3" /> Bị từ chối
                        </span>
                      )}
                    </div>

                    {/* HASH SNIPPET */}
                    <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2 text-[11px] font-mono text-slate-400 border border-slate-800">
                      <span>{asset.fileHash.slice(0, 10)}...{asset.fileHash.slice(-8)}</span>
                      <button
                        onClick={() => copyToClipboard(asset.fileHash)}
                        className="text-slate-500 hover:text-white"
                        title="Sao chép SHA-256"
                      >
                        {copiedHash === asset.fileHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>

                    {asset.rejectionReason && (
                      <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        Lý do từ chối: {asset.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="border-t border-slate-800/80 p-4 bg-slate-950/40">
                  {isApproved && (
                    <button
                      onClick={() => handleMintOnChain(asset)}
                      disabled={mintingId === asset.id}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{mintingId === asset.id ? "Đang ký MetaMask..." : "Đưa Lên Blockchain (Mint NFT)"}</span>
                    </button>
                  )}

                  {isRegistered && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/certificate/${asset.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        <span>Chứng nhận PDF</span>
                      </a>

                      <Link
                        href={`/verify?hash=${asset.fileHash}`}
                        className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="Kiểm định lại"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  {isPending && (
                    <p className="text-center text-[11px] text-slate-500 italic py-1">
                      Đang đợi hội đồng Admin xét duyệt hồ sơ
                    </p>
                  )}

                  {isRejected && (
                    <Link
                      href="/creator"
                      className="block text-center text-xs font-semibold text-rose-400 hover:underline py-1"
                    >
                      Nộp lại hồ sơ chỉnh sửa
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

