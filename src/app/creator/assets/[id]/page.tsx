"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Send,
  ExternalLink,
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
      <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-4">
        <div className="h-8 w-48 mx-auto bg-slate-800 animate-pulse rounded-lg" />
        <div className="h-64 max-w-xl mx-auto bg-slate-800/40 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không tìm thấy tài sản số này!</h2>
        <Link
          href="/creator/my-assets"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Quay lại Bảng điều khiển
        </Link>
      </div>
    );
  }

  const isRegistered = asset.status === "REGISTERED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* TOP BREADCRUMB */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/creator/my-assets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách tác phẩm</span>
        </Link>

        {isRegistered && (
          <Link
            href={`/creator/transfer?assetId=${asset.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Chuyển nhượng NFT</span>
          </Link>
        )}
      </div>

      {/* ASSET SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="relative h-64 md:h-full w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
          <Image
            src={asset.filePath}
            alt={asset.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
                {asset.category}
              </span>
              {isRegistered && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  <Sparkles className="h-3 w-3" /> Token #{asset.tokenId} On-Chain
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-white">{asset.title}</h1>
            <p className="text-xs text-slate-400 leading-relaxed">{asset.description || "Chưa có mô tả chi tiết."}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Mã SHA-256:</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>{shortenHash(asset.fileHash)}</span>
                <button
                  onClick={() => copyHash(asset.fileHash)}
                  className="hover:text-white"
                  title="Sao chép"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Chủ sở hữu hiện tại:</span>
              <span className="text-white">{shortenAddress(asset.currentOwnerWallet)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Tác giả gốc:</span>
              <span className="text-slate-300">{asset.creator?.fullName || "Ẩn danh"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROVENANCE TIMELINE COMPONENT */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <ProvenanceTimeline asset={asset} history={asset.history || []} />
      </div>
    </div>
  );
}
