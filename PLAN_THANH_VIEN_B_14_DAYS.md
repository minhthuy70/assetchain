# **KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT 14 NGÀY — THÀNH VIÊN B**
## **THẨM ĐỊNH HỒ SƠ, BỘ MÁY CHỨNG NHẬN E-CERT & CỔNG XÁC MINH 1-CLICK**

> **Dự án:** AssetChain — Hệ thống Đăng ký và Quản lý Quyền Sở hữu Tài sản Số trên Nền tảng Blockchain  
> **Thành viên phụ trách:** **Thành viên B** (Kỹ sư Fullstack Giao diện & Thẩm định / Verification & Engine Specialist)  
> **Lát cắt dọc (Vertical Slice):** Layout Web3 Chung, Cổng Thẩm định Admin, API Duyệt/Từ chối, Bộ sinh E-Certificate PDF & QR Code động, Cổng Tra cứu & Xác minh Kéo-Thả 1-Click (0 Gas), Cơ chế Thu hồi (Revoke), Landing Page & Thư viện Khám phá  
> **Tỷ trọng đóng góp:** 50% khối lượng dự án  
> **Nhánh Git làm việc:** `feature/member-b-approval-cert`  
> **Môi trường vận hành:** Local-First Fullstack (Next.js 14/15 App Router + SQLite Prisma + Hardhat Local EVM)

---

## 📌 MỤC LỤC TÀI LIỆU

