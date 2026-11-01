# AssetChain - Nền Tảng Đăng Ký & Quản Lý Quyền Sở Hữu Tài Sản Số Trên Blockchain

> **Dự án Đồ án Công nghệ Thông tin / Chuyên đề Blockchain (Nhóm 2 thành viên - 14 ngày)**  
> **Kiến trúc:** Local-First Fullstack (Next.js 14/15 + SQLite + Prisma + Hardhat Local EVM)

---

## 📌 1. TỔNG QUAN DỰ ÁN VÀ PHẠM VI CHỨC NĂNG

### 1.1. Giới thiệu
**AssetChain** là nền tảng số hỗ trợ các nhà sáng tạo nội dung (họa sĩ, nhà thiết kế đồ họa, nhiếp ảnh gia) đăng ký, bảo vệ và minh chứng quyền sở hữu tác phẩm số thông qua công nghệ **Blockchain EVM**. Hệ thống kết hợp cơ chế minh chứng sự tồn tại (**Proof of Existence**), quy trình thẩm định hồ sơ của hội đồng quản trị (**Admin Approval**) và phát hành **Chứng nhận điện tử (E-Certificate)** có mã QR xác thực tức thì.

### 1.2. Tuyên bố pháp lý & kỹ thuật
- **Vai trò kỹ thuật:** Blockchain đóng vai trò ghi nhận dấu vân tay số (*SHA-256 fingerprint*) và mốc thời gian không thể sửa đổi (*Timestamp*) tại thời điểm đăng ký.
- **Giới hạn pháp lý:** Hệ thống cung cấp bằng chứng công nghệ độc lập về quyền tác giả ban đầu và lịch sử chuyển nhượng, không tuyên bố thay thế văn bằng bảo hộ sở hữu trí tuệ do cơ quan nhà nước cấp.
- **Nguyên tắc an toàn:** Tuyệt đối **không** lưu file nhị phân dung lượng lớn, mật khẩu hay khóa riêng tư on-chain. Blockchain chỉ lưu `tokenId`, `contentHash`, địa chỉ ví và mốc thời gian.

### 1.3. Phạm vi chức năng cốt lõi
1. **Dành cho Tác giả (Creator):**
   - Đăng ký tài sản: Tải lên tác phẩm số, băm vân tay SHA-256 trực tiếp trên trình duyệt bằng Web Crypto API.
   - Bảng điều khiển cá nhân: Theo dõi trạng thái hồ sơ (Chờ duyệt, Đã duyệt, Đã lên chuỗi, Bị từ chối).
   - Đưa lên Blockchain: Kích hoạt ví MetaMask ký giao dịch mint NFT ERC-721 sau khi được duyệt.
   - Chuyển nhượng quyền sở hữu: Chuyển NFT sang ví khác an toàn kèm ghi nhận lịch sử.
2. **Dành cho Quản trị viên (Admin):**
   - Cổng thẩm định hồ sơ: Xem xét file gốc và thông tin tác giả.
   - Phê duyệt / Từ chối hồ sơ kèm lý do phản hồi minh bạch.
   - Thu hồi chứng nhận nếu phát hiện gian lận hoặc vi phạm bản quyền.
3. **Dành cho Cộng đồng & Khách vãng lai (Public):**
   - Xem và tải Chứng nhận điện tử (E-Certificate PDF) chứa mã QR động.
   - **Cổng xác minh 1-Click (1-Click Verification):** Kéo thả file ảnh bất kỳ vào trang web -> Trình duyệt tự băm SHA-256 và đối chiếu trực tiếp với Smart Contract -> Báo kết quả THẬT / GIẢ trong 1 giây mà không cần tài khoản hay tốn phí gas.

---

## 🛠️ 2. BẢNG CÔNG NGHỆ CUỐI CÙNG & LÝ DO LỰA CHỌN

