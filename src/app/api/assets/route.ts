import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const onlyRegistered = searchParams.get("registered") === "1";

    const where: any = {};

    if (wallet) {
      where.currentOwnerWallet = wallet;
    }

    if (onlyRegistered) {
      where.status = "REGISTERED";
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { fileHash: { contains: query } },
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

    return NextResponse.json({ success: true, data: assets });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách assets:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = (formData.get("description") as string | null) || "";
    const category = (formData.get("category") as string | null) || "ART";
    const walletAddress = formData.get("walletAddress") as string | null;
    const creatorName = (formData.get("creatorName") as string | null) || "Nghệ sĩ ẩn danh";

    if (!file || !title || !walletAddress) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ: Tệp tin, Tiêu đề và Địa chỉ ví Web3!" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Tính mã băm SHA-256 server-side
    const serverHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 2. Chống trùng lặp tuyệt đối trong cơ sở dữ liệu SQLite
    const existing = await prisma.asset.findUnique({
      where: { fileHash: serverHash },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Tác phẩm này đã từng được nộp trong hệ thống với mã băm SHA-256 tương tự!",
          existingAssetId: existing.id,
        },
        { status: 409 }
      );
    }

    // 3. Đảm bảo thư mục lưu trữ public/uploads/ tồn tại
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Lưu file vật lý với tên chuẩn hóa
    const ext = path.extname(file.name) || ".png";
    const safeFileName = `${Date.now()}_${serverHash.slice(0, 8)}${ext}`;
    const filePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    // 5. Đảm bảo có User trong DB
    let user = await prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${walletAddress.slice(0, 8)}@assetchain.local`,
          passwordHash: "web3_authenticated_wallet_2026",
          fullName: creatorName,
          walletAddress,
          role: "CREATOR",
        },
      });
    }

    // 6. Tạo bản ghi Asset với trạng thái PENDING_APPROVAL
    const asset = await prisma.asset.create({
      data: {
        title,
        description,
        category,
        filePath: `/uploads/${safeFileName}`,
        fileName: file.name,
        fileHash: serverHash,
        fileSize: buffer.length,
        mimeType: file.type || "application/octet-stream",
        status: "PENDING_APPROVAL",
        creatorId: user.id,
        currentOwnerWallet: walletAddress,
      },
    });

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi đăng ký tài sản mới:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

