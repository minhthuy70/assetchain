import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const { action, rejectionReason } = await req.json();

    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { creator: true },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ tài sản" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "APPROVED",
          rejectionReason: null,
        },
      });

      // Sinh số hiệu chứng nhận tự động
      const certCount = await prisma.certificate.count();
      const certificateNumber = `CERT-2026-${String(certCount + 1).padStart(4, "0")}`;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const cert = await prisma.certificate.upsert({
        where: { assetId },
        update: {},
        create: {
          assetId,
          certificateNumber,
          verifyUrl: `${baseUrl}/verify?hash=${updated.fileHash}`,
          issuedBy: "AssetChain Admin Council",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Phê duyệt hồ sơ thành công",
        data: updated,
        certificate: cert,
      });
    } else if (action === "REJECT") {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return NextResponse.json(
          { error: "Vui lòng nhập lý do từ chối để phản hồi cho tác giả" },
          { status: 400 }
        );
      }

      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Đã từ chối hồ sơ kèm lý do phản hồi",
        data: updated,
      });
    }

    return NextResponse.json({ error: "Hành động review không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    console.error("Lỗi review hồ sơ admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

