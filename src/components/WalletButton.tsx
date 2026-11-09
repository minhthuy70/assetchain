"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { Wallet, AlertCircle, CheckCircle2, ChevronDown, LayoutDashboard } from "lucide-react";

const HARDHAT_CHAIN_ID_HEX = "0x7a69"; // 31337 in hex
const HARDHAT_RPC_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";

export default function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const checkNetwork = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const isTarget = network.chainId === BigInt(31337);
      setIsWrongNetwork(!isTarget);
      return isTarget;
    } catch {
      return false;
    }
  }, []);

  const updateAccountAndBalance = useCallback(
    async (acc: string, provider: ethers.BrowserProvider) => {
      setAccount(acc);
      try {
        const bal = await provider.getBalance(acc);
        const formatted = parseFloat(ethers.formatEther(bal)).toFixed(2);
        setBalance(formatted);
      } catch (err) {
        console.error("Lỗi đọc số dư:", err);
      }
    },
    []
  );

  const initWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        await checkNetwork(provider);
        await updateAccountAndBalance(accounts[0].address, provider);
      }
    } catch (err) {
      console.warn("Chưa kết nối ví ban đầu:", err);
    }
  }, [checkNetwork, updateAccountAndBalance]);

  useEffect(() => {
    initWallet();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setBalance(null);
        } else {
          const provider = new ethers.BrowserProvider(ethereum);
          updateAccountAndBalance(accounts[0], provider);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [initWallet, updateAccountAndBalance]);

  async function connectWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt!");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        await checkNetwork(provider);
        await updateAccountAndBalance(accounts[0], provider);
      }
    } catch (err: any) {
      console.error("Lỗi kết nối ví:", err);
    } finally {
      setIsConnecting(false);
    }
  }

  async function switchNetwork() {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
      setIsWrongNetwork(false);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: HARDHAT_CHAIN_ID_HEX,
                chainName: "Hardhat Local EVM",
                rpcUrls: [HARDHAT_RPC_URL],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
          setIsWrongNetwork(false);
        } catch (addError) {
          console.error("Lỗi thêm mạng Hardhat:", addError);
        }
      }
    }
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 type-caption font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
      >
        <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
        <span>Đổi mạng Hardhat</span>
      </button>
    );
  }

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 type-caption font-medium text-slate-200 hover:bg-slate-850 hover:border-slate-700 transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="type-code text-white">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          {balance !== null && (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 type-code text-slate-300">
              {balance} ETH
            </span>
          )}
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="type-caption font-medium text-slate-400">
                Ví MetaMask
              </span>
              <span className="flex items-center gap-1 type-code text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> 31337
              </span>
            </div>
            <div className="mt-2.5">
              <p className="type-caption text-slate-500">Địa chỉ:</p>
              <p className="mt-0.5 break-all type-code text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-800 select-all">
                {account}
              </p>
            </div>
            <div className="mt-2.5 flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="type-caption text-slate-400">Số dư:</span>
              <span className="type-code font-medium text-white">{balance} ETH</span>
            </div>
            <Link
              href="/creator/my-assets"
              onClick={() => setMenuOpen(false)}
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 py-1.5 type-caption font-medium text-slate-200 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-[#F6851B]" />
              <span>Tác phẩm của tôi</span>
            </Link>
            <button
              onClick={() => {
                setAccount(null);
                setBalance(null);
                setMenuOpen(false);
              }}
              className="mt-2 w-full rounded-lg bg-rose-500/10 border border-rose-500/20 py-1.5 type-caption font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Ngắt kết nối
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-primary"
    >
      <Wallet className="h-3.5 w-3.5" />
      <span>{isConnecting ? "Đang kết nối..." : "Kết nối Ví"}</span>
    </button>
  );
}
