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

    const cleanWallet = wallet.trim();
    const lowerWallet = cleanWallet.toLowerCase();

    const where: any = {
      OR: [
        { currentOwnerWallet: cleanWallet },
        { currentOwnerWallet: lowerWallet },
        { creator: { walletAddress: cleanWallet } },
        { creator: { walletAddress: lowerWallet } },
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

    // Thống kê nhanh theo từng trạng thái phục vụ Creator Dashboard (Day 9)
    const baseWalletFilter = {
      OR: [
        { currentOwnerWallet: cleanWallet },
        { currentOwnerWallet: lowerWallet },
        { creator: { walletAddress: cleanWallet } },
        { creator: { walletAddress: lowerWallet } },
      ],
    };

    const [totalCount, registeredCount, pendingCount, approvedCount, rejectedCount, revokedCount] =
      await Promise.all([
        prisma.asset.count({ where: baseWalletFilter }),
        prisma.asset.count({ where: { ...baseWalletFilter, status: "REGISTERED" } }),
        prisma.asset.count({ where: { ...baseWalletFilter, status: "PENDING_APPROVAL" } }),
        prisma.asset.count({ where: { ...baseWalletFilter, status: "APPROVED" } }),
        prisma.asset.count({ where: { ...baseWalletFilter, status: "REJECTED" } }),
        prisma.asset.count({ where: { ...baseWalletFilter, status: "REVOKED" } }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        registered: registeredCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        revoked: revokedCount,
      },
      data: assets,
    });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách tài sản tác giả:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
