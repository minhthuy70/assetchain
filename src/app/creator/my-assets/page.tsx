"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import {
  PlusCircle,
  FileCheck2,
  RefreshCw,
  Copy,
  Check,
  Send,
  Search,
  Wallet,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { shortenAddress, shortenHash } from "@/lib/crypto";
import { mintAssetOnChain, parseWeb3ErrorMessage } from "@/lib/onchain";

export default function MyAssetsDashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchMyAssets = useCallback(async (currentWallet?: string) => {
    if (!currentWallet) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      url.searchParams.set("wallet", currentWallet);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Đảm bảo client-side lọc đúng theo ví
        const myFiltered = data.data.filter(
          (a: any) => a.currentOwnerWallet?.toLowerCase() === currentWallet.toLowerCase()
        );
        setAssets(myFiltered);
      } else {
        setAssets([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tài sản:", err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt!");
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setWallet(accounts[0]);
        await fetchMyAssets(accounts[0]);
      } else {
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setWallet(addr);
        await fetchMyAssets(addr);
      }
    } catch (err) {
      console.error("Lỗi kết nối ví MetaMask:", err);
    } finally {
      setIsConnecting(false);
    }
  };

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
      setWallet("");
      setAssets([]);
      setLoading(false);
    }

    init();

    if (typeof window !== "undefined" && (window as any).ethereum?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          fetchMyAssets(accounts[0]);
        } else {
          setWallet("");
          setAssets([]);
          setLoading(false);
        }
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [fetchMyAssets]);

  const handleMintOnChain = async (asset: any) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Vui lòng mở tiện ích MetaMask!");
      return;
    }

    setMintingId(asset.id);
    setMintError(null);

    try {
      // 1. Gọi giao dịch mintAssetOnChain qua Ethers helper chuẩn
      const onchainResult = await mintAssetOnChain({
        title: asset.title,
        description: asset.description || "",
        filePath: asset.filePath,
        fileHash: asset.fileHash,
        walletAddress: wallet,
      });

      // 2. Đồng bộ kết quả mint vào SQLite Database
      const syncRes = await fetch(`/api/assets/${asset.id}/sync-onchain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: onchainResult.tokenId,
          txHash: onchainResult.txHash,
          blockNumber: onchainResult.blockNumber,
          ownerWallet: onchainResult.ownerAddress,
        }),
      });

      const syncData = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncData.error || "Lỗi đồng bộ dữ liệu sau khi mint");
      }

      await fetchMyAssets(wallet);
    } catch (err: any) {
      console.error("Lỗi mint on-chain:", err);
      setMintError(parseWeb3ErrorMessage(err));
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
  const revokedCount = assets.filter((a) => a.status === "REVOKED").length;

  const filteredAssets = assets.filter((a) => {
    if (activeTab === "REGISTERED" && a.status !== "REGISTERED") return false;
    if (activeTab === "PENDING_APPROVAL" && a.status !== "PENDING_APPROVAL") return false;
    if (activeTab === "APPROVED" && a.status !== "APPROVED") return false;
    if (activeTab === "REJECTED" && a.status !== "REJECTED") return false;
    if (activeTab === "REVOKED" && a.status !== "REVOKED") return false;

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
          <span className="type-label text-slate-500">
            Creator Dashboard
          </span>
          <h1 className="type-h1 mt-1">
            Bảng Điều Khiển Tác Phẩm Của Tôi
          </h1>
          <p className="type-subhead mt-0.5">
            Quản lý hồ sơ, thực hiện giao dịch đưa lên chuỗi khối và tải chứng nhận quyền sở hữu số.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wallet && (
            <button
              onClick={() => fetchMyAssets(wallet)}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          )}
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
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between type-body gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className={`h-2 w-2 rounded-full ${wallet ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span>Trạng thái ví:</span>
          {wallet ? (
            <span className="type-code text-white font-medium">{wallet}</span>
          ) : (
            <span className="type-code text-amber-400 font-medium">Chưa kết nối MetaMask</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {wallet ? (
            <span className="type-caption font-mono text-slate-400">Hardhat Local (31337)</span>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-1.5 rounded bg-[#F6851B] hover:bg-[#e2761b] px-3 py-1 text-xs font-medium text-white transition-colors"
            >
              {isConnecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wallet className="h-3.5 w-3.5" />
              )}
              <span>{isConnecting ? "Đang kết nối..." : "Kết nối ví MetaMask"}</span>
            </button>
          )}
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-surface p-3.5">
          <div className="type-caption">Tổng tác phẩm</div>
          <div className="text-lg font-semibold text-white font-mono mt-0.5">{totalCount}</div>
        </div>

        <div className="card-surface p-3.5 border-emerald-500/20">
          <div className="type-caption text-emerald-400">Đã lên Blockchain</div>
          <div className="text-lg font-semibold text-emerald-400 font-mono mt-0.5">{registeredCount}</div>
        </div>

        <div className="card-surface p-3.5 border-amber-500/20">
          <div className="type-caption text-amber-400">Chờ thẩm định</div>
          <div className="text-lg font-semibold text-amber-400 font-mono mt-0.5">{pendingCount}</div>
        </div>

        <div className="card-surface p-3.5 border-[#F6851B]/20">
          <div className="type-caption text-[#F6851B]">Sẵn sàng mint</div>
          <div className="text-lg font-semibold text-[#F6851B] font-mono mt-0.5">{approvedCount}</div>
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
            ...(revokedCount > 0 ? [{ id: "REVOKED", label: `Đã thu hồi (${revokedCount})` }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white font-medium border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-850 font-normal"
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
        <div className="rounded-lg bg-rose-500/10 p-2.5 type-body text-rose-300 border border-rose-500/20">
          <span>{mintError}</span>
        </div>
      )}

      {/* ASSET GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-60 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : !wallet ? (
        /* PROMPT TO CONNECT WALLET */
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-12 text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="type-h3 text-white">Vui lòng kết nối ví MetaMask để xem tài sản của bạn</h3>
            <p className="type-caption text-slate-400 mt-1 max-w-md mx-auto">
              Bảng điều khiển cá nhân chỉ hiển thị các tác phẩm thuộc quyền sở hữu của địa chỉ ví bạn đang sử dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary inline-flex items-center gap-1.5 mx-auto"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span>{isConnecting ? "Đang kết nối ví..." : "Kết nối ví MetaMask ngay"}</span>
          </button>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-2 bg-slate-900/30">
          <h3 className="type-h3 text-white">Chưa có tác phẩm nào phù hợp</h3>
          <p className="type-caption text-slate-400">
            {searchQuery ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Bạn chưa có tác phẩm nào trong danh mục này. Hãy bắt đầu đăng ký tác phẩm đầu tiên!"}
          </p>
          <div className="pt-2">
            <Link
              href="/creator/register"
              className="btn-primary"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Nộp tác phẩm</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isPending = asset.status === "PENDING_APPROVAL";
            const isApproved = asset.status === "APPROVED";
            const isRegistered = asset.status === "REGISTERED";
            const isRejected = asset.status === "REJECTED";
            const isRevoked = asset.status === "REVOKED";

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
                      <span className="rounded bg-black/70 px-2 py-0.5 type-caption font-medium text-slate-200 border border-white/10 backdrop-blur-sm">
                        {asset.category}
                      </span>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-4 space-y-2">
                    <h3 className="type-h3 line-clamp-1">{asset.title}</h3>

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
                      {isRevoked && (
                        <span className="inline-flex items-center rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
                          Đã thu hồi on-chain
                        </span>
                      )}
                    </div>

                    {/* HASH */}
                    <div className="flex items-center justify-between rounded-lg bg-slate-950 px-2.5 py-1.5 type-code border border-slate-800">
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
                      <p className="type-caption text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        {isRevoked ? "Lý do thu hồi: " : "Lý do từ chối: "}
                        {asset.rejectionReason}
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

                      <div className="flex items-center justify-between type-caption pt-0.5">
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
                    <p className="text-center type-caption text-slate-500 py-0.5">
                      Đang đợi hội đồng Admin thẩm định
                    </p>
                  )}

                  {isRejected && (
                    <Link
                      href="/creator/register"
                      className="block text-center type-caption font-medium text-rose-400 hover:underline py-0.5"
                    >
                      Nộp lại hồ sơ chỉnh sửa
                    </Link>
                  )}

                  {isRevoked && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {asset.certificate && (
                          <a
                            href={`/api/certificate/${asset.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary flex-1 py-1.5 text-[11px] text-rose-300 hover:text-rose-200"
                          >
                            <FileCheck2 className="h-3 w-3 text-rose-400" />
                            <span>Bản thu hồi (PDF)</span>
                          </a>
                        )}
                        <Link
                          href={`/verify?hash=${asset.fileHash}`}
                          className="btn-secondary flex-1 py-1.5 text-[11px]"
                        >
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                          <span>Đối soát vi phạm</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-center type-caption pt-0.5">
                        <Link
                          href={`/creator/assets/${asset.id}`}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Xem lịch sử nguồn gốc & quyết định →
                        </Link>
                      </div>
                    </div>
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