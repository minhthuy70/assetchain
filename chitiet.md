# Hướng Dẫn Kỹ Thuật Triển Khai Chi Tiết - AssetChain (Nhóm 2 Thành Viên)

> **Mô hình kiến trúc:** Local-First Fullstack (Next.js 14/15 App Router + SQLite Prisma + Hardhat Local EVM)  
> **Thời gian thực hiện:** 14 ngày | **Phương pháp:** Vertical Slicing (2 người code độc lập trên 2 máy local)

---

## MỤC LỤC
1. [Thiết lập Môi trường & Khởi tạo Dự án](#1-thiết-lập-môi-trường--khởi-tạo-dự-án)
2. [Thiết kế Prisma Schema (SQLite) & Database Helpers](#2-thiết-kế-prisma-schema-sqlite--database-helpers)
3. [Smart Contract AssetRegistry.sol & Kịch bản Deploy (Thành viên A)](#3-smart-contract-assetregistrysol--kịch-bản-deploy-thành-viên-a)
4. [Xây dựng Layout chung & Tiện ích Client SHA-256 (Thành viên B)](#4-xây-dựng-layout-chung--tiện-ích-client-sha-256-thành-viên-b)
5. [Lát cắt Chức năng A: Đăng ký & Mint On-chain (Thành viên A)](#5-lát-cắt-chức-năng-a-đăng-ký--mint-on-chain-thành-viên-a)
6. [Lát cắt Chức năng B: Xét duyệt & Chứng nhận E-Cert (Thành viên B)](#6-lát-cắt-chức-năng-b-xét-duyệt--chứng-nhận-e-cert-thành-viên-b)
7. [Cổng Xác Minh 1-Click Kéo Thả Siêu Tốc (Thành viên B)](#7-cổng-xác-minh-1-click-kéo-thả-siêu-tốc-thành-viên-b)
8. [Script 1-Lệnh Chuẩn Bị Demo Dành Cho Buổi Báo Cáo](#8-script-1-lệnh-chuẩn-bị-demo-dành-cho-buổi-báo-cáo)

---

## 1. THIẾT LẬP MÔI TRƯỜNG & KHỞI TẠO DỰ ÁN

### 1.1. Chuẩn bị môi trường trên máy của mỗi thành viên
- Cài đặt **Node.js LTS** (phiên bản 18.x hoặc 20.x).
- Cài đặt extension **MetaMask** trên trình duyệt Chrome.
- Cài đặt **Git**.

### 1.2. Khởi tạo cấu trúc dự án (Thành viên A thực hiện đầu tiên rồi push lên GitHub)
```bash
# Tại thư mục làm việc:
npx create-next-app@latest assetchain --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd assetchain

# Cài đặt các thư viện Web3, Database và Tiện ích
npm install ethers @openzeppelin/contracts prisma @prisma/client
npm install jspdf qrcode lucide-react clsx tailwind-merge
npm install -D hardhat @nomicfoundation/hardhat-toolbox @types/qrcode
```

### 1.3. Khởi tạo cấu trúc thư mục làm việc chuẩn
```bash
mkdir -p contracts/contracts contracts/scripts contracts/test
mkdir -p public/uploads public/certificates
mkdir -p src/contracts src/lib
touch public/uploads/.gitkeep public/certificates/.gitkeep
```

---

## 2. THIẾT KẾ PRISMA SCHEMA (SQLITE) & DATABASE HELPERS

### 2.1. File `prisma/schema.prisma`
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  fullName      String
  role          String    @default("CREATOR") // "CREATOR" | "ADMIN"
  walletAddress String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  assets        Asset[]
  @@map("users")
}

model Asset {
  id                 String             @id @default(cuid())
  tokenId            Int?               @unique
  title              String
  description        String
  category           String             @default("ART")
  filePath           String
  fileName           String
  fileHash           String             @unique // 64 ký tự hex SHA-256
  fileSize           Int
  mimeType           String
  status             String             @default("PENDING_APPROVAL") 
  // PENDING_APPROVAL -> APPROVED (hoặc REJECTED) -> REGISTERED -> REVOKED
  
  creatorId          String
  creator            User               @relation(fields: [creatorId], references: [id])
  
  currentOwnerWallet String
  txHash             String?
  blockNumber        Int?
  registeredAt       DateTime?
  rejectionReason    String?

  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  history            OwnershipHistory[]
  certificate        Certificate?

  @@index([status])
  @@index([currentOwnerWallet])
  @@map("assets")
}

model OwnershipHistory {
  id           String   @id @default(cuid())
  assetId      String
  asset        Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  tokenId      Int
  fromWallet   String
  toWallet     String
  txHash       String   @unique
  blockNumber  Int
  eventType    String   // "MINT" | "TRANSFER" | "REVOKE"
  createdAt    DateTime @default(now())

  @@map("ownership_histories")
}

model Certificate {
  id                String   @id @default(cuid())
  assetId           String   @unique
  asset             Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  certificateNumber String   @unique
  verifyUrl         String
  qrCodeBase64      String?
  pdfPath           String?
  issuedAt          DateTime @default(now())
  issuedBy          String

  @@map("certificates")
}
```

### 2.2. Khởi tạo Prisma Client Helper (`src/lib/prisma.ts`)
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 2.3. Lệnh cập nhật database
```bash
npx prisma db push
```

---

## 3. SMART CONTRACT ASSETREGISTRY.SOL & KỊCH BẢN DEPLOY (THÀNH VIÊN A)

### 3.1. File cấu hình `hardhat.config.js`
Tạo tại thư mục gốc hoặc trong `contracts/`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts/contracts",
    tests: "./contracts/test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts"
  }
};
```

### 3.2. Mã nguồn `contracts/contracts/AssetRegistry.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AssetRegistry is ERC721URIStorage, Ownable, Pausable {
    uint256 private _nextTokenId;

    struct AssetRecord {
        uint256 tokenId;
        bytes32 contentHash;
        address creator;
        uint256 registeredAt;
        bool isRevoked;
        string revocationReason;
    }

    mapping(uint256 => AssetRecord) public assets;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(bytes32 => bool) public isHashRegistered;

    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 indexed contentHash,
        string tokenURI,
        uint256 timestamp
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event AssetRevoked(
        uint256 indexed tokenId,
        address indexed admin,
        string reason,
        uint256 timestamp
    );

    constructor() ERC721("AssetChain Digital Asset", "ASSET") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function registerAsset(
        address to,
        string memory uri,
        bytes32 contentHash
    ) external whenNotPaused returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(contentHash != bytes32(0), "Invalid hash");
        require(!isHashRegistered[contentHash], "Hash already registered on-chain");

        uint256 currentId = _nextTokenId;
        _nextTokenId++;

        assets[currentId] = AssetRecord({
            tokenId: currentId,
            contentHash: contentHash,
            creator: to,
            registeredAt: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        hashToTokenId[contentHash] = currentId;
        isHashRegistered[contentHash] = true;

        _safeMint(to, currentId);
        _setTokenURI(currentId, uri);

        emit AssetRegistered(currentId, to, contentHash, uri, block.timestamp);
        return currentId;
    }

    function getAssetByHash(bytes32 contentHash) external view returns (
        uint256 tokenId,
        address creator,
        address currentOwner,
        uint256 registeredAt,
        bool isRevoked,
        string memory uri
    ) {
        require(isHashRegistered[contentHash], "Asset hash not found");
        uint256 id = hashToTokenId[contentHash];
        AssetRecord memory item = assets[id];
        return (
            item.tokenId,
            item.creator,
            ownerOf(id),
            item.registeredAt,
            item.isRevoked,
            tokenURI(id)
        );
    }

    function transferAsset(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Caller is not asset owner");
        require(to != address(0), "Cannot transfer to zero address");
        safeTransferFrom(msg.sender, to, tokenId);
        emit AssetTransferred(tokenId, msg.sender, to, block.timestamp);
    }

    function revokeAsset(uint256 tokenId, string memory reason) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        assets[tokenId].isRevoked = true;
        assets[tokenId].revocationReason = reason;
        emit AssetRevoked(tokenId, msg.sender, reason, block.timestamp);
    }
}
```

### 3.3. Script Deploy Tự Động Xuất ABI (`contracts/scripts/deploy.js`)
```javascript
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of AssetRegistry.sol...");
  const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
  const contract = await AssetRegistry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("AssetRegistry deployed successfully at:", contractAddress);

  // Xuất file ABI và Address sang thư mục src/contracts để Frontend dùng ngay
  const targetDir = path.join(__dirname, "../../src/contracts");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("AssetRegistry");
  const contractData = {
    address: contractAddress,
    chainId: 31337,
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(targetDir, "AssetRegistry.json"),
    JSON.stringify(contractData, null, 2)
  );
  console.log("Saved ABI & Address to src/contracts/AssetRegistry.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 4. XÂY DỰNG LAYOUT CHUNG & TIỆN ÍCH CLIENT SHA-256 (THÀNH VIÊN B)

### 4.1. Tiện ích băm file phía client bằng Web Crypto API (`src/lib/hash.ts`)
```typescript
/**
 * Tính mã băm SHA-256 nhị phân của File trực tiếp trên trình duyệt
 * Không tốn tài nguyên server, bảo vệ quyền riêng tư
 */
export async function computeFileHashSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Chuyển đổi mã băm 64 ký tự hex thành chuỗi bytes32 cho Solidity
 */
export function hexToBytes32(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + clean;
}
```

### 4.2. Component Kết nối Ví MetaMask (`src/components/WalletButton.tsx`)
```tsx
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  async function connectWallet() {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const bal = await provider.getBalance(accounts[0]);
          setBalance(parseFloat(ethers.formatEther(bal)).toFixed(2));
        }
      } catch (err) {
        console.error("Lỗi kết nối ví:", err);
      }
    } else {
      alert("Vui lòng cài đặt tiện ích MetaMask trên trình duyệt!");
    }
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
    >
      {account ? `${account.slice(0, 6)}...${account.slice(-4)} (${balance} ETH)` : "Kết nối MetaMask"}
    </button>
  );
}
```

---

## 5. LÁT CẮT CHỨC NĂNG A: ĐĂNG KÝ & MINT ON-CHAIN (THÀNH VIÊN A)

### 5.1. Route Handler Tiếp Nhận File & Đăng Ký (`src/app/api/assets/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = (formData.get("category") as string) || "ART";
    const walletAddress = formData.get("walletAddress") as string;
    const creatorId = formData.get("creatorId") as string;

    if (!file || !title || !walletAddress) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Tính SHA-256 server-side
    const serverHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Kiểm tra trùng lặp trong SQLite
    const existing = await prisma.asset.findUnique({
      where: { fileHash: serverHash }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Tác phẩm này đã từng được đăng ký trong hệ thống!" },
        { status: 409 }
      );
    }

    // Lưu file vào public/uploads
    const ext = path.extname(file.name) || ".png";
    const fileName = `${Date.now()}_${serverHash.slice(0, 8)}${ext}`;
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);
    fs.writeFileSync(uploadPath, buffer);

    // Tạo bản ghi mới với trạng thái PENDING_APPROVAL
    const asset = await prisma.asset.create({
      data: {
        title,
        description,
        category,
        filePath: `/uploads/${fileName}`,
        fileName: file.name,
        fileHash: serverHash,
        fileSize: buffer.length,
        mimeType: file.type || "application/octet-stream",
        status: "PENDING_APPROVAL",
        creatorId: creatorId || "demo-creator-id",
        currentOwnerWallet: walletAddress,
      }
    });

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi đăng ký:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### 5.2. Hàm Kích Hoạt Mint On-Chain từ Giao diện
```typescript
import { ethers } from "ethers";
import contractInfo from "@/contracts/AssetRegistry.json";
import { hexToBytes32 } from "@/lib/hash";

export async function mintAssetOnChain(asset: {
  id: string;
  fileHash: string;
  title: string;
  filePath: string;
}) {
  if (!(window as any).ethereum) throw new Error("Chưa cài MetaMask");

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);

  const bytes32Hash = hexToBytes32(asset.fileHash);
  const metadataUri = JSON.stringify({
    title: asset.title,
    image: asset.filePath,
    hash: asset.fileHash,
  });

  // Gọi giao dịch registerAsset
  const tx = await contract.registerAsset(userAddress, metadataUri, bytes32Hash);
  const receipt = await tx.wait();

  // Đọc tokenId từ Event AssetRegistered
  let tokenId = 1;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === "AssetRegistered") {
        tokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch (_) {}
  }

  // Đồng bộ kết quả về Database
  await fetch(`/api/assets/${asset.id}/sync-onchain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tokenId,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      ownerWallet: userAddress,
    }),
  });

  return { tokenId, txHash: receipt.hash };
}
```

---

## 6. LÁT CẮT CHỨC NĂNG B: XÉT DUYỆT & CHỨNG NHẬN E-CERT (THÀNH VIÊN B)

### 6.1. Route Handler Xét Duyệt Admin (`src/app/api/admin/assets/[id]/review/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, rejectionReason } = await req.json();
    const assetId = params.id;

    if (action === "APPROVE") {
      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "APPROVED",
          rejectionReason: null,
        },
      });

      // Tạo số hiệu chứng nhận ban đầu
      const certCount = await prisma.certificate.count();
      const certNumber = `CERT-2026-${String(certCount + 1).padStart(4, "0")}`;
      await prisma.certificate.upsert({
        where: { assetId },
        update: {},
        create: {
          assetId,
          certificateNumber: certNumber,
          verifyUrl: `http://localhost:3000/verify?hash=${updated.fileHash}`,
          issuedBy: "Admin Council",
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } else if (action === "REJECT") {
      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Hồ sơ không đạt tiêu chí quy định",
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### 6.2. Bộ Sinh E-Certificate PDF & QR Code (`src/lib/certificate.ts`)
```typescript
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export async function generateCertificatePDF(data: {
  certificateNumber: string;
  assetTitle: string;
  fileHash: string;
  creatorWallet: string;
  tokenId?: number;
  txHash?: string;
  issuedAt: string;
}): Promise<jsPDF> {
  const verifyUrl = `http://localhost:3000/verify?hash=${data.fileHash}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Khung viền sang trọng màu vàng kim & xanh navy
  doc.setDrawColor(24, 43, 73);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.8);
  doc.rect(13, 13, 271, 184);

  // Tiêu đề
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(24, 43, 73);
  doc.text("ASSETCHAIN DIGITAL CERTIFICATE", 148, 35, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Proof of Existence & Blockchain Ownership Verification", 148, 43, { align: "center" });

  // Thông tin chứng nhận
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(`Certificate No: ${data.certificateNumber}`, 25, 65);
  doc.text(`Asset Title: ${data.assetTitle}`, 25, 75);
  doc.text(`Digital Fingerprint (SHA-256):`, 25, 85);
  
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(197, 160, 89);
  doc.text(data.fileHash, 25, 93);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(`Registered Creator: ${data.creatorWallet}`, 25, 105);
  doc.text(`Blockchain Token ID: #${data.tokenId ?? "Pending"}`, 25, 115);
  doc.text(`Transaction Hash: ${data.txHash ? data.txHash.slice(0, 32) + "..." : "Local Record"}`, 25, 125);
  doc.text(`Issue Date: ${data.issuedAt}`, 25, 135);

  // Chèn mã QR
  doc.addImage(qrDataUrl, "PNG", 200, 60, 45, 45);
  doc.setFontSize(9);
  doc.text("Scan QR to verify on-chain", 222, 112, { align: "center" });

  // Dòng dấu cam kết
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120);
  doc.text("This certificate provides cryptographic proof recorded on Ethereum EVM blockchain.", 148, 175, { align: "center" });

  return doc;
}
```

---

## 7. CỔNG XÁC MINH 1-CLICK KÉO THẢ SIÊU TỐC (THÀNH VIÊN B)

Component Cổng xác minh trực tiếp (`src/app/verify/page.tsx`):
```tsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { computeFileHashSHA256, hexToBytes32 } from "@/lib/hash";
import contractInfo from "@/contracts/AssetRegistry.json";

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleDropFile(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    verifyFile(files[0]);
  }

  async function verifyFile(file: File) {
    setLoading(true);
    setResult(null);
    try {
      const hash = await computeFileHashSHA256(file);
      const bytes32Hash = hexToBytes32(hash);

      // Đọc trực tiếp Smart Contract qua RPC công khai (không tốn gas, không cần ví)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

      try {
        const onchainData = await contract.getAssetByHash(bytes32Hash);
        setResult({
          valid: true,
          hash,
          tokenId: Number(onchainData[0]),
          creator: onchainData[1],
          currentOwner: onchainData[2],
          timestamp: new Date(Number(onchainData[3]) * 1000).toLocaleString(),
          isRevoked: onchainData[4],
        });
      } catch (contractErr) {
        // Nếu contract báo không tìm thấy
        setResult({
          valid: false,
          hash,
          message: "Tệp tin chưa từng được ghi nhận trên Blockchain hoặc đã bị chỉnh sửa!",
        });
      }
    } catch (err: any) {
      alert("Lỗi khi kiểm tra: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-4">
        Cổng Xác Minh Tính Toàn Vẹn Tài Sản Số
      </h1>
      <p className="text-slate-600 text-center mb-8">
        Kéo thả file bất kỳ vào khung dưới đây. Hệ thống sẽ băm SHA-256 ngay trên máy của bạn và đối chiếu trực tiếp với Smart Contract on-chain!
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFile}
        className="border-2 border-dashed border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-12 text-center cursor-pointer transition"
      >
        <p className="text-lg font-medium text-indigo-900">
          Kéo & Thả file tác phẩm vào đây để kiểm tra ngay lập tức
        </p>
        <p className="text-sm text-slate-500 mt-2">Hỗ trợ ảnh PNG, JPG, thiết kế PDF</p>
      </div>

      {loading && <p className="text-center mt-6 text-indigo-600 font-semibold animate-pulse">Đang băm file & đối chiếu Blockchain...</p>}

      {result && (
        <div className={`mt-8 p-6 rounded-xl border ${result.valid ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}>
          {result.valid ? (
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xl mb-3">
                <span>✓</span> CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN
              </div>
              <p className="text-sm text-slate-700"><strong>Mã băm SHA-256:</strong> <code className="text-xs bg-white px-2 py-1 rounded">{result.hash}</code></p>
              <p className="text-sm text-slate-700 mt-1"><strong>Token ID:</strong> #{result.tokenId}</p>
              <p className="text-sm text-slate-700 mt-1"><strong>Tác giả ban đầu:</strong> {result.creator}</p>
              <p className="text-sm text-slate-700 mt-1"><strong>Thời điểm ghi nhận on-chain:</strong> {result.timestamp}</p>
            </div>
          ) : (
            <div>
              <div className="text-rose-800 font-bold text-xl mb-2">✕ CẢNH BÁO: TỆP TIN KHÔNG HỢP LỆ</div>
              <p className="text-sm text-rose-700">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 8. SCRIPT 1-LỆNH CHUẨN BỊ DEMO DÀNH CHO BUỔI BÁO CÁO

Để trước giờ lên thuyết trình không bị hoảng loạn vì thiếu dữ liệu mẫu hay address contract bị lệch, thêm vào `package.json`:

```json
"scripts": {
  "demo:reset": "node contracts/scripts/demo-reset.js"
}
```

File script `contracts/scripts/demo-reset.js` tự động làm mới môi trường demo:
```javascript
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== RESETTING ASSETCHAIN DEMO ENVIRONMENT ===");

// 1. Reset Database SQLite
console.log("1. Pushing clean Prisma SQLite schema...");
execSync("npx prisma db push --force-reset", { stdio: "inherit" });

// 2. Deploy lại Smart Contract
console.log("2. Deploying AssetRegistry.sol to Hardhat Node...");
execSync("npx hardhat run contracts/scripts/deploy.js --network localhost", { stdio: "inherit" });

console.log("=== DEMO ENVIRONMENT IS 100% READY FOR PRESENTATION! ===");
```
Chỉ cần chạy `npm run demo:reset`, hệ thống sẽ sạch sẽ và sẵn sàng 100% cho buổi demo điểm 10!
