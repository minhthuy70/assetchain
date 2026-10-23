# AssetChain

> **Blockchain-Based Digital Asset Ownership Registration and Management System**  
> Dự án môn học Chuyên đề / Đồ án tốt nghiệp ngành Công nghệ Thông tin.

AssetChain là nền tảng đăng ký, xác minh và quản lý quyền sở hữu tài sản số kết hợp công nghệ **Blockchain (EVM)** và kiến trúc **Web2 hiện đại (Next.js + NestJS + PostgreSQL)**. Hệ thống cung cấp cơ chế minh chứng sự tồn tại (*Proof of Existence*), truy vết nguồn gốc giao dịch (*Provenance*) và công cụ xác thực tính toàn vẹn dữ liệu số độc lập.

---

## 📌 Tuyên Bố Pháp Lý & Kỹ Thuật

> [!IMPORTANT]
> - **Vai trò kỹ thuật của Blockchain:** Blockchain ghi nhận mốc thời gian không thể sửa đổi (*Timestamp*) và dấu vân tay số (*SHA-256 fingerprint*) của tài sản tại thời điểm đăng ký.
> - **Giới hạn pháp lý:** Việc đăng ký trên blockchain **không** tự động thay thế văn bằng bảo hộ quyền sở hữu trí tuệ do cơ quan nhà nước có thẩm quyền cấp. Hệ thống giải quyết bài toán kỹ thuật về bằng chứng số ban đầu và lịch sử chuyển nhượng minh bạch.
> - **Nguyên tắc bảo mật:** Tuyệt đối **không** lưu trữ mật khẩu, khóa riêng tư (private keys), file nhị phân dung lượng lớn hay dữ liệu cá nhân nhạy cảm on-chain.

---

## 🏗️ Kiến Trúc Hệ Thống

```
+--------------------------------------------------------------------------+
|                            CLIENT TIER                                   |
|   - Next.js (App Router, TypeScript, Tailwind CSS)                       |
|   - Web3 Provider: MetaMask Browser Extension, ethers.js v6              |
+------------------------------------+-------------------------------------+
                                     |
             +-----------------------+-----------------------+
             | REST API / JWT                                | Web3 RPC / Transactions
             v                                               v
+------------------------------------+       +-----------------------------+
|           BACKEND TIER             |       |       BLOCKCHAIN TIER       |
| - NestJS RESTful Architecture      |       | - Hardhat Local EVM Network |
| - Auth: JWT + SIWE Wallet Binding  |       | - Chain ID: 31337           |
| - Asset Processing & SHA-256 Hash  |       | - AssetRegistry.sol         |
| - Transaction Receipt Verification |       |   (ERC-721 + Proof of       |
| - Integrity Verification Engine    |       |    Existence + Fingerprint) |
+------------------+-----------------+       +-----------------------------+
                   |
     +-------------+-------------+
     v                           v
+-----------------+     +-----------------+
|   PostgreSQL    |     |  File Storage   |
| (Prisma ORM 5+) |     | (Local / IPFS)  |
+-----------------+     +-----------------+
```

### Phân định On-chain vs Off-chain
- **On-chain (Smart Contracts):** `tokenId`, mã băm `contentHash` (bytes32), địa chỉ ví người tạo (`creator`), địa chỉ ví chủ sở hữu (`owner`), `registeredAt`, `tokenURI`.
- **Off-chain (PostgreSQL):** Thông tin tài khoản, mật khẩu băm, hồ sơ creator, tiêu đề, mô tả, danh mục, file gốc, fileSize, lịch sử cấp phép, logs tranh chấp.

---

## 📁 Cấu Trúc Thư Mục Chuẩn

```
assetchain/
├── contracts/               # Smart Contracts (Hardhat, Solidity ^0.8.24)
│   ├── contracts/           # Mã nguồn Solidity (AssetRegistry.sol, ...)
│   ├── test/                # Unit tests cho Smart Contracts (ethers, chai)
│   ├── scripts/             # Kịch bản deploy & seed dữ liệu
│   └── hardhat.config.ts    # Cấu hình mạng EVM local
│
├── backend/                 # Backend REST API (NestJS, TypeScript)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Xác thực JWT, SIWE Wallet Challenge
│   │   │   ├── users/       # Quản lý tài khoản & hồ sơ Creator
│   │   │   ├── assets/      # Upload, tính hash SHA-256, verify receipt
│   │   │   ├── blockchain/  # Dịch vụ kết nối RPC, đọc contract & logs
│   │   │   ├── ownership/   # Quản lý lịch sử chuyển nhượng
│   │   │   ├── licenses/    # Cấp phép quyền sử dụng (Phase 2)
│   │   │   └── admin/       # Xử lý báo cáo tranh chấp & kiểm duyệt
│   │   └── prisma/          # Prisma schema, migrations, seed
│   └── test/                # Unit & E2E tests cho Backend
│
├── frontend/                # Web Application (Next.js 14/15, Tailwind CSS)
│   ├── src/
│   │   ├── app/             # App Router pages (Home, Explore, Register, Verify, Dashboard)
│   │   ├── components/      # UI Components (Navbar, WalletButton, AssetCard, FileDropzone)
│   │   ├── hooks/           # Custom hooks (useWallet, useContract, useAuth)
│   │   ├── lib/             # Ethers helper, API client, utils
│   │   └── types/           # TypeScript interfaces
│   └── tailwind.config.ts
│
├── docs/                    # Tài liệu kiến trúc & thiết kế
│   ├── architecture.md      # Thiết kế kiến trúc & luồng dữ liệu chi tiết
│   ├── erd.md               # Mô hình cơ sở dữ liệu quan hệ (Prisma ERD)
│   ├── api_spec.md          # Đặc tả toàn bộ REST API endpoints
│   └── contracts_spec.md    # Đặc tả Smart Contracts
│
├── docker-compose.yml       # Khởi chạy PostgreSQL 16 & Adminer cục bộ
├── .env.example             # Mẫu biến môi trường
├── .gitignore               # Cấu hình loại trừ file nhạy cảm & artifacts
└── README.md                # Tài liệu tổng quan dự án
```

