import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { fileHash: { contains: query } },
        { currentOwnerWallet: { contains: query } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, walletAddress: true },
        },
        certificate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: await prisma.asset.count(),
      pending: await prisma.asset.count({ where: { status: "PENDING_APPROVAL" } }),
      approved: await prisma.asset.count({ where: { status: "APPROVED" } }),
      registered: await prisma.asset.count({ where: { status: "REGISTERED" } }),
      rejected: await prisma.asset.count({ where: { status: "REJECTED" } }),
      revoked: await prisma.asset.count({ where: { status: "REVOKED" } }),
    };

    return NextResponse.json({ success: true, data: assets, stats });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách hồ sơ admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
