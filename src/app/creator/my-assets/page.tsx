"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import {
  LayoutDashboard,
  PlusCircle,
  FileCheck2,
  RefreshCw,
  Copy,
  Check,
  Send,
  History,
  Search,
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

      const tx = await contract.registerAsset(userAddress, metadataUri, bytes32Hash);
      const receipt = await tx.wait();

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

  const totalCount = assets.length;
  const registeredCount = assets.filter((a) => a.status === "REGISTERED").length;
  const pendingCount = assets.filter((a) => a.status === "PENDING_APPROVAL").length;
  const approvedCount = assets.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = assets.filter((a) => a.status === "REJECTED").length;

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Creator Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Bảng Điều Khiển Tác Phẩm Của Tôi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý hồ sơ, thực hiện giao dịch đưa lên chuỗi khối và tải chứng nhận quyền sở hữu số.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchMyAssets(wallet)}
            className="btn-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Làm mới</span>
          </button>
          <Link
            href="/creator/register"
            className="btn-primary"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Đăng ký mới</span>
          </Link>
        </div>
      </div>

      {/* WALLET STRIP */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Ví đang hoạt động:</span>
          <span className="font-mono text-white font-medium">{wallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Hardhat Local (31337)</span>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-surface p-3.5">
          <div className="text-[11px] font-medium text-slate-400">Tổng tác phẩm</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{totalCount}</div>
        </div>

        <div className="card-surface p-3.5 border-emerald-500/20">
          <div className="text-[11px] font-medium text-emerald-400">Đã lên Blockchain</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{registeredCount}</div>
        </div>

        <div className="card-surface p-3.5 border-amber-500/20">
          <div className="text-[11px] font-medium text-amber-400">Chờ thẩm định</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{pendingCount}</div>
        </div>

        <div className="card-surface p-3.5 border-[#F6851B]/20">
          <div className="text-[11px] font-medium text-[#F6851B]">Sẵn sàng mint</div>
          <div className="text-xl font-bold text-[#F6851B] font-mono mt-0.5">{approvedCount}</div>
        </div>
      </div>

      {/* FILTER & TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
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
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc hash..."
            className="input-base pl-8"
          />
        </div>
      </div>

      {/* MINT ERROR BANNER */}
      {mintError && (
        <div className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20">
          <span>{mintError}</span>
        </div>
      )}

      {/* ASSET GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3 bg-slate-900/30">
          <LayoutDashboard className="h-8 w-8 mx-auto text-slate-600" />
          <div>
            <h3 className="text-xs font-semibold text-white">Chưa có tác phẩm nào phù hợp</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {searchQuery ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Bắt đầu đăng ký tác phẩm đầu tiên của bạn!"}
            </p>
          </div>
          <Link
            href="/creator/register"
            className="btn-primary"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Nộp tác phẩm</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isPending = asset.status === "PENDING_APPROVAL";
            const isApproved = asset.status === "APPROVED";
            const isRegistered = asset.status === "REGISTERED";
            const isRejected = asset.status === "REJECTED";

            return (
              <div
                key={asset.id}
                className="card-surface overflow-hidden flex flex-col justify-between hover:border-slate-750 transition-colors"
              >
                <div>
                  {/* PREVIEW */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <Image
                      src={asset.filePath}
                      alt={asset.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2">
                      <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-slate-200 border border-white/10 backdrop-blur-sm">
                        {asset.category}
                      </span>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{asset.title}</h3>
                    </div>

                    <div>
                      {isPending && (
                        <span className="inline-flex items-center rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                          Chờ Admin duyệt
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center rounded bg-[#F6851B]/10 px-2 py-0.5 text-[11px] font-medium text-[#F6851B] border border-[#F6851B]/20">
                          Đã duyệt • Sẵn sàng mint
                        </span>
                      )}
                      {isRegistered && (
                        <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                          Token #{asset.tokenId} On-Chain
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
                          Bị từ chối
                        </span>
                      )}
                    </div>

                    {/* HASH */}
                    <div className="flex items-center justify-between rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-mono text-slate-400 border border-slate-800">
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
                      <p className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        Lý do từ chối: {asset.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="border-t border-slate-800 p-3 bg-slate-950/40 space-y-2">
                  {isApproved && (
                    <button
                      onClick={() => handleMintOnChain(asset)}
                      disabled={mintingId === asset.id}
                      className="btn-primary w-full py-2"
                    >
                      <span>{mintingId === asset.id ? "Đang ký MetaMask..." : "Đưa Lên Blockchain (Mint NFT)"}</span>
                    </button>
                  )}

                  {isRegistered && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/certificate/${asset.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary flex-1 py-1.5 text-[11px]"
                        >
                          <FileCheck2 className="h-3 w-3" />
                          <span>E-Cert PDF</span>
                        </a>

                        <Link
                          href={`/creator/transfer?assetId=${asset.id}`}
                          className="btn-secondary flex-1 py-1.5 text-[11px]"
                          title="Chuyển nhượng quyền sở hữu"
                        >
                          <Send className="h-3 w-3" />
                          <span>Chuyển nhượng</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <Link
                          href={`/creator/assets/${asset.id}`}
                          className="hover:text-slate-200 transition-colors"
                        >
                          Lịch sử nguồn gốc →
                        </Link>
                        <Link
                          href={`/verify?hash=${asset.fileHash}`}
                          className="hover:text-slate-200 transition-colors"
                        >
                          Tra cứu on-chain
                        </Link>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <p className="text-center text-[11px] text-slate-500 py-0.5">
                      Đang đợi hội đồng Admin thẩm định
                    </p>
                  )}

                  {isRejected && (
                    <Link
                      href="/creator/register"
                      className="block text-center text-xs text-rose-400 hover:underline py-0.5"
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
