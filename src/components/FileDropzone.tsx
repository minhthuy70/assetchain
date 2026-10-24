"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileCheck,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
  Hash,
} from "lucide-react";
import { computeFileHashSHA256, hexToBytes32 } from "@/lib/crypto";

export interface HashedFileResult {
  file: File;
  hash: string;
  bytes32Hash: string;
  durationMs: number;
}

interface FileDropzoneProps {
  onFileHashed?: (result: HashedFileResult) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileDropzone({
  onFileHashed,
  accept = "image/*,application/pdf",
  maxSizeMB = 50,
  className = "",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [bytes32, setBytes32] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (selectedFile: File) => {
      setError(null);

      // Kiểm tra dung lượng
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxBytes) {
        setError(`Dung lượng tệp vượt quá mức cho phép (${maxSizeMB}MB). Vui lòng chọn tệp nhỏ hơn.`);
        return;
      }

      setFile(selectedFile);

      // Tạo preview nếu là ảnh
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      // Bắt đầu băm SHA-256 client
      setIsHashing(true);
      const t0 = performance.now();

      try {
        const hashResult = await computeFileHashSHA256(selectedFile);
        const t1 = performance.now();
        const duration = ((t1 - t0) / 1000).toFixed(2);
        const b32 = hexToBytes32(hashResult);

        setHash(hashResult);
        setBytes32(b32);
        setDurationSec(duration);

        if (onFileHashed) {
          onFileHashed({
            file: selectedFile,
            hash: hashResult,
            bytes32Hash: b32,
            durationMs: t1 - t0,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tính toán SHA-256:", err);
        setError("Không thể tính mã băm SHA-256 của tệp tin. Vui lòng thử lại!");
      } finally {
        setIsHashing(false);
      }
    },
    [maxSizeMB, onFileHashed]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setHash(null);
    setBytes32(null);
    setDurationSec(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Lỗi copy clipboard:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* DROP AREA / ACTIVE CONTAINER */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
            isDragging
              ? "border-indigo-400 bg-indigo-500/15 scale-[1.01] shadow-2xl shadow-indigo-500/20"
              : "border-slate-700/80 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-800/40"
          }`}
        >
          {/* BACKGROUND GLOW */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />

          {/* ICON */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 ${
              isDragging
                ? "bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/40"
                : "bg-slate-800 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300"
            }`}
          >
            <UploadCloud className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-100">
            Kéo thả tệp tin tác phẩm vào đây hoặc{" "}
            <span className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 group-hover:text-indigo-300">
              chọn từ máy tính
            </span>
          </h3>

          <p className="mt-2 text-xs text-slate-400 max-w-sm">
            Hỗ trợ ảnh số (PNG, JPG, WEBP, GIF, SVG) và tài liệu PDF. Tối đa {maxSizeMB}MB.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-700/60">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Web Crypto API: Băm SHA-256 tức thì trực tiếp trên trình duyệt</span>
          </div>
        </div>
      ) : (
        /* PROCESSED / HASHED FILE DISPLAY CARD */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          {/* HEADER: FILE INFO + RESET BUTTON */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <Image
                    src={previewUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-indigo-400">
                  <FileText className="h-7 w-7" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-white break-all">{file.name}</h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase">{file.type || "binary"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Chọn tệp tin khác"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đổi tệp</span>
            </button>
          </div>

          {/* HASH STATUS & TIMING */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-indigo-400" /> Dấu vân tay số (SHA-256)
              </span>

              {durationSec && !isHashing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  <Clock className="h-3 w-3" />
                  <span>Băm hoàn tất trong {durationSec}s</span>
                </span>
              )}
            </div>

            {isHashing ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <span className="text-xs text-slate-300">Đang tính toán mã SHA-256 nhị phân...</span>
              </div>
            ) : hash ? (
              <div className="space-y-2">
                {/* 64-CHAR SHA256 DISPLAY WITH 1-CLICK COPY */}
                <div className="relative group rounded-xl border border-indigo-500/30 bg-slate-950 p-3 shadow-inner">
                  <p className="font-mono text-xs text-emerald-400 break-all select-all leading-relaxed font-semibold">
                    {hash}
                  </p>
                  <button
                    onClick={() => copyToClipboard(hash)}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-slate-800/90 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-indigo-600 hover:text-white"
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

                {/* SOLIDITY BYTES32 EQUIVALENT */}
                {bytes32 && (
                  <div className="rounded-lg bg-slate-800/40 px-3 py-2 text-[11px] text-slate-400 border border-slate-800">
                    <span className="text-slate-500 font-mono">Solidity bytes32: </span>
                    <span className="font-mono text-slate-300 break-all">{bytes32}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* NOTICE FOOTER */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300 border border-indigo-500/20">
            <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Mã băm được tính trực tiếp từ Web Crypto API tại trình duyệt của bạn và sẽ đối chiếu bất biến với Smart Contract.
            </span>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/30">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

