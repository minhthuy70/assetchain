"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Maximize2,
  ExternalLink,
  ZoomIn,
} from "lucide-react";

interface AssetRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  filePath: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  status: string;
  rejectionReason?: string | null;
  currentOwnerWallet: string;
  createdAt: string;
  creator?: {
    fullName: string;
    email: string;
    walletAddress?: string | null;
  };
  certificate?: {
    certificateNumber: string;
  } | null;
}

interface ReviewModalProps {
  asset: AssetRecord | null;
  isOpen: boolean;
  adminWallet?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  asset,
  isOpen,
  adminWallet,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!isOpen || !asset) return null;

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(asset.fileHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleApprove = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-wallet": adminWallet || "",
        },
        body: JSON.stringify({ action: "APPROVE", adminWallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Phê duyệt thất bại");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMsg("Vui lòng nhập lý do từ chối hồ sơ này!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-wallet": adminWallet || "",
        },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: rejectionReason.trim(),
          adminWallet,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Từ chối thất bại");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* BACKDROP */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* MODAL DIALOG */}
        <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F6851B]" />
              <div>
                <h2 className="type-h3">Thẩm Định Hồ Sơ Tác Phẩm Số</h2>
                <p className="type-caption mt-0.5">Kiểm tra tính toàn vẹn và cấp phép phát hành chứng nhận</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-850 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ERROR NOTIFICATION */}
          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 type-body text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BODY */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CỘT TRÁI: PREVIEW FILE & SOÁT ẢNH GỐC */}
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950 group">
                {asset.filePath && asset.mimeType.startsWith("image/") ? (
                  <>
                    <Image
                      src={asset.filePath}
                      alt={asset.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    {/* HOVER QUICK ACTIONS TO INSPECT FULL RESOLUTION */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="rounded-md bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1.5 text-xs text-white border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-colors"
                      >
                        <ZoomIn className="h-3.5 w-3.5 text-[#F6851B]" />
                        <span>Phóng to</span>
                      </button>
                      <a
                        href={asset.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1.5 text-xs text-white border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
                        <span>Mở tab mới</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center text-slate-500">
                    <FileText className="h-8 w-8 text-slate-600 mb-1" />
                    <p className="type-body font-medium text-slate-300">{asset.fileName}</p>
                    <p className="type-caption">{asset.mimeType}</p>
                  </div>
                )}
              </div>

              {/* INSPECT LINK FOR HIGH-RES REVIEW */}
              {asset.filePath && asset.mimeType.startsWith("image/") && (
                <div className="flex items-center justify-between px-1">
                  <span className="type-caption text-slate-500">Chế độ giám định pixel:</span>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#F6851B] hover:underline font-medium"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Xem ảnh gốc toàn màn hình</span>
                  </button>
                </div>
              )}

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1 type-caption">
                <div className="flex justify-between text-slate-400">
                  <span>Tên tệp:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[170px]" title={asset.fileName}>
                    {asset.fileName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Dung lượng:</span>
                  <span className="text-slate-200">{formatFileSize(asset.fileSize)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Định dạng:</span>
                  <span className="text-slate-200">{asset.mimeType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ngày nộp:</span>
                  <span className="text-slate-200">
                    {new Date(asset.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT TÁC GIẢ & HASH */}
            <div className="space-y-3">
              <div>
                <span className="inline-block rounded bg-slate-800 px-1.5 py-0.5 type-label text-slate-300 mb-1">
                  {asset.category}
                </span>
                <h3 className="type-h3">{asset.title}</h3>
                <p className="type-subhead mt-0.5 leading-relaxed">
                  {asset.description || "Không có mô tả chi tiết."}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                <div className="space-y-0.5">
                  <span className="type-label">
                    Thông tin tác giả
                  </span>
                  <p className="type-body font-medium text-white">
                    {asset.creator?.fullName || "Ẩn danh"}
                  </p>
                  <p className="type-code text-slate-400 break-all">
                    Ví nộp: {asset.currentOwnerWallet}
                  </p>
                </div>

                <div className="border-t border-slate-850 pt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="type-label">
                      Vân tay số SHA-256
                    </span>
                    <button
                      onClick={copyHash}
                      className="inline-flex items-center gap-1 type-caption text-slate-400 hover:text-white"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Đã chép" : "Chép"}</span>
                    </button>
                  </div>
                  <div className="rounded bg-slate-900 p-2 type-code text-slate-300 break-all border border-slate-850">
                    {asset.fileHash}
                  </div>
                </div>
              </div>

              {/* FORM TỪ CHỐI */}
              {rejecting && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 space-y-1.5">
                  <label className="type-caption font-medium text-rose-300 block">
                    Lý do từ chối hồ sơ (Phản hồi cho tác giả):
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    className="input-base"
                  />
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-800 pt-3.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Đóng
            </button>

            {!rejecting ? (
              <>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={loading}
                  className="btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Từ chối</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={loading}
                  className="btn-primary"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{loading ? "Đang xử lý..." : "Phê duyệt & Cấp E-Cert"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={loading}
                  className="btn-danger"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{loading ? "Đang gửi..." : "Xác nhận từ chối"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL CHO GIÁM ĐỊNH ẢNH GỐC ĐỘ PHÂN GIẢI CAO */}
      {isLightboxOpen && asset.filePath && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-md">
          {/* LIGHTBOX TOPBAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80">
            <div className="space-y-0.5">
              <h3 className="type-body font-semibold text-white flex items-center gap-2">
                <span>{asset.title}</span>
                <span className="type-caption text-slate-400 font-normal">({asset.fileName})</span>
              </h3>
              <p className="type-caption text-slate-400">
                Chế độ soi chi tiết độ phân giải gốc dành cho Hội đồng Quản trị
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={asset.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Mở trong tab mới</span>
              </a>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Đóng (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* LIGHTBOX IMAGE CONTAINER */}
          <div
            className="flex-1 overflow-auto p-4 flex items-center justify-center cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative max-w-full max-h-full cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.filePath}
                alt={asset.title}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
