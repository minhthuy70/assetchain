"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Loader2,
  RotateCcw,
} from "lucide-react";
import FileDropzone, { HashedFileResult } from "@/components/FileDropzone";

interface HashCheckResult {
  isDuplicate: boolean;
  message: string;
  existingTitle?: string;
  existingStatus?: string;
}

export default function CreatorRegisterPage() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("ART");
  const [hashedResult, setHashedResult] = useState<HashedFileResult | null>(null);

  const [isCheckingHash, setIsCheckingHash] = useState<boolean>(false);
  const [hashCheckResult, setHashCheckResult] = useState<HashCheckResult | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<any | null>(null);

  // Tự động nhận diện tài khoản MetaMask đã kết nối
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

    if (typeof window !== "undefined" && (window as any).ethereum?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      };
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  // Nút 1-click kết nối nhanh ví MetaMask
  const handleConnectWallet = async () => {
    setErrorMsg(null);
    setIsConnectingWallet(true);
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("Không phát hiện ví MetaMask! Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt.");
      }
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        setWalletAddress(await signer.getAddress());
      }
    } catch (err: any) {
      console.error("Lỗi kết nối ví MetaMask:", err);
      if (err.code === 4001) {
        setErrorMsg("Bạn đã hủy yêu cầu kết nối ví MetaMask.");
      } else {
        setErrorMsg(err.message || "Không thể kết nối với ví MetaMask.");
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Kiểm tra trùng lặp thời gian thực ngay khi tính xong SHA-256
  const handleFileHashed = useCallback(async (result: HashedFileResult) => {
    setHashedResult(result);
    setErrorMsg(null);
    setHashCheckResult(null);

    if (!result || !result.hash) return;

    setIsCheckingHash(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: result.hash }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const isDuplicated = Boolean(data.dbData || data.isOnchain || data.verified);
        if (isDuplicated) {
          const existingTitle = data.dbData?.title || (data.isOnchain ? "Tác phẩm đã đúc on-chain" : "Tác phẩm đã đăng ký");
          const existingStatus = data.dbData?.status || (data.isOnchain ? "ONCHAIN" : "UNKNOWN");
          setHashCheckResult({
            isDuplicate: true,
            message: data.dbData?.title
              ? `Tác phẩm này đã tồn tại trong hệ thống với tiêu đề: "${data.dbData.title}" (Trạng thái: ${data.dbData.status})`
              : "Mã băm SHA-256 này đã từng được lưu trữ trên hệ thống hoặc đã tồn tại trên sổ cái Blockchain!",
            existingTitle,
            existingStatus,
          });
        } else {
          setHashCheckResult({
            isDuplicate: false,
            message: "Tác phẩm độc bản — Dấu vân tay số SHA-256 chưa từng xuất hiện trên hệ thống!",
          });
        }
      } else {
        setHashCheckResult({
          isDuplicate: false,
          message: "Tác phẩm độc bản — Dấu vân tay số SHA-256 hợp lệ.",
        });
      }
    } catch (err) {
      console.error("Lỗi đối chiếu mã băm thời gian thực:", err);
    } finally {
      setIsCheckingHash(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hashedResult || !hashedResult.file) {
      setErrorMsg("Vui lòng tải lên và băm mã SHA-256 tệp tác phẩm!");
      return;
    }

    if (hashCheckResult?.isDuplicate) {
      setErrorMsg("Không thể nộp tác phẩm đã tồn tại trong hệ thống. Vui lòng chọn tệp tin độc bản khác!");
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
          <span className="type-label text-slate-500">
            Nộp Hồ Sơ Bản Quyền
          </span>
          <h1 className="type-h1 mt-1">
            Đăng Ký Quyền Sở Hữu Tác Phẩm Mới
          </h1>
          <p className="type-subhead mt-0.5">
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
        <div className="card-surface p-8 text-center space-y-3.5">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="type-h2">Nộp Hồ Sơ Bản Quyền Thành Công</h2>
            <p className="type-subhead mt-0.5">
              Tác phẩm &ldquo;{successAsset.title}&rdquo; đã được đưa vào hàng đợi thẩm định.
            </p>
          </div>

          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-left max-w-md mx-auto space-y-1 type-body">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="font-medium text-amber-400">Chờ Thẩm Định</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Mã SHA-256:</span>
              <span className="type-code text-slate-300">{successAsset.fileHash.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Ví tác giả:</span>
              <span className="type-code text-slate-300">{successAsset.currentOwnerWallet.slice(0, 10)}...</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
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
                setHashCheckResult(null);
                setErrorMsg(null);
              }}
              className="btn-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đăng ký thêm</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: FILE DROPZONE */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center gap-2 type-label text-slate-300">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">1</span>
              <span>Tải lên tệp gốc & băm mã SHA-256</span>
            </div>
            <FileDropzone onFileHashed={handleFileHashed} />

            {/* REAL-TIME DUPLICATE STATUS INDICATOR */}
            {isCheckingHash && (
              <div className="flex items-center gap-2.5 rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-[#F6851B] shrink-0" />
                <span>Đang đối chiếu mã băm SHA-256 với hệ thống & Blockchain để kiểm tra tính độc bản...</span>
              </div>
            )}

            {!isCheckingHash && hashCheckResult && (
              hashCheckResult.isDuplicate ? (
                <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-rose-200">
                      Cảnh báo: Phát hiện tác phẩm trùng lặp (Đã tồn tại trong hệ thống)!
                    </div>
                    <p className="text-rose-300/90 leading-relaxed">
                      {hashCheckResult.message}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Hệ thống tự động khóa nút nộp để bảo vệ bản quyền và chống hành vi tải lại các tác phẩm đã tồn tại.
                    </p>
                    {hashedResult && (
                      <div className="pt-1">
                        <Link
                          href={`/verify?hash=${hashedResult.hash}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-300 hover:text-white underline"
                        >
                          Kiểm tra hồ sơ tác phẩm trùng lặp trên Cổng Xác Minh →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      ✓ {hashCheckResult.message}
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30 shrink-0 ml-2">
                      ĐỘC BẢN
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* STEP 2: METADATA & WALLET */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center gap-2 type-label text-slate-300">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F6851B] text-[10px] text-white font-mono">2</span>
              <span>Thông tin tác phẩm & chủ sở hữu</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="type-caption font-medium text-slate-300 mb-1 block">Tiêu đề tác phẩm (*):</label>
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
                <label className="type-caption font-medium text-slate-300 mb-1 block">Tên nghệ sĩ / Tác giả:</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nghệ Sĩ"
                  className="input-base"
                />
              </div>

              <div>
                <label className="type-caption font-medium text-slate-300 mb-1 block">Danh mục tác phẩm:</label>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="type-caption font-medium text-slate-300">
                    Địa chỉ ví MetaMask nhận quyền (*):
                  </label>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet}
                    className="inline-flex items-center gap-1 text-[11px] text-[#F6851B] hover:text-[#e2761b] hover:underline transition-colors font-medium cursor-pointer"
                  >
                    {isConnectingWallet ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wallet className="h-3 w-3" />
                    )}
                    <span>{isConnectingWallet ? "Đang kết nối..." : "Lấy địa chỉ ví hiện tại"}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="input-base font-mono pr-28"
                  />
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet}
                    className="absolute right-1.5 inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 px-2 py-1 text-xs font-medium transition-colors"
                    title="Kết nối nhanh ví MetaMask"
                  >
                    {isConnectingWallet ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#F6851B]" />
                    ) : (
                      <Wallet className="h-3 w-3 text-[#F6851B]" />
                    )}
                    <span>{walletAddress ? "Đổi ví" : "Kết nối ví"}</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="type-caption font-medium text-slate-300 mb-1 block">Mô tả tác phẩm:</label>
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
              <div className="rounded-lg bg-rose-500/10 p-2.5 type-body text-rose-300 border border-rose-500/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="submit"
                disabled={submitting || isCheckingHash || hashCheckResult?.isDuplicate}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </span>
                ) : isCheckingHash ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang kiểm tra tính độc bản...</span>
                  </span>
                ) : hashCheckResult?.isDuplicate ? (
                  <span className="flex items-center gap-1.5 text-rose-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Tác phẩm bị trùng lặp (Khóa nộp)</span>
                  </span>
                ) : (
                  <span>Nộp Hồ Sơ Bản Quyền</span>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
