const hre = require("hardhat");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("=== Seeding Initial Demo Data for AssetChain ===");

  // 1. Tạo tài khoản mẫu (Creator & Admin)
  const admin = await prisma.user.upsert({
    where: { email: "admin@assetchain.local" },
    update: {},
    create: {
      email: "admin@assetchain.local",
      passwordHash: "demo_admin_hashed_password_2026",
      fullName: "Hội Đồng Quản Trị (Admin)",
      role: "ADMIN",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@assetchain.local" },
    update: {},
    create: {
      email: "creator@assetchain.local",
      passwordHash: "demo_creator_hashed_password_2026",
      fullName: "Nguyễn Văn Nghệ Sĩ",
      role: "CREATOR",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1
    },
  });

  console.log("Users created:", { admin: admin.email, creator: creator.email });

  // 2. Tạo tác phẩm mẫu đã duyệt và cấp chứng nhận
  const sampleHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const asset = await prisma.asset.upsert({
    where: { fileHash: sampleHash },
    update: {},
    create: {
      title: "Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn",
      description: "Tác phẩm tranh nghệ thuật số minh họa hoa sen cung đình Huế, bảo vệ tác quyền trên EVM.",
      category: "ART",
      filePath: "/uploads/sen_vang.png",
      fileName: "sen_vang.png",
      fileHash: sampleHash,
      fileSize: 1048576,
      mimeType: "image/png",
      status: "APPROVED",
      creatorId: creator.id,
      currentOwnerWallet: creator.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    },
  });

  const certNumber = "CERT-2026-0001";
  await prisma.certificate.upsert({
    where: { assetId: asset.id },
    update: {},
    create: {
      assetId: asset.id,
      certificateNumber: certNumber,
      verifyUrl: `http://localhost:3000/verify?hash=${sampleHash}`,
      issuedBy: "AssetChain Admin Council",
    },
  });

  console.log("Demo asset & certificate created:", { title: asset.title, certNumber });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

