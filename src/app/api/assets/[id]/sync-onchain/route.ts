import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const { tokenId, txHash, blockNumber, ownerWallet } = await req.json();

    if (!tokenId || !txHash) {
      return NextResponse.json(
        { error: "Thiếu thông tin Token ID hoặc Transaction Hash từ Blockchain" },
        { status: 400 }
      );
    }

    const numericTokenId = Number(tokenId);
    if (isNaN(numericTokenId) || numericTokenId <= 0) {
      return NextResponse.json(
        { error: "Token ID không hợp lệ (phải là số nguyên dương)" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { certificate: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy tài sản để đồng bộ" }, { status: 404 });
    }

    // 1. Cập nhật trạng thái sang REGISTERED
    const targetOwner = ownerWallet || asset.currentOwnerWallet;
    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        tokenId: numericTokenId,
        txHash,
        blockNumber: blockNumber ? Number(blockNumber) : null,
        currentOwnerWallet: targetOwner,
        status: "REGISTERED",
        registeredAt: asset.registeredAt || new Date(),
      },
    });

    // 2. Ghi nhận lịch sử sở hữu một cách an toàn (Idempotent Upsert theo txHash)
    await prisma.ownershipHistory.upsert({
      where: { txHash },
      update: {
        tokenId: numericTokenId,
        toWallet: targetOwner,
        blockNumber: blockNumber ? Number(blockNumber) : 1,
      },
      create: {
        assetId,
        tokenId: numericTokenId,
        fromWallet: "0x0000000000000000000000000000000000000000",
        toWallet: targetOwner,
        txHash,
        blockNumber: blockNumber ? Number(blockNumber) : 1,
        eventType: "MINT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đồng bộ giao dịch on-chain vào SQLite thành công",
      data: updated,
    });
  } catch (err: any) {
    console.error("Lỗi đồng bộ on-chain:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
