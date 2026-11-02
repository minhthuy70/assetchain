import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

export interface CertificateData {
  certificateNumber: string;
  assetTitle: string;
  fileHash: string;
  creatorWallet: string;
  creatorName?: string;
  tokenId?: number | null;
  txHash?: string | null;
  blockNumber?: number | null;
  issuedAt: string;
  issuedBy?: string;
  appUrl?: string;
  isRevoked?: boolean;
  revocationReason?: string;
}

/**
 * Sinh chuỗi ảnh DataURL PNG từ URL xác thực của tác phẩm
 */
export async function generateCertificateQRCode(verifyUrl: string): Promise<string> {
  return await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#182B49",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Lập trình xuất tài liệu jsPDF Chứng nhận Sở hữu Số chuẩn đồ họa cao cấp A4 Landscape
 */
export async function generateCertificatePDF(data: CertificateData): Promise<jsPDF> {
  const baseUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?hash=${data.fileHash}`;
  const qrDataUrl = await generateCertificateQRCode(verifyUrl);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Kích thước khổ giấy A4 Landscape: 297mm x 210mm
  const PAGE_WIDTH = 297;
  const PAGE_HEIGHT = 210;

  // Bảng mã màu chuẩn sang trọng
  const COLOR_NAVY = { r: 24, g: 43, b: 73 }; // #182B49
  const COLOR_GOLD = { r: 197, g: 160, b: 89 }; // #C5A059
  const COLOR_GOLD_LIGHT = { r: 236, g: 224, b: 196 }; // #ECE0C4
  const COLOR_DARK_GRAY = { r: 51, g: 65, b: 85 }; // #334155
  const COLOR_LIGHT_BG = { r: 248, g: 250, b: 252 }; // #F8FAFC

  // 1. NỀN GIẤY TRANG TRỌNG
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // Họa tiết nền mờ sang trọng (Corner accents)
  doc.setFillColor(COLOR_LIGHT_BG.r, COLOR_LIGHT_BG.g, COLOR_LIGHT_BG.b);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28, "F");

  // 2. KHUNG VIỀN ĐÔI SANG TRỌNG
  // Khung ngoài: Xanh Navy đậm (#182B49)
  doc.setDrawColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.setLineWidth(2.2);
  doc.rect(10, 10, PAGE_WIDTH - 20, PAGE_HEIGHT - 20);

  // Khung trong: Vàng kim hoàng gia (#C5A059)
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.8);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28);

  // Đường chỉ mảnh bên trong
  doc.setDrawColor(COLOR_GOLD_LIGHT.r, COLOR_GOLD_LIGHT.g, COLOR_GOLD_LIGHT.b);
  doc.setLineWidth(0.3);
  doc.rect(16, 16, PAGE_WIDTH - 32, PAGE_HEIGHT - 32);

  // Góc trang trí họa tiết 4 góc (Corner Ornaments)
  const drawCornerDeco = (x: number, y: number, xFlip: number, yFlip: number) => {
    doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
    doc.setLineWidth(1.2);
    doc.line(x, y, x + 12 * xFlip, y);
    doc.line(x, y, x, y + 12 * yFlip);
    doc.circle(x + 3 * xFlip, y + 3 * yFlip, 0.8, "FD");
  };
  drawCornerDeco(18, 18, 1, 1);
  drawCornerDeco(PAGE_WIDTH - 18, 18, -1, 1);
  drawCornerDeco(18, PAGE_HEIGHT - 18, 1, -1);
  drawCornerDeco(PAGE_WIDTH - 18, PAGE_HEIGHT - 18, -1, -1);

  // 3. PHẦN ĐẦU CHỨNG NHẬN (HEADER)
  // Huy hiệu / Crest trang trọng
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setFillColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.roundedRect(148.5 - 35, 20, 70, 7, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text("OFFICIAL BLOCKCHAIN REGISTRY", 148.5, 24.8, { align: "center" });

  // Tiêu đề chính
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("ASSETCHAIN DIGITAL CERTIFICATE OF OWNERSHIP", 148.5, 36, { align: "center" });

  // Phụ đề
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text(
    "PROOF OF EXISTENCE & IMMUTABLE PROVENANCE ON ETHEREUM EVM",
    148.5,
    42.5,
    { align: "center" }
  );

  // Đường kẻ chia tiêu đề cách điệu
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.5);
  doc.line(60, 46, 140, 46);
  doc.circle(148.5, 46, 1.2, "FD");
  doc.line(157, 46, 237, 46);

  // 4. NỘI DUNG CHỨNG NHẬN (BODY BLOCK)
  const leftX = 26;
  let cursorY = 56;

  // Lời tuyên ngôn chứng nhận
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  doc.text(
    "This document solemnly certifies that the digital intellectual creation described below has been cryptographically",
    148.5,
    cursorY,
    { align: "center" }
  );
  doc.text(
    "verified, timestamped, and permanently anchored onto the decentralized EVM ledger under ERC-721 standards.",
    148.5,
    cursorY + 5,
    { align: "center" }
  );

  cursorY += 15;

  // Khung chứa thông tin chính
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX - 4, cursorY - 4, 172, 85, 2, 2, "FD");

  // Mục 1: Số hiệu chứng chỉ
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("CERTIFICATE NUMBER:", leftX, cursorY + 3);

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text(data.certificateNumber, leftX + 46, cursorY + 3);

  // Mục 2: Tên tác phẩm
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("ASSET TITLE:", leftX, cursorY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  const titleDisplay =
    data.assetTitle.length > 40 ? data.assetTitle.slice(0, 37) + "..." : data.assetTitle;
  doc.text(titleDisplay, leftX + 46, cursorY + 12);

  // Mục 3: Tác giả / Chủ sở hữu
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("CREATOR WALLET:", leftX, cursorY + 21);

  doc.setFont("courier", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  doc.text(data.creatorWallet, leftX + 46, cursorY + 21);

  if (data.creatorName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`(Author: ${data.creatorName})`, leftX + 46, cursorY + 26);
  }

  // Mục 4: VÙNG MÃ BĂM VÂN TAY SỐ SHA-256 (NỔI BẬT)
  const hashBoxY = cursorY + 30;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftX, hashBoxY, 164, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("CRYPTOGRAPHIC FINGERPRINT (SHA-256 PROOF OF EXISTENCE):", leftX + 3, hashBoxY + 4.5);

  doc.setFont("courier", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text(data.fileHash, leftX + 3, hashBoxY + 10.5);

  // Mục 5: Thông số Blockchain
  const bcY = hashBoxY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("TOKEN ID (ERC-721):", leftX, bcY);

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text(data.tokenId !== undefined && data.tokenId !== null ? `#${data.tokenId}` : "#Pending On-Chain", leftX + 46, bcY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("TRANSACTION HASH:", leftX, bcY + 8);

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  const txText = data.txHash
    ? data.txHash.length > 36
      ? data.txHash.slice(0, 36) + "..."
      : data.txHash
    : "Registered locally (Awaiting on-chain mint)";
  doc.text(txText, leftX + 46, bcY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("TIMESTAMP RECORDED:", leftX, bcY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  doc.text(data.issuedAt, leftX + 46, bcY + 16);

  // 5. CỘT PHẢI: MÃ QR ĐỘNG & SEAL DẤU BẢO CHỨNG
  const rightBoxX = 202;
  const qrBoxY = 67;

  // Khung bao mã QR
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.8);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightBoxX, qrBoxY, 68, 85, 2, 2, "FD");

  // Ảnh mã QR độ phân giải cao
  doc.addImage(qrDataUrl, "PNG", rightBoxX + 9, qrBoxY + 6, 50, 50);

  // Chú thích dưới mã QR
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("1-CLICK VERIFICATION", rightBoxX + 34, qrBoxY + 62, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Scan with camera or drop into", rightBoxX + 34, qrBoxY + 67, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text("assetchain/verify", rightBoxX + 34, qrBoxY + 71.5, { align: "center" });

  // Dấu mộc số giả lập (Official Seal Graphic)
  doc.setDrawColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.setLineWidth(0.5);
  doc.circle(rightBoxX + 34, qrBoxY + 77, 4.5);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("VERIFIED", rightBoxX + 34, qrBoxY + 78, { align: "center" });

  // 6. CHÂN CHỨNG NHẬN (FOOTER & SIGNATURES)
  const footerY = 166;

  // Chữ ký bên trái: Tác giả
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("REGISTERED CREATOR SIGNATURE", 60, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(30, footerY + 12, 90, footerY + 12);
  doc.setFont("courier", "italic");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text("[Cryptographically Signed via Web3]", 60, footerY + 16, { align: "center" });

  // Con dấu hội đồng ở giữa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("ADMINISTRATIVE BOARD APPROVAL", 148.5, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.line(118.5, footerY + 12, 178.5, footerY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(data.issuedBy || "AssetChain Council Authenticated", 148.5, footerY + 16, { align: "center" });

  // Hệ thống mạng bên phải
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("DISTRIBUTED NETWORK CONSENSUS", 236, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.line(206, footerY + 12, 266, footerY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Hardhat Local EVM (Chain ID 31337)", 236, footerY + 16, { align: "center" });

  // Ghi chú học thuật dưới cùng
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "AssetChain Project • Department of Network & Distributed Systems • Proof of Existence Protocol",
    148.5,
    196,
    { align: "center" }
  );

  // 7. WATERMARK THU HỒI NẾU TÀI SẢN BỊ REVOKED
  if (data.isRevoked) {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(225, 29, 72); // Rose/Red
    doc.text("REVOKED / ĐÃ THU HỒI", 148.5, 115, {
      align: "center",
      angle: 25,
    });
    doc.restoreGraphicsState();
  }

  return doc;
}

/**
 * Trả về mảng byte Buffer từ tài liệu PDF (hỗ trợ lưu file hoặc trả về API Response)
 */
export async function generateCertificateBuffer(data: CertificateData): Promise<Buffer> {
  const doc = await generateCertificatePDF(data);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Lưu trực tiếp file PDF chứng chỉ vào thư mục public/certificates/
 */
export async function saveCertificatePDF(
  certificateNumber: string,
  data: CertificateData
): Promise<string> {
  const certDir = path.join(process.cwd(), "public", "certificates");
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const fileName = `${certificateNumber}.pdf`;
  const filePath = path.join(certDir, fileName);
  const buffer = await generateCertificateBuffer(data);

  fs.writeFileSync(filePath, buffer);
  return `/certificates/${fileName}`;
}

