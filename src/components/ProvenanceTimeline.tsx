"use client";

import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Send,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import { shortenAddress, shortenHash } from "@/lib/crypto";

export interface OwnershipHistoryRecord {
  id: string;
  tokenId: number;
  fromWallet: string;
  toWallet: string;
  txHash: string;
  blockNumber: number;
  eventType: string; // "MINT" | "TRANSFER" | "REVOKE"
  createdAt: string | Date;
}

interface ProvenanceTimelineProps {
  asset: {
    id: string;
    tokenId?: number | null;
    title: string;
    fileHash: string;
    status: string;
    createdAt: string | Date;
    registeredAt?: string | Date | null;
    currentOwnerWallet: string;
    creator?: {
      fullName: string;
      walletAddress?: string | null;
    } | null;
  };
  history?: OwnershipHistoryRecord[];
}

export default function ProvenanceTimeline({
  asset,
  history = [],
}: ProvenanceTimelineProps) {
  const isRegistered = asset.status === "REGISTERED";
  const isApproved = asset.status === "APPROVED" || isRegistered;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Layers className="h-4 w-4" />
          <span>Dòng Thời Gian Nguồn Gốc & Chuỗi Sở Hữu (Provenance)</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Immutable EVM Ledger
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-purple-500 before:to-slate-700">
        {/* NODE 1: KHỞI TẠO HỒ SƠ & BĂM CLIENT-SIDE */}
        <div className="relative group">
          <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 ring-2 ring-orange-500 text-orange-400 shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                Khởi tạo & Băm Client-side SHA-256
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDate(asset.createdAt)}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Tác giả <span className="font-semibold text-slate-200">{asset.creator?.fullName || "Tác giả"}</span> ({shortenAddress(asset.creator?.walletAddress || asset.currentOwnerWallet)}) đã hoàn tất băm nhị phân SHA-256 ngay trên trình duyệt và nộp hồ sơ.
            </p>

            <div className="rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-emerald-400 border border-slate-800 break-all">
              Mã băm: {asset.fileHash}
            </div>
          </div>
        </div>

        {/* NODE 2: PHÊ DUYỆT THẨM ĐỊNH TỪ ADMIN */}
        <div className="relative group">
          <div className={`absolute -left-[31px] sm:-left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 ring-2 ${
            isApproved ? "ring-purple-400 text-purple-400" : "ring-slate-700 text-slate-600"
          } shadow-md`}>
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>

          <div className={`rounded-2xl border p-4 backdrop-blur-md space-y-2 ${
            isApproved
              ? "border-purple-500/30 bg-purple-950/20"
              : "border-slate-800 bg-slate-900/30 opacity-60"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                Thẩm Định & Cấp Phép Bản Quyền
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-purple-500/30">
                  <CheckCircle2 className="h-2.5 w-2.5" /> APPROVED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {isApproved
                ? "Ban Quản trị AssetChain đã kiểm duyệt đối chiếu tính nguyên bản và cấp phép đưa tài sản lên chuỗi khối."
                : "Hồ sơ đang nằm trong hàng đợi chờ thẩm định của Ban Quản trị."}
            </p>
          </div>
        </div>

        {/* NODE 3: MINT ON-CHAIN */}
        {isRegistered && (
          <div className="relative group">
            <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 ring-2 ring-orange-500 text-orange-400 shadow-md">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-4 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  Đưa Lên Blockchain (Mint NFT ERC-721)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDate(asset.registeredAt || asset.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Khắc dấu quyền sở hữu vĩnh viễn trên sổ cái EVM với định danh <span className="font-bold text-white">Token #{asset.tokenId}</span>.
              </p>

              {history.length > 0 && history[0].txHash && (
                <div className="rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khối Block:</span>
                    <span>#{history[0].blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction:</span>
                    <span className="text-orange-400">{shortenHash(history[0].txHash)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NODE 4+: TRANSFERS (NẾU CÓ) */}
        {history
          .filter((h) => h.eventType === "TRANSFER")
          .map((transfer, idx) => (
            <div key={transfer.id || idx} className="relative group">
              <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 ring-2 ring-orange-400 text-orange-400 shadow-md">
                <Send className="h-3.5 w-3.5" />
              </div>

              <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-4 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Chuyển Nhượng Quyền Sở Hữu #{idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(transfer.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 py-1">
                  <span className="text-slate-400">{shortenAddress(transfer.fromWallet)}</span>
                  <ArrowRight className="h-3 w-3 text-orange-400" />
                  <span className="font-bold text-emerald-400">{shortenAddress(transfer.toWallet)}</span>
                </div>

                <div className="rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-slate-400 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Block:</span>
                    <span className="text-white">#{transfer.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TxHash:</span>
                    <span className="text-orange-400">{shortenHash(transfer.txHash)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
