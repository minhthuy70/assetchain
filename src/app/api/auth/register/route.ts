import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, walletAddress } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ họ tên và email!" },
        { status: 400 }
      );
    }

    // Kiểm tra email hoặc ví đã tồn tại
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(walletAddress ? [{ walletAddress }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email hoặc địa chỉ ví đã tồn tại trong hệ thống!" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: password ? `hash_${password}` : "web3_wallet_auth",
        walletAddress: walletAddress || null,
        role: "CREATOR",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi đăng ký tài khoản:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
