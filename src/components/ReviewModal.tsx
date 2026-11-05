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
  Clock,
  User,
  ShieldAlert,
  Hash,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-[#0B0014]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* MODAL DIALOG */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-750 bg-[#1F0238] p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/50">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-750 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thẩm Định Hồ Sơ Tác Phẩm Số</h2>
              <p className="text-xs text-slate-400">Xem xét tính nguyên bản và cấp phép đưa lên chuỗi khối EVM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* BODY CONTENT */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT TRÁI: PREVIEW FILE & HÌNH ẢNH */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-750 bg-slate-950">
              {asset.filePath && asset.mimeType.startsWith("image/") ? (
                <Image
                  src={asset.filePath}
                  alt={asset.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
                  <FileText className="h-12 w-12 text-slate-500 mb-2" />
                  <p className="text-xs font-semibold">{asset.fileName}</p>
                  <p className="text-[11px] text-slate-500">{asset.mimeType}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-750 bg-slate-850 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tên tệp gốc:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={asset.fileName}>
                  {asset.fileName}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dung lượng:</span>
                <span className="font-semibold text-slate-200">{formatFileSize(asset.fileSize)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Định dạng:</span>
                <span className="font-semibold text-slate-200">{asset.mimeType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ngày nộp:</span>
                <span className="font-semibold text-slate-200">
                  {new Date(asset.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN HỒ SƠ & MÃ BĂM SHA-256 */}
          <div className="space-y-4">
            <div>
              <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700 mb-1.5">
                {asset.category}
              </span>
              <h3 className="text-xl font-bold text-white">{asset.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {asset.description || "Không có mô tả chi tiết."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-750 bg-slate-850 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Thông tin Tác giả
                </span>
                <p className="text-xs font-medium text-white">
                  {asset.creator?.fullName || "Ẩn danh"} ({asset.creator?.email || "Chưa có email"})
                </p>
                <p className="text-[11px] font-mono text-slate-400 break-all">
                  Ví nộp: {asset.currentOwnerWallet}
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-750 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Vân tay số SHA-256 (Client-side)
                  </span>
                  <button
                    onClick={copyHash}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800 break-all leading-relaxed">
                  {asset.fileHash}
                </div>
              </div>
            </div>

            {/* FORM LÝ DO TỪ CHỐI (KHI BẤM NÚT TỪ CHỐI) */}
            {rejecting && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
                <label className="text-xs font-semibold text-rose-300">
                  Lý do từ chối hồ sơ (Gửi phản hồi cho tác giả):
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Tác phẩm có dấu hiệu trùng lặp vân tay số với tài sản đã đăng ký; Hình ảnh vi phạm bản quyền..."
                  className="w-full rounded-xl border border-rose-500/30 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-750 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-750 hover:text-white transition"
          >
            Đóng
          </button>

          {!rejecting ? (
            <>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <XCircle className="h-4 w-4" />
                <span>Từ Chối Hồ Sơ</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] to-[#CD6116] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30 hover:brightness-110 transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{loading ? "Đang Phê Duyệt..." : "Phê Duyệt & Cấp Chứng Nhận"}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                disabled={loading}
                className="w-full sm:w-auto rounded-xl border border-slate-750 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                Hủy từ chối
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>{loading ? "Đang Gửi..." : "Xác Nhận Từ Chối"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
