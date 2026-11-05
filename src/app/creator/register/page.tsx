"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck2,
} from "lucide-react";
import FileDropzone, { HashedFileResult } from "@/components/FileDropzone";

export default function CreatorRegisterPage() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("ART");
  const [hashedResult, setHashedResult] = useState<HashedFileResult | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<any | null>(null);

  // Tự động nhận diện ví MetaMask nếu có
  useEffect(() => {
    async function getConnectedWallet() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        } catch (err) {
          console.error("MetaMask detection error:", err);
        }
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
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-[#F6851B]" />
            <span>Nộp Hồ Sơ Bản Quyền Tác Phẩm Số</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Đăng Ký Quyền Sở Hữu Tài Sản Mới
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tính toán mã vân tay số SHA-256 client-side (0 Gas) và gửi yêu cầu phê duyệt tới Hội đồng Quản trị.
          </p>
        </div>

        <Link
          href="/creator/my-assets"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-750 px-4 py-2 text-xs font-bold text-slate-200 hover:border-orange-500 hover:text-white transition self-start sm:self-auto"
        >
          <LayoutDashboard className="h-4 w-4 text-orange-400" />
          <span>Bảng điều khiển của tôi</span>
        </Link>
      </div>

      {/* SUCCESS SCREEN */}
      {successAsset ? (
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white">Nộp Hồ Sơ Bản Quyền Thành Công!</h2>
            <p className="text-xs text-slate-300">
              Tác phẩm <strong className="text-white">&ldquo;{successAsset.title}&rdquo;</strong> đã được tiếp nhận và chuyển đến hàng đợi thẩm định của Hội đồng Quản trị.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trạng thái hồ sơ:</span>
              <span className="font-bold text-orange-400 uppercase">Chờ Thẩm Định (Pending Approval)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Mã băm SHA-256:</span>
              <span className="font-mono text-emerald-400 font-bold">{successAsset.fileHash.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Địa chỉ ví tác giả:</span>
              <span className="font-mono text-slate-300">{successAsset.currentOwnerWallet.slice(0, 10)}...</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/creator/my-assets"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] to-[#E2761B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:brightness-110"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Xem tiến độ thẩm định</span>
            </Link>
            <button
              onClick={() => {
                setSuccessAsset(null);
                setTitle("");
                setDescription("");
                setHashedResult(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-850 border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span>Đăng ký tác phẩm khác</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: FILE UPLOAD & DROPZONE */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-bold">1</span>
              <span>Tải Lên Tệp Gốc & Băm Mã SHA-256</span>
            </div>
            <FileDropzone onFileHashed={(result) => setHashedResult(result)} />
          </div>

          {/* STEP 2: METADATA & WALLET */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-bold">2</span>
              <span>Thông Tin Tác Phẩm & Chủ Sở Hữu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Tiêu đề tác phẩm (*):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Danh mục tác phẩm:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ART">Mỹ thuật số (Digital Art)</option>
                  <option value="PHOTOGRAPHY">Nhiếp ảnh (Photography)</option>
                  <option value="DESIGN">Thiết kế đồ họa (Graphic Design)</option>
                  <option value="DOCUMENT">Tài liệu & Bản quyền (Document)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Họ tên nghệ sĩ / Tác giả:</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nghệ Sĩ"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Địa chỉ ví Web3 (*):</label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Mô tả tác phẩm:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ý tưởng, chất liệu số, thông điệp tác phẩm..."
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] via-[#E2761B] to-[#CD6116] px-6 py-3 text-xs font-bold text-white shadow-xl shadow-orange-500/25 transition hover:brightness-110 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>{submitting ? "Đang xử lý nộp hồ sơ..." : "Nộp Hồ Sơ Đăng Ký"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
