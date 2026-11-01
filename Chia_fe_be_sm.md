# Phân Chia Công Việc Nhóm 2 Thành Viên - AssetChain (Mô Hình Vertical Slicing)

## 1. Nguyên Tắc Phân Chia Công Việc

Thay vì chia ngang (Horizontal Slicing - một người chỉ làm Frontend và một người chỉ làm Backend), dự án áp dụng mô hình **Chia theo nhóm chức năng nghiệp vụ (Vertical Slicing)**. Mỗi thành viên sở hữu trọn vẹn một lát cắt tính năng bao gồm: **Giao diện (UI) + API Routes + Thao tác SQLite (Prisma) + Tương tác Blockchain (Ethers.js)**.

Cách tiếp cận này mang lại 4 lợi ích sống còn cho thời hạn 14 ngày:
1. **Phát triển độc lập:** Hai thành viên có thể code song song trên 2 máy mà không phải chờ đợi API hay giao diện của nhau.
2. **Ít xung đột mã nguồn (Git Conflict):** Mỗi người làm việc trên các trang và endpoint riêng biệt.
3. **Hiểu sâu toàn diện:** Cả 2 thành viên đều nắm được luồng Web3 từ giao diện đến smart contract, phục vụ tốt buổi vấn đáp/demo với giảng viên.
4. **Đóng góp cân bằng (50% - 50%):** Số lượng commit, khối lượng code và mức độ phức tạp được cân đối đồng đều trên GitHub.

---

## 2. Bảng Phân Định Trách Nhiệm Chi Tiết

| Đặc tính | **Thành Viên A** | **Thành Viên B** |
|---|---|---|
| **Chủ đề chính** | **Nền tảng & Đăng ký Tài sản (Creator Portal)** | **Xét duyệt & Chứng nhận (Admin & Verification)** |
| **Phần phụ trách chính** | - Khởi tạo project Next.js + Tailwind + Prisma SQLite.<br>- Viết & Deploy Smart Contract lõi `AssetRegistry.sol` (Hardhat).<br>- Module Auth & Session cơ bản.<br>- Luồng Đăng ký tài sản (Upload, Web Crypto SHA-256).<br>- Bảng điều khiển tác giả (Dashboard, Danh sách tài sản của tôi).<br>- Chức năng Chuyển nhượng quyền sở hữu (Transfer on-chain). | - Cổng quản trị và thẩm định hồ sơ Admin (`/admin/approvals`).<br>- Nghiệp vụ Duyệt / Từ chối (Approve / Reject).<br>- Bộ sinh Chứng nhận điện tử (PDF + QR Code generator).<br>- Cổng tra cứu & xác minh tính toàn vẹn (`/verify`).<br>- Tính năng 1-Click Verification (kéo thả file kiểm tra on-chain tức thì).<br>- Trang chủ công cộng (Landing Page & Explore Gallery). |
| **Thư mục / File chính** | - `contracts/` (Solidity, scripts deploy, test)<br>- `prisma/schema.prisma` (Chủ trì khởi tạo)<br>- `src/app/(auth)/...`<br>- `src/app/creator/...` (Form đăng ký, Dashboard)<br>- `src/app/api/assets/...`<br>- `src/lib/contracts/...` (ABI, Contract helpers) | - `src/app/(public)/...` (Home, Explore)<br>- `src/app/admin/...` (Review portal)<br>- `src/app/verify/...` (Tra cứu & Kéo thả)<br>- `src/app/api/admin/...`<br>- `src/app/api/verify/...`<br>- `src/app/api/certificate/...`<br>- `src/lib/certificate/...` (jspdf, qrcode) |
| **Tương tác Blockchain** | - Deploy contract lên Hardhat node.<br>- Giao dịch `registerAsset` (Mint NFT on-chain).<br>- Giao dịch `transferAsset` (Chuyển quyền). | - Đọc dữ liệu `getAssetByHash` & `getAssetById` (View call - 0 gas).<br>- Giao dịch `revokeAsset` (Admin thu hồi bản quyền nếu vi phạm). |

---

## 3. Quy Ước Thành Phần Dùng Chung & Trách Nhiệm Phụ Trách

Để tránh việc cả hai người cùng sửa chung một file dẫn đến xung đột Git, quy ước các tài nguyên dùng chung như sau:

