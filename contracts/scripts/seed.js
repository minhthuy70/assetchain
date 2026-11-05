const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { jsPDF } = require("jspdf");
const QRCode = require("qrcode");

const prisma = new PrismaClient();

// ==========================================
// 1. TIỆN ÍCH VẼ CANVAS & XUẤT ẢNH PNG HỢP LỆ
// ==========================================
class SimpleCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rowSize = 1 + width * 3;
    this.data = Buffer.alloc(this.rowSize * height);
    for (let y = 0; y < height; y++) {
      this.data[y * this.rowSize] = 0; // PNG filter type 0: None
    }
  }

  setPixel(x, y, r, g, b) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const offset = y * this.rowSize + 1 + x * 3;
    this.data[offset] = Math.max(0, Math.min(255, r));
    this.data[offset + 1] = Math.max(0, Math.min(255, g));
    this.data[offset + 2] = Math.max(0, Math.min(255, b));
  }

  gradientVertical(c1, c2) {
    for (let y = 0; y < this.height; y++) {
      const t = y / this.height;
      const r = Math.round(c1[0] * (1 - t) + c2[0] * t);
      const g = Math.round(c1[1] * (1 - t) + c2[1] * t);
      const b = Math.round(c1[2] * (1 - t) + c2[2] * t);
      for (let x = 0; x < this.width; x++) {
        this.setPixel(x, y, r, g, b);
      }
    }
  }

  fillRect(x0, y0, w, h, c) {
    const startX = Math.max(0, x0);
    const endX = Math.min(this.width, x0 + w);
    const startY = Math.max(0, y0);
    const endY = Math.min(this.height, y0 + h);
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        this.setPixel(x, y, c[0], c[1], c[2]);
      }
    }
  }

  strokeRect(x0, y0, w, h, thickness, c) {
    this.fillRect(x0, y0, w, thickness, c);
    this.fillRect(x0, y0 + h - thickness, w, thickness, c);
    this.fillRect(x0, y0, thickness, h, c);
    this.fillRect(x0 + w - thickness, y0, thickness, h, c);
  }

  fillCircle(cx, cy, r, c) {
    const minX = Math.max(0, cx - r);
    const maxX = Math.min(this.width - 1, cx + r);
    const minY = Math.max(0, cy - r);
    const maxY = Math.min(this.height - 1, cy + r);
    const r2 = r * r;
    for (let y = minY; y <= maxY; y++) {
      const dy2 = (y - cy) * (y - cy);
      for (let x = minX; x <= maxX; x++) {
        if ((x - cx) * (x - cx) + dy2 <= r2) {
          this.setPixel(x, y, c[0], c[1], c[2]);
        }
      }
    }
  }

  toPngBuffer() {
    const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    function crc32(buf) {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
      }
      return (c ^ 0xffffffff) >>> 0;
    }

    function makeChunk(type, data) {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const typeBuf = Buffer.from(type, "ascii");
      const crcBuf = Buffer.concat([typeBuf, data]);
      const crc = crc32(crcBuf);
      const crcOut = Buffer.alloc(4);
      crcOut.writeUInt32BE(crc, 0);
      return Buffer.concat([len, typeBuf, data, crcOut]);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.width, 0);
    ihdr.writeUInt32BE(this.height, 4);
    ihdr[8] = 8; // 8-bit depth
    ihdr[9] = 2; // Color type 2: RGB
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const idat = zlib.deflateSync(this.data);
    return Buffer.concat([
      header,
      makeChunk("IHDR", ihdr),
      makeChunk("IDAT", idat),
      makeChunk("IEND", Buffer.alloc(0)),
    ]);
  }
}

