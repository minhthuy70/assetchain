"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  UploadCloud,
  Download,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { computeFileHashSHA256, shortenAddress, shortenHash } from "@/lib/crypto";

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  isOnchain: boolean;
  isRevoked: boolean;
  hash: string;
  dbData?: any;
  onchainData?: any;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get("hash");

  const [inputHash, setInputHash] = useState("");
  const [inputTokenId, setInputTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashingTime, setHashingTime] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hashFromUrl) {
      setInputHash(hashFromUrl);
      performVerification(hashFromUrl);
    }
  }, [hashFromUrl]);

  const performVerification = async (hash?: string, tokenId?: number) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash: hash?.trim() || undefined,
          tokenId: tokenId !== undefined ? Number(tokenId) : undefined,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Lỗi xác minh:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = async (file: File) => {
    setSelectedFile(file);

    const start = performance.now();
    const computedHash = await computeFileHashSHA256(file);
    const end = performance.now();
    const duration = ((end - start) / 1000).toFixed(3);

    setHashingTime(duration);
    setInputHash(computedHash);
    performVerification(computedHash);
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
    setResult(null);
    setHashingTime(null);
    setInputHash("");
    setInputTokenId("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Cổng Xác Minh Tính Toàn Vẹn Tác Phẩm
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Kéo thả tệp tin để đối chiếu tức thì mã băm SHA-256 với Smart Contract on-chain (0 Gas, không cần kết nối ví).
        </p>
      </div>

      {/* DROPZONE & SEARCH CARD */}
      <div className="card-surface p-6 space-y-5">
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
          className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-[#F6851B] bg-slate-850"
              : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950/90"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 mb-2.5">
            <UploadCloud className="h-5 w-5 text-[#F6851B]" />
          </div>

          <p className="text-xs font-semibold text-white">
            {selectedFile ? `Đã chọn: ${selectedFile.name}` : "Kéo thả tệp tin tác phẩm vào đây để xác minh"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PNG, JPG, WEBP, PDF (Tính toán trong RAM máy khách)
          </p>

          {hashingTime && (
            <span className="mt-2.5 inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              Thời gian băm: {hashingTime}s
            </span>
          )}
        </div>

        {/* MANUAL SEARCH FORM */}
        <div className="border-t border-slate-800 pt-4">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Dán chuỗi mã băm SHA-256 (64 ký tự hex)..."
                className="input-base font-mono"
              />
            </div>
            <div className="w-full sm:w-32">
              <input
                type="number"
                value={inputTokenId}
                onChange={(e) => setInputTokenId(e.target.value)}
                placeholder="Token ID"
                className="input-base font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{loading ? "Đang tra cứu..." : "Tra cứu"}</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={reset}
                className="btn-ghost"
                title="Làm mới"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="card-surface p-8 text-center space-y-2">
          <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#F6851B] border-t-transparent" />
          <p className="text-xs font-medium text-slate-200">Đang đối chiếu dữ liệu Smart Contract EVM...</p>
          <p className="text-[11px] text-slate-400 font-mono">Querying via local RPC provider</p>
        </div>
      )}

      {/* RESULT CARDS */}
      {result && !loading && (
        <div className="space-y-4">
          {/* CASE 1: REVOKED */}
          {result.isRevoked ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    Cảnh Báo: Chứng Nhận Đã Bị Thu Hồi (Revoked)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tác phẩm này đã bị Cơ quan Quản trị hủy bỏ hiệu lực on-chain do vi phạm hoặc tranh chấp quyền sở hữu.
                  </p>
                </div>
              </div>

              {result.dbData?.rejectionReason && (
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Lý do thu hồi: </span>
                  <span className="text-slate-200">{result.dbData.rejectionReason}</span>
                </div>
              )}
            </div>
          ) : result.verified ? (
            /* CASE 2: VERIFIED & AUTHENTIC */
            <div className="rounded-xl border border-emerald-500/30 bg-slate-900 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400">
                      Chứng Nhận Hợp Lệ & Nguyên Bản
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vân tay số SHA-256 trùng khớp 100% với bản ghi trên Smart Contract
                    </p>
                  </div>
                </div>

                {result.dbData?.id && (
                  <a
                    href={`/api/certificate/${result.dbData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary self-start sm:self-auto"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải E-Certificate PDF</span>
                  </a>
                )}
              </div>

              {/* METADATA GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Hồ sơ tác phẩm
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiêu đề:</span>
                      <span className="font-semibold text-white">{result.dbData?.title || "Tác phẩm đã ghi danh"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số chứng nhận:</span>
                      <span className="font-mono text-slate-300">{result.dbData?.certificate?.certificateNumber || "CERT-2026-ONCHAIN"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tác giả:</span>
                      <span className="text-slate-300">{result.dbData?.creator?.fullName || "Tác giả gốc"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Danh mục:</span>
                      <span className="text-slate-300">{result.dbData?.category || "ART"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Bản ghi On-Chain (EVM)
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Token ID:</span>
                      <span className="font-mono font-bold text-emerald-400">#{result.onchainData?.tokenId || result.dbData?.tokenId || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ sở hữu:</span>
                      <span className="font-mono text-slate-300">
                        {result.onchainData?.currentOwner
                          ? shortenAddress(result.onchainData.currentOwner)
                          : "Đã ghi nhận"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mốc thời gian:</span>
                      <span className="text-slate-300">
                        {result.onchainData?.registeredAt
                          ? new Date(result.onchainData.registeredAt).toLocaleString("vi-VN")
                          : "Đã khắc khối"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HASH BOX */}
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Mã SHA-256 đối chiếu:</span>
                  <button
                    onClick={() => copyToClipboard(result.hash)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="font-mono text-slate-300 break-all select-all mt-1">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : (
            /* CASE 3: NOT FOUND / ALTERED */
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-400">
                    Không Tìm Thấy Bản Ghi Hợp Lệ Hoặc Tệp Tin Đã Bị Sửa Đổi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mã băm của tệp tin này không khớp với bất kỳ chứng nhận nào trên sổ cái Smart Contract.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 text-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nguyên nhân có thể xảy ra:
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Thuật toán SHA-256 có tính chất nhạy cảm cực cao: Dù tệp tin chỉ bị thay đổi 1 pixel màu, nén lại hoặc sửa đổi siêu dữ liệu, chuỗi băm đầu ra sẽ hoàn toàn sai lệch so với bản gốc đã đăng ký.
                </p>
                <div className="font-mono text-[11px] text-slate-400 break-all pt-1">
                  Mã băm đã kiểm tra: <span className="text-slate-200">{result.hash}</span>
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Đang tải dữ liệu xác minh...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
