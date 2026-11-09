"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  UploadCloud,
  Download,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Sparkles,
  XCircle,
  FileText,
} from "lucide-react";
import { computeFileHashSHA256, shortenAddress, shortenHash } from "@/lib/crypto";

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  isOnchain: boolean;
  isRevoked: boolean;
  isPending?: boolean;
  isRejected?: boolean;
  hash: string;
  dbData?: any;
  onchainData?: any;
}

const SAMPLE_PRESETS = [
  {
    label: "Token #1 (Hợp Lệ On-Chain)",
    desc: "Đã khắc khối EVM • Sen Vàng",
    hash: "3178b1b391477fcd50ee1d3b9bcc5370418cea33a6d4465f03f8acf5ed7390e3",
    type: "success",
  },
  {
    label: "Token #2 (Đã Thu Hồi - Revoked)",
    desc: "Tranh chấp quyền sở hữu",
    hash: "0a80c9eccdc654d36be98d5be949acbd3920ca7e9e793ac9940878eb33a864ad",
    type: "revoked",
  },
  {
    label: "Hồ Sơ Chờ Thẩm Định (Pending)",
    desc: "Cyberpunk City • Đang duyệt",
    hash: "c11e6181d4a06854c030689eb7f5cb9d9237546821f4d0de830311a7e7ca68ba",
    type: "pending",
  },
  {
    label: "Tệp Giả Mạo (Chưa Đăng Ký)",
    desc: "Hash lạ không khớp hệ thống",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    type: "unknown",
  },
];

