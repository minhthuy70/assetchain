import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, walletAddress: true },
        },
        certificate: true,
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy tác phẩm!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (err: any) {
    console.error("Lỗi lấy chi tiết tài sản:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
