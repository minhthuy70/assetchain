/**
 * Utility băm SHA-256 nhị phân của File trực tiếp trên trình duyệt bằng Web Crypto API
 * Không tốn tài nguyên server, bảo vệ quyền riêng tư người dùng
 */
export async function computeFileHashSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Chuyển đổi mã băm hex (64 ký tự) thành định dạng bytes32 (0x...) cho Solidity Smart Contract
 */
export function hexToBytes32(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + clean.padStart(64, "0");
}