| Thành phần | Công nghệ lựa chọn | Lý do lựa chọn (Tối ưu cho 2 người trong 14 ngày) |
|---|---|---|
| **Frontend** | **Next.js 14/15 + TypeScript + Tailwind CSS** | Framework hiện đại, hỗ trợ SSR/CSR linh hoạt, Tailwind CSS giúp dựng giao diện cực nhanh, đẹp mắt và đồng bộ. |
| **Backend** | **Next.js App Router Route Handlers (`/api/*`)** | Fullstack trong 1 repository duy nhất, loại bỏ hoàn toàn NestJS riêng biệt, không cần chạy 2 server song song, tiết kiệm 40% thời gian cấu hình và tránh lỗi CORS. |
| **Database** | **SQLite + Prisma ORM** | Không cần cài đặt PostgreSQL, không cần Docker container, cơ sở dữ liệu là 1 file duy nhất (`prisma/dev.db`), khởi động tức thì, không lo xung đột cổng. |
| **Smart Contract** | **Solidity 0.8.x + OpenZeppelin** | Tiêu chuẩn công nghiệp cho EVM, thừa kế `ERC721URIStorage`, `Ownable`, `Pausable` an toàn tuyệt đối. |
| **Blockchain** | **Hardhat Local Network (Port 8545)** | Mạng EVM local siêu nhẹ, Chain ID `31337`, tạo sẵn 20 ví test có 10,000 ETH, đào block tức thì trong 0 giây. |
| **Blockchain SDK** | **Ethers.js v6** | Thư viện tương tác Web3 chuẩn mực, hỗ trợ tương tác contract, đọc event, chuyển đổi hex sang `bytes32`. |
| **Ví Web3** | **MetaMask Extension** | Ví phổ biến nhất thế giới, dễ kết nối với mạng Hardhat Local `127.0.0.1:8545`. |
| **Lưu trữ file** | **Local File Storage (`public/uploads`)** | Lưu trực tiếp vào thư mục tĩnh của Next.js, hiển thị ảnh ngay lập tức, không phụ thuộc internet hay tài khoản Pinata/IPFS trong giai đoạn phát triển. |
| **Tính toàn vẹn** | **Web Crypto API (SHA-256)** | Chuẩn trình duyệt gốc, tính mã băm cực nhanh tại máy client trước khi gửi lên server, bảo mật và tiết kiệm băng thông. |
| **Chứng nhận** | **jsPDF + qrcode** | Thư viện client/server xuất file PDF chứng nhận trang trọng và sinh mã QR động trỏ tới link xác minh. |

---

## 🏛️ 3. KIẾN TRÚC HỆ THỐNG VÀ 6 LUỒNG NGHIỆP VỤ

### 3.1. Sơ đồ kiến trúc 3 lớp
```
+--------------------------------------------------------------------------+
|                       1. CLIENT TIER (Browser)                           |
|   - Next.js UI (App Router, Tailwind CSS, Lucide Icons)                  |
|   - Web Crypto API (SHA-256 client-side fingerprinting)                  |
|   - MetaMask Wallet (ký giao dịch mint, transfer)                        |
+------------------------------------+-------------------------------------+
                                     |
             +-----------------------+-----------------------+
             | REST API / JSON-RPC                           | JSON-RPC (Port 8545)
             v                                               v
+------------------------------------+       +-----------------------------+
|    2. APPLICATION TIER (Next.js)   |       |     3. BLOCKCHAIN TIER      |
| - Route Handlers: /api/assets,     |       | - Hardhat Local EVM Node    |
|   /api/admin, /api/verify          |       | - Chain ID: 31337           |
| - Prisma ORM (Client)              |       | - AssetRegistry.sol         |
| - PDF & QR Code Engine             |       |   (ERC-721 + Proof of       |
+------------------+-----------------+       |    Existence)               |
                   |                         +-----------------------------+
      +------------+------------+
      v                         v
+-----------------+     +-----------------+
|     SQLite      |     |  Local Storage  |
| (prisma/dev.db) |     | (public/uploads)|
+-----------------+     +-----------------+
```

### 3.2. Bảng phân định dữ liệu 3 lớp
- **Blockchain (On-Chain):** `tokenId`, `bytes32 contentHash`, `creatorAddress`, `ownerAddress`, `registeredAt`, `tokenURI`, `isRevoked`.
- **SQLite (Off-Chain):** Tài khoản, mật khẩu băm, tiêu đề, mô tả, danh mục, kích thước file, trạng thái duyệt (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `REGISTERED`), lý do từ chối.
- **Local File Storage:** File gốc tại `public/uploads/` và file chứng nhận tại `public/certificates/`.

