import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const { toWallet, txHash, blockNumber } = await req.json();

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

    if (asset.status === "REVOKED") {
      return NextResponse.json(
        { error: "Tài sản này đã bị thu hồi hiệu lực trên chuỗi khối, không thể chuyển quyền sở hữu!" },
        { status: 400 }
      );
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
