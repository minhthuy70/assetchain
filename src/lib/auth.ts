import { prisma } from "@/lib/prisma";

// Địa chỉ ví Deployer / Quản trị viên mặc định (Hardhat Node Account #0)
export const DEFAULT_ADMIN_WALLETS = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase(),
];

/**
 * Kiểm tra nhanh phía client-side hoặc cấu hình tĩnh
 */
export function isConfiguredAdminWallet(address?: string | null): boolean {
  if (!address) return false;
  const clean = address.trim().toLowerCase();

  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);

  return DEFAULT_ADMIN_WALLETS.includes(clean) || envAdmins.includes(clean);
}

/**
 * Xác thực quyền Admin phía Server (kết hợp Database SQLite và Danh sách ví cấu hình)
 */
export async function verifyAdminWallet(address?: string | null): Promise<boolean> {
  if (!address) return false;
  const clean = address.trim().toLowerCase();

  // 1. Kiểm tra danh sách ví admin cấu hình trước
  if (isConfiguredAdminWallet(clean)) return true;

  // 2. Tra cứu trong bảng users của SQLite (hỗ trợ nhiều tài khoản ADMIN)
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        walletAddress: true,
      },
    });

    return adminUsers.some(
      (u) => u.walletAddress && u.walletAddress.trim().toLowerCase() === clean
    );
  } catch {
    return false;
  }
}

