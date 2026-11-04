import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    if (!wallet) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ ví của tác giả (wallet)" },
        { status: 400 }
      );
    }

    const where: any = {
      OR: [
        { currentOwnerWallet: wallet },
        { creator: { walletAddress: wallet } },
      ],
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (query) {
      where.AND = [
        {
          OR: [
            { title: { contains: query } },
            { fileHash: { contains: query } },
          ],
        },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        certificate: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Thống kê nhanh theo từng trạng thái
    const totalCount = await prisma.asset.count({
      where: { currentOwnerWallet: wallet },
    });
    const registeredCount = await prisma.asset.count({
      where: { currentOwnerWallet: wallet, status: "REGISTERED" },
    });
    const pendingCount = await prisma.asset.count({
      where: { currentOwnerWallet: wallet, status: "PENDING_APPROVAL" },
    });
    const rejectedCount = await prisma.asset.count({
      where: { currentOwnerWallet: wallet, status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        registered: registeredCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
      data: assets,
    });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách tài sản tác giả:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
