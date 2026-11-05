"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Wallet, AlertCircle, CheckCircle2, ChevronDown, ExternalLink } from "lucide-react";

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
      alert("Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt Chrome/Edge!");
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
      if (err.code !== 4001) {
        alert("Lỗi khi kết nối ví MetaMask. Vui lòng kiểm tra lại tiện ích!");
      }
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
      } else {
        console.error("Lỗi chuyển mạng:", switchError);
      }
    }
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-sm transition-all hover:bg-amber-500/25"
      >
        <AlertCircle className="h-4 w-4 animate-pulse text-amber-400" />
        <span>Chuyển sang mạng Hardhat (31337)</span>
      </button>
    );
  }

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-750 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur transition-all hover:border-orange-500/60 hover:bg-slate-850"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          <span className="font-mono font-bold tracking-tight">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          {balance !== null && (
            <span className="rounded-lg bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[11px] font-bold text-orange-400">
              {balance} ETH
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-950/98 p-3.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Ví MetaMask Đã Kết Nối
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Chain 31337
              </span>
            </div>
            <div className="mt-3">
              <p className="text-[11px] text-slate-400 font-medium">Địa chỉ ví công khai:</p>
              <p className="mt-1 break-all font-mono text-xs text-white bg-slate-900/90 p-2 rounded-xl border border-slate-800 select-all">
                {account}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Số dư khả dụng:</span>
              <span className="font-bold text-orange-400 text-sm">{balance} ETH</span>
            </div>
            <button
              onClick={() => {
                setAccount(null);
                setBalance(null);
                setMenuOpen(false);
              }}
              className="mt-3.5 w-full rounded-xl bg-rose-500/10 border border-rose-500/20 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
            >
              Ngắt kết nối phiên làm việc
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
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F6851B] via-[#E2761B] to-[#CD6116] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 hover:brightness-110 hover:shadow-orange-500/40 active:scale-95 disabled:opacity-50"
    >
      <Wallet className="h-4 w-4" />
      <span>{isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}</span>
    </button>
  );
}
