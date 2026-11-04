const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Tạo thư mục public/demo
const demoDir = path.join(__dirname, "../../public/demo");
if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

// Tạo 1 PNG header & data đơn giản (hoặc tạo 2 file ảnh nhị phân khác nhau đúng 1 byte)
function createSamplePNG(alterOneByte = false) {
  const buffer = Buffer.alloc(2048);
  buffer.write("ASSETCHAIN_DIGITAL_ARTWORK_SEN_VANG_2026", 0);
  for (let i = 40; i < 2040; i++) {
    buffer[i] = (i * 31 + 17) % 256;
  }
  
  if (alterOneByte) {
    buffer[500] = buffer[500] ^ 0x01;
  }

  return buffer;
}

const originalBuffer = createSamplePNG(false);
const fakeBuffer = createSamplePNG(true);

const originalPath = path.join(demoDir, "Sen_Vang_Original.png");
const fakePath = path.join(demoDir, "Sen_Vang_Fake.png");

fs.writeFileSync(originalPath, originalBuffer);
fs.writeFileSync(fakePath, fakeBuffer);

const originalHash = crypto.createHash("sha256").update(originalBuffer).digest("hex");
const fakeHash = crypto.createHash("sha256").update(fakeBuffer).digest("hex");

console.log("=== CREATED DEMO ASSETS FOR PRESENTATION ===");
console.log("1. Original Image: public/demo/Sen_Vang_Original.png");
console.log("   SHA-256:", originalHash);
console.log("2. Fake/Altered 1-Pixel Image: public/demo/Sen_Vang_Fake.png");
console.log("   SHA-256:", fakeHash);
console.log("Difference: Exactly 1 bit altered, yet SHA-256 is 100% avalanche-diverged!");
