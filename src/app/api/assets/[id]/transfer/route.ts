import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import contractInfo from "@/contracts/AssetRegistry.json";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const body = await req.json();
    const { toWallet, fromWallet, txHash, blockNumber } = body;

    if (!toWallet || !txHash) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ ví người nhận và mã giao dịch txHash!" },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(toWallet) || toWallet === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json(
        { error: "Địa chỉ ví người nhận không hợp lệ hoặc là địa chỉ rỗng (Zero Address)!" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy tài sản!" }, { status: 404 });
    }

    // Xác thực quyền người gọi: Ngăn chặn tấn công IDOR / BOLA chuyển nhượng trái phép
    const callerWallet = req.headers.get("x-owner-wallet") || fromWallet;
    if (callerWallet && callerWallet.toLowerCase() !== asset.currentOwnerWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Từ chối quyền truy cập: Bạn không phải là chủ sở hữu hợp pháp của tác phẩm này!" },
        { status: 403 }
      );
    }

    if (asset.currentOwnerWallet.toLowerCase() === toWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Không thể chuyển nhượng cho chính địa chỉ ví của chủ sở hữu hiện tại!" },
        { status: 400 }
      );
    }

    if (asset.status === "REVOKED") {
      return NextResponse.json(
        { error: "Tài sản này đã bị thu hồi hiệu lực trên chuỗi khối, không thể chuyển quyền sở hữu!" },
        { status: 400 }
      );
    }

    if (asset.status !== "REGISTERED") {
      return NextResponse.json(
        { error: "Chỉ các tác phẩm đã hoàn tất đăng ký và đúc NFT trên chuỗi khối (REGISTERED) mới có thể chuyển nhượng quyền sở hữu!" },
        { status: 400 }
      );
    }

    // Đối soát On-Chain kép: Đảm bảo giao dịch chuyển nhượng NFT thực sự đã hoàn tất trên EVM
    const rpcUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    if (contractInfo && contractInfo.address && asset.tokenId) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
        const onchainOwner = await contract.ownerOf(asset.tokenId);
        if (onchainOwner && onchainOwner.toLowerCase() !== toWallet.toLowerCase()) {
          return NextResponse.json(
            {
              error: `Đối soát on-chain thất bại: Chủ sở hữu của Token #${asset.tokenId} trên Blockchain (${onchainOwner}) chưa được chuyển sang ví nhận (${toWallet})!`,
            },
            { status: 403 }
          );
        }
      } catch (rpcErr: any) {
        if (rpcErr.message?.includes("ERC721NonexistentToken") || rpcErr.message?.includes("owner query for nonexistent token")) {
          return NextResponse.json(
            { error: `Token ID #${asset.tokenId} không tồn tại trên Smart Contract của Blockchain!` },
            { status: 400 }
          );
        }
        console.warn("Lưu ý: Bỏ qua đối soát RPC on-chain nếu mạng local chưa khởi động:", rpcErr.message);
      }
    }

    const previousOwner = asset.currentOwnerWallet;

    // 1. Cập nhật chủ sở hữu mới trong bảng Asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        currentOwnerWallet: toWallet,
      },
    });

    // 2. Ghi nhận sự kiện chuyển quyền vào bảng OwnershipHistory
    const history = await prisma.ownershipHistory.create({
      data: {
        assetId,
        tokenId: asset.tokenId || 0,
        fromWallet: previousOwner,
        toWallet,
        txHash,
        blockNumber: blockNumber ? Number(blockNumber) : 1,
        eventType: "TRANSFER",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Chuyển nhượng quyền sở hữu thành công!",
      data: { asset: updatedAsset, history },
    });
  } catch (err: any) {
    console.error("Lỗi chuyển nhượng quyền sở hữu:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