| Thành phần dùng chung | Người chịu trách nhiệm chính | Người sử dụng | Quy tắc phối hợp |
|---|---|---|---|
| **Smart Contract & ABI** | **Thành viên A** | **Thành viên B** | Thành viên A hoàn thành và khóa contract ABI vào cuối **Ngày 2**. Sau khi compile, ABI được lưu tại file dùng chung: `src/contracts/AssetRegistry.json`. Thành viên B chỉ việc import để gọi hàm. |
| **Prisma Schema (`schema.prisma`)** | **Thành viên A** | **Thành viên B** | Thành viên A tạo schema ban đầu vào **Ngày 1**. Nếu Thành viên B cần bổ sung thêm trường cho chứng nhận (`Certificate`), hai người thảo luận trước 15 phút trước khi Thành viên B thêm và chạy `npx prisma db push`. |
| **Cấu hình môi trường (`.env.example`)** | **Thành viên A** | **Thành viên B** | Giữ cố định cấu hình chung (Port 3000, RPC 8545, Contract Address `0x5FbDB...`). Không commit `.env` cá nhân. |
| **Thư mục lưu trữ Uploads** | Dùng chung | Dùng chung | Đường dẫn chuẩn hóa: `public/uploads/` cho tài sản gốc, `public/certificates/` cho file PDF chứng nhận. Bổ sung vào `.gitignore`. |

---

## 4. Chi Tiết Nhiệm Vụ Từng Thành Viên Theo Các Giai Đoạn

### GIAI ĐOẠN 1: Thiết Lập Nền Tảng & Hợp Đồng Lõi (Ngày 1 - Ngày 3)

#### Thành Viên A (Chủ trì Nền tảng & Contract):
- [ ] Khởi tạo dự án Next.js 14/15 App Router với TypeScript và Tailwind CSS.
- [ ] Cấu hình Prisma ORM với SQLite (`prisma/schema.prisma`), chạy migrate và seed tài khoản mẫu.
- [ ] Thiết lập thư mục `contracts/` với Hardhat, cấu hình mạng local chain ID `31337`.
- [ ] Viết Smart Contract `AssetRegistry.sol` (kế thừa ERC-721URIStorage, Ownable, Pausable).
- [ ] Viết test cases bằng Chai/Ethers (tối thiểu 15-20 test cases kiểm tra mint, duplicate hash, transfer, revoke).
- [ ] Viết script deploy và xuất tự động ABI + Contract Address ra thư mục `src/contracts/`.

#### Thành Viên B (Khởi tạo Giao diện & Thư viện Chứng nhận):
- [ ] Thiết lập hệ thống UI Layout chung (Navbar, Footer, Modal, WalletConnectButton component).
- [ ] Nghiên cứu và thử nghiệm thư viện tạo PDF (`jspdf`) và mã QR (`qrcode`).
- [ ] Thiết kế mẫu giao diện Chứng nhận số (E-Certificate template) với khung viền sang trọng, watermark và bố cục thông tin minh bạch.
- [ ] Viết hàm tiện ích tính mã băm SHA-256 phía client sử dụng trình duyệt Web Crypto API (`window.crypto.subtle.digest`).
- [ ] Kiểm tra kết nối ví MetaMask với mạng Hardhat Local (`http://127.0.0.1:8545`).

> **Mốc tích hợp M1 (Cuối Ngày 3):** Chạy thử thành công script deploy Smart Contract trên local node; Client kết nối được MetaMask và đọc được số dư test ETH.

---

### GIAI ĐOẠN 2: Phát Triển Chức Năng Độc Lập Theo Slice (Ngày 4 - Ngày 8)

#### Thành Viên A: Luồng Đăng Ký Tài Sản & Quản Lý Cá Nhân
- [ ] Xây dựng form Đăng ký tài sản (`/creator/register`): kéo thả file, tự động tính SHA-256 trên browser và hiển thị mã băm ngay cho người dùng xem.
- [ ] Xây dựng API Route `POST /api/assets`: lưu file vào `public/uploads/`, đối chiếu mã băm, kiểm tra trùng lặp trong SQLite, tạo bản ghi với trạng thái `PENDING_APPROVAL`.
- [ ] Xây dựng Trang cá nhân / Dashboard tác giả (`/creator/my-assets`): hiển thị danh sách tài sản theo các trạng thái (Chờ duyệt, Đã duyệt, Đã lên Blockchain, Bị từ chối).
- [ ] Xây dựng chức năng kích hoạt giao dịch MetaMask mint NFT on-chain khi hồ sơ được duyệt.
- [ ] Xây dựng API `POST /api/assets/[id]/sync-onchain`: xác thực transaction receipt từ Hardhat RPC và cập nhật `tokenId`, `txHash` vào SQLite.
- [ ] Xây dựng tính năng Chuyển nhượng tài sản (`transferAsset`) kèm cập nhật `OwnershipHistory`.

