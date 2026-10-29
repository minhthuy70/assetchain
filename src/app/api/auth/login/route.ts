import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, walletAddress } = await req.json();

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp email hoặc kết nối địa chỉ ví Web3!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(walletAddress ? [{ walletAddress }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại. Vui lòng đăng ký!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Lỗi đăng nhập:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