// ==========================================
// 2. SINH CÁC TÁC PHẨM ĐỒ HỌA MẪU CHUẨN ĐẸP
// ==========================================
function generateArtworkBuffers() {
  const artworks = {};

  // 1. Sen Vàng Triều Nguyễn (Nền Navy hoàng gia, khung vàng kép, hoa sen tỏa hào quang)
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([15, 23, 42], [30, 58, 100]); // Navy sang trọng
    canvas.strokeRect(16, 16, 568, 388, 4, [212, 175, 55]); // Khung vàng
    canvas.strokeRect(24, 24, 552, 372, 1, [236, 224, 196]); // Chỉ viền trong

    // Hào quang vàng trung tâm
    canvas.fillCircle(300, 200, 90, [60, 50, 20]);
    canvas.fillCircle(300, 200, 65, [140, 110, 35]);
    canvas.fillCircle(300, 200, 45, [212, 175, 55]);

    // Các cánh hoa sen tỏa đều
    const petals = [
      [300, 140, 22],
      [300, 260, 22],
      [240, 200, 22],
      [360, 200, 22],
      [255, 155, 18],
      [345, 155, 18],
      [255, 245, 18],
      [345, 245, 18],
    ];
    for (const [px, py, pr] of petals) {
      canvas.fillCircle(px, py, pr, [245, 215, 110]);
    }
    // Tâm nhụy sen
    canvas.fillCircle(300, 200, 18, [255, 245, 200]);

    // Băng rôn huy hiệu đáy
    canvas.fillRect(180, 330, 240, 36, [15, 23, 42]);
    canvas.strokeRect(180, 330, 240, 36, 1, [212, 175, 55]);

    artworks.senVangOriginal = canvas.toPngBuffer();

    // Bản fake: Thay đổi đúng 1 pixel màu tại tọa độ (300, 200)
    canvas.setPixel(300, 200, 254, 245, 200); // 255 -> 254 (mắt thường không thể thấy)
    artworks.senVangFake = canvas.toPngBuffer();
  }

  // 2. Cyberpunk City 2077 (Nền tím tối, lưới perspective neon cyan và hồng)
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([10, 5, 25], [30, 10, 55]);
    canvas.strokeRect(16, 16, 568, 388, 3, [0, 240, 255]); // Viền Cyan Neon

    // Mặt trời Cyberpunk
    canvas.fillCircle(300, 180, 60, [255, 0, 128]);

    // Các tòa cao ốc Cyberpunk skyline
    const buildings = [
      [60, 190, 50, 180, [15, 20, 45]],
      [120, 140, 60, 230, [25, 15, 50]],
      [190, 210, 45, 160, [18, 25, 55]],
      [245, 120, 70, 250, [10, 30, 60]],
      [325, 160, 55, 210, [25, 20, 50]],
      [390, 100, 65, 270, [15, 25, 55]],
      [465, 180, 75, 190, [20, 15, 45]],
    ];
    for (const [bx, by, bw, bh, bc] of buildings) {
      canvas.fillRect(bx, by, bw, bh, bc);
      canvas.strokeRect(bx, by, bw, bh, 1, [0, 240, 255]);
    }

    // Lưới perspective sàn
    canvas.fillRect(40, 360, 520, 30, [5, 15, 30]);
    canvas.strokeRect(40, 360, 520, 30, 1, [255, 0, 128]);

    artworks.cyberpunk = canvas.toPngBuffer();
  }

  // 3. Chiều Thu Phố Cổ Hà Nội (Nền hoàng hôn vàng cam ấm áp, đèn lồng, mái ngói)
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([70, 30, 10], [160, 90, 30]); // Nắng hoàng hôn
    canvas.strokeRect(16, 16, 568, 388, 3, [245, 166, 35]);

    // Mặt trời lặn sau mái ngói
    canvas.fillCircle(420, 150, 50, [255, 210, 100]);

    // Mái ngói rêu phong
    canvas.fillRect(50, 260, 500, 110, [40, 25, 15]);
    canvas.fillRect(70, 230, 220, 40, [60, 35, 20]);
    canvas.fillRect(310, 210, 220, 60, [50, 30, 18]);

    // Dãy đèn lồng đỏ ấm
    const lanterns = [
      [140, 250],
      [200, 255],
      [360, 240],
      [420, 245],
      [480, 240],
    ];
    for (const [lx, ly] of lanterns) {
      canvas.fillCircle(lx, ly, 12, [220, 40, 30]);
      canvas.fillCircle(lx, ly, 6, [255, 200, 80]);
    }

    artworks.phoCoHanoi = canvas.toPngBuffer();
  }

  // 4. Tranh Sao Chép Sơn Dầu Phong Cảnh Mùa Thu
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([50, 45, 35], [90, 75, 45]);
    canvas.strokeRect(16, 16, 568, 388, 3, [160, 130, 80]);

    // Các mảng màu sơn dầu
    canvas.fillCircle(200, 180, 70, [130, 60, 30]);
    canvas.fillCircle(380, 200, 80, [150, 90, 40]);
    canvas.fillCircle(290, 240, 90, [70, 80, 40]);
    canvas.fillRect(60, 290, 480, 80, [40, 35, 25]);

    artworks.tranhSaoChep = canvas.toPngBuffer();
  }

  // 5. Chân Dung AI Generative V5 (Nền xanh đen không gian, vòng hào quang nơ-ron)
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([15, 15, 35], [35, 20, 60]);
    canvas.strokeRect(16, 16, 568, 388, 3, [168, 85, 247]); // Tím Neon

    // Vòng tròn thần kinh số AI
    canvas.fillCircle(300, 200, 85, [50, 30, 90]);
    canvas.fillCircle(300, 200, 60, [90, 50, 140]);
    canvas.fillCircle(300, 200, 35, [168, 85, 247]);
    canvas.fillCircle(300, 200, 15, [255, 255, 255]);

    // Các điểm nút mạng nơ-ron
    const nodes = [
      [180, 140],
      [420, 140],
      [180, 260],
      [420, 260],
      [220, 200],
      [380, 200],
    ];
    for (const [nx, ny] of nodes) {
      canvas.fillCircle(nx, ny, 10, [0, 240, 255]);
    }

    artworks.aiPortrait = canvas.toPngBuffer();
  }

  // 6. Nhận Diện Thương Hiệu TechCorp 2026 (Nền đen slate, biểu tượng ngọc lục bảo)
  {
    const canvas = new SimpleCanvas(600, 420);
    canvas.gradientVertical([15, 23, 42], [10, 15, 30]);
    canvas.strokeRect(16, 16, 568, 388, 3, [16, 185, 129]); // Ngọc Lục Bảo

    // Logo TechCorp hình khiên lục giác
    canvas.fillCircle(300, 180, 70, [6, 78, 59]);
    canvas.fillCircle(300, 180, 50, [16, 185, 129]);
    canvas.fillCircle(300, 180, 25, [255, 255, 255]);

    // Băng chữ định danh
    canvas.fillRect(160, 290, 280, 45, [15, 23, 42]);
    canvas.strokeRect(160, 290, 280, 45, 1, [16, 185, 129]);

    artworks.techCorp = canvas.toPngBuffer();
  }

  return artworks;
}