#### Thành Viên B: Luồng Xét Duyệt & Cổng Xác Minh Chứng Nhận
- [ ] Xây dựng Cổng quản trị xét duyệt (`/admin/approvals`): hiển thị danh sách hồ sơ `PENDING_APPROVAL`, cho phép xem file gốc, xem thông tin tác giả và mã băm.
- [ ] Xây dựng API Route `POST /api/admin/assets/[id]/review`: xử lý nút "Phê duyệt" (status -> `APPROVED`) hoặc "Từ chối" (status -> `REJECTED` + lý do).
- [ ] Xây dựng API và hàm sinh E-Certificate: tự động tạo mã chứng nhận (`CERT-2026-XXXX`), tạo mã QR chứa link tra cứu, xuất file PDF chứng nhận có thể tải về.
- [ ] Xây dựng Cổng xác minh công khai (`/verify`):
  - Tra cứu bằng số Token ID hoặc mã băm SHA-256.
  - **Tính năng đặc biệt:** Vùng kéo thả file trực tiếp (Drag & Drop File) -> Trình duyệt tự băm SHA-256 -> Gọi trực tiếp hàm `getAssetByHash` của Smart Contract và đối chiếu SQLite -> Báo kết quả thật/giả tức thì!
- [ ] Xây dựng trang xem chi tiết chứng nhận điện tử (`/certificate/[id]`).

> **Mốc tích hợp M2 (Cuối Ngày 8):** Kiểm thử tích hợp luồng chéo đầu tiên: Thành viên A đăng ký tài sản -> Thành viên B mở trang Admin duyệt hồ sơ -> Thành viên A mint on-chain -> Thành viên B kiểm tra trang Xác minh và xuất chứng nhận PDF.

---

### GIAI ĐOẠN 3: Hoàn Thiện Trải Nghiệm & Tính Năng Nâng Cao (Ngày 9 - Ngày 11)

#### Thành Viên A:
- [ ] Hoàn thiện trang chi tiết tài sản công khai (`/assets/[id]`): hiển thị ảnh, thông tin tác giả, mốc thời gian on-chain, transaction hash có link mở rộng.
- [ ] Xây dựng biểu đồ lịch sử chuyển nhượng (Provenance Timeline) trực quan từ bảng `OwnershipHistory`.
- [ ] Xử lý các trường hợp ngoại lệ: người dùng từ chối ký ví, giao dịch blockchain thất bại, mạng bị ngắt kết nối.

#### Thành Viên B:
- [ ] Thiết kế Landing Page giới thiệu dự án (`/`): thống kê tổng tài sản đã bảo vệ, các tính năng nổi bật, hướng dẫn sử dụng.
- [ ] Xây dựng trang Khám phá (Explore Gallery): hiển thị các tác phẩm số đã được chứng nhận và bảo vệ on-chain.
- [ ] Tối ưu hóa giao diện E-Certificate PDF (thêm watermark chống sao chép, chữ ký số đại diện, màu sắc chuẩn đồ họa cao cấp).
- [ ] Bổ sung chức năng Quản trị thu hồi bản quyền (`revokeAsset`) trên giao diện Admin khi phát hiện tài sản vi phạm.

---

### GIAI ĐOẠN 4: Kiểm Thử Toàn Diện, Đồng Bộ Môi Trường & Chuẩn Bị Demo (Ngày 12 - Ngày 14)

#### Cả 2 thành viên cùng phối hợp:
- [ ] Chuẩn hóa kịch bản Demo hoàn chỉnh trong 5 phút (kịch bản trình bày luồng từ lúc đăng ký đến lúc xác thực thành công và phát hiện file giả mạo).
- [ ] Viết script Reset & Seed dữ liệu demo chỉ bằng 1 dòng lệnh: deploy lại contract, tạo sẵn 3 tài sản mẫu kèm file chứng nhận.
- [ ] Kiểm thử kiểm tra chéo (Cross-Testing): Thành viên A đóng vai Admin duyệt tài sản, Thành viên B đóng vai Creator đăng ký tài sản.
- [ ] Rà soát toàn bộ tài liệu, README, slide thuyết trình và commit lịch sử GitHub đều đặn.

---

## 5. Hướng Dẫn Tự Kiểm Thử Độc Lập Cho Từng Thành Viên

Mỗi thành viên có thể kiểm thử toàn bộ chức năng của mình trên máy cá nhân mà không cần máy của thành viên kia:

### Thành viên A tự kiểm thử:
```bash
# 1. Khởi động Hardhat local node
npx hardhat node

# 2. Deploy contract ở terminal khác
npx hardhat run scripts/deploy.js --network localhost

# 3. Chạy Next.js
npm run dev

# 4. Truy cập http://localhost:3000/creator/register để test upload file và kiểm tra dev.db
```

### Thành viên B tự kiểm thử:
- Sử dụng script seed dữ liệu mẫu (do Thành viên A cung cấp hoặc tạo trực tiếp bằng Prisma Studio: `npx prisma studio`).
- Tạo sẵn 1 bản ghi `PENDING_APPROVAL` và 1 bản ghi `REGISTERED` trong SQLite local để test ngay giao diện Admin và tính năng xuất PDF/QR mà không cần chờ Thành viên A đăng ký.
