import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import { hexToBytes32 } from "@/lib/crypto";
import contractInfo from "@/contracts/AssetRegistry.json";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { hash, tokenId } = await req.json();

    if (!hash && tokenId === undefined) {
      return NextResponse.json({ error: "Vui lòng cung cấp mã hash SHA-256 hoặc Token ID" }, { status: 400 });
    }

    let targetHash = hash;

    // 1. TẦNG 1: TRUY VẤN CƠ SỞ DỮ LIỆU SQLITE
    let dbAsset: any = null;
    if (targetHash) {
      dbAsset = await prisma.asset.findUnique({
        where: { fileHash: targetHash },
        include: { creator: true, certificate: true },
      });
    } else if (tokenId !== undefined) {
      dbAsset = await prisma.asset.findUnique({
        where: { tokenId: Number(tokenId) },
        include: { creator: true, certificate: true },
      });
      if (dbAsset) targetHash = dbAsset.fileHash;
    }

    // 2. TẦNG 2: ĐỐI CHIẾU TRỰC TIẾP ON-CHAIN BLOCKCHAIN EVM
    let onchainData: any = null;
    const rpcUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";

    try {
      if (targetHash && contractInfo && contractInfo.address) {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
        const bytes32Hash = hexToBytes32(targetHash);

        const res = await contract.getAssetByHash(bytes32Hash);
        onchainData = {
          registered: true,
          tokenId: Number(res[0]),
          creator: res[1],
          currentOwner: res[2],
          registeredAt: new Date(Number(res[3]) * 1000).toISOString(),
          isRevoked: Boolean(res[4]),
          tokenURI: res[5],
        };
      }
    } catch (contractErr: any) {
      // Contract revert nếu không tìm thấy hash
      onchainData = {
        registered: false,
        message: "Không tìm thấy dấu vân tay số này trên sổ cái Blockchain",
      };
    }

    const isDbVerified = Boolean(dbAsset) && (dbAsset.status === "REGISTERED" || dbAsset.status === "APPROVED");
    const isRevoked = Boolean(onchainData?.isRevoked || dbAsset?.status === "REVOKED");
    const verified = Boolean(onchainData?.registered) || isDbVerified;

    return NextResponse.json({
      success: true,
      verified,
      isOnchain: Boolean(onchainData?.registered),
      isRevoked,
      hash: targetHash,
      dbData: dbAsset,
      onchainData,
    });
  } catch (err: any) {
    console.error("Lỗi xác minh verify API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
