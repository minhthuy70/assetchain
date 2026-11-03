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
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  asset,
  isOpen,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason }),
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

  const isImage = asset.mimeType.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thẩm Định Hồ Sơ Tác Phẩm Số</h3>
              <p className="text-xs text-slate-400">Kiểm tra thông số kỹ thuật và tính toàn vẹn bản quyền</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI: XEM TRƯỚC TÁC PHẨM */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
                {isImage ? (
                  <Image
                    src={asset.filePath}
                    alt={asset.title}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <FileText className="h-16 w-16 text-indigo-400" />
                    <span className="text-xs">Tài liệu nhị phân / PDF</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Tên file: <strong className="text-slate-300">{asset.fileName}</strong></span>
                <span>Dung lượng: <strong className="text-slate-300">{formatFileSize(asset.fileSize)}</strong></span>
              </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN CHI TIẾT & BẰNG CHỨNG */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  {asset.category}
                </span>
                <h4 className="text-xl font-bold text-white mt-0.5">{asset.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {asset.description || "Không có mô tả chi tiết."}
                </p>
              </div>

              {/* TÁC GIẢ & VÍ */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <User className="h-3.5 w-3.5 text-indigo-400" /> Tác giả đăng ký:
                  </span>
                  <span className="font-semibold text-white">
                    {asset.creator?.fullName || "Tác giả vãng lai"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Địa chỉ ví Web3:</span>
                  <p className="font-mono text-[11px] text-slate-300 break-all select-all mt-0.5">
                    {asset.currentOwnerWallet}
                  </p>
                </div>
              </div>

              {/* MÃ BĂM SHA-256 PROOF OF EXISTENCE */}
              <div className="rounded-xl border border-indigo-500/30 bg-slate-950 p-3.5 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <Hash className="h-3.5 w-3.5" /> Dấu vân tay số (SHA-256)
                  </span>
                  <button
                    onClick={copyHash}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-200 break-all select-all font-semibold">
                  {asset.fileHash}
                </p>
              </div>

              {/* THÔNG TIN TRẠNG THÁI */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <span className="font-semibold px-2.5 py-1 rounded-full text-xs uppercase bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                  {asset.status}
                </span>
              </div>
            </div>
          </div>

          {/* KHUNG TỪ CHỐI KÈM LÝ DO */}
          {rejecting && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase">
                <AlertTriangle className="h-4 w-4" />
                <span>Nhập lý do từ chối hồ sơ (Bắt buộc)</span>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: File ảnh độ phân giải quá thấp / Phát hiện nghi vấn đạo nhái / Sai lệch thông tin tác giả..."
                rows={3}
                className="w-full rounded-lg border border-rose-500/30 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejecting(false)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Hủy từ chối
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/20 p-3 text-xs text-rose-300 border border-rose-500/40">
              {errorMsg}
            </div>
          )}
        </div>

        {/* MODAL ACTIONS FOOTER */}
        {!rejecting && (
          <div className="border-t border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Hành động của Admin sẽ ghi nhận trực tiếp vào cơ sở dữ liệu và cấp chứng nhận.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Từ chối hồ sơ</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{loading ? "Đang xử lý..." : "Phê duyệt & Cấp số Cert"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

