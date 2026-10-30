"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  UploadCloud,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Hash,
  ExternalLink,
  Layers,
  ArrowRight,
  RotateCcw,
  Download,
} from "lucide-react";
import { computeFileHashSHA256, hexToBytes32 } from "@/lib/crypto";

function VerifyContent() {
  const searchParams = useSearchParams();
  const urlHash = searchParams.get("hash");

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hashingTime, setHashingTime] = useState<string | null>(null);
  const [inputHash, setInputHash] = useState("");
  const [inputTokenId, setInputTokenId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const performVerification = useCallback(async (hash?: string, tokenId?: number) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, tokenId }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        verified: false,
        error: err.message || "Lỗi kiểm tra đối chiếu dữ liệu",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động kiểm tra nếu có query ?hash=... từ mã QR
  useEffect(() => {
    if (urlHash) {
      setInputHash(urlHash);
      performVerification(urlHash);
    }
  }, [urlHash, performVerification]);

  const handleFileDrop = async (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setLoading(true);
    setResult(null);

    const t0 = performance.now();
    try {
      const computedHash = await computeFileHashSHA256(file);
      const t1 = performance.now();
      const elapsed = ((t1 - t0) / 1000).toFixed(2);
      setHashingTime(elapsed);
      setInputHash(computedHash);

      // Đối chiếu kép
      await performVerification(computedHash);
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        verified: false,
        error: "Không thể tính mã băm SHA-256 của tệp",
      });
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputHash.trim()) {
      performVerification(inputHash.trim());
    } else if (inputTokenId.trim()) {
      performVerification(undefined, Number(inputTokenId.trim()));
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setHashingTime(null);
    setInputHash("");
    setInputTokenId("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* HEADER HERO */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cổng Xác Minh Công Khai 1-Click • 0 Gas • Không Cần Ví Web3</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Xác Thực Bản Quyền & Tính Toàn Vẹn Tác Phẩm
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Kéo thả tệp tin tác phẩm vào vùng bên dưới. Trình duyệt tự băm mã SHA-256 và đối chiếu trực tiếp với sổ cái Blockchain EVM trong 1 giây để minh chứng xuất xứ tác phẩm thật hay giả mạo.
        </p>
      </div>

      {/* 1-CLICK DRAG AND DROP ZONE */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileDrop(e.dataTransfer.files[0]);
            }
          }}
          className={`relative group cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
            isDragging
              ? "border-emerald-400 bg-emerald-500/15 scale-[1.01] shadow-2xl shadow-emerald-500/20"
              : "border-slate-700/80 bg-slate-950/70 hover:border-emerald-500/60 hover:bg-slate-900/70"
          }`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e: any) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileDrop(e.target.files[0]);
              }
            };
            input.click();
          }}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 ${
              isDragging
                ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40"
                : "bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300"
            }`}
          >
            <UploadCloud className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-100">
            Kéo thả bất kỳ file tác phẩm số nào vào đây để kiểm tra ngay
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Hỗ trợ PNG, JPG, WEBP, GIF, PDF (Tự tính SHA-256 trực tiếp trong RAM máy của bạn)
          </p>

          {hashingTime && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              <Clock className="h-3.5 w-3.5" /> Băm SHA-256 hoàn tất trong {hashingTime}s
            </span>
          )}
        </div>

        {/* MANUAL SEARCH ACCORDION / INPUT */}
        <div className="border-t border-slate-800/80 pt-6">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Dán mã băm SHA-256 (64 ký tự hex) để tra cứu..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="w-full sm:w-36">
              <input
                type="number"
                value={inputTokenId}
                onChange={(e) => setInputTokenId(e.target.value)}
                placeholder="Token ID (VD: 1)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{loading ? "Đang tra cứu..." : "Tra cứu"}</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:text-white"
                title="Đặt lại"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-xl animate-pulse space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm font-semibold text-white">Đang truy vấn song song SQLite & Smart Contract EVM...</p>
          <p className="text-xs text-slate-400">Đọc trực tiếp bộ nhớ trạng thái on-chain qua cổng RPC 8545 (0 Gas)</p>
        </div>
      )}

      {/* HIGH-CONTRAST RESULTS SECTION */}
      {result && !loading && (
        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
          {/* TRƯỜNG HỢP 1: THU HỒI (REVOKED) */}
          {result.isRevoked ? (
            <div className="rounded-3xl border-2 border-orange-500/80 bg-orange-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/40">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-orange-400">
                    CẢNH BÁO: CHỨNG NHẬN ĐÃ BỊ THU HỒI
                  </h3>
                  <p className="text-xs text-orange-300 mt-0.5">
                    Tác phẩm này đã bị Cơ quan Quản trị (Admin) hủy bỏ hiệu lực bản quyền trên Blockchain do vi phạm hoặc tranh chấp.
                  </p>
                </div>
              </div>

              {result.dbData?.rejectionReason && (
                <div className="rounded-xl bg-slate-900/80 p-4 border border-orange-500/30 text-xs">
                  <span className="font-semibold text-orange-400">Lý do thu hồi chính thức: </span>
                  <span className="text-slate-200">{result.dbData.rejectionReason}</span>
                </div>
              )}
            </div>
          ) : result.verified ? (
            /* TRƯỜNG HỢP 2: HỢP LỆ VÀ NGUYÊN BẢN (XANH LỤC RỰC RỠ) */
            <div className="rounded-3xl border-2 border-emerald-500/80 bg-emerald-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* STATUS BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-500/30 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                      ✓ CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN
                    </h3>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Dấu vân tay số SHA-256 trùng khớp 100% với bản ghi bất biến trên Blockchain EVM!
                    </p>
                  </div>
                </div>

                {result.dbData?.id && (
                  <a
                    href={`/api/certificate/${result.dbData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 self-start sm:self-auto"
                  >
                    <Download className="h-4 w-4" />
                    <span>Tải Chứng Nhận E-Cert PDF</span>
                  </a>
                )}
              </div>

              {/* DETAILED COMPARISON GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* THÔNG SỐ TÁC PHẨM */}
                <div className="space-y-3 rounded-2xl bg-slate-900/80 p-5 border border-slate-800">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Hồ Sơ Tác Phẩm Số
                  </h4>
                  <p className="text-lg font-bold text-white">
                    {result.dbData?.title || "Tác phẩm đã ghi danh on-chain"}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Số chứng nhận:</span>
                      <strong className="text-emerald-400 font-mono">
                        {result.dbData?.certificate?.certificateNumber || "CERT-2026-ONCHAIN"}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Tác giả đăng ký:</span>
                      <strong className="text-white">
                        {result.dbData?.creator?.fullName || "Tác giả gốc"}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Danh mục:</span>
                      <span className="uppercase text-indigo-400 font-semibold">
                        {result.dbData?.category || "DIGITAL ART"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* THÔNG SỐ BLOCKCHAIN EVM */}
                <div className="space-y-3 rounded-2xl bg-slate-900/80 p-5 border border-slate-800">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Bằng Chứng Bất Biến (On-Chain)
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Token ID (ERC-721):</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        #{result.onchainData?.tokenId || result.dbData?.tokenId || 1}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Ví chủ sở hữu hiện tại:</span>
                      <span className="font-mono text-slate-300">
                        {result.onchainData?.currentOwner
                          ? `${result.onchainData.currentOwner.slice(0, 8)}...${result.onchainData.currentOwner.slice(-6)}`
                          : "Đã ghi nhận"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Thời gian khắc khối:</span>
                      <span className="text-slate-300">
                        {result.onchainData?.registeredAt
                          ? new Date(result.onchainData.registeredAt).toLocaleString("vi-VN")
                          : "Thời gian đã bảo chứng"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINGERPRINT BOX */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-emerald-500/30">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Mã băm SHA-256 đối chiếu thành công:
                </span>
                <p className="font-mono text-xs text-white break-all select-all font-bold mt-1">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : (
            /* TRƯỜNG HỢP 3: GIẢ MẠO / ĐÃ CHỈNH SỬA / KHÔNG TÌM THẤY (ĐỎ RỰC RỠ) */
            <div className="rounded-3xl border-2 border-rose-500/80 bg-rose-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-rose-500/30 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/40">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                    ✕ CẢNH BÁO: TỆP TIN CHƯA TỪNG ĐĂNG KÝ HOẶC ĐÃ BỊ CHỈNH SỬA!
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    Hệ thống không tìm thấy bất kỳ bản ghi nào trùng khớp với mã băm này trên Smart Contract Blockchain.
                  </p>
                </div>
              </div>

              {/* EXPLANATION OF AVALANCHE EFFECT */}
              <div className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-rose-400">
                  Tại sao mã băm không trùng khớp? (Hiệu ứng Tuyết lở - Avalanche Effect)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thuật toán SHA-256 có tính chất toán học đặc biệt: <strong>Dù tệp tin chỉ bị thay đổi 1 pixel màu duy nhất</strong> hay 1 ký tự nhỏ, toàn bộ 256 bits của chuỗi băm đầu ra sẽ bị biến đổi hoàn toàn ngẫu nhiên. Điều này ngăn chặn triệt để mọi hành vi cắt ghép, chỉnh sửa hoặc mạo danh tác phẩm gốc.
                </p>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-rose-500/30 font-mono text-xs text-rose-400 break-all select-all">
                  Mã băm của tệp vừa kiểm tra: <span className="text-white font-bold">{result.hash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Đang tải cổng xác minh...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
