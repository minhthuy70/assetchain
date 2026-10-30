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
  Copy,
  Check,
  Send,
  History,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { hexToBytes32, shortenAddress, shortenHash } from "@/lib/crypto";
import contractInfo from "@/contracts/AssetRegistry.json";

export default function MyAssetsDashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Tab & Search state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      console.error("Lỗi lấy danh sách tài sản:", err);
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
        } catch (err) {
          console.error("Lỗi khởi tạo ví:", err);
        }
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

  // Thống kê nhanh
  const totalCount = assets.length;
  const registeredCount = assets.filter((a) => a.status === "REGISTERED").length;
  const pendingCount = assets.filter((a) => a.status === "PENDING_APPROVAL").length;
  const approvedCount = assets.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = assets.filter((a) => a.status === "REJECTED").length;

  // Lọc theo tab & từ khóa
  const filteredAssets = assets.filter((a) => {
    if (activeTab === "REGISTERED" && a.status !== "REGISTERED") return false;
    if (activeTab === "PENDING_APPROVAL" && a.status !== "PENDING_APPROVAL") return false;
    if (activeTab === "APPROVED" && a.status !== "APPROVED") return false;
    if (activeTab === "REJECTED" && a.status !== "REJECTED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchHash = a.fileHash?.toLowerCase().includes(q);
      if (!matchTitle && !matchHash) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <LayoutDashboard className="h-4 w-4" />
            <span>Không Gian Làm Việc Tác Giả (Creator Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Bảng Điều Khiển Quản Lý Quyền Tác Phẩm
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi tiến độ thẩm định, khắc dấu NFT ERC-721 on-chain và quản lý quyền sở hữu số.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMyAssets(wallet)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/creator/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng ký tác phẩm mới</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="text-xs text-slate-400 font-medium">Tổng tác phẩm</div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Đã Lên Blockchain
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{registeredCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Chờ Thẩm Định
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sẵn Sàng Mint NFT
          </div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">{approvedCount}</div>
        </div>
      </div>

      {/* FILTER & TABS SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: `Tất cả (${totalCount})` },
            { id: "REGISTERED", label: `On-Chain (${registeredCount})` },
            { id: "APPROVED", label: `Sẵn sàng mint (${approvedCount})` },
            { id: "PENDING_APPROVAL", label: `Chờ duyệt (${pendingCount})` },
            { id: "REJECTED", label: `Bị từ chối (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc hash..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* MINT ERROR TOAST */}
      {mintError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-xs text-rose-300 border border-rose-500/30">
          <span>{mintError}</span>
        </div>
      )}

      {/* ASSET GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-3xl border border-slate-800 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Chưa có tác phẩm nào phù hợp</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Bắt đầu đăng ký tác phẩm đầu tiên của bạn!"}
            </p>
          </div>
          <Link
            href="/creator/register"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nộp tác phẩm ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const isPending = asset.status === "PENDING_APPROVAL";
            const isApproved = asset.status === "APPROVED";
            const isRegistered = asset.status === "REGISTERED";
            const isRejected = asset.status === "REJECTED";

            return (
              <div
                key={asset.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl"
              >
                <div>
                  {/* IMAGE PREVIEW */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <Image
                      src={asset.filePath}
                      alt={asset.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md border border-slate-700/80">
                        {asset.category}
                      </span>
                    </div>
                  </div>

                  {/* BODY INFO */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{asset.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
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
                      <span>{shortenHash(asset.fileHash)}</span>
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
                <div className="border-t border-slate-800/80 p-4 bg-slate-950/40 space-y-2">
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
                    <div className="space-y-2">
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
                          href={`/creator/transfer?assetId=${asset.id}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/25 transition"
                          title="Chuyển nhượng quyền sở hữu"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Chuyển nhượng</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <Link
                          href={`/creator/assets/${asset.id}`}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>Xem Lịch Sử Nguồn Gốc</span>
                        </Link>
                        <Link
                          href={`/verify?hash=${asset.fileHash}`}
                          className="text-slate-500 hover:text-white transition"
                        >
                          Tra cứu on-chain
                        </Link>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <p className="text-center text-[11px] text-slate-500 italic py-1">
                      Đang đợi hội đồng Admin xét duyệt hồ sơ
                    </p>
                  )}

                  {isRejected && (
                    <Link
                      href="/creator/register"
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
