# SLIDE BÁO CÁO ĐỒ ÁN BLOCKCHAIN: ASSETCHAIN (10 SLIDES)

---

## SLIDE 1: TRANG TIÊU ĐỀ
- **Tên đề tài:** Nền Tảng Đăng Ký & Quản Lý Quyền Sở Hữu Tài Sản Số Trên Blockchain EVM (AssetChain)
- **Học phần:** Chuyên đề Công nghệ Blockchain & Hợp đồng thông minh
- **Bộ môn:** Mạng & Hệ thống phân tán
- **Sinh viên thực hiện:**
  - Thành viên A: Kỹ sư Nền tảng EVM & Smart Contract lõi
  - Thành viên B: Kỹ sư Fullstack Giao diện & Thẩm định / Cổng xác minh 1-Click
- **Giảng viên hướng dẫn:** [Tên Giảng Viên]

---

## SLIDE 2: ĐẶT VẤN ĐỀ & BỐI CẢNH THỰC TIỄN
- **Vấn nạn bản quyền số:** Tác phẩm số (tranh vẽ, thiết kế đồ họa, ảnh chụp) rất dễ bị sao chép nguyên bản chỉ qua 1 thao tác Right Click > Save As.
- **Hạn chế của hệ thống truyền thống:**
  - Quy trình cấp văn bằng bảo hộ tốn nhiều tuần/tháng.
  - Khó chứng minh mốc thời gian sáng tạo ban đầu (*Who was first?*).
  - Thiếu công cụ cho công chúng kiểm định tính nguyên bản trong 1 giây mà không mất phí.

---

## SLIDE 3: GIẢI PHÁP ASSETCHAIN
- **Cơ chế Proof of Existence (Minh chứng sự tồn tại):**
  - Không lưu file dung lượng lớn on-chain.
  - Băm vân tay mật mã SHA-256 ngay trên trình duyệt (Web Crypto API).
  - Khắc dấu mốc thời gian không thể sửa đổi (*Timestamp*) và Token ID ERC-721 vào sổ cái Blockchain EVM.
- **Mô hình kết hợp Web2 & Web3:** Thẩm định hồ sơ của hội đồng quản trị + Phát hành E-Certificate có mã QR xác thực tức thì.

---

## SLIDE 4: KIẾN TRÚC HỆ THỐNG LOCAL-FIRST
- **Kiến trúc 3 lớp tinh gọn:**
  1. **Client Tier:** Next.js 14 App Router, Tailwind CSS, Lucide Icons, Web Crypto API, MetaMask Extension.
  2. **Application Tier:** Next.js Route Handlers (`/api/*`), Prisma ORM, PDF & QR Engine (`jspdf` + `qrcode`).
  3. **Blockchain Tier:** Hardhat Local EVM Network (Port 8545, Chain ID: 31337), Solidity `AssetRegistry.sol`.
- **Lý do chọn Local-First:** Không phụ thuộc Docker/PostgreSQL, cơ sở dữ liệu là 1 file SQLite duy nhất, khởi động tức thì, tốc độ đào block 0 giây.

---

## SLIDE 5: PHÂN ĐỊNH LƯU TRỮ 3 TẦNG (ON-CHAIN VS. OFF-CHAIN)
| Thành phần | Dữ liệu lưu trữ | Mục đích |
|---|---|---|
| **Blockchain (EVM)** | `tokenId`, `bytes32 contentHash`, `creator`, `owner`, `timestamp`, `isRevoked` | Chân lý duy nhất (*Single Source of Truth*), bất biến, không thể xóa sửa. |
| **SQLite (Prisma)** | Users, tiêu đề, mô tả, danh mục, file size, trạng thái duyệt (`status`), lý do | Hiển thị bảng điều khiển, phân trang, lọc trạng thái thẩm định. |
| **Local Storage** | `public/uploads/*` (file gốc), `public/certificates/*` (file PDF) | Lưu tài nguyên nhị phân dung lượng lớn phục vụ hiển thị. |

---

