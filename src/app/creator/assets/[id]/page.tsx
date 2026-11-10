"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Copy,
  Check,
  ShieldAlert,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import ProvenanceTimeline from "@/components/ProvenanceTimeline";
import { shortenAddress, shortenHash } from "@/lib/crypto";

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params?.id as string;

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadAsset = useCallback(async () => {
    if (!assetId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/assets/${assetId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAsset(data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin tài sản:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-3">
        <div className="h-6 w-36 mx-auto bg-slate-800 animate-pulse rounded" />
        <div className="h-48 max-w-lg mx-auto bg-slate-900 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-3">
        <h2 className="type-h2">Không tìm thấy tài sản số này</h2>
        <Link
          href="/creator/my-assets"
          className="btn-secondary"
        >
          Quay lại Bảng điều khiển
        </Link>
      </div>
    );
  }

  const isRegistered = asset.status === "REGISTERED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* TOP NAV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <Link
          href="/creator/my-assets"
          className="btn-ghost self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Danh sách tác phẩm</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadAsset}
            disabled={isRefreshing}
            className="btn-secondary py-1.5 text-xs"
            title="Đồng bộ lại dữ liệu mới nhất từ hệ thống và Blockchain"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          {asset.certificate && (
            <a
              href={`/api/certificate/${asset.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary py-1.5 text-xs"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>{asset.status === "REVOKED" ? "E-Cert (Đã thu hồi)" : "Tải E-Certificate"}</span>
            </a>
          )}

          <Link
            href={`/verify?hash=${asset.fileHash}`}
            className="btn-secondary py-1.5 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#F6851B]" />
            <span>Đối soát on-chain</span>
          </Link>

          {isRegistered && (
            <Link
              href={`/creator/transfer?assetId=${asset.id}`}
              className="btn-primary py-1.5 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Chuyển nhượng NFT</span>
            </Link>
          )}
        </div>
      </div>

      {/* REVOKED ALERT BANNER */}
      {asset.status === "REVOKED" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3 text-xs">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="font-semibold text-rose-200">
              Chứng Nhận Đã Bị Thu Hồi On-Chain (Revoked)
            </h3>
            <p className="text-rose-300/90 leading-relaxed">
              Tác phẩm này đã bị Hội đồng Quản trị hủy bỏ hiệu lực bản quyền trên chuỗi khối. Mọi giao dịch chuyển nhượng tiếp theo đều bị đóng băng.
            </p>
            {asset.rejectionReason && (
              <p className="text-slate-300 pt-1">
                <span className="text-rose-400 font-medium">Lý do thu hồi: </span>
                {asset.rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* REJECTED ALERT BANNER */}
      {asset.status === "REJECTED" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="font-semibold text-rose-200">
              Hồ Sơ Bị Từ Chối Thẩm Định (Rejected)
            </h3>
            <p className="text-rose-300/90 leading-relaxed">
              Hồ sơ tác phẩm này đã bị Hội đồng Quản trị từ chối phê duyệt do không đạt tiêu chuẩn bản quyền.
            </p>
            {asset.rejectionReason && (
              <p className="text-slate-300 pt-1">
                <span className="text-rose-400 font-medium">Lý do từ chối: </span>
                {asset.rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ASSET SUMMARY CARD */}
      <div className="card-surface p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative h-56 md:h-full w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-850 group">
          <Image
            src={asset.filePath}
            alt={asset.title}
            fill
            className="object-cover"
            unoptimized
          />
          <a
            href={asset.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 rounded-md bg-black/80 hover:bg-black px-2 py-1 text-[11px] text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 border border-white/10"
            title="Mở xem ảnh gốc độ phân giải đầy đủ"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Ảnh gốc</span>
          </a>
        </div>

        <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="type-label rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                {asset.category}
              </span>
              {isRegistered && (
                <span className="type-label rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 border border-emerald-500/20">
                  Token #{asset.tokenId} On-Chain
                </span>
              )}
            </div>

            <h1 className="type-h2">{asset.title}</h1>
            <p className="type-body text-slate-400 leading-relaxed">{asset.description || "Chưa có mô tả chi tiết."}</p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="type-caption">Mã SHA-256:</span>
              <div className="flex items-center gap-1.5 type-code">
                <span>{shortenHash(asset.fileHash)}</span>
                <button
                  onClick={() => copyHash(asset.fileHash)}
                  className="hover:text-white transition-colors"
                  title="Sao chép"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="type-caption">Chủ sở hữu hiện tại:</span>
              <span className="type-code text-white">{shortenAddress(asset.currentOwnerWallet)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="type-caption">Tác giả gốc:</span>
              <span className="type-body text-slate-300">{asset.creator?.fullName || "Ẩn danh"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROVENANCE TIMELINE */}
      <div className="card-surface p-5 sm:p-6">
        <ProvenanceTimeline asset={asset} history={asset.history || []} />
      </div>
    </div>
  );
}
