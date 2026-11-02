"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import {
  UploadCloud,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import FileDropzone, { HashedFileResult } from "@/components/FileDropzone";

export default function CreatorRegisterPage() {
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("ART");
  const [hashedResult, setHashedResult] = useState<HashedFileResult | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<any | null>(null);

  // Lấy địa chỉ ví từ MetaMask nếu có
  useEffect(() => {
    async function getConnectedWallet() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        } catch {}
      }
    }
    getConnectedWallet();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hashedResult || !hashedResult.file) {
      setErrorMsg("Vui lòng tải lên và băm mã SHA-256 tệp tác phẩm!");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề tác phẩm!");
      return;
    }

    if (!walletAddress.trim()) {
      setErrorMsg("Vui lòng kết nối ví MetaMask hoặc nhập địa chỉ ví của bạn!");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", hashedResult.file);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("walletAddress", walletAddress.trim());
      formData.append("creatorName", creatorName.trim() || "Nghệ sĩ số");

      const res = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể đăng ký tác phẩm");
      }

      setSuccessAsset(data.data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Cổng Dành Cho Tác Giả (Creator Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Đăng Ký & Khắc Dấu Bản Quyền Tác Phẩm
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tải lên tác phẩm, băm SHA-256 client-side tức thì và nộp hồ sơ thẩm định lên hội đồng quản trị.
          </p>
        </div>

        <Link
          href="/creator/my-assets"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-700/80 transition hover:bg-slate-700 hover:text-white self-start sm:self-auto"
        >
          <LayoutDashboard className="h-4 w-4 text-indigo-400" />
          <span>Bảng điều khiển của tôi</span>
        </Link>
      </div>

      {/* SUCCESS CARD */}
      {successAsset ? (
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-emerald-950/20 p-8 backdrop-blur-xl shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Nộp Hồ Sơ Đăng Ký Thành Công!</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Hồ sơ tác phẩm <strong className="text-emerald-400">{successAsset.title}</strong> đã được lưu trữ an toàn trong hệ thống với trạng thái <strong className="text-amber-400">PENDING_APPROVAL (Chờ thẩm định)</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800 max-w-xl mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Mã băm SHA-256:</span>
              <span className="font-mono text-emerald-400 font-semibold">{successAsset.fileHash.slice(0, 16)}...{successAsset.fileHash.slice(-8)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Địa chỉ ví:</span>
              <span className="font-mono text-slate-300">{successAsset.currentOwnerWallet.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Bước tiếp theo:</span>
              <span className="text-indigo-400 font-medium">Hội đồng Admin thẩm định hồ sơ</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/creator/my-assets"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              <span>Xem tiến độ tại Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                setSuccessAsset(null);
                setTitle("");
                setDescription("");
                setHashedResult(null);
              }}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Đăng ký thêm tác phẩm khác
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: DROPZONE FILE & HASH */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">1</span>
              <span>Tải Lên Tác Phẩm & Băm Mật Mã SHA-256</span>
            </div>
            <FileDropzone onFileHashed={(res) => setHashedResult(res)} />
          </div>

          {/* STEP 2: METADATA & WALLET */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">2</span>
              <span>Thông Tin Tác Phẩm & Chủ Sở Hữu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tiêu đề tác phẩm (*):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Danh mục tác phẩm:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ART">Mỹ thuật số (Digital Art)</option>
                  <option value="PHOTOGRAPHY">Nhiếp ảnh (Photography)</option>
                  <option value="DESIGN">Thiết kế đồ họa (Graphic Design)</option>
                  <option value="DOCUMENT">Tài liệu & Bản quyền (Document)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Họ tên nghệ sĩ / Tác giả:</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nghệ Sĩ"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Địa chỉ ví Web3 (*):</label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mô tả tác phẩm:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ý tưởng, chất liệu số, thông điệp tác phẩm..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-xs text-rose-300 border border-rose-500/30">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !hashedResult}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{submitting ? "Đang xử lý nộp hồ sơ..." : "Nộp Hồ Sơ Đăng Ký"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
