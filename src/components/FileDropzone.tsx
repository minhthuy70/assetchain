"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Copy,
  Check,
  RotateCcw,
  FileText,
  AlertCircle,
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

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxBytes) {
        setError(`Dung lượng tệp vượt quá mức cho phép (${maxSizeMB}MB). Vui lòng chọn tệp nhỏ hơn.`);
        return;
      }

      setFile(selectedFile);
      setIsHashing(true);

      if (selectedFile.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }

      try {
        const startTime = performance.now();
        const hashResult = await computeFileHashSHA256(selectedFile);
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(3);

        const bytes32Result = hexToBytes32(hashResult);

        setHash(hashResult);
        setBytes32(bytes32Result);
        setDurationSec(duration);

        if (onFileHashed) {
          onFileHashed({
            file: selectedFile,
            hash: hashResult,
            bytes32Hash: bytes32Result,
            durationMs: Math.round(endTime - startTime),
          });
        }
      } catch (err: any) {
        console.error("Lỗi khi băm file:", err);
        setError("Không thể tính mã băm SHA-256 cho tệp này. Vui lòng thử lại!");
      } finally {
        setIsHashing(false);
      }
    },
    [maxSizeMB, onFileHashed]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
    } catch {}
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

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-[#F6851B] bg-slate-900"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300 mb-3">
            <UploadCloud className="h-5 w-5 text-slate-300" />
          </div>

          <p className="type-body font-medium text-slate-200">
            Kéo thả tệp tin vào đây hoặc <span className="text-[#F6851B]">duyệt từ máy tính</span>
          </p>
          <p className="mt-1 type-caption text-slate-500">
            Hỗ trợ PNG, JPG, WEBP, PDF tối đa {maxSizeMB}MB
          </p>
          <p className="mt-2 type-caption font-mono text-slate-500">
            Băm nhị phân SHA-256 thực thi trực tiếp trên trình duyệt (0-Knowledge)
          </p>
        </div>
      ) : (
        <div className="card-surface p-4 space-y-4">
          {/* FILE HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400">
                  <FileText className="h-5 w-5" />
                </div>
              )}
              <div>
                <h4 className="type-body font-medium text-white break-all">{file.name}</h4>
                <div className="mt-0.5 flex items-center gap-2 type-caption text-slate-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase">{file.type || "file"}</span>
                  {durationSec && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{durationSec}s</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className="btn-ghost"
              title="Chọn tệp tin khác"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Đổi tệp</span>
            </button>
          </div>

          {/* HASH RESULTS */}
          <div>
            <div className="type-label mb-1.5">
              <span>Mã băm SHA-256 (Client-side)</span>
            </div>

            {isHashing ? (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 p-3 border border-slate-800">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F6851B] border-t-transparent" />
                <span className="type-caption text-slate-400">Đang tính toán mã băm nhị phân...</span>
              </div>
            ) : hash ? (
              <div className="space-y-2">
                <div className="relative rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <p className="type-code text-slate-200 break-all select-all pr-16 leading-relaxed">
                    {hash}
                  </p>
                  <button
                    onClick={() => copyToClipboard(hash)}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-slate-850 px-2 py-0.5 type-caption font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Chép</span>
                      </>
                    )}
                  </button>
                </div>

                {bytes32 && (
                  <div className="rounded-lg bg-slate-950 px-2.5 py-1.5 type-code text-slate-400 border border-slate-800 flex items-center justify-between">
                    <span className="type-caption">bytes32:</span>
                    <span className="truncate max-w-[420px] text-slate-400">{bytes32}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
