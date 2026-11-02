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

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { certificate: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy tài sản để đồng bộ" }, { status: 404 });
    }

    // Cập nhật trạng thái sang REGISTERED
    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        tokenId: Number(tokenId),
        txHash,
        blockNumber: blockNumber ? Number(blockNumber) : null,
        currentOwnerWallet: ownerWallet || asset.currentOwnerWallet,
        status: "REGISTERED",
        registeredAt: new Date(),
      },
    });

    // Ghi nhận lịch sử sở hữu
    await prisma.ownershipHistory.create({
      data: {
        assetId,
        tokenId: Number(tokenId),
        fromWallet: "0x0000000000000000000000000000000000000000",
        toWallet: ownerWallet || asset.currentOwnerWallet,
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
