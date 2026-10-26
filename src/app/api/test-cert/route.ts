import { NextRequest, NextResponse } from "next/server";
import {
  generateCertificateBuffer,
  generateCertificatePDF,
  generateCertificateQRCode,
  saveCertificatePDF,
  CertificateData,
} from "@/lib/certificate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";
    const asJson = searchParams.get("json") === "1";

    const demoCertData: CertificateData = {
      certificateNumber: "CERT-2026-DEMO01",
      assetTitle: "Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn",
      fileHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      creatorWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      creatorName: "Nguyễn Văn Nghệ Sĩ",
      tokenId: 1,
      txHash: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      blockNumber: 104,
      issuedAt: new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      issuedBy: "Hội Đồng Quản Trị AssetChain Admin",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    };

    // Lưu vào thư mục public/certificates/
    await saveCertificatePDF(demoCertData.certificateNumber, demoCertData);

    if (asJson) {
      const qrDataUrl = await generateCertificateQRCode(
        `${demoCertData.appUrl}/verify?hash=${demoCertData.fileHash}`
      );
      return NextResponse.json({
        success: true,
        message: "E-Certificate mẫu đã được tạo thành công",
        data: demoCertData,
        qrCodeBase64: qrDataUrl,
        pdfUrl: `/certificates/${demoCertData.certificateNumber}.pdf`,
      });
    }

    const pdfBuffer = await generateCertificateBuffer(demoCertData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${demoCertData.certificateNumber}.pdf"`
          : `inline; filename="${demoCertData.certificateNumber}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("Lỗi tạo test certificate:", err);
    return NextResponse.json(
      { error: "Không thể tạo file PDF chứng nhận", details: err.message },
      { status: 500 }
    );
  }
}