## SLIDE 6: SMART CONTRACT `AssetRegistry.sol`
- **Tiêu chuẩn công nghiệp:** Kế thừa `ERC721URIStorage`, `Ownable`, `Pausable` từ OpenZeppelin v5.
- **Cơ chế chống trùng lặp on-chain:** Mapping kép `mapping(bytes32 => uint256)` và `mapping(bytes32 => bool)` revert ngay lập tức nếu hash đã tồn tại.
- **Hàm view 0 Gas:** `getAssetByHash(bytes32)` cho phép công chúng kiểm định không tốn gas và không cần ví Web3.
- **Bộ Unit Tests:** 18/18 test cases pass 100% bao phủ toàn bộ nhánh logic.

---

## SLIDE 7: BỘ MÁY E-CERTIFICATE & CỔNG XÁC MINH 1-CLICK (TÍNH NĂNG "WOW")
- **E-Certificate PDF:** Khung viền sang trọng navy/gold, huy hiệu chính thức, mã SHA-256 font Courier, mã QR động trỏ tới link xác minh.
- **Cổng xác minh 1-Click (`/verify`):**
  - Kéo thả bất kỳ file nào -> Băm SHA-256 trong < 0.05s.
  - Đọc trực tiếp Smart Contract qua RPC công khai (0 Gas, không cần tài khoản).
  - Tự động nhận diện và hiển thị hộp xanh (Nguyên bản) hoặc hộp đỏ (Giả mạo/Chỉnh sửa).

---

## SLIDE 8: PHÂN CÔNG CÔNG VIỆC VERTICAL SLICING (50/50)
- **Thành viên A (Nền tảng & Đăng ký):**
  - Khởi tạo nền tảng, Smart Contract `AssetRegistry.sol` & bộ unit test.
  - Form nộp tác phẩm, Web Crypto SHA-256, API lưu trữ file.
  - Ký giao dịch mint NFT qua MetaMask và đồng bộ on-chain.
  - Dashboard tác giả & Chuyển nhượng quyền sở hữu.
- **Thành viên B (Thẩm định & Xác minh):**
  - Layout Web3 tổng thể, Navbar, Footer, component kết nối ví.
  - Cổng Admin thẩm định hồ sơ (`/admin/approvals`) & API Approve/Reject.
  - Bộ máy sinh PDF E-Certificate & tạo mã QR động.
  - Cổng tra cứu xác minh 1-Click (`/verify`) & Cơ chế Thu hồi bản quyền (`revokeAsset`).

---

## SLIDE 9: KỊCH BẢN DEMO THỰC TẾ (MÀN BIỂU DIỄN THẬT VS. GIẢ)
- **Bước 1:** Nộp tác phẩm "Sen Vàng" -> Admin duyệt hồ sơ -> Cấp số `CERT-2026-0001`.
- **Bước 2:** Mint NFT on-chain trên MetaMask -> Xuất file PDF chứng nhận có mã QR.
- **Bước 3:** Quét mã QR bằng điện thoại -> Mở cổng `/verify`.
- **Bước 4 (Đỉnh cao):**
  - Kéo file `Sen_Vang_Original.png` vào `/verify` -> Báo XANH: "✓ HỢP LỆ VÀ NGUYÊN BẢN".
  - Kéo file `Sen_Vang_Fake.png` (sửa 1 pixel màu) vào -> Báo ĐỎ: "✕ CẢNH BÁO: TỆP TIN ĐÃ BỊ CHỈNH SỬA!".
  - Giải thích Hiệu ứng Tuyết lở (Avalanche Effect).

---

## SLIDE 10: KẾT LUẬN & HƯỚNG PHÁT TRIỂN
- **Kết quả đạt được:** Hoàn thành 100% mục tiêu 14 ngày, hệ thống chạy mượt mà local-first, trải nghiệm người dùng Web3 hiện đại.
- **Hướng phát triển tương lai:**
  1. Triển khai lên testnet/mainnet công khai (Polygon, Arbitrum).
  2. Tích hợp mạng lưu trữ phi tập trung vĩnh cửu (IPFS / Arweave).
  3. Mở rộng cơ chế Royalty Fee khi chuyển nhượng bản quyền tác phẩm.

