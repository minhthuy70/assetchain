"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Copy,
  Check,
} from "lucide-react";
import ProvenanceTimeline from "@/components/ProvenanceTimeline";
import { shortenAddress, shortenHash } from "@/lib/crypto";

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params?.id as string;

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadAsset() {
      if (!assetId) return;
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
      }
    }
    loadAsset();
  }, [assetId]);

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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/creator/my-assets"
          className="btn-ghost"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Danh sách tác phẩm</span>
        </Link>

        {isRegistered && (
          <Link
            href={`/creator/transfer?assetId=${asset.id}`}
            className="btn-primary"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Chuyển nhượng NFT</span>
          </Link>
        )}
      </div>

      {/* ASSET SUMMARY CARD */}
      <div className="card-surface p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative h-56 md:h-full w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-850">
          <Image
            src={asset.filePath}
            alt={asset.title}
            fill
            className="object-cover"
            unoptimized
          />
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
