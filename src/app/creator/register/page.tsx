"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  LayoutDashboard,
  CheckCircle2,
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nộp Hồ Sơ Bản Quyền
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Đăng Ký Quyền Sở Hữu Tác Phẩm Mới
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Băm dấu vân tay SHA-256 trực tiếp trong RAM trình duyệt và gửi hồ sơ cho Hội đồng Quản trị thẩm định.
          </p>
        </div>

        <Link
          href="/creator/my-assets"
          className="btn-secondary self-start sm:self-auto"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Bảng điều khiển</span>
        </Link>
      </div>

      {/* SUCCESS SCREEN */}
      {successAsset ? (
        <div className="card-surface p-8 text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Nộp Hồ Sơ Bản Quyền Thành Công</h2>
            <p className="text-xs text-slate-400">
              Tác phẩm &ldquo;{successAsset.title}&rdquo; đã được đưa vào hàng đợi thẩm định.
            </p>
          </div>

          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-left max-w-md mx-auto space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="font-semibold text-amber-400">Chờ Thẩm Định</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Mã SHA-256:</span>
              <span className="font-mono text-slate-300">{successAsset.fileHash.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Ví tác giả:</span>
              <span className="font-mono text-slate-300">{successAsset.currentOwnerWallet.slice(0, 10)}...</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <Link
              href="/creator/my-assets"
              className="btn-primary"
            >
              <span>Xem tiến độ thẩm định</span>
            </Link>
            <button
              onClick={() => {
                setSuccessAsset(null);
                setTitle("");
                setDescription("");
                setHashedResult(null);
              }}
              className="btn-secondary"
            >
              <span>Đăng ký thêm</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: FILE DROPZONE */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">1</span>
              <span>Tải lên tệp gốc & băm mã SHA-256</span>
            </div>
            <FileDropzone onFileHashed={(result) => setHashedResult(result)} />
          </div>

          {/* STEP 2: METADATA & WALLET */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">2</span>
              <span>Thông tin tác phẩm & chủ sở hữu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Tiêu đề tác phẩm (*):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tranh Kỹ Thuật Số Hoàng Hôn"
                  className="input-base"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Tên nghệ sĩ / Tác giả:</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nghệ Sĩ"
                  className="input-base"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Danh mục tác phẩm:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-base cursor-pointer"
                >
                  <option value="ART">Hội họa số (Digital Art)</option>
                  <option value="PHOTOGRAPHY">Nhiếp ảnh số (Photography)</option>
                  <option value="DESIGN">Thiết kế đồ họa (Graphic Design)</option>
                  <option value="DOCUMENT">Tài liệu / Văn bản bản quyền</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Địa chỉ ví MetaMask nhận quyền (*):</label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="input-base font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-300 mb-1 block">Mô tả tác phẩm:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ý nghĩa, kỹ thuật sáng tác hoặc ghi chú bản quyền..."
                  className="input-base"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20">
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                <span>{submitting ? "Đang gửi hồ sơ..." : "Nộp Hồ Sơ Bản Quyền"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
