import { NextRequest, NextResponse } from "next/server";
import { verifyAdminWallet } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({
        isAdmin: false,
        reason: "Chưa cung cấp địa chỉ ví",
      });
    }

    const isAdmin = await verifyAdminWallet(wallet);

    return NextResponse.json({
      success: true,
      wallet,
      isAdmin,
      role: isAdmin ? "ADMIN" : "CREATOR",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