### 3.3. Tóm tắt 6 luồng dữ liệu cốt lõi
1. **Đăng ký tài sản:** Client tính SHA-256 -> Gửi multipart lên `/api/assets` -> Lưu file vào `public/uploads/` -> Kiểm tra trùng hash -> Lưu SQLite với trạng thái `PENDING_APPROVAL`.
2. **Xét duyệt hồ sơ:** Admin xem hồ sơ trên `/admin/approvals` -> Bấm Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED` + lý do).
3. **Xác nhận on-chain:** Creator bấm "Đưa lên chuỗi" -> MetaMask ký gọi `registerAsset()` trên contract -> Gửi biên nhận về `/api/assets/[id]/sync-onchain` -> Backend kiểm tra receipt qua RPC -> Đổi trạng thái sang `REGISTERED`.
4. **Cấp & Xác minh chứng nhận:** Sinh mã số chứng nhận `CERT-2026-XXXX`, tạo mã QR link tới `/verify?hash=...`, xuất PDF -> Cổng xác minh cho phép kéo thả file để đối chiếu trực tiếp với hàm `getAssetByHash()` trên Smart Contract.
5. **Cơ chế đồng bộ:** Client gửi `txHash` về API, backend dùng `ethers.JsonRpcProvider` đọc lại receipt và logs sự kiện từ Hardhat node để cập nhật SQLite an toàn trong 1 transaction.
6. **Xử lý sự cố Blockchain:** Nếu giao dịch bị hủy hoặc lỗi mạng, bản ghi trong SQLite vẫn giữ nguyên `APPROVED` với nút "Thực hiện lại giao dịch", không bị mất dữ liệu đã nhập.

---

## 📂 4. CẤU TRÚC THƯ MỤC DỰ ÁN

Toàn bộ dự án được tổ chức theo mô hình **Monorepo Tinh Gọn (Single Next.js Root)**:

```
assetchain/
├── contracts/                     # PHẦN SMART CONTRACTS (Hardhat)
│   ├── contracts/
│   │   └── AssetRegistry.sol      # Hợp đồng thông minh lõi ERC-721
│   ├── scripts/
│   │   ├── deploy.js              # Script deploy và tự động copy ABI sang src/
│   │   └── seed.js                # Script seed dữ liệu on-chain phục vụ demo
│   ├── test/
│   │   └── AssetRegistry.test.js  # 15-20 unit test cases (Chai + Ethers)
│   └── hardhat.config.js          # Cấu hình mạng EVM local (Port 8545, chainId 31337)
│
├── prisma/                        # CƠ SỞ DỮ LIỆU SQLITE
│   ├── schema.prisma              # Prisma schema models (User, Asset, History, Cert)
│   └── dev.db                     # File database SQLite cục bộ (chỉ lưu trên máy cá nhân)
│
├── public/                        # STATIC ASSETS & STORAGE
│   ├── uploads/                   # Thư mục lưu file tài sản người dùng tải lên
│   └── certificates/              # Thư mục lưu file PDF chứng nhận đã xuất
│
├── src/                           # MÃ NGUỒN FULLSTACK NEXT.JS
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Landing page (/), Explore gallery
│   │   ├── (auth)/                # Trang đăng nhập, đăng ký
│   │   ├── creator/               # Giao diện Tác giả (Form đăng ký, Dashboard)
│   │   ├── admin/                 # Cổng quản trị xét duyệt (/admin/approvals)
│   │   ├── verify/                # Cổng tra cứu & Kéo thả xác minh 1-Click
│   │   └── api/                   # BACKEND ROUTE HANDLERS
│   │       ├── auth/              # /api/auth (login, register, me)
│   │       ├── assets/            # /api/assets (upload, list, sync-onchain)
│   │       ├── admin/             # /api/admin/assets (review approve/reject)
│   │       └── verify/            # /api/verify (tra cứu hash, tokenId)
│   ├── components/                # UI Components tái sử dụng (Navbar, WalletButton, Dropzone)
│   ├── contracts/                 # Contract ABI & Deployed Address (sinh tự động sau deploy)
│   │   └── AssetRegistry.json
│   └── lib/                       # Modules tiện ích (prisma.ts, ethers.ts, hash.ts, pdf.ts)
│
├── .env.example                   # Mẫu cấu hình môi trường chuẩn
├── .gitignore                     # Loại trừ file nhạy cảm và build artifacts
├── package.json                   # Dependencies toàn dự án
└── README.md                      # Tài liệu hướng dẫn dự án
```

---

## 👥 5. PHÂN CHIA CÔNG VIỆC CHI TIẾT (VERTICAL SLICING)

| Tiêu chí | **Thành Viên A (Nền tảng & Đăng ký)** | **Thành Viên B (Xét duyệt & Chứng nhận)** |
|---|---|---|
| **Chức năng chính** | - Khởi tạo project Next.js + Tailwind + Prisma SQLite.<br>- Viết Smart Contract lõi `AssetRegistry.sol` & Unit tests.<br>- Form đăng ký tài sản (Upload, Web Crypto SHA-256).<br>- API Upload và xử lý trùng hash trong SQLite.<br>- Tích hợp MetaMask ký mint NFT on-chain.<br>- Dashboard tác giả (`/creator/my-assets`).<br>- Chức năng Chuyển nhượng quyền sở hữu (`transferAsset`). | - Xây dựng Layout tổng thể & Component kết nối ví.<br>- Cổng quản trị thẩm định hồ sơ Admin (`/admin/approvals`).<br>- API duyệt / từ chối hồ sơ (Approve / Reject).<br>- Bộ sinh E-Certificate PDF & tạo mã QR động.<br>- Cổng tra cứu xác minh công khai (`/verify`).<br>- Tính năng 1-Click Drag-and-Drop Verification.<br>- Nghiệp vụ thu hồi bản quyền (`revokeAsset`). |
| **Phần dùng chung** | Chịu trách nhiệm chính cấu trúc hợp đồng và Prisma schema ban đầu. Khóa ABI và schema vào Ngày 2. | Nhận ABI và schema để xây dựng cổng Admin và cổng xác minh mà không phải chờ Thành viên A code xong giao diện. |

---

## 💻 6. QUY TRÌNH LÀM VIỆC ĐỘC LẬP TRÊN 2 MÁY LOCAL

### 6.1. Yêu cầu cài đặt trên mỗi máy
- **Node.js:** Phiên bản LTS >= 18.x (khuyến nghị 20.x).
- **Git:** Bản mới nhất.
- **Trình duyệt & Extension:** Google Chrome + Ví **MetaMask**.

### 6.2. Hướng dẫn cài đặt và khởi chạy dự án
Mỗi thành viên thực hiện các bước sau trên máy của mình:

```bash
# Bước 1: Clone repository
git clone https://github.com/minhthuy70/assetchain.git
cd assetchain