// ==========================================
// 3. SINH FILE PDF E-CERTIFICATE CHUẨN ĐỒ HỌA
// ==========================================
async function generateAndSavePDF(certData, targetFilePath) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const PAGE_WIDTH = 297;
  const PAGE_HEIGHT = 210;

  // Bảng mã màu
  const COLOR_NAVY = { r: 24, g: 43, b: 73 };
  const COLOR_GOLD = { r: 197, g: 160, b: 89 };
  const COLOR_GOLD_LIGHT = { r: 236, g: 224, b: 196 };
  const COLOR_DARK_GRAY = { r: 51, g: 65, b: 85 };
  const COLOR_LIGHT_BG = { r: 248, g: 250, b: 252 };

  // Nền giấy
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  doc.setFillColor(COLOR_LIGHT_BG.r, COLOR_LIGHT_BG.g, COLOR_LIGHT_BG.b);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28, "F");

  // Khung viền đôi sang trọng
  doc.setDrawColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.setLineWidth(2.2);
  doc.rect(10, 10, PAGE_WIDTH - 20, PAGE_HEIGHT - 20);

  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.8);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28);

  doc.setDrawColor(COLOR_GOLD_LIGHT.r, COLOR_GOLD_LIGHT.g, COLOR_GOLD_LIGHT.b);
  doc.setLineWidth(0.3);
  doc.rect(16, 16, PAGE_WIDTH - 32, PAGE_HEIGHT - 32);

  // Góc trang trí
  const drawCornerDeco = (x, y, xFlip, yFlip) => {
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

  // HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text("ASSETCHAIN DECENTRALIZED PROTOCOL", 148.5, 28, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("CERTIFICATE OF DIGITAL OWNERSHIP", 148.5, 38, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  doc.text(
    "Minh chứng Bản quyền Tác phẩm Số & Xác thực Bất biến trên Blockchain EVM",
    148.5,
    45,
    { align: "center" }
  );

  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.6);
  doc.line(100, 48, 197, 48);

  // SỐ HIỆU CHỨNG NHẬN
  doc.setFillColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.roundedRect(100, 52, 97, 8, 2, 2, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text(`CERTIFICATE ID: ${certData.certificateNumber}`, 148.5, 57.5, { align: "center" });

  // THÔNG TIN TÁC PHẨM
  const leftX = 26;
  const contentY = 70;
  const lineSpacing = 8.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("THÔNG TIN TÁC PHẨM BẢN QUYỀN:", leftX, contentY);

  const drawField = (label, value, yPos, isMono = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
    doc.text(`${label}:`, leftX, yPos);

    doc.setFont(isMono ? "courier" : "helvetica", isMono ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
    doc.text(String(value || "N/A"), leftX + 48, yPos);
  };

  drawField("Tên Tác Phẩm", certData.assetTitle, contentY + lineSpacing);
  drawField("Tác Giả / Người Nộp", certData.creatorName || "Nghệ sĩ Đã Xác Minh", contentY + lineSpacing * 2);
  drawField("Địa Chỉ Ví Web3", certData.creatorWallet, contentY + lineSpacing * 3, true);
  drawField("Token ID (ERC-721)", certData.tokenId ? `#${certData.tokenId}` : "Chờ kích hoạt", contentY + lineSpacing * 4, true);
  drawField("Transaction Hash", certData.txHash || "0x7b1c4e9f...8a2b3d6c", contentY + lineSpacing * 5, true);
  drawField("Thời Gian Xác Thực", certData.issuedAt, contentY + lineSpacing * 6);

  // KHUNG SHA-256
  const hashBoxY = contentY + lineSpacing * 7.2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftX, hashBoxY, 160, 16, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftX, hashBoxY, 160, 16, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("MÃ VÂN TAY SỐ BẤT BIẾN (SHA-256 HASH - 64 KÝ TỰ HEX):", leftX + 4, hashBoxY + 5);

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(certData.fileHash, leftX + 4, hashBoxY + 11);

  // MÃ QR ĐỘNG BÊN PHẢI
  const qrX = 212;
  const qrY = 70;
  const qrSize = 58;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 22, 3, 3, "F");
  doc.setDrawColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.setLineWidth(0.6);
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 22, 3, 3, "D");

  const verifyUrl = `http://localhost:3000/verify?hash=${certData.fileHash}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#182B49", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("QUÉT MÃ XÁC THỰC", qrX + qrSize / 2, qrY + qrSize + 5, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(COLOR_DARK_GRAY.r, COLOR_DARK_GRAY.g, COLOR_DARK_GRAY.b);
  doc.text("Tra cứu 1-Click • 0 Gas", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" });

  // CHỮ KÝ VÀ DẤU HỘI ĐỒNG
  const footerY = 168;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("REGISTERED CREATOR SIGNATURE", 60, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(30, footerY + 10, 90, footerY + 10);
  doc.setFont("courier", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b);
  doc.text("[Signed Cryptographically via Web3]", 60, footerY + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("ADMINISTRATIVE BOARD APPROVAL", 148.5, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.line(118.5, footerY + 10, 178.5, footerY + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(certData.issuedBy || "AssetChain Council Authenticated", 148.5, footerY + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_NAVY.r, COLOR_NAVY.g, COLOR_NAVY.b);
  doc.text("DISTRIBUTED NETWORK CONSENSUS", 236, footerY, { align: "center" });
  doc.setDrawColor(203, 213, 225);
  doc.line(206, footerY + 10, 266, footerY + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Hardhat Local EVM (Chain ID 31337)", 236, footerY + 14, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "AssetChain Project • Department of Network & Distributed Systems • Proof of Existence Protocol",
    148.5,
    195,
    { align: "center" }
  );

  // WATERMARK THU HỒI NẾU TÀI SẢN BỊ REVOKED
  if (certData.isRevoked) {
    doc.saveGraphicsState();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(225, 29, 72); // Đỏ cảnh báo
    doc.text("REVOKED / ĐÃ THU HỒI", 148.5, 115, {
      align: "center",
      angle: 25,
    });
    doc.restoreGraphicsState();
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(targetFilePath, pdfBuffer);
}

// ==========================================
// 4. HÀM MAIN SEED DỮ LIỆU TOÀN DIỆN
// ==========================================
async function main() {
  console.log("============================================================");
  console.log("🚀 BẮT ĐẦU KHỞI TẠO BỘ DỮ LIỆU MẪU ĐẦY ĐỦ CHO ASSETCHAIN...");
  console.log("============================================================");

  // 1. Khởi tạo thư mục cần thiết
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const certsDir = path.join(process.cwd(), "public", "certificates");
  const demoDir = path.join(process.cwd(), "public", "demo");

  [uploadsDir, certsDir, demoDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // 2. Tạo hình ảnh đồ họa nhị phân thật & tính hash SHA-256 chuẩn
  console.log("🎨 Đang sinh các tác phẩm mỹ thuật số chuẩn định dạng PNG...");
  const artworks = generateArtworkBuffers();

  const fileMap = {
    senVang: {
      path: path.join(uploadsDir, "sen_vang.png"),
      buffer: artworks.senVangOriginal,
      name: "sen_vang.png",
      hash: crypto.createHash("sha256").update(artworks.senVangOriginal).digest("hex"),
    },
    cyberpunk: {
      path: path.join(uploadsDir, "cyberpunk_city.png"),
      buffer: artworks.cyberpunk,
      name: "cyberpunk_city.png",
      hash: crypto.createHash("sha256").update(artworks.cyberpunk).digest("hex"),
    },
    phoCo: {
      path: path.join(uploadsDir, "pho_co_hanoi.png"),
      buffer: artworks.phoCoHanoi,
      name: "pho_co_hanoi.png",
      hash: crypto.createHash("sha256").update(artworks.phoCoHanoi).digest("hex"),
    },
    tranhSaoChep: {
      path: path.join(uploadsDir, "tranh_sao_chep.png"),
      buffer: artworks.tranhSaoChep,
      name: "tranh_sao_chep.png",
      hash: crypto.createHash("sha256").update(artworks.tranhSaoChep).digest("hex"),
    },
    aiPortrait: {
      path: path.join(uploadsDir, "ai_portrait.png"),
      buffer: artworks.aiPortrait,
      name: "ai_portrait.png",
      hash: crypto.createHash("sha256").update(artworks.aiPortrait).digest("hex"),
    },
    techCorp: {
      path: path.join(uploadsDir, "brand_techcorp.png"),
      buffer: artworks.techCorp,
      name: "brand_techcorp.png",
      hash: crypto.createHash("sha256").update(artworks.techCorp).digest("hex"),
    },
  };

  // Lưu file ảnh vật lý vào public/uploads
  for (const key of Object.keys(fileMap)) {
    fs.writeFileSync(fileMap[key].path, fileMap[key].buffer);
  }

  // Lưu file đối chứng trình diễn trong public/demo
  const demoOriginalPath = path.join(demoDir, "Sen_Vang_Original.png");
  const demoFakePath = path.join(demoDir, "Sen_Vang_Fake.png");
  fs.writeFileSync(demoOriginalPath, artworks.senVangOriginal);
  fs.writeFileSync(demoFakePath, artworks.senVangFake);

  const demoOriginalHash = fileMap.senVang.hash;
  const demoFakeHash = crypto.createHash("sha256").update(artworks.senVangFake).digest("hex");

  console.log("✅ Đã ghi nhận các file ảnh vật lý vào public/uploads và public/demo:");
  console.log(`   - Tác phẩm gốc Sen Vàng: SHA-256 = ${demoOriginalHash}`);
  console.log(`   - Tác phẩm sửa 1 bit Fake: SHA-256 = ${demoFakeHash}`);

  // 3. Khởi tạo 4 tài khoản người dùng mẫu
  console.log("\n👥 Đang khởi tạo các tài khoản người dùng thử nghiệm...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@assetchain.local" },
    update: {},
    create: {
      email: "admin@assetchain.local",
      passwordHash: "demo_admin_hashed_password_2026",
      fullName: "Hội Đồng Quản Trị (Admin)",
      role: "ADMIN",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat #0
    },
  });

  const creator1 = await prisma.user.upsert({
    where: { email: "creator@assetchain.local" },
    update: {},
    create: {
      email: "creator@assetchain.local",
      passwordHash: "demo_creator_hashed_password_2026",
      fullName: "Nguyễn Văn Nghệ Sĩ",
      role: "CREATOR",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat #1
    },
  });

  const creator2 = await prisma.user.upsert({
    where: { email: "designer@assetchain.local" },
    update: {},
    create: {
      email: "designer@assetchain.local",
      passwordHash: "demo_designer_hashed_password_2026",
      fullName: "Trần Thị Designer",
      role: "CREATOR",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat #2
    },
  });

  const collector = await prisma.user.upsert({
    where: { email: "collector@assetchain.local" },
    update: {},
    create: {
      email: "collector@assetchain.local",
      passwordHash: "demo_collector_hashed_password_2026",
      fullName: "Lê Hoàng Nhà Sưu Tập",
      role: "CREATOR",
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat #3
    },
  });

  console.log("✅ Đã khởi tạo 4 tài khoản: Admin, Nghệ sĩ, Designer, Nhà sưu tập");

  // 4. Dọn dẹp và khởi tạo danh mục tác phẩm mẫu
  console.log("\n🖼️ Đang làm sạch và nạp danh mục tác phẩm mẫu vào SQLite...");
  await prisma.ownershipHistory.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.asset.deleteMany();

  // Asset 1: REGISTERED (Token ID 1, E-Cert 0001)
  const asset1 = await prisma.asset.upsert({
    where: { fileHash: fileMap.senVang.hash },
    update: {},
    create: {
      title: "Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn",
      description: "Tác phẩm tranh nghệ thuật số minh họa hoa sen cung đình Huế, bảo vệ tác quyền bất biến trên Blockchain EVM.",
      category: "ART",
      filePath: "/uploads/sen_vang.png",
      fileName: fileMap.senVang.name,
      fileHash: fileMap.senVang.hash,
      fileSize: fileMap.senVang.buffer.length,
      mimeType: "image/png",
      status: "REGISTERED",
      tokenId: 1,
      txHash: "0x7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d",
      blockNumber: 1024,
      registeredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      creatorId: creator1.id,
      currentOwnerWallet: creator1.walletAddress,
    },
  });

  const cert1Number = "CERT-2026-0001";
  await prisma.certificate.upsert({
    where: { assetId: asset1.id },
    update: {},
    create: {
      assetId: asset1.id,
      certificateNumber: cert1Number,
      verifyUrl: `http://localhost:3000/verify?hash=${fileMap.senVang.hash}`,
      issuedBy: "AssetChain Admin Council",
      pdfPath: `/certificates/${cert1Number}.pdf`,
    },
  });

  await prisma.ownershipHistory.upsert({
    where: { txHash: "0x7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d" },
    update: {},
    create: {
      assetId: asset1.id,
      tokenId: 1,
      fromWallet: "0x0000000000000000000000000000000000000000",
      toWallet: creator1.walletAddress,
      txHash: "0x7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d",
      blockNumber: 1024,
      eventType: "MINT",
    },
  });

  await generateAndSavePDF(
    {
      certificateNumber: cert1Number,
      assetTitle: asset1.title,
      fileHash: asset1.fileHash,
      creatorWallet: creator1.walletAddress,
      creatorName: creator1.fullName,
      tokenId: 1,
      txHash: asset1.txHash,
      issuedAt: "15 Tháng 1, 2026",
      issuedBy: "AssetChain Admin Council",
    },
    path.join(certsDir, `${cert1Number}.pdf`)
  );

  // Asset 2: PENDING_APPROVAL (Chờ Admin duyệt trực tiếp trong demo)
  const asset2 = await prisma.asset.upsert({
    where: { fileHash: fileMap.cyberpunk.hash },
    update: {},
    create: {
      title: "Bản Vẽ Thiết Kế Đồ Họa 3D Cyberpunk City 2077",
      description: "Mô hình kiến trúc 3D không gian tương lai viễn tưởng Cyberpunk với hệ thống ánh sáng neon động phức hợp.",
      category: "DESIGN",
      filePath: "/uploads/cyberpunk_city.png",
      fileName: fileMap.cyberpunk.name,
      fileHash: fileMap.cyberpunk.hash,
      fileSize: fileMap.cyberpunk.buffer.length,
      mimeType: "image/png",
      status: "PENDING_APPROVAL",
      creatorId: creator2.id,
      currentOwnerWallet: creator2.walletAddress,
    },
  });

  // Asset 3: APPROVED (Đã duyệt, cấp E-Cert 0002, sẵn sàng cho Creator bấm Mint on-chain)
  const asset3 = await prisma.asset.upsert({
    where: { fileHash: fileMap.phoCo.hash },
    update: {},
    create: {
      title: "Nhiếp Ảnh Số Chiều Thu Phố Cổ Hà Nội",
      description: "Khoảnh khắc ánh sáng hoàng hôn vàng buông xuống mái ngói rêu phong phố Tạ Hiện, độ phân giải RAW.",
      category: "PHOTOGRAPHY",
      filePath: "/uploads/pho_co_hanoi.png",
      fileName: fileMap.phoCo.name,
      fileHash: fileMap.phoCo.hash,
      fileSize: fileMap.phoCo.buffer.length,
      mimeType: "image/png",
      status: "APPROVED",
      creatorId: creator1.id,
      currentOwnerWallet: creator1.walletAddress,
    },
  });

  const cert2Number = "CERT-2026-0002";
  await prisma.certificate.upsert({
    where: { assetId: asset3.id },
    update: {},
    create: {
      assetId: asset3.id,
      certificateNumber: cert2Number,
      verifyUrl: `http://localhost:3000/verify?hash=${fileMap.phoCo.hash}`,
      issuedBy: "AssetChain Admin Council",
      pdfPath: `/certificates/${cert2Number}.pdf`,
    },
  });

  await generateAndSavePDF(
    {
      certificateNumber: cert2Number,
      assetTitle: asset3.title,
      fileHash: asset3.fileHash,
      creatorWallet: creator1.walletAddress,
      creatorName: creator1.fullName,
      issuedAt: "20 Tháng 1, 2026",
      issuedBy: "AssetChain Admin Council",
    },
    path.join(certsDir, `${cert2Number}.pdf`)
  );

  // Asset 4: REJECTED (Minh họa từ chối có lý do)
  const asset4 = await prisma.asset.upsert({
    where: { fileHash: fileMap.tranhSaoChep.hash },
    update: {},
    create: {
      title: "Bộ Tranh Trích Xuất Sơn Dầu Phong Cảnh Mùa Thu",
      description: "Tác phẩm tranh phong cảnh thiên nhiên mùa thu phong cách phục hưng.",
      category: "ART",
      filePath: "/uploads/tranh_sao_chep.png",
      fileName: fileMap.tranhSaoChep.name,
      fileHash: fileMap.tranhSaoChep.hash,
      fileSize: fileMap.tranhSaoChep.buffer.length,
      mimeType: "image/png",
      status: "REJECTED",
      rejectionReason: "Hội đồng thẩm định phát hiện tác phẩm trùng khớp 98% với bản vẽ có sẵn trên Pinterest chưa được mua bản quyền phân phối.",
      creatorId: creator1.id,
      currentOwnerWallet: creator1.walletAddress,
    },
  });

  // Asset 5: REVOKED (Token ID 2, E-Cert 0003 có watermark chìm ĐỎ)
  const asset5 = await prisma.asset.upsert({
    where: { fileHash: fileMap.aiPortrait.hash },
    update: {},
    create: {
      title: "Bộ Ảnh Nghệ Thuật Chân Dung AI Generative Model V5",
      description: "Tác phẩm chân dung số tạo bởi mạng nơ-ron đối nghịch GAN kết hợp kỹ thuật khuếch tán hình ảnh.",
      category: "ART",
      filePath: "/uploads/ai_portrait.png",
      fileName: fileMap.aiPortrait.name,
      fileHash: fileMap.aiPortrait.hash,
      fileSize: fileMap.aiPortrait.buffer.length,
      mimeType: "image/png",
      status: "REVOKED",
      tokenId: 2,
      txHash: "0x8e2f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c",
      blockNumber: 1038,
      registeredAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      rejectionReason: "Quyền sở hữu bị hủy bỏ theo Quyết định Trọng tài Bản quyền Số 45/2026 do tác giả vi phạm cam kết sử dụng dữ liệu huấn luyện thương mại không phép.",
      creatorId: creator1.id,
      currentOwnerWallet: creator1.walletAddress,
    },
  });

  const cert3Number = "CERT-2026-0003";
  await prisma.certificate.upsert({
    where: { assetId: asset5.id },
    update: {},
    create: {
      assetId: asset5.id,
      certificateNumber: cert3Number,
      verifyUrl: `http://localhost:3000/verify?hash=${fileMap.aiPortrait.hash}`,
      issuedBy: "AssetChain Admin Council",
      pdfPath: `/certificates/${cert3Number}.pdf`,
    },
  });

  await prisma.ownershipHistory.upsert({
    where: { txHash: "0x8e2f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c" },
    update: {},
    create: {
      assetId: asset5.id,
      tokenId: 2,
      fromWallet: "0x0000000000000000000000000000000000000000",
      toWallet: creator1.walletAddress,
      txHash: "0x8e2f1a4b7d0c3e6f9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c",
      blockNumber: 1038,
      eventType: "MINT",
    },
  });

  await generateAndSavePDF(
    {
      certificateNumber: cert3Number,
      assetTitle: asset5.title,
      fileHash: asset5.fileHash,
      creatorWallet: creator1.walletAddress,
      creatorName: creator1.fullName,
      tokenId: 2,
      txHash: asset5.txHash,
      issuedAt: "10 Tháng 1, 2026",
      issuedBy: "AssetChain Admin Council",
      isRevoked: true,
      revocationReason: asset5.rejectionReason,
    },
    path.join(certsDir, `${cert3Number}.pdf`)
  );

  // Asset 6: REGISTERED (Token ID 3, E-Cert 0004)
  const asset6 = await prisma.asset.upsert({
    where: { fileHash: fileMap.techCorp.hash },
    update: {},
    create: {
      title: "Hồ Sơ Bản Quyền Nhận Diện Thương Hiệu TechCorp 2026",
      description: "Bộ quy chuẩn thiết kế thương hiệu số hoàn chỉnh: Logo, Typography, Bảng mã màu Pantone và Guidelines hệ thống.",
      category: "DOCUMENT",
      filePath: "/uploads/brand_techcorp.png",
      fileName: fileMap.techCorp.name,
      fileHash: fileMap.techCorp.hash,
      fileSize: fileMap.techCorp.buffer.length,
      mimeType: "image/png",
      status: "REGISTERED",
      tokenId: 3,
      txHash: "0x9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f",
      blockNumber: 1045,
      registeredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      creatorId: creator2.id,
      currentOwnerWallet: creator2.walletAddress,
    },
  });

  const cert4Number = "CERT-2026-0004";
  await prisma.certificate.upsert({
    where: { assetId: asset6.id },
    update: {},
    create: {
      assetId: asset6.id,
      certificateNumber: cert4Number,
      verifyUrl: `http://localhost:3000/verify?hash=${fileMap.techCorp.hash}`,
      issuedBy: "AssetChain Admin Council",
      pdfPath: `/certificates/${cert4Number}.pdf`,
    },
  });

  await prisma.ownershipHistory.upsert({
    where: { txHash: "0x9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f" },
    update: {},
    create: {
      assetId: asset6.id,
      tokenId: 3,
      fromWallet: "0x0000000000000000000000000000000000000000",
      toWallet: creator2.walletAddress,
      txHash: "0x9a2b5d8c1e4f7a0b3d6c9e2f5a8b1c4d7b1c4e9f8a2b3d6c5e8f1a4b7d0c3e6f",
      blockNumber: 1045,
      eventType: "MINT",
    },
  });

  await generateAndSavePDF(
    {
      certificateNumber: cert4Number,
      assetTitle: asset6.title,
      fileHash: asset6.fileHash,
      creatorWallet: creator2.walletAddress,
      creatorName: creator2.fullName,
      tokenId: 3,
      txHash: asset6.txHash,
      issuedAt: "22 Tháng 1, 2026",
      issuedBy: "AssetChain Admin Council",
    },
    path.join(certsDir, `${cert4Number}.pdf`)
  );

  console.log("✅ Đã nạp thành công 6 tác phẩm mẫu với đầy đủ 5 trạng thái:");
  console.log("   1. REGISTERED: 'Tranh Kỹ Thuật Số Sen Vàng' (#1, CERT-2026-0001)");
  console.log("   2. PENDING_APPROVAL: 'Bản Vẽ 3D Cyberpunk City' (Chờ Admin duyệt)");
  console.log("   3. APPROVED: 'Nhiếp Ảnh Phố Cổ Hà Nội' (Sẵn sàng cho Creator Mint)");
  console.log("   4. REJECTED: 'Tranh Sao Chép Sơn Dầu' (Minh họa từ chối kèm lý do)");
  console.log("   5. REVOKED: 'Chân Dung AI Generative' (#2, CERT-2026-0003 - Dấu đỏ Thu hồi)");
  console.log("   6. REGISTERED: 'Nhận Diện Thương Hiệu TechCorp' (#3, CERT-2026-0004)");
  console.log("============================================================");
  console.log("🎉 BỘ DỮ LIỆU MẪU ĐÃ SẴN SÀNG 100% CHO THUYẾT TRÌNH & ĐÁNH GIÁ!");
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi khởi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
