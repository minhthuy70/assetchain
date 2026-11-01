import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { tokenId, assetId, reason } = await req.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập lý do thu hồi chứng nhận" }, { status: 400 });
    }

    let targetAsset: any = null;
    if (assetId) {
      targetAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    } else if (tokenId !== undefined) {
      targetAsset = await prisma.asset.findUnique({ where: { tokenId: Number(tokenId) } });
    }

    if (!targetAsset) {
      return NextResponse.json({ error: "Không tìm thấy tài sản cần thu hồi" }, { status: 404 });
    }

    const updated = await prisma.asset.update({
      where: { id: targetAsset.id },
      data: {
        status: "REVOKED",
        rejectionReason: reason.trim(),
      },
    });

    // Ghi nhận lịch sử sự kiện thu hồi
    await prisma.ownershipHistory.create({
      data: {
        assetId: targetAsset.id,
        tokenId: targetAsset.tokenId || 0,
        fromWallet: targetAsset.currentOwnerWallet,
        toWallet: "0x0000000000000000000000000000000000000000",
        txHash: `revoke_tx_${Date.now()}`,
        blockNumber: 1,
        eventType: "REVOKE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã thu hồi chứng nhận tài sản thành công",
      data: updated,
    });
  } catch (err: any) {
    console.error("Lỗi thu hồi tài sản:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