1. [Tổng Quan Vai Trò & Ranh Giới Kỹ Thuật](#1-tổng-quan-vai-trò--ranh-giới-kỹ-thuật)
2. [Bản Đồ File & Thư Mục Phụ Trách Trực Tiếp](#2-bản-đồ-file--thư-mục-phụ-trách-trực-tiếp)
3. [Quy Trình Chạy Môi Trường Hàng Ngày Trên Máy Local](#3-quy-trình-chạy-môi-trường-hàng-ngày-trên-máy-local)
4. [Lộ Trình Hành Động Chi Tiết 14 Ngày (Day 1 - Day 14)](#4-lộ-trình-hành-động-chi-tiết-14-ngày-day-1---day-14)
5. [Các Mốc Tích Hợp Chung (Merge Checkpoints M1 - M4)](#5-các-mốc-tích-hợp-chung-merge-checkpoints-m1---m4)
6. [Checklist Tự Kiểm Thử (Definition of Done)](#6-checklist-tự-kiểm-thử-definition-of-done)
7. [Kịch Bản Thuyết Trình & Vấn Đáp Điểm 10/10](#7-kịch-bản-thuyết-trình--vấn-đáp-điểm-1010)

---

# 1. TỔNG QUAN VAI TRÒ & RANH GIỚI KỸ THUẬT

### 1.1. Mục tiêu cốt lõi của Thành viên B
Thành viên B làm chủ toàn bộ trải nghiệm người dùng, lát cắt chức năng của **Quản trị viên (Admin Reviewer)** và **Cổng Công cộng (Public Verification Portal)**:
- Xây dựng Layout tổng thể hệ thống (Navbar, Footer, Nút kết nối ví MetaMask, Theme Web3 sang trọng).
- Xây dựng Cổng Quản trị Thẩm định (`/admin/approvals`) và API Phê duyệt / Từ chối hồ sơ kèm lý do phản hồi cho tác giả.
- Phát triển Bộ máy sinh Chứng nhận điện tử E-Certificate (`src/lib/certificate.ts` bằng `jspdf` và `qrcode`) chuẩn đồ họa cao cấp, chèn watermark chống làm giả và mã QR động.
- Phát triển **Tính năng "WOW" số 1 của dự án: Cổng xác minh 1-Click kéo thả siêu tốc (`/verify`)**: Bất kỳ ai cũng có thể kéo thả tệp tin vào để đối chiếu trực tiếp với Smart Contract on-chain (0 Gas, không cần tài khoản, không cần ví Web3).
- Xây dựng cơ chế Thu hồi chứng nhận (*Revoke Asset*) khi phát hiện vi phạm bản quyền.
- Thiết kế Landing Page (`/`) và Thư viện khám phá tác phẩm (`/explore`).
- Chuẩn bị slide thuyết trình (10 slide) và chuẩn bị cặp file ảnh demo (ảnh gốc vs ảnh sửa 1 pixel màu) để tạo ấn tượng mạnh mẽ trước hội đồng chấm thi.

### 1.2. Ranh giới kỹ thuật & Quy ước chống xung đột (No-Conflict Rules)
Để làm việc độc lập 100% trên máy cá nhân mà không gây xung đột Git với Thành viên A:
1. **Sử dụng Smart Contract ABI:** Thành viên B không trực tiếp sửa file `contracts/contracts/AssetRegistry.sol`. Khi Thành viên A deploy xong, file `src/contracts/AssetRegistry.json` sẽ có sẵn. Thành viên B chỉ việc import để đọc ABI và địa chỉ contract, phục vụ gọi hàm view `getAssetByHash` và hàm admin `revokeAsset`.
2. **Database Schema:** Thành viên A khởi tạo cấu trúc cơ sở ban đầu. Thành viên B phụ trách bảng `Certificate`. Mọi chỉnh sửa schema đều chạy `npx prisma db push` trên máy local của mình.
3. **Thư mục File Vật Lý:** Thành viên B phụ trách thư mục lưu file PDF chứng nhận: `public/certificates/`. Thư mục ảnh tác giả `public/uploads/` do Thành viên A quản lý.

---

# 2. BẢN ĐỒ FILE & THƯ MỤC PHỤ TRÁCH TRỰC TIẾP

| Đường Dẫn File / Thư Mục | Loại File | Quyền Hạn | Trách Nhiệm Chi Tiết |
|:---|:---|:---:|:---|
| `src/components/Navbar.tsx` | Component | Sở hữu 100% | Thanh điều hướng chính, logo AssetChain, menu, nút kết nối ví. |
| `src/components/Footer.tsx` | Component | Sở hữu 100% | Chân trang thông tin học thuật, liên kết hợp đồng, ghi chú bản quyền. |
| `src/components/WalletButton.tsx` | Component | Sở hữu 100% | Nút kết nối MetaMask, nhận diện Chain ID 31337, hiển thị số dư test ETH. |
| `src/lib/crypto.ts` | Helper TS | Sở hữu 100% | Tiện ích băm `SHA-256` client bằng Web Crypto API và chuyển đổi `bytes32`. |
| `src/components/FileDropzone.tsx` | Component | Sở hữu 100% | Khu vực kéo thả tệp, tính toán mã băm tức thì và xem trước ảnh. |
| `src/lib/certificate.ts` | Engine TS | Sở hữu 100% | Bộ máy xuất file PDF chứng nhận chất lượng cao và sinh ảnh mã QR. |
| `src/app/admin/approvals/page.tsx` | UI Page | Sở hữu 100% | Cổng Admin: bảng danh sách hồ sơ cần thẩm định, bộ lọc trạng thái. |
| `src/components/ReviewModal.tsx` | Component | Sở hữu 100% | Modal xem xét tác phẩm chi tiết, form nhập lý do từ chối. |
| `src/app/api/admin/assets/route.ts` | API Route | Sở hữu 100% | API lấy danh sách hồ sơ chờ thẩm định (`PENDING_APPROVAL`). |
| `src/app/api/admin/assets/[id]/review/route.ts` | API Route | Sở hữu 100% | API xử lý phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED`). |
| `src/app/api/certificate/[assetId]/route.ts` | API Route | Sở hữu 100% | API trả về dữ liệu chứng nhận và URL tải file PDF. |
| `src/app/verify/page.tsx` | UI Page | Sở hữu 100% | **Cổng Xác Minh 1-Click Kéo Thả Siêu Tốc (0 Gas, 1-Click Verification).** |
| `src/app/api/verify/route.ts` | API Route | Sở hữu 100% | API tra cứu đối chiếu kép giữa SQLite Database và Smart Contract. |
| `src/app/page.tsx` | UI Page | Sở hữu 100% | Trang chủ Landing Page giới thiệu giải pháp, thống kê, hướng dẫn 3 bước. |
| `src/app/explore/page.tsx` | UI Page | Sở hữu 100% | Thư viện Khám phá trưng bày các tác phẩm đã chứng nhận on-chain. |
| `src/app/admin/revoke/page.tsx` | UI Page | Sở hữu 100% | Giao diện thu hồi chứng nhận on-chain khi có tranh chấp vi phạm. |
| `slide_presentation.pptx` / slides | Tài liệu | Sở hữu 100% | Bộ slide 10 trang thuyết trình trước Hội đồng đánh giá. |

---

# 3. QUY TRÌNH CHẠY MÔI TRƯỜNG HÀNG NGÀY TRÊN MÁY LOCAL

Mỗi ngày bắt đầu làm việc, Thành viên B mở **2 cửa sổ Terminal**:

```bash
# ==============================================================================
# TERMINAL 1: Khởi động Blockchain Cục bộ (Hardhat EVM Node)
# ==============================================================================
npx hardhat node
# -> Node chạy tại http://127.0.0.1:8545, Chain ID: 31337
# -> Cung cấp sẵn 20 ví test có 10,000 ETH
# -> Giữ nguyên Terminal này không được đóng
```

```bash
# ==============================================================================
# TERMINAL 2: Chạy Fullstack Next.js
# ==============================================================================
# Bước 1: Đồng bộ Database SQLite cục bộ (nếu có cập nhật mới từ Git)
npx prisma db push

# Bước 2: Khởi động giao diện và API
npm run dev
# -> Mở trình duyệt tại http://localhost:3000
```

> [!NOTE]
> Khi Thành viên A deploy lại contract hoặc cập nhật ABI sang `src/contracts/AssetRegistry.json`, Thành viên B chỉ cần `git pull` là tự động có địa chỉ contract và ABI mới nhất mà không cần chạy lại script deploy.

---

# 4. LỘ TRÌNH HÀNH ĐỘNG CHI TIẾT 14 NGÀY (DAY 1 - DAY 14)

---

### NGÀY 1: XÂY DỰNG LAYOUT TỔNG THỂ & TIỆN ÍCH BĂM SHA-256 CLIENT
- **Mục tiêu:** Thiết lập khung giao diện chuẩn Web3 sang trọng (Navbar, Footer, Dark/Light mode) và module băm SHA-256 client-side.
- **Chi tiết các bước thực hiện:**
  1. Viết tiện ích băm file phía client `src/lib/crypto.ts`:
     ```typescript
     export async function computeFileHashSHA256(file: File): Promise<string> {
       const arrayBuffer = await file.arrayBuffer();
       const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
       const hashArray = Array.from(new Uint8Array(hashBuffer));
       return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
     }
     export function hexToBytes32(hex: string): string {
       const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
       return "0x" + clean;
     }
     ```
  2. Xây dựng Layout tổng thể hệ thống:
     - Component `Navbar.tsx`: Logo AssetChain cách điệu icon khiên số, liên kết trang chủ, khám phá tác phẩm, cổng thẩm định Admin, nút kết nối ví.
     - Component `Footer.tsx`: Thông tin bộ môn Mạng & Hệ thống phân tán, ghi chú bản quyền học thuật, liên kết GitHub.
  3. Xây dựng component `FileDropzone.tsx`:
     - Vùng kéo thả tệp tin với đường viền nét đứt (dashed border).
     - Hiệu ứng đổi màu khi rê tệp vào (drag-over effect).
     - Tính mã băm SHA-256 và hiển thị thanh đo thời gian xử lý (ví dụ: `0.03s`).
- **Đầu ra Ngày 1:** Giao diện có khung điều hướng hoàn chỉnh; Kéo thả file thử nghiệm sinh ra chuỗi SHA-256 hex chuẩn xác ngay trên trình duyệt.

---

### NGÀY 2: BỘ MÁY SINH E-CERTIFICATE PDF & TẠO MÃ QR ĐỘNG
- **Mục tiêu:** Thiết kế mẫu phôi Chứng nhận Điện tử PDF chuẩn đồ họa cao cấp và sinh mã QR động dẫn tới URL xác minh.
- **Chi tiết các bước thực hiện:**
  1. Cài đặt thư viện đồ họa và mã vạch:
     ```bash
     npm install jspdf qrcode @types/qrcode
     ```
  2. Lập trình bộ sinh chứng nhận trong `src/lib/certificate.ts`:
     - Khởi tạo tài liệu jsPDF khổ A4 Landscape (`orientation: 'landscape'`, `format: 'a4'`).
     - Vẽ khung viền đôi sang trọng: Khung ngoài xanh navy (`#182B49`), khung trong vàng kim (`#C5A059`).
     - Tiêu đề trang trọng: *"ASSETCHAIN DIGITAL CERTIFICATE OF OWNERSHIP"*.
     - Bố cục thông tin đối xứng: Số hiệu chứng nhận (`CERT-2026-xxxx`), Tên tác phẩm, Địa chỉ ví tác giả, Token ID, Transaction Hash, Mốc thời gian on-chain.
     - Vùng in mã vân tay số: Định dạng font Courier hiển thị đầy đủ 64 ký tự SHA-256.
     - Tích hợp thư viện `qrcode`: Tạo chuỗi DataURL từ đường dẫn tra cứu thực tế `http://localhost:3000/verify?hash=<contentHash>` và nhúng ảnh mã QR vào góc phải chứng nhận.
  3. Viết hàm xuất thử file PDF mẫu:
     - Tạo endpoint tạm `/api/test-cert` để tải thử file PDF về kiểm tra độ sắc nét trên các thiết bị.
- **Đầu ra Ngày 2:** Xuất thành công file PDF chứng nhận chuẩn mỹ thuật cao; Dùng camera điện thoại quét thử mã QR mở đúng đường link verify dự kiến.

---

### NGÀY 3: COMPONENT KẾT NỐI VÍ METAMASK & MỐC TÍCH HỢP M1
- **Mục tiêu:** Hoàn thiện nút kết nối ví MetaMask trên thanh điều hướng, nhận diện mạng Hardhat local và đạt mốc M1.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng component `src/components/WalletButton.tsx`:
     - Kiểm tra sự tồn tại của `window.ethereum`.
     - Gọi `provider.send("eth_requestAccounts", [])` yêu cầu người dùng cấp quyền truy cập ví.
     - Tự động kiểm tra mạng: Nếu không phải Chain ID `31337` (`0x7a69`), hiển thị thông báo chuyển mạng sang Hardhat Local RPC `http://127.0.0.1:8545`.
     - Lấy số dư ETH test (`provider.getBalance`) và format hiển thị rút gọn (ví dụ: `0xf39F...2266 (9999.85 ETH)`).
     - Bắt sự kiện `accountsChanged` và `chainChanged` để cập nhật trạng thái giao diện tức thì khi người dùng đổi tài khoản trong MetaMask.
  2. Nhúng `WalletButton` vào thanh `Navbar`.
  3. Cùng Thành viên A kiểm thử kết nối trực tiếp vào Smart Contract vừa deploy: Đọc địa chỉ hợp đồng từ `src/contracts/AssetRegistry.json`.
- **Đầu ra Ngày 3 (MỐC M1):** Kết nối MetaMask thành công; Nhận diện mạng local; Hiển thị đúng địa chỉ ví và số dư ETH test trên giao diện.

---

### NGÀY 4: CỔNG QUẢN TRỊ ADMIN (ADMIN REVIEW PORTAL)
- **Mục tiêu:** Xây dựng giao diện thẩm định hồ sơ dành riêng cho Quản trị viên, hiển thị danh sách hồ sơ đang chờ xét duyệt.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng trang `/admin/approvals`:
     - Bảng dữ liệu (Table) trực quan: Ảnh thu nhỏ, Tiêu đề, Tác giả (địa chỉ ví rút gọn), Ngày nộp, Mã băm rút gọn kèm nút sao chép, Cột thao tác.
     - Bộ lọc trạng thái: Chờ duyệt (`PENDING_APPROVAL`), Đã duyệt (`APPROVED`), Đã từ chối (`REJECTED`).
     - Thanh tìm kiếm theo tên tác phẩm hoặc ví tác giả.
  2. Xây dựng component `ReviewModal.tsx`:
     - Khi Admin bấm vào một hồ sơ: Modal phóng to ảnh tác phẩm để kiểm tra chất lượng.
     - Hiển thị đầy đủ thông số kỹ thuật: Kích thước tệp (KB/MB), Định dạng MIME, Mã băm SHA-256 64 ký tự.
     - Hai nút bấm hành động nổi bật: Nút xanh **"Phê duyệt"** và Nút đỏ **"Từ chối"**.
     - Ô nhập lý do từ chối (bắt buộc nhập nếu bấm nút Từ chối để gửi phản hồi cho tác giả).
- **Đầu ra Ngày 4:** Admin đăng nhập có thể xem danh sách toàn bộ hồ sơ đang chờ duyệt và mở modal xem chi tiết từng tác phẩm.

---

### NGÀY 5: API QUẢN TRỊ DUYỆT / TỪ CHỐI & CẤP SỐ CHỨNG NHẬN
- **Mục tiêu:** Hoàn thiện API backend xử lý phê duyệt hoặc từ chối hồ sơ, tự động sinh số hiệu chứng nhận.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng API Route `GET /api/admin/assets`:
     - Truy vấn SQLite qua Prisma lấy danh sách hồ sơ lọc theo `status`.
  2. Xây dựng API Route `POST /api/admin/assets/[id]/review`:
     - Tiếp nhận payload: `{ action: "APPROVE" | "REJECT", rejectionReason?: string }`.
     - **Nếu `action === "APPROVE"`:**
       - Cập nhật bản ghi trong SQLite: `status = "APPROVED"`.
       - Đếm tổng số chứng nhận hiện tại và sinh số hiệu định dạng: `CERT-2026-XXXX` (ví dụ `CERT-2026-0001`).
       - Tạo bản ghi mới trong bảng `Certificate`: `{ assetId, certificateNumber, verifyUrl, issuedBy: "AssetChain Admin Council" }`.
       - Trả về mã HTTP `200 OK`.
     - **Nếu `action === "REJECT"`:**
       - Cập nhật bản ghi: `status = "REJECTED"`, `rejectionReason = rejectionReason`.
       - Trả về mã HTTP `200 OK`.
  3. Kết nối các nút bấm trên `ReviewModal` với API backend, hiển thị thông báo thành công (Toast notification) và tự động làm mới danh sách bảng.
- **Đầu ra Ngày 5:** Admin bấm Duyệt -> Dữ liệu cập nhật ngay trong SQLite, hồ sơ chuyển sang `APPROVED`, số hiệu chứng nhận được sinh tự động.

---

### NGÀY 6: XUẤT CHỨNG NHẬN ĐIỆN TỬ PDF CHÍNH THỨC
- **Mục tiêu:** Tự động sinh file PDF chứng nhận chất lượng cao khi tác giả hoàn tất mint on-chain và cho phép tải về tức thì.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng API Route `GET /api/certificate/[assetId]`:
     - Truy vấn thông tin chi tiết của tài sản từ SQLite (tiêu đề, hash, ví tác giả, `tokenId`, `txHash`, mốc thời gian `registeredAt`).
     - Đọc thông tin từ bảng `Certificate` (số hiệu `certificateNumber`).
     - Gọi hàm `generateCertificatePDF(...)` từ `src/lib/certificate.ts`.
     - Chuyển đổi tài liệu jsPDF thành mảng byte nhị phân (`doc.output("arraybuffer")`).
     - Lưu một bản sao vật lý vào thư mục `public/certificates/${certificateNumber}.pdf`.
     - Trả về file nhị phân kèm header: `Content-Type: application/pdf` và `Content-Disposition: attachment; filename="Certificate-${certificateNumber}.pdf"`.
  2. Bổ sung nút **"Tải Chứng Nhận PDF"** trên giao diện chi tiết tài sản của tác giả và trên modal xem xét của Admin.
- **Đầu ra Ngày 6:** Bấm nút "Tải Chứng Nhận" -> Trình duyệt tải ngay file PDF sắc nét, mở lên có đầy đủ Token ID, Transaction Hash on-chain và mã QR quét được.

---

### NGÀY 7: CỔNG TRA CỨU CÔNG KHAI BAN ĐẦU
- **Mục tiêu:** Xây dựng trang tra cứu `/verify` cơ bản theo số hiệu Token ID hoặc chuỗi băm SHA-256.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng trang `/verify`:
     - Ô nhập tìm kiếm đa năng: Người dùng có thể dán mã băm 64 hex hoặc nhập số Token ID.
     - Nút "Tra Cứu Bản Quyền".
  2. Viết API Route `POST /api/verify`:
     - Tiếp nhận `{ hash?: string, tokenId?: number }`.
     - Truy vấn song song hai tầng:
       - **Tầng 1 (SQLite):** Tìm bản ghi tài sản, tác giả, trạng thái, số chứng nhận.
       - **Tầng 2 (Smart Contract):** Gọi hàm view `getAssetByHash(bytes32)` hoặc `ownerOf(tokenId)` trên Hardhat EVM để lấy dữ liệu bất biến on-chain.
       - Đối chiếu khớp nối: Đảm bảo dữ liệu off-chain trùng khớp 100% với dữ liệu ghi trên blockchain.
  3. Hiển thị kết quả tra cứu: Thẻ thông tin chứng nhận, trạng thái on-chain, liên kết tải chứng nhận PDF gốc.
- **Đầu ra Ngày 7:** Bất kỳ ai nhập mã băm hoặc Token ID đều xem được bằng chứng tồn tại của tài sản mà không cần đăng nhập.

---

### NGÀY 8: MỐC TÍCH HỢP M2 (KIỂM THỬ LIÊN MÁY LẦN 1)
- **Mục tiêu:** Hợp nhất mã nguồn vào nhánh `main`, phối hợp với Thành viên A chạy kiểm thử liên máy luồng nghiệp vụ khép kín.
- **Chi tiết các bước thực hiện:**
  1. Tạo Pull Request từ nhánh `feature/member-b-approval-cert` vào `main`.
  2. Họp kiểm thử chéo với Thành viên A:
     - Máy A upload tác phẩm "Sen Vàng" -> Máy B mở Cổng Admin bấm Duyệt.
     - Máy A ký MetaMask mint on-chain -> Máy B mở trang Verify tra cứu bằng URL mã QR.
     - Kiểm tra xem file PDF tải về trên Máy B có hiển thị đúng Token ID và TxHash mà Máy A vừa mint hay không.
  3. Tinh chỉnh giao diện và sửa toàn bộ lỗi liên kết giữa hai máy.
- **Đầu ra Ngày 8 (MỐC M2):** Luồng 4 bước cơ bản (Đăng ký -> Thẩm định -> Mint -> Xuất PDF) vận hành hoàn hảo không lỗi.

---

### NGÀY 9: TÍNH NĂNG "WOW" SỐ 1: CỔNG XÁC MINH 1-CLICK KÉO THẢ SIÊU TỐC
- **Mục tiêu:** Nâng cấp cổng `/verify` thành điểm nhấn kỹ thuật đỉnh cao nhất của đồ án — Kéo thả file kiểm tra thật/giả tức thì 0 Gas.
- **Chi tiết các bước thực hiện:**
  1. Nâng cấp giao diện `/verify` với khu vực **1-Click Drag-and-Drop Area**:
     - Thiết kế hộp kéo thả lớn, hiệu ứng viền phát sáng khi kéo file vào.
     - Dòng chữ hướng dẫn ấn tượng: *"Kéo & Thả bất kỳ tệp tác phẩm nào vào đây. Hệ thống sẽ băm SHA-256 ngay trên máy của bạn và đối chiếu trực tiếp với Smart Contract on-chain trong 1 giây mà không cần ví hay tài khoản!"*.
  2. Cơ chế xử lý kỹ thuật trực tiếp trên trình duyệt (`VerifyPage.tsx`):
     - Lắng nghe sự kiện `onDrop`: Lấy đối tượng `file`.
     - Gọi `computeFileHashSHA256(file)` tính toán mã băm trong < 0.05s.
     - Khởi tạo kết nối RPC công khai (không tốn gas, không cần MetaMask):
       ```typescript
       const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
       const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
       ```
     - Gọi hàm view on-chain: `const data = await contract.getAssetByHash(bytes32Hash)`.
  3. Hiển thị kết quả tương phản mạnh mẽ (High-Contrast Result Box):
     - **Trường hợp tệp NGUYÊN BẢN (Tìm thấy trên chuỗi):**
       - Khung màu xanh lục rực rỡ (`bg-emerald-50 border-emerald-400`).
       - Dòng thông báo lớn: *"✓ CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN"*.
       - Chi tiết: Token ID, Địa chỉ ví tác giả, Mốc thời gian khối bất biến, Trạng thái hoạt động.
     - **Trường hợp tệp GIẢ MẠO / ĐÃ CHỈNH SỬA (Contract revert do không tìm thấy hash):**
       - Khung màu đỏ cảnh báo (`bg-rose-50 border-rose-400`).
       - Dòng thông báo lớn: *"✕ CẢNH BÁO: TỆP TIN CHƯA TỪNG ĐĂNG KÝ HOẶC ĐÃ BỊ CHỈNH SỬA!"*.
       - Giải thích: Dù chỉ thay đổi 1 pixel màu, mã băm SHA-256 đã bị biến đổi hoàn toàn và không trùng khớp với bất kỳ bản ghi nào trên sổ cái blockchain.
- **Đầu ra Ngày 9:** Tính năng kéo thả xác minh hoàn thành mượt mà, tốc độ phản hồi < 0.5s, tạo hiệu ứng thị giác cực kỳ thuyết phục.

---

### NGÀY 10: TRANG CHỦ LANDING PAGE & THƯ VIỆN KHÁM PHÁ (MỐC M3)
- **Mục tiêu:** Hoàn thiện bộ mặt giao diện công cộng, tạo ấn tượng chuyên nghiệp ngay từ trang chủ.
- **Chi tiết các bước thực hiện:**
  1. Thiết kế Landing Page (`src/app/page.tsx`):
     - **Hero Section:** Tiêu đề ấn tượng, hiệu ứng gradient chữ *"Bảo Vệ Bản Quyền Tác Phẩm Số Bằng Công Nghệ Blockchain"*, nút kêu gọi hành động (CTA) "Đăng ký tác phẩm ngay" và "Xác minh tài sản".
     - **Bảng Thống kê Trực tiếp (Live Stats):** Số lượng tác phẩm đã bảo vệ on-chain, Số chứng nhận đã phát hành, Tổng số giao dịch ghi nhận.
     - **Quy trình 3 bước trực quan:** 1. Đăng ký & Băm mật mã -> 2. Thẩm định & Khắc dấu Blockchain -> 3. Nhận Chứng nhận số & Xác minh 1-Click.
     - **Lợi thế Công nghệ:** Nhấn mạnh Proof of Existence, Không thể đảo ngược, Bảo vệ quyền tác giả vĩnh viễn.
  2. Thiết kế Thư viện Khám phá (`src/app/explore/page.tsx`):
     - Lưới hiển thị các tác phẩm đã đạt trạng thái `REGISTERED`.
     - Thẻ tác phẩm (Asset Card) hiển thị ảnh, tác giả, Token ID, nút bấm dẫn sang trang xác minh hoặc xem chứng nhận.
- **Đầu ra Ngày 10 (MỐC M3):** Toàn bộ giao diện công cộng hoàn thiện thẩm mỹ cao, chuẩn Web3 hiện đại.

---

### NGÀY 11: CHỨC NĂNG THU HỒI CHỨNG NHẬN (REVOKE ASSET)
- **Mục tiêu:** Xây dựng cơ chế xử lý trường hợp phát hiện gian lận bản quyền, minh chứng khả năng quản trị chặt chẽ của hệ thống.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng giao diện thu hồi cho Admin (`/admin/revoke` hoặc tích hợp trên trang chi tiết):
     - Chỉ hiển thị đối với tài khoản Quản trị viên (hoặc ví Admin deployer).
     - Form chọn Token ID cần thu hồi và nhập lý do thu hồi (ví dụ: *"Phát hiện sao chép trái phép từ tác phẩm khác"*).
  2. Kích hoạt giao dịch thu hồi on-chain:
     - Admin kết nối ví, gọi hàm `contract.revokeAsset(tokenId, reason)`.
     - Smart contract cập nhật struct `assets[tokenId].isRevoked = true` và phát ra sự kiện `AssetRevoked`.
  3. Cập nhật trạng thái off-chain:
     - Đổi trạng thái trong SQLite: `status = "REVOKED"`.
     - Cập nhật bộ sinh PDF `src/lib/certificate.ts`: Nếu tài sản có `isRevoked === true`, tự động vẽ một con dấu Watermark màu đỏ chéo trang: **"REVOKED / CHỨNG NHẬN ĐÃ BỊ THU HỒI"**.
     - Cổng tra cứu `/verify` khi kiểm tra tài sản này sẽ hiển thị cảnh báo màu cam: *"CHỨNG NHẬN NÀY ĐÃ BỊ CƠ QUAN QUẢN TRỊ THU HỒI DO VI PHẠM BẢN QUYỀN"*.
- **Đầu ra Ngày 11:** Hệ thống hoàn thiện đầy đủ vòng đời nghiệp vụ: Đăng ký -> Duyệt -> Mint -> Chuyển quyền -> Thu hồi.

---

### NGÀY 12: MỐC TÍCH HỢP M4 (TỐI ƯU GIAO DIỆN & KIỂM THỬ CHỊU LỖI)
- **Mục tiêu:** Rà soát toàn bộ giao diện, kiểm thử responsive trên các độ phân giải màn hình và tối ưu trải nghiệm.
- **Chi tiết các bước thực hiện:**
  1. Kiểm thử responsive: Đảm bảo giao diện hiển thị chuẩn đẹp trên cả Laptop (1920x1080), Tablet và Mobile.
  2. Kiểm thử các trường hợp dữ liệu rác hoặc ngoại lệ:
     - Kéo thả file văn bản hoặc file hỏng vào cổng Verify -> Hệ thống vẫn băm được và báo không tìm thấy, không làm sập ứng dụng.
     - Nhập Token ID không tồn tại -> Báo lỗi thân thiện.
  3. Tối ưu hóa hiệu ứng tương tác:
     - Thêm hiệu ứng hover mượt mà cho các nút bấm và thẻ tác phẩm.
     - Hiển thị Toast thông báo khi sao chép mã băm hoặc địa chỉ ví vào clipboard.
- **Đầu ra Ngày 12 (MỐC M4):** Giao diện đạt độ hoàn thiện cao nhất, chuẩn bị sẵn sàng cho buổi báo cáo.

---

### NGÀY 13: CHUẨN BỊ SLIDE THUYẾT TRÌNH & BỘ TỆP DEMO THẬT / GIẢ
- **Mục tiêu:** Hoàn thiện bộ slide 10 trang và chuẩn bị cặp file ảnh đặc biệt phục vụ màn biểu diễn "thật/giả" trước hội đồng.
- **Chi tiết các bước thực hiện:**
  1. Thiết kế bộ Slide báo cáo (10 slide):
     - Slide 1: Bìa đề tài, thành viên nhóm, giảng viên hướng dẫn.
     - Slide 2: Đặt vấn đề — Vấn nạn vi phạm bản quyền số và hạn chế của phương pháp truyền thống.
     - Slide 3: Giải pháp AssetChain — Bằng chứng tồn tại Proof of Existence trên EVM Blockchain.
     - Slide 4: Kiến trúc hệ thống Local-First (Next.js + SQLite + Hardhat EVM) & Lý do không dùng Docker/Cloud.
     - Slide 5: Phân định dữ liệu On-Chain vs. Off-Chain (Tại sao chỉ lưu SHA-256 hash trên chuỗi).
     - Slide 6: Smart Contract `AssetRegistry.sol` — ERC-721, cơ chế chống trùng lặp và tính toàn vẹn.
     - Slide 7: Bộ máy E-Certificate & Cổng xác minh 1-Click Drag-and-Drop (0 Gas).
     - Slide 8: Kế hoạch phân công Vertical Slicing 50/50 giữa 2 thành viên.
     - Slide 9: Kết quả đạt được & Video/Hình ảnh minh họa hệ thống.
     - Slide 10: Hướng phát triển mở rộng (Mainnet Ethereum, IPFS/Arweave, Cổng thanh toán bản quyền).
  2. Chuẩn bị 2 file ảnh demo:
     - **File 1 (Ảnh Gốc):** Bức tranh nghệ thuật `"Sen_Vang_Original.png"` (đã được mint on-chain Token #1).
     - **File 2 (Ảnh Giả Mạo):** Mở File 1 bằng Paint hoặc Photoshop, chỉnh sửa đúng **1 pixel màu** ở góc tranh rồi lưu lại với tên `"Sen_Vang_Fake.png"` (mắt thường nhìn 2 ảnh giống hệt nhau 100%).
  3. Cùng Thành viên A diễn tập thuyết trình thử 2 lần, khớp kịch bản từng giây.
- **Đầu ra Ngày 13:** Slide đẹp mắt, cặp file demo sẵn sàng; Tự tin làm chủ hoàn toàn buổi thuyết trình.

---

### NGÀY 14: BẢO VỆ ĐỒ ÁN TRƯỚC HỘI ĐỒNG (MỤC TIÊU 10/10)
- **Mục tiêu:** Trình bày thuyết phục, biểu diễn màn kéo thả thật/giả gây ấn tượng mạnh và trả lời xuất sắc câu hỏi vấn đáp.
- **Phân công nhiệm vụ cụ thể trong buổi bảo vệ:** Xem chi tiết tại [Mục 7: Kịch Bản Thuyết Trình](#7-kịch-bản-thuyết-trình--vấn-đáp-điểm-1010).

---

# 5. CÁC MỐC TÍCH HỢP CHUNG (MERGE CHECKPOINTS M1 - M4)

```
[MỐC M1 - Ngày 3]  Deploy Smart Contract local + Khóa ABI + Kết nối Ví MetaMask
       │
[MỐC M2 - Ngày 8]  Hợp nhất Luồng Cốt lõi: Đăng ký -> Duyệt -> Mint -> Xuất PDF
       │
[MỐC M3 - Ngày 10] Tích hợp Chuyển nhượng + Cổng Drag-and-Drop Verify + Landing Page
       │
[MỐC M4 - Ngày 12] Kiểm thử Toàn diện: Chịu lỗi MetaMask, Reset demo 1-lệnh, Tối ưu UI
```

### Quy tắc Merge Git an toàn cho Thành viên B:
1. Trước khi tạo Pull Request, luôn kéo mã mới nhất từ `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/member-b-approval-cert
   git merge main
   ```
2. Nếu có xung đột, ưu tiên giữ nguyên file thuộc thẩm quyền của mình; tuyệt đối không tự ý xóa sửa các file của Thành viên A (`contracts/contracts/*`, `contracts/test/*`, `src/app/creator/*`, `src/app/api/assets/*`).
3. Chạy lệnh kiểm tra build giao diện trước khi merge:
   ```bash
   npm run build
   ```
   *(Đảm bảo TypeScript không có lỗi biên dịch nào)*.

---

# 6. CHECKLIST TỰ KIỂM THỬ (DEFINITION OF DONE)

Thành viên B tự kiểm tra từng tiêu chí kỹ thuật trước khi bàn giao module:

- [ ] **Giao diện & Trải nghiệm Người dùng:**
  - [ ] Navbar và Footer hiển thị đồng bộ trên mọi trang.
  - [ ] Nút `WalletButton` nhận diện chuẩn mạng local Chain ID `31337`, hiển thị rút gọn địa chỉ ví và số dư ETH.
  - [ ] Landing Page và Thư viện Khám phá hiển thị đẹp mắt, không vỡ layout.
- [ ] **Cổng Quản trị Thẩm định Admin:**
  - [ ] Hiển thị đầy đủ danh sách hồ sơ cần duyệt lọc theo trạng thái.
  - [ ] Modal xem xét phóng to ảnh sắc nét, hiển thị đầy đủ thông số kỹ thuật.
  - [ ] Nút "Phê duyệt" đổi trạng thái sang `APPROVED` và sinh đúng số hiệu `CERT-2026-xxxx`.
  - [ ] Nút "Từ chối" bắt buộc nhập lý do và cập nhật trạng thái `REJECTED`.
- [ ] **Bộ Sinh E-Certificate PDF:**
  - [ ] Xuất file PDF chuẩn khổ A4 Landscape với khung viền vàng kim / xanh navy sang trọng.
  - [ ] In đúng số hiệu chứng nhận, tên tác phẩm, mã SHA-256 font Courier, Token ID và TxHash.
  - [ ] Quét mã QR bằng camera điện thoại thực tế mở chính xác URL tra cứu của tác phẩm.
- [ ] **Cổng Xác Minh 1-Click Kéo Thả:**
  - [ ] Kéo thả file ảnh vào nhận diện tức thì, không cần bấm thêm nút nào.
  - [ ] Đọc trực tiếp Smart Contract qua RPC (0 Gas, không cần ví Web3, không cần đăng nhập).
  - [ ] Kéo ảnh gốc -> Báo XANH: "CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN".
  - [ ] Kéo ảnh đã sửa 1 pixel -> Báo ĐỎ: "CẢNH BÁO: TỆP TIN ĐÃ BỊ CHỈNH SỬA!".
- [ ] **Cơ chế Thu hồi:**
  - [ ] Gọi hàm `revokeAsset` on-chain thành công từ tài khoản Admin.
  - [ ] File PDF chứng nhận sau khi thu hồi tự động có watermark đỏ "REVOKED / ĐÃ THU HỒI".

---

# 7. KỊCH BẢN THUYẾT TRÌNH & VẤN ĐÁP ĐIỂM 10/10

### 7.1. Phân vai và Thao tác của Thành viên B trong 5 phút Demo

- **Phút 03 — Thẩm định & Phê duyệt Hồ sơ tại Cổng Admin:**
  - *Thao tác:* Mở Cổng Quản trị `/admin/approvals`.
  - *Lời thoại:* "Kính thưa Thầy/Cô, em là [Tên Thành viên B]. Ngay sau khi tác giả nộp hồ sơ, Quản trị viên của hệ thống sẽ nhận được thông báo tại Cổng thẩm định. Em mở Modal chi tiết bức ảnh 'Sen Vàng'. Tại đây Admin có thể kiểm tra trực quan chất lượng tác phẩm, dung lượng file và đối chiếu mã băm. Thấy hồ sơ hoàn toàn hợp lệ, em nhấn 'Phê duyệt'. Hệ thống lập tức sinh số hiệu chứng nhận CERT-2026-0001 và cấp quyền cho tác giả đưa tác phẩm lên chuỗi."
- **Phút 04 (Phụ trợ) — Xuất & Giới thiệu Chứng nhận Điện tử:**
  - *Thao tác:* Sau khi Thành viên A hoàn tất mint on-chain, Thành viên B bấm nút **"Tải Chứng Nhận PDF"**.
  - *Lời thoại:* "Hệ thống tự động render một bản chứng nhận điện tử định dạng PDF độ phân giải cao. Bản chứng nhận này tích hợp con dấu số của hội đồng, thông tin Token ID #1, Transaction Hash on-chain và một mã QR Code động. Em kính mời quý Thầy/Cô có thể dùng camera điện thoại quét thử mã QR này trên màn hình — nó sẽ dẫn thẳng tới cổng tra cứu công khai độc lập của hệ thống!"
- **Phút 05 — ĐỈNH CAO BÙNG NỔ: Xác Minh Kéo-Thả 1-Click (Thật vs. Giả):**
  - *Thao tác 1:* Mở Cổng tra cứu công khai `/verify` (nhấn mạnh: hoàn toàn ẩn danh, không cần đăng nhập tài khoản, không cần kết nối ví Web3).
  - *Thao tác 2:* Kéo bức ảnh gốc `"Sen_Vang_Original.png"` thả vào khung -> Hệ thống chớp sáng và hiện **HỘP XANH LỤC RỰC RỠ**: *"✓ CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN"*.
  - *Lời thoại 1:* "Thưa thầy cô, em chỉ việc kéo thả file ảnh gốc vào đây. Trình duyệt tự băm SHA-256 và gọi trực tiếp hàm view trên Smart Contract qua RPC mà không tốn một đồng phí gas nào. Hệ thống xác nhận ngay: Đây là tác phẩm gốc, được đăng ký bởi ví 0xf39F... vào lúc 14 giờ 20 phút."
  - *Thao tác 3:* Mở tiếp bức ảnh `"Sen_Vang_Fake.png"` (đã bị sửa 1 pixel màu) kéo thả vào khung -> Hệ thống đổi sang **HỘP ĐỎ CẢNH BÁO**: *"✕ CẢNH BÁO: TỆP TIN CHƯA TỪNG ĐĂNG KÝ HOẶC ĐÃ BỊ CHỈNH SỬA!"*.
  - *Lời thoại 2 & Kết luận:* "Bây giờ, em kéo thả bức ảnh thứ hai vào. Bằng mắt thường, bức ảnh này giống bức ảnh ban đầu 100%. Tuy nhiên, kẻ gian đã bí mật chỉnh sửa chỉ đúng một pixel màu ở góc tranh. Nhờ hiệu ứng tuyết lở (Avalanche Effect) của hàm băm SHA-256 kết hợp với tính bất biến của Smart Contract, hệ thống lập tức phát hiện mã băm đã bị sai lệch và đưa ra cảnh báo đỏ ngay trong một giây! Đây chính là sức mạnh cốt lõi của công nghệ Blockchain: Bảo vệ toàn vẹn và chống chối bỏ quyền tác giả số một cách tuyệt đối!"

---

### 7.2. Bộ Câu Hỏi Vấn Đáp Chuyên Sâu Dành Cho Thành Viên B & Câu Trả Lời Mẫu

#### Câu hỏi 1: "Tại sao cổng tra cứu `/verify` khi kéo thả file lại không yêu cầu người dùng phải kết nối ví MetaMask hay trả phí Gas?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, đây là ứng dụng kỹ thuật của **Hàm View / Pure trong máy ảo Ethereum EVM**:  
> 1. **Cơ chế 0 Gas:** Trong Smart Contract, hàm tra cứu `getAssetByHash(bytes32 contentHash)` được khai báo với từ khóa `external view`. Các hàm `view` chỉ đọc dữ liệu từ bộ nhớ trạng thái (EVM Storage) mà hoàn toàn không làm thay đổi trạng thái sổ cái. Do đó, các node mạng EVM cho phép thực thi truy vấn này cục bộ mà không cần đưa vào block và không tiêu tốn Gas.  
> 2. **Không cần ví Web3:** Phía client, em sử dụng thư viện Ethers.js khởi tạo một `JsonRpcProvider` kết nối trực tiếp tới cổng RPC công khai `http://127.0.0.1:8545`. Do không cần ký giao dịch (không cần Signer), bất kỳ người dùng bình thường nào trong công chúng cũng có thể kéo thả file để kiểm tra tính nguyên bản của tác phẩm chỉ trong 1 giây mà không cần biết ví tiền điện tử hay blockchain là gì. Điều này giúp tối đa hóa khả năng tiếp cận đại chúng của hệ thống."

#### Câu hỏi 2: "Nếu kẻ gian tải file PDF chứng nhận về, dùng Photoshop sửa lại tên tác giả và địa chỉ ví thì hệ thống phát hiện thế nào?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, file PDF chỉ đóng vai trò là một **Vật phẩm Trực quan hóa (Simulated Visualization)** phục vụ hiển thị, còn **Chân lý duy nhất (Single Source of Truth) nằm trên Blockchain**:  
> 1. Trên mỗi bản PDF đều có in rõ số hiệu chứng nhận, mã băm SHA-256 và một **mã QR động**.  
> 2. Kẻ gian dù có thể sửa tên trên file PDF bằng Photoshop, nhưng **không thể** sửa được dữ liệu đã đóng khối trên Smart Contract.  
> 3. Khi người kiểm định quét mã QR hoặc kéo chính file PDF/ảnh gốc vào cổng `/verify`, hệ thống sẽ trích xuất mã băm và đọc trực tiếp từ Smart Contract on-chain. Khi đó, thông tin thật của tác giả ban đầu và mốc thời gian khối sẽ hiện ra, bóc trần hoàn toàn sự giả mạo của tờ chứng nhận đã qua chỉnh sửa."

#### Câu hỏi 3: "Hiệu ứng tuyết lở (Avalanche Effect) của hàm băm SHA-256 trong bài demo kéo thả hoạt động như thế nào?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, hàm băm mật mã học SHA-256 được thiết kế theo cấu trúc Merkle–Damgård với đặc tính **Avalanche Effect (Hiệu ứng Tuyết lở)** nghiêm ngặt:  
> - Khi dữ liệu đầu vào thay đổi dù chỉ **1 bit duy nhất** (ví dụ: đổi một điểm ảnh từ mã màu `#FFFFFF` sang `#FFFFFE`), qua 64 vòng lặp biến đổi phi tuyến tính (non-linear functions) của thuật toán SHA-256, hơn 50% số bit trong chuỗi băm đầu ra 256 bits sẽ bị thay đổi hoàn toàn ngẫu nhiên.  
> - Chuỗi băm mới sinh ra sẽ hoàn toàn xa lạ và không có bất kỳ mối liên hệ nào với chuỗi băm ban đầu.  
> - Khi Smart Contract kiểm tra mapping `isHashRegistered[contentHash]`, chuỗi băm mới này không hề tồn tại trong danh bạ on-chain, do đó hợp đồng revert ngay lập tức và cổng verify kích hoạt cảnh báo đỏ. Điều này chứng minh rằng việc giả mạo một tác phẩm mà vẫn giữ nguyên được mã băm là bất khả thi về mặt toán học."
