import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminWallet } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    // Xác thực quyền Quản trị viên từ Header hoặc Query Param
    const callerWallet = req.headers.get("x-admin-wallet") || searchParams.get("wallet");
    const isAdmin = await verifyAdminWallet(callerWallet);

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Từ chối quyền truy cập: Chỉ có địa chỉ ví thuộc Hội đồng Quản trị (Admin) mới có quyền truy cập dữ liệu thẩm định!",
          requiredRole: "ADMIN",
        },
        { status: 403 }
      );
    }

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
