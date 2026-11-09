import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminWallet } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, assetId, reason, adminWallet } = body;

    // Xác thực quyền Admin
    const callerWallet = req.headers.get("x-admin-wallet") || adminWallet;
    const isAdmin = await verifyAdminWallet(callerWallet);

    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Từ chối quyền truy cập: Chỉ có địa chỉ ví thuộc Hội đồng Quản trị (Admin) mới có quyền thu hồi tài sản!",
          requiredRole: "ADMIN",
        },
        { status: 403 }
      );
    }

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

    if (targetAsset.status === "REVOKED") {
      return NextResponse.json(
        {
          error: `Tác phẩm Token #${targetAsset.tokenId} này đã bị thu hồi trước đó! (Lý do: ${targetAsset.rejectionReason || "Đã hủy hiệu lực"}). Không thể thu hồi lần 2.`,
        },
        { status: 400 }
      );
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