---

## 👥 Các Vai Trò Trong Hệ Thống (Roles)

1. **Khách vãng lai (Guest):**
   - Xem thư viện tài sản số công khai.
   - Sử dụng công cụ kéo-thả tệp để **Xác minh tính toàn vẹn (Integrity Verifier)** tức thì qua mã băm SHA-256 đối chiếu on-chain.
   - Xem dòng thời gian nguồn gốc tài sản (Provenance History).
2. **Người dùng / Nhà sáng tạo (Creator/User):**
   - Đăng ký/đăng nhập tài khoản và liên kết ví MetaMask qua chữ ký mật mã học.
   - Đăng ký tài sản số mới (tính hash, tạo metadata, ký mint token trên ví MetaMask).
   - Quản lý tài sản số cá nhân, chuyển quyền sở hữu cho người khác.
   - Thiết lập điều khoản cấp quyền sử dụng tài sản (Licensing).
3. **Quản trị viên (Admin):**
   - Quản lý trạng thái người dùng (kích hoạt, khóa tài khoản).
   - Tiếp nhận và xử lý báo cáo tranh chấp bản quyền (Disputes).
   - Đánh dấu trạng thái tài sản vi phạm (`FLAGGED` / `REVOKED`) trên database và hợp đồng thông minh.

---

## 🚀 Lộ Trình Triển Khai (Roadmap)

### Giai đoạn 1: Khởi tạo nền tảng & Kiến trúc (Hiện tại - Foundation Phase)
- [x] Khảo sát môi trường và cấu trúc Git.
- [x] Thiết lập `.gitignore`, `.env.example`, `docker-compose.yml`.
- [x] Tài liệu hóa thiết kế hệ thống (`docs/architecture.md`, `docs/erd.md`, `docs/api_spec.md`, `docs/contracts_spec.md`).
- [ ] Khởi tạo khung dự án `contracts/` với Hardhat, OpenZeppelin contracts và unit tests.
- [ ] Khởi tạo khung dự án `backend/` với NestJS và Prisma ORM schema.
- [ ] Khởi tạo khung dự án `frontend/` với Next.js và Tailwind CSS.

### Giai đoạn 2: MVP Core (Mục tiêu Demo đầu tiên)
- [ ] Smart contract `AssetRegistry.sol` hoàn chỉnh, compile và unit test 100% pass.
- [ ] Docker PostgreSQL + Prisma migration.
- [ ] Backend: Module xác thực (JWT + liên kết ví), Upload file, SHA-256 hasher, Verify on-chain receipt, API tra cứu tính toàn vẹn.
- [ ] Frontend: Kết nối MetaMask, Giao diện kéo-thả file xác thực (Integrity Verifier), Form đăng ký tài sản số gọi smart contract qua MetaMask.

### Giai đoạn 3: Nghiệp vụ Nâng cao (Post-MVP)
- [ ] Module cấp phép bản quyền sử dụng tài sản (`AssetLicensing.sol` & Backend APIs).
- [ ] Dashboard dành riêng cho Admin xử lý báo cáo vi phạm.
- [ ] Background worker đồng bộ sự kiện blockchain tự động.
- [ ] Tích hợp lưu trữ phi tập trung IPFS (Pinata/Kubo).

---

## 🛠️ Hướng Dẫn Chạy Local (Quick Start)

### 1. Yêu cầu môi trường
- **Node.js:** `>= 18.x` (Đã kiểm tra tương thích trên `v24.16.0`)
- **Docker & Docker Compose:** Đã cài đặt để chạy PostgreSQL
- **MetaMask Extension:** Đã cài đặt trên trình duyệt

### 2. Khởi động Cơ sở dữ liệu (PostgreSQL)
```bash
# Khởi chạy PostgreSQL và Adminer
docker compose up -d

# Kiểm tra trạng thái container
docker compose ps
```
- PostgreSQL: `localhost:5432` (User: `assetchain_admin`, DB: `assetchain_db`)
- Adminer UI: `http://localhost:8081`

### 3. Cấu hình biến môi trường
Tạo file `.env` từ mẫu có sẵn:
```bash
cp .env.example .env
```

---

## 🧪 Đảm Bảo Chất Lượng & Kiểm Thử
- **Unit Testing Smart Contracts:** Hardhat + Chai + Ethers.js
- **Unit Testing Backend:** Jest + NestJS Testing Module
- **Kiểm tra biên lai giao dịch:** Backend xác thực độc lập trạng thái block và event từ RPC node trước khi ghi nhận trạng thái vào database.
