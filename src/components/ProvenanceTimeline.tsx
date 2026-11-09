"use client";

import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Send,
  ArrowRight,
  ShieldAlert,
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
    rejectionReason?: string | null;
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
  const isRegistered = asset.status === "REGISTERED" || asset.status === "REVOKED";
  const isApproved = asset.status === "APPROVED" || isRegistered;
  const isRejected = asset.status === "REJECTED";
  const isRevoked = asset.status === "REVOKED" || history.some((h) => h.eventType === "REVOKE");

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const revokeHistoryRecord = history.find((h) => h.eventType === "REVOKE");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="type-label text-white">
          Lịch Sử Nguồn Gốc & Chuỗi Sở Hữu (Provenance)
        </span>
        <span className="type-code text-slate-500">
          EVM Ledger
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
        {/* NODE 1: KHỞI TẠO HỒ SƠ */}
        <div className="relative">
          <div className="absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            <Sparkles className="h-2.5 w-2.5" />
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="type-body font-medium text-white">Khởi tạo & Băm Client-side SHA-256</span>
              <span className="type-caption font-mono">{formatDate(asset.createdAt)}</span>
            </div>
            <p className="type-body text-slate-400">
              Tác giả <strong className="text-slate-200 font-medium">{asset.creator?.fullName || "Tác giả"}</strong> ({shortenAddress(asset.creator?.walletAddress || asset.currentOwnerWallet)}) đã băm SHA-256 trong trình duyệt và nộp hồ sơ.
            </p>
            <div className="rounded bg-slate-900 p-2 type-code text-slate-300 break-all border border-slate-850">
              Mã băm: {asset.fileHash}
            </div>
          </div>
        </div>

        {/* NODE 2: PHÊ DUYỆT THẨM ĐỊNH */}
        <div className="relative">
          <div className={`absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border ${
            isApproved
              ? "border-emerald-500 text-emerald-400"
              : isRejected
              ? "border-rose-500 text-rose-400"
              : "border-slate-800 text-slate-600"
          }`}>
            {isRejected ? <ShieldAlert className="h-2.5 w-2.5" /> : <ShieldCheck className="h-2.5 w-2.5" />}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="type-body font-medium text-white">Thẩm Định & Cấp Phép Bản Quyền</span>
              {isApproved ? (
                <span className="type-label rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20">
                  APPROVED
                </span>
              ) : isRejected ? (
                <span className="type-label rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-400 border border-rose-500/20">
                  REJECTED
                </span>
              ) : (
                <span className="type-label rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-400 border border-amber-500/20">
                  PENDING
                </span>
              )}
            </div>
            <p className="type-body text-slate-400">
              {isApproved
                ? "Hội đồng Quản trị AssetChain đã đối chiếu tính nguyên bản và cấp phép phát hành chứng nhận."
                : isRejected
                ? "Hồ sơ đã bị Hội đồng Quản trị từ chối phê duyệt do không đạt tiêu chuẩn bản quyền."
                : "Hồ sơ đang trong hàng đợi thẩm định của Hội đồng Quản trị."}
            </p>
            {isRejected && asset.rejectionReason && (
              <div className="rounded bg-rose-500/10 p-2 text-rose-300 border border-rose-500/20 type-caption mt-1">
                <span className="font-semibold text-rose-400">Lý do từ chối: </span>
                {asset.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* NODE 3: MINT ON-CHAIN */}
        {isRegistered && (
          <div className="relative">
            <div className="absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-[#F6851B] text-[#F6851B]">
              <CheckCircle2 className="h-2.5 w-2.5" />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="type-body font-medium text-white">Khắc Dấu On-Chain (Mint NFT ERC-721)</span>
                <span className="type-caption font-mono">{formatDate(asset.registeredAt || asset.createdAt)}</span>
              </div>
              <p className="type-body text-slate-400">
                Khắc dấu quyền sở hữu vĩnh viễn trên Smart Contract với định danh <strong className="text-white font-medium">Token #{asset.tokenId}</strong>.
              </p>

              {history.length > 0 && history[0].txHash && (
                <div className="rounded bg-slate-900 p-2 type-code text-slate-400 border border-slate-850 space-y-1">
                  <div className="flex justify-between">
                    <span className="type-caption">Block:</span>
                    <span className="text-slate-200">#{history[0].blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="type-caption">TxHash:</span>
                    <span className="text-slate-300">{shortenHash(history[0].txHash)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NODE 4+: TRANSFERS */}
        {history
          .filter((h) => h.eventType === "TRANSFER")
          .map((transfer, idx) => (
            <div key={transfer.id || idx} className="relative">
              <div className="absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                <Send className="h-2.5 w-2.5" />
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="type-body font-medium text-white">Chuyển Nhượng Quyền Sở Hữu #{idx + 1}</span>
                  <span className="type-caption font-mono">{formatDate(transfer.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 type-code py-0.5">
                  <span className="text-slate-400">{shortenAddress(transfer.fromWallet)}</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                  <span className="text-emerald-400 font-medium">{shortenAddress(transfer.toWallet)}</span>
                </div>

                <div className="rounded bg-slate-900 p-2 type-code text-slate-400 border border-slate-850 space-y-1">
                  <div className="flex justify-between">
                    <span className="type-caption">Block:</span>
                    <span className="text-slate-200">#{transfer.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="type-caption">TxHash:</span>
                    <span className="text-slate-300">{shortenHash(transfer.txHash)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* NODE 5: THU HỒI TÁC PHẨM ON-CHAIN (NẾU CÓ - Day 11 Plan) */}
        {isRevoked && (
          <div className="relative">
            <div className="absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-rose-500 text-rose-400">
              <ShieldAlert className="h-2.5 w-2.5" />
            </div>

            <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="type-body font-medium text-rose-300">Thu Hồi Chứng Nhận & Đóng Băng Quyền Sở Hữu</span>
                <span className="type-label rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-400 border border-rose-500/30">
                  REVOKED
                </span>
              </div>
              <p className="type-body text-slate-400">
                {revokeHistoryRecord
                  ? `Cơ quan Quản trị (${shortenAddress(revokeHistoryRecord.fromWallet)}) đã phát lệnh thu hồi on-chain.`
                  : "Tác phẩm này đã bị Hội đồng Quản trị thu hồi do phát hiện tranh chấp hoặc vi phạm bản quyền."}
              </p>
              {asset.rejectionReason && (
                <div className="rounded bg-slate-900 p-2 text-rose-300 border border-rose-500/20">
                  <span className="font-semibold text-rose-400">Lý do thu hồi: </span>
                  {asset.rejectionReason}
                </div>
              )}
              {revokeHistoryRecord?.txHash && (
                <div className="rounded bg-slate-900 p-2 type-code text-slate-400 border border-slate-850 space-y-1">
                  <div className="flex justify-between">
                    <span className="type-caption">Block:</span>
                    <span className="text-slate-200">#{revokeHistoryRecord.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="type-caption">TxHash:</span>
                    <span className="text-rose-400">{shortenHash(revokeHistoryRecord.txHash)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