function VerifyContent() {
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get("hash");
  const tokenIdFromUrl = searchParams.get("tokenId") || searchParams.get("token");

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
    } else if (tokenIdFromUrl && !isNaN(Number(tokenIdFromUrl))) {
      setInputTokenId(tokenIdFromUrl);
      performVerification(undefined, Number(tokenIdFromUrl));
    }
  }, [hashFromUrl, tokenIdFromUrl]);

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

  const handlePresetSelect = (hash: string) => {
    setSelectedFile(null);
    setHashingTime(null);
    setInputHash(hash);
    setInputTokenId("");
    performVerification(hash);
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h1 className="type-h1">
          Cổng Xác Minh Tính Toàn Vẹn Tác Phẩm
        </h1>
        <p className="type-subhead">
          Kéo thả tệp tin để đối chiếu tức thì mã băm SHA-256 với Smart Contract on-chain (0 Gas, không cần kết nối ví).
        </p>
      </div>

      {/* DROPZONE & SEARCH CARD */}
      <div className="card-surface p-5 sm:p-6 space-y-4">
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 mb-2.5">
            <UploadCloud className="h-4 w-4 text-[#F6851B]" />
          </div>

          <p className="type-body font-medium text-white">
            {selectedFile ? `Đã chọn: ${selectedFile.name}` : "Kéo thả tệp tin tác phẩm vào đây để xác minh"}
          </p>
          <p className="type-caption mt-0.5">
            PNG, JPG, WEBP, PDF (Tính toán trong RAM máy khách)
          </p>

          {hashingTime && (
            <span className="mt-2.5 inline-flex items-center rounded bg-slate-900 border border-slate-800 px-2 py-0.5 type-code text-slate-400">
              Thời gian băm: {hashingTime}s
            </span>
          )}
        </div>

        {/* MANUAL SEARCH FORM */}
        <div className="border-t border-slate-800 pt-3.5 space-y-3">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Dán chuỗi mã băm SHA-256 (64 ký tự hex)..."
                className="input-base font-mono"
              />
            </div>
            <div className="w-full sm:w-28">
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

          {/* 1-CLICK VERIFICATION SAMPLE PRESETS */}
          <div className="border-t border-slate-850 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="type-caption flex items-center gap-1.5 text-slate-300 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-[#F6851B]" />
                <span>Thử nhanh với dữ liệu mẫu (1-Click Presets):</span>
              </span>
              <span className="type-caption text-slate-500 font-mono text-[10px]">
                0 Gas • Không cần tệp gốc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((p) => {
                const isCurrent = inputHash === p.hash;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetSelect(p.hash)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isCurrent
                        ? "border-[#F6851B] bg-slate-850 shadow-sm"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-750 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-medium ${
                          p.type === "success"
                            ? "text-emerald-400"
                            : p.type === "revoked"
                            ? "text-amber-400"
                            : p.type === "pending"
                            ? "text-sky-400"
                            : "text-rose-400"
                        }`}
                      >
                        {p.label}
                      </span>
                    </div>
                    <p className="type-caption text-slate-400 text-[10px] mt-0.5">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="card-surface p-6 text-center space-y-1.5">
          <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-[#F6851B] border-t-transparent" />
          <p className="type-body font-medium text-slate-200">Đang đối chiếu dữ liệu Smart Contract EVM & CSDL...</p>
          <p className="type-caption font-mono">Querying via local RPC & SQLite multi-tier verification</p>
        </div>
      )}

      {/* RESULT CARDS */}
      {result && !loading && (
        <div className="space-y-4">
          {/* CASE 1: REVOKED */}
          {result.isRevoked ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="type-h3 text-amber-300">
                    Cảnh Báo: Chứng Nhận Đã Bị Thu Hồi (Revoked)
                  </h3>
                  <p className="type-caption text-slate-400 mt-0.5">
                    Tác phẩm này đã bị Cơ quan Quản trị hủy bỏ hiệu lực on-chain do vi phạm hoặc tranh chấp quyền sở hữu.
                  </p>
                </div>
              </div>

              {result.dbData?.rejectionReason && (
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 type-body">
                  <span className="text-slate-400">Lý do thu hồi: </span>
                  <span className="text-slate-200">{result.dbData.rejectionReason}</span>
                </div>
              )}

              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="type-caption font-mono">Mã SHA-256 đối chiếu:</span>
                  <button
                    onClick={() => copyToClipboard(result.hash)}
                    className="inline-flex items-center gap-1 type-caption text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="type-code text-slate-300 break-all select-all">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : result.isRejected ? (
            /* CASE 2: REJECTED */
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                  <XCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="type-h3 text-rose-400">
                    Hồ Sơ Bản Quyền Bị Từ Chối Thẩm Định
                  </h3>
                  <p className="type-caption text-slate-400 mt-0.5">
                    Hồ sơ tác phẩm này đã bị Hội đồng Quản trị từ chối cấp phép do không đáp ứng tiêu chuẩn bản quyền.
                  </p>
                </div>
              </div>

              {result.dbData?.rejectionReason && (
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 type-body">
                  <span className="text-rose-400 font-medium">Lý do từ chối: </span>
                  <span className="text-slate-200">{result.dbData.rejectionReason}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 type-body">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tiêu đề:</span>
                    <span className="text-slate-200 font-medium">{result.dbData?.title || "Không rõ"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người nộp:</span>
                    <span className="text-slate-300">{result.dbData?.creator?.fullName || "Tác giả"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="text-rose-400 font-medium">REJECTED (Bị từ chối)</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 type-body">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Danh mục:</span>
                    <span className="text-slate-300">{result.dbData?.category || "ART"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời điểm nộp:</span>
                    <span className="text-slate-300">
                      {result.dbData?.createdAt ? new Date(result.dbData.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cấp phép On-Chain:</span>
                    <span className="text-slate-500 font-mono">Không được duyệt</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="type-caption font-mono">Mã SHA-256 đối chiếu:</span>
                  <button
                    onClick={() => copyToClipboard(result.hash)}
                    className="inline-flex items-center gap-1 type-caption text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="type-code text-slate-300 break-all select-all">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : result.isPending ? (
            /* CASE 3: PENDING APPROVAL */
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="type-h3 text-sky-300">
                    Hồ Sơ Đang Trong Quy Trình Thẩm Định Bản Quyền
                  </h3>
                  <p className="type-caption text-slate-400 mt-0.5">
                    Dấu vân tay số SHA-256 đã được tiếp nhận và lưu trữ trong CSDL. Hồ sơ đang chờ Hội đồng Quản trị thẩm định trước khi cấp phép đưa lên chuỗi khối EVM.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 type-body">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tiêu đề:</span>
                    <span className="text-slate-200 font-medium">{result.dbData?.title || "Tác phẩm mới"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tác giả nộp:</span>
                    <span className="text-slate-300">{result.dbData?.creator?.fullName || "Tác giả"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tiến độ:</span>
                    <span className="text-amber-400 font-medium">Chờ Admin xét duyệt</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 type-body">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Danh mục:</span>
                    <span className="text-slate-300">{result.dbData?.category || "ART"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời điểm gửi:</span>
                    <span className="text-slate-300">
                      {result.dbData?.createdAt ? new Date(result.dbData.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khắc dấu EVM:</span>
                    <span className="text-slate-500 font-mono">Chờ phê duyệt</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="type-caption font-mono">Mã SHA-256 đối chiếu:</span>
                  <button
                    onClick={() => copyToClipboard(result.hash)}
                    className="inline-flex items-center gap-1 type-caption text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="type-code text-slate-300 break-all select-all">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : result.verified ? (
            /* CASE 4: VERIFIED & AUTHENTIC ON-CHAIN */
            <div className="card-surface p-5 sm:p-6 space-y-4 border-emerald-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="type-h3 text-emerald-400">
                      Chứng Nhận Hợp Lệ & Nguyên Bản
                    </h3>
                    <p className="type-caption text-slate-400 mt-0.5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-2">
                  <h4 className="type-label">
                    Hồ sơ tác phẩm
                  </h4>
                  <div className="space-y-1 pt-0.5 type-body">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiêu đề:</span>
                      <span className="font-medium text-white">{result.dbData?.title || "Tác phẩm đã ghi danh"}</span>
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

                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-2">
                  <h4 className="type-label">
                    Bản ghi On-Chain (EVM)
                  </h4>
                  <div className="space-y-1 pt-0.5 type-body">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Token ID:</span>
                      <span className="font-mono font-medium text-emerald-400">#{result.onchainData?.tokenId || result.dbData?.tokenId || 1}</span>
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
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="type-caption font-mono">Mã SHA-256 đối chiếu:</span>
                  <button
                    onClick={() => copyToClipboard(result.hash)}
                    className="inline-flex items-center gap-1 type-caption text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <p className="type-code text-slate-300 break-all select-all">
                  {result.hash}
                </p>
              </div>
            </div>
          ) : (
            /* CASE 5: NOT FOUND / ALTERED */
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="type-h3 text-rose-400">
                    Không Tìm Thấy Bản Ghi Hợp Lệ Hoặc Tệp Tin Đã Bị Sửa Đổi
                  </h3>
                  <p className="type-caption text-slate-400 mt-0.5">
                    Mã băm của tệp tin này không khớp với bất kỳ chứng nhận nào trên sổ cái Smart Contract.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1 type-body">
                <p className="type-label text-slate-400">
                  Nguyên nhân có thể xảy ra:
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Thuật toán SHA-256 có tính chất nhạy cảm cực cao: Dù tệp tin chỉ bị thay đổi 1 pixel màu, nén lại hoặc sửa đổi siêu dữ liệu, chuỗi băm đầu ra sẽ hoàn toàn sai lệch so với bản gốc đã đăng ký.
                </p>
                <div className="type-code text-slate-400 break-all pt-1">
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
    <Suspense fallback={<div className="p-12 text-center type-caption text-slate-500">Đang tải dữ liệu xác minh...</div>}>
      <VerifyContent />
    </Suspense>
  );
}