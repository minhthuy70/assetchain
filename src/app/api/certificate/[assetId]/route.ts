import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateCertificateBuffer,
  generateCertificateQRCode,
  saveCertificatePDF,
  CertificateData,
} from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";
    const asJson = searchParams.get("json") === "1";

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        creator: true,
        certificate: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ tác phẩm" }, { status: 404 });
    }

    if (!asset.certificate) {
      return NextResponse.json(
        { error: "Tác phẩm này chưa được cấp chứng nhận điện tử (Chưa qua phê duyệt)" },
        { status: 400 }
      );
    }

    const certData: CertificateData = {
      certificateNumber: asset.certificate.certificateNumber,
      assetTitle: asset.title,
      fileHash: asset.fileHash,
      creatorWallet: asset.currentOwnerWallet,
      creatorName: asset.creator?.fullName,
      tokenId: asset.tokenId,
      txHash: asset.txHash,
      blockNumber: asset.blockNumber,
      issuedAt: new Date(asset.certificate.issuedAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      issuedBy: asset.certificate.issuedBy,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      isRevoked: asset.status === "REVOKED",
      revocationReason: asset.rejectionReason || undefined,
    };

    // Lưu bản sao PDF vào public/certificates
    await saveCertificatePDF(certData.certificateNumber, certData);

    if (asJson) {
      const qrDataUrl = await generateCertificateQRCode(
        `${certData.appUrl}/verify?hash=${certData.fileHash}`
      );
      return NextResponse.json({
        success: true,
        data: certData,
        qrCodeBase64: qrDataUrl,
        pdfUrl: `/certificates/${certData.certificateNumber}.pdf`,
      });
    }

    const pdfBuffer = await generateCertificateBuffer(certData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${certData.certificateNumber}.pdf"`
          : `inline; filename="${certData.certificateNumber}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("Lỗi xuất chứng nhận E-Certificate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