# Bước 2: Cài đặt dependencies (chỉ 1 lệnh duy nhất cho toàn bộ dự án)
npm install

# Bước 3: Tạo file cấu hình môi trường cục bộ
cp .env.example .env

# Bước 4: Khởi tạo database SQLite cục bộ
npx prisma db push
npx prisma db seed # (tạo sẵn tài khoản admin & creator mẫu)
```

### 6.3. Khởi chạy 2 tiến trình để làm việc hàng ngày

Mở **2 cửa sổ Terminal**:

- **Terminal 1: Chạy Blockchain Local (Hardhat Node)**
  ```bash
  npx hardhat node
  ```
  *(Node sẽ chạy tại `http://127.0.0.1:8545`, hiển thị 20 tài khoản test kèm 10,000 ETH)*

- **Terminal 2: Deploy Contract và chạy Next.js**
  ```bash
  # Deploy contract lên local node vừa bật (chỉ mất 2 giây)
  npx hardhat run contracts/scripts/deploy.js --network localhost

  # Khởi chạy Next.js Fullstack (giao diện + API)
  npm run dev
  ```
  *(Truy cập ứng dụng tại: `http://localhost:3000`)*

### 6.4. Xử lý đặc thù Blockchain Local trên 2 máy riêng biệt
- **Vấn đề:** Hardhat node trên 2 máy sinh ra state riêng biệt; transaction hash trên máy A không tồn tại trên máy B.
- **Giải pháp:**
  - Hardhat sử dụng tài khoản deployer cố định (Account #0: `0xf39Fd6e5...`). Do đó, địa chỉ contract khi deploy lần đầu trên cả 2 máy **luôn luôn giống hệt nhau** (`0x5FbDB2315678afecb367f032d93F642f64180aa3`).
  - Trong quá trình phát triển độc lập, mỗi thành viên tự test trên chuỗi local của máy mình.
  - **Quy trình Demo:** Khi tích hợp lên máy thuyết trình, chỉ cần chạy 1 lệnh duy nhất:
    ```bash
    npm run demo:reset
    ```
    Script này sẽ tự động: reset database SQLite -> deploy lại contract -> nạp sẵn 3 tác phẩm số mẫu (1 đã duyệt và mint, 1 chờ duyệt, 1 bị từ chối) -> sẵn sàng trình chiếu mượt mà trong 10 giây!

---

## 🌿 7. QUY TRÌNH GIT VÀ TÍCH HỢP CODE

- **Nhánh chính (`main`):** Chỉ chứa mã nguồn đã kiểm thử và chạy ổn định.
- **Nhánh thành viên:**
  - Thành viên A làm việc trên nhánh: `feature/member-a-registration`
  - Thành viên B làm việc trên nhánh: `feature/member-b-approval-cert`
- **Quy tắc cam kết (Commit):**
  - Không commit các file sau lên Git (đã có trong `.gitignore`):
    - `.env`
    - `node_modules/`
    - `prisma/dev.db` và `*.db-journal`
    - `public/uploads/*` (ngoại trừ file `.gitkeep`)
    - `public/certificates/*` (ngoại trừ file `.gitkeep`)
    - `contracts/artifacts/` và `contracts/cache/`
- **Tích hợp:** Tại các mốc M1 (Ngày 3), M2 (Ngày 8), M3 (Ngày 10), M4 (Ngày 12), hai thành viên tạo Pull Request, cùng review chéo và merge vào `main`.

---

## 📅 8. KẾ HOẠCH TRIỂN KHAI 14 NGÀY (TÓM TẮT)

- **Ngày 1 - 3 (Khung nền tảng & Contract):** Khởi tạo Next.js, Prisma SQLite, Hardhat node, contract `AssetRegistry.sol`, Unit test 100% pass, Mốc M1.
- **Ngày 4 - 7 (Triển khai Slice độc lập):** A làm luồng Đăng ký & Mint on-chain; B làm Cổng Admin duyệt hồ sơ & Bộ sinh E-Certificate PDF/QR.
- **Ngày 8 (Mốc M2):** Tích hợp luồng chéo liên máy lần 1 (Đăng ký -> Duyệt -> Mint -> Xuất chứng nhận -> Tra cứu).
- **Ngày 9 - 11 (Nâng cấp trải nghiệm):** A làm Dashboard & Chuyển nhượng; B làm Cổng xác minh kéo-thả 1-Click & Thu hồi bản quyền.
- **Ngày 12 - 13 (Kiểm thử, Chuẩn hóa demo):** Test lỗi, viết script 1-Click Reset Demo, diễn tập thuyết trình 5 phút.
- **Ngày 14:** BẢO VỆ ĐỒ ÁN VÀ ĐẠT ĐIỂM TỐI ĐA (10/10).

---

## ✅ 9. CHECKLIST KIỂM THỬ VÀ TIÊU CHÍ HOÀN THÀNH

| Hạng mục kiểm thử | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|
| **Smart Contract** | `npx hardhat test` | 15-20 unit test cases đều pass màu xanh, kiểm tra đủ mint, trùng hash, chuyển quyền, thu hồi. |
| **Băm Client-side** | Chọn 1 file ảnh tại `/creator/register` | Mã SHA-256 (64 ký tự hex) hiển thị tức thì dưới tên file trước khi nhấn nút Gửi. |
| **Chống trùng lặp** | Upload lại đúng file ảnh đó lần thứ 2 | Hệ thống báo lỗi trùng lặp ngay tại giao diện, không tạo thêm bản ghi. |
| **Quy trình Admin** | Mở `/admin/approvals` và bấm Duyệt | Trạng thái đổi thành `APPROVED`, tác giả thấy hồ sơ chuyển sang trạng thái sẵn sàng mint. |
| **Giao dịch Web3** | Bấm "Đưa lên Blockchain" qua MetaMask | Giao dịch thành công, trừ đúng lượng gas test, sinh `tokenId` và `txHash`. |
| **Chứng nhận PDF** | Bấm "Tải chứng nhận" | Xuất file PDF sắc nét, mã QR quét bằng điện thoại mở ra đúng link xác minh tài sản. |
| **1-Click Verify** | Kéo thả file gốc vào `/verify` | Hệ thống báo: "CHỨNG NHẬN HỢP LỆ VÀ NGUYÊN BẢN" kèm mốc thời gian on-chain. |
| **Phát hiện giả mạo**| Sửa 1 điểm ảnh trên file rồi kéo vào `/verify` | Hệ thống báo: "CẢNH BÁO: TỆP TIN CHƯA TỪNG ĐƯỢC ĐĂNG KÝ HOẶC ĐÃ BỊ CHỈNH SỬA!" |
