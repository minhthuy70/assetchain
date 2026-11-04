# **KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT 14 NGÀY — THÀNH VIÊN A**
## **NỀN TẢNG KIẾN TRÚC, SMART CONTRACT & ĐĂNG KÝ TÀI SẢN (CREATOR PORTAL)**

> **Dự án:** AssetChain — Hệ thống Đăng ký và Quản lý Quyền Sở hữu Tài sản Số trên Nền tảng Blockchain  
> **Thành viên phụ trách:** **Thành viên A** (Trưởng nhóm Kỹ thuật / Web3 Core & Backend Foundation)  
> **Lát cắt dọc (Vertical Slice):** Nền tảng Hệ thống, Smart Contract Core, Database Schema, Luồng Đăng ký & Băm Client-side, Đưa lên Blockchain (Mint NFT ERC-721), Dashboard Tác giả, Chuyển nhượng & Provenance Timeline  
> **Tỷ trọng đóng góp:** 50% khối lượng dự án  
> **Nhánh Git làm việc:** `feature/member-a-registration`  
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

### 1.1. Mục tiêu cốt lõi của Thành viên A
Thành viên A chịu trách nhiệm thiết lập toàn bộ "xương sống" công nghệ của dự án và làm chủ trọn vẹn lát cắt chức năng của **Nhà sáng tạo (Creator)**:
- Khởi tạo monorepo Next.js, cài đặt Prisma ORM SQLite và thiết lập Hardhat Local EVM.
- Thiết kế, lập trình và kiểm thử Smart Contract `AssetRegistry.sol` (kế thừa tiêu chuẩn ERC-721 của OpenZeppelin, lưu trữ bằng chứng tồn tại Proof of Existence).
- Xây dựng luồng đăng ký tác phẩm: tải tệp, tích hợp Web Crypto API băm SHA-256 client-side, kiểm tra trùng lặp trên cơ sở dữ liệu.
- Tích hợp giao dịch Web3 qua ví MetaMask: gọi hàm `registerAsset` đưa tài sản lên chuỗi, xử lý ký giao dịch, đồng bộ kết quả vào SQLite.
- Xây dựng Bảng điều khiển Tác giả (Creator Dashboard), chức năng Chuyển nhượng (Transfer) và Dòng thời gian nguồn gốc (Provenance Timeline).
- Viết script 1-lệnh reset toàn bộ môi trường demo phục vụ báo cáo.

### 1.2. Ranh giới kỹ thuật & Quy ước chống xung đột (No-Conflict Rules)
Để làm việc độc lập 100% trên máy cá nhân mà không gây xung đột Git với Thành viên B:
1. **Smart Contract ABI:** Thành viên A chịu trách nhiệm duy nhất về `contracts/contracts/AssetRegistry.sol`. Khi chạy script deploy, file ABI và Contract Address sẽ tự động xuất ra `src/contracts/AssetRegistry.json`. Thành viên B chỉ việc import file JSON này để sử dụng. ABI được **khóa cố định vào cuối Ngày 2**.
2. **Database Schema:** Thành viên A khởi tạo file `prisma/schema.prisma` vào Ngày 1. Khi Thành viên B cần bổ sung trường cho thực thể `Certificate`, hai người hội ý 5 phút trước khi Thành viên B cập nhật.
3. **Thư mục File Vật Lý:** Thành viên A chỉ làm việc với thư mục upload file gốc: `public/uploads/`. Thư mục chứng nhận `public/certificates/` thuộc quyền quản lý của Thành viên B.

---

# 2. BẢN ĐỒ FILE & THƯ MỤC PHỤ TRÁCH TRỰC TIẾP

| Đường Dẫn File / Thư Mục | Loại File | Quyền Hạn | Trách Nhiệm Chi Tiết |
|:---|:---|:---:|:---|
| `hardhat.config.js` | Config | Sở hữu 100% | Cấu hình mạng Hardhat Local EVM (port 8545, chainId 31337). |
| `contracts/contracts/AssetRegistry.sol` | Solidity | Sở hữu 100% | Smart contract ERC-721 quản lý đăng ký, chuyển nhượng, thu hồi. |
| `contracts/test/AssetRegistry.test.js` | Test JS | Sở hữu 100% | Bộ Unit Test 15-20 test cases bao phủ 100% logic smart contract. |
| `contracts/scripts/deploy.js` | Script JS | Sở hữu 100% | Script deploy contract và tự động xuất ABI sang `src/contracts/`. |
| `contracts/scripts/demo-reset.js` | Script JS | Sở hữu 100% | Script 1-lệnh reset database SQLite, redeploy contract, nạp dữ liệu mẫu. |
| `prisma/schema.prisma` | Schema | Khởi tạo gốc | Định nghĩa các models `User`, `Asset`, `OwnershipHistory`. |
| `src/app/api/assets/route.ts` | API Route | Sở hữu 100% | API upload tệp, kiểm tra trùng lặp hash, lưu bản ghi `PENDING_APPROVAL`. |
| `src/app/api/assets/my-assets/route.ts` | API Route | Sở hữu 100% | API lấy danh sách tài sản của tác giả kèm bộ lọc trạng thái. |
| `src/app/api/assets/[id]/sync-onchain/route.ts` | API Route | Sở hữu 100% | API đối chiếu receipt và đồng bộ trạng thái `REGISTERED` vào DB. |
| `src/app/api/auth/register/route.ts` | API Route | Sở hữu 100% | API đăng ký tài khoản tác giả / liên kết ví MetaMask. |
| `src/app/api/auth/login/route.ts` | API Route | Sở hữu 100% | API đăng nhập hệ thống và cấp phiên làm việc. |
| `src/app/creator/register/page.tsx` | UI Page | Sở hữu 100% | Giao diện nộp hồ sơ, chọn file ảnh, xem trực tiếp mã SHA-256. |
| `src/app/creator/my-assets/page.tsx` | UI Page | Sở hữu 100% | Dashboard tác giả, danh sách tài sản, nút "Đưa lên Blockchain". |
| `src/app/creator/transfer/page.tsx` | UI Page | Sở hữu 100% | Giao diện chuyển nhượng NFT sang địa chỉ ví mới. |
| `src/components/ProvenanceTimeline.tsx` | Component | Sở hữu 100% | Thành phần giao diện hiển thị lịch sử quyền sở hữu qua các khối. |
| `src/lib/onchain.ts` | Helper TS | Sở hữu 100% | Tiện ích gọi hàm contract `registerAsset`, `transferAsset` bằng ethers.js. |

---

# 3. QUY TRÌNH CHẠY MÔI TRƯỜNG HÀNG NGÀY TRÊN MÁY LOCAL

Mỗi ngày bắt đầu làm việc, Thành viên A mở **2 cửa sổ Terminal**:

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
# TERMINAL 2: Deploy Contract và Chạy Fullstack Next.js
# ==============================================================================
# Bước 1: Deploy smart contract (mất 2s, tự động cập nhật src/contracts/AssetRegistry.json)
npx hardhat run contracts/scripts/deploy.js --network localhost

# Bước 2: Đồng bộ cấu trúc Database SQLite (nếu có cập nhật schema)
npx prisma db push

# Bước 3: Khởi động giao diện và API
npm run dev
# -> Truy cập ứng dụng tại http://localhost:3000
```

> [!TIP]
> **Khôi phục Nonce MetaMask khi khởi động lại node:**  
> Nếu restart lại Hardhat node, mở tiện ích MetaMask -> Chọn tài khoản -> Bấm biểu tượng 3 chấm góc phải -> **Cài đặt (Settings)** -> **Nâng cao (Advanced)** -> Bấm **"Xóa dữ liệu tài khoản / Xóa lịch sử hoạt động" (Clear activity tab data)** để reset nonce về 0, tránh lỗi "Nonce too high".

---

# 4. LỘ TRÌNH HÀNH ĐỘNG CHI TIẾT 14 NGÀY (DAY 1 - DAY 14)

---

### NGÀY 1: KHỞI TẠO NỀN TẢNG KIẾN TRÚC & DATABASE SQLITE
- **Mục tiêu:** Dựng xong khung dự án Fullstack Next.js, cài đặt Prisma SQLite, khởi tạo môi trường Hardhat EVM.
- **Chi tiết các bước thực hiện:**
  1. Khởi tạo mã nguồn Next.js 14/15 TypeScript:
     ```bash
     npx create-next-app@latest assetchain --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
     cd assetchain
     ```
  2. Cài đặt các gói phụ thuộc Web3 & Database:
     ```bash
     npm install ethers @openzeppelin/contracts prisma @prisma/client lucide-react clsx tailwind-merge
     npm install -D hardhat @nomicfoundation/hardhat-toolbox
     ```
  3. Cấu hình thư mục cấu trúc chuẩn:
     ```bash
     mkdir -p contracts/contracts contracts/scripts contracts/test
     mkdir -p public/uploads public/certificates
     mkdir -p src/contracts src/lib
     touch public/uploads/.gitkeep public/certificates/.gitkeep
     ```
  4. Khởi tạo Prisma SQLite trong `prisma/schema.prisma`:
     - Thiết lập datasource SQLite (`DATABASE_URL="file:./dev.db"`).
     - Định nghĩa các models ban đầu: `User`, `Asset`, `OwnershipHistory`, `Certificate`.
  5. Chạy lệnh tạo DB cục bộ:
     ```bash
     npx prisma db push
     ```
  6. Khởi tạo Hardhat cấu hình trong `hardhat.config.js` trỏ đúng thư mục `contracts/`.
- **Đầu ra Ngày 1:** Chạy được `npm run dev`; mở được `npx prisma studio` kiểm tra database SQLite rỗng thành công. Commit code khởi tạo lên nhánh `main` và rẽ nhánh `feature/member-a-registration`.

---

### NGÀY 2: SMART CONTRACT `AssetRegistry.sol` & BỘ 15+ UNIT TESTS
- **Mục tiêu:** Hoàn thiện smart contract lõi đạt 100% pass unit test, bảo mật chống trùng lặp dữ liệu on-chain.
- **Chi tiết các bước thực hiện:**
  1. Viết hợp đồng `contracts/contracts/AssetRegistry.sol`:
     - Kế thừa `ERC721URIStorage`, `Ownable`, `Pausable` từ OpenZeppelin v5.
     - Struct `AssetRecord` lưu: `tokenId`, `bytes32 contentHash`, `creator`, `registeredAt`, `isRevoked`, `revocationReason`.
     - Mapping kép: `mapping(uint256 => AssetRecord) public assets`, `mapping(bytes32 => uint256) public hashToTokenId`, `mapping(bytes32 => bool) public isHashRegistered`.
     - Hàm `registerAsset(address to, string memory uri, bytes32 contentHash)` có kiểm tra `!isHashRegistered[contentHash]`.
     - Hàm `transferAsset(address to, uint256 tokenId)` kiểm tra quyền sở hữu.
     - Hàm view tra cứu 0 Gas `getAssetByHash(bytes32 contentHash)`.
     - Hàm quản trị `revokeAsset(uint256 tokenId, string memory reason)` chỉ Admin deployer được gọi.
  2. Viết bộ Unit Test trong `contracts/test/AssetRegistry.test.js` bao gồm tối thiểu 15 kịch bản:
     - Test mint NFT thành công, tăng `tokenId` tuần tự.
     - Test lưu đúng mã băm SHA-256 (`bytes32`).
     - Test chống trùng lặp: đăng ký cùng 1 hash lần 2 phải revert với lỗi `"Hash already registered on-chain"`.
     - Test chuyển nhượng thành công và cập nhật đúng chủ sở hữu `ownerOf`.
     - Test chặn người không phải chủ tài sản thực hiện chuyển nhượng.
     - Test thu hồi tài sản và kiểm tra cờ `isRevoked = true`.
     - Test chặn người không phải Admin gọi lệnh thu hồi (`OwnableUnauthorizedAccount`).
  3. Chạy kiểm thử:
     ```bash
     npx hardhat test
     ```
- **Đầu ra Ngày 2:** Toàn bộ 15-20 test cases hiển thị màu xanh lá cây 100%; Đo lường chi phí Gas mint và transfer ở mức tối ưu. Khóa cố định giao diện ABI hợp đồng.

---

### NGÀY 3: SCRIPT DEPLOY TỰ ĐỘNG & MỐC TÍCH HỢP M1
- **Mục tiêu:** Tự động hóa quá trình xuất ABI sang frontend, kiểm thử tích hợp node local và đạt mốc M1.
- **Chi tiết các bước thực hiện:**
  1. Viết script `contracts/scripts/deploy.js`:
     - Triển khai hợp đồng `AssetRegistry` lên mạng cục bộ.
     - Lấy địa chỉ contract (`contract.getAddress()`).
     - Đọc file artifact và tự động xuất ra `src/contracts/AssetRegistry.json` gồm `{ address, chainId: 31337, abi }`.
  2. Khởi động Hardhat local node:
     ```bash
     npx hardhat node
     ```
  3. Deploy contract thử nghiệm:
     ```bash
     npx hardhat run contracts/scripts/deploy.js --network localhost
     ```
  4. Phối hợp với Thành viên B: Thành viên B hoàn thành nút kết nối ví MetaMask (`WalletButton.tsx`). Kiểm tra trên trình duyệt: kết nối vào mạng `http://127.0.0.1:8545`, nhận diện Chain ID `31337`, đọc đúng số dư 10,000 ETH test.
- **Đầu ra Ngày 3 (MỐC M1):** Deploy thành công contract; Frontend tự động load được địa chỉ và ABI; Kết nối ví MetaMask mượt mà.

---

### NGÀY 4: FORM ĐĂNG KÝ TÀI SẢN & TÍCH HỢP BĂM SHA-256 CLIENT
- **Mục tiêu:** Xây dựng trang nộp hồ sơ tác phẩm, băm file bằng Web Crypto API ngay trên trình duyệt và lưu file gốc.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng trang giao diện `/creator/register`:
     - Form nhập: Tiêu đề tác phẩm (`title`), Mô tả (`description`), Danh mục (`category`: ART, DOCUMENT, PHOTOGRAPHY,...).
     - Component chọn/kéo thả tệp ảnh (`<input type="file">`).
     - Vùng xem trước ảnh (Image preview).
  2. Tích hợp băm SHA-256 client-side:
     - Khi tác giả chọn file, gọi ngay `computeFileHashSHA256(file)` bằng `window.crypto.subtle.digest("SHA-256", buffer)`.
     - Hiển thị chuỗi Hex 64 ký tự màu xanh nổi bật ngay dưới tên file kèm thời gian băm (ví dụ: `Băm hoàn tất trong 0.04s`).
  3. Viết API lưu trữ file:
     - Tiếp nhận `multipart/form-data`.
     - Lưu file nhị phân vào thư mục `public/uploads/` với tên chuẩn hóa: `${Date.now()}_${shortHash}${ext}`.
- **Đầu ra Ngày 4:** Tác giả chọn ảnh -> Mã băm SHA-256 xuất hiện tức thì trên màn hình -> Bấm nộp thì file được lưu an toàn vào `public/uploads/`.

---

### NGÀY 5: API ĐĂNG KÝ METADATA & KIỂM TRA TRÙNG LẶP SQLITE
- **Mục tiêu:** Hoàn thiện API tiếp nhận hồ sơ, chống trùng lặp dữ liệu trước khi vào hàng đợi duyệt.
- **Chi tiết các bước thực hiện:**
  1. Hoàn thiện `src/app/api/assets/route.ts`:
     - Đọc dữ liệu từ form gửi lên: `file`, `title`, `description`, `category`, `walletAddress`, `creatorId`.
     - Tính lại SHA-256 ở server-side bằng module `crypto` của Node.js để đối chiếu với clientHash (chống giả mạo request).
     - Kiểm tra trong SQLite: `prisma.asset.findUnique({ where: { fileHash } })`.
     - Nếu đã tồn tại: trả về mã lỗi HTTP `409 Conflict` kèm thông báo: *"Tác phẩm này đã từng được đăng ký trong hệ thống!"*.
     - Nếu hợp lệ: tạo bản ghi mới với trạng thái mặc định `status: "PENDING_APPROVAL"`.
  2. Xây dựng trang thông báo nộp thành công:
     - Hiển thị mã hồ sơ, mốc thời gian nộp, mã SHA-256 và trạng thái badge màu vàng: `"Đang chờ Admin thẩm định"`.
- **Đầu ra Ngày 5:** Kiểm thử upload 1 file ảnh -> Nộp thành công vào SQLite. Thử upload lại chính file đó lần 2 -> Hệ thống chặn ngay lập tức và báo lỗi trùng lặp chi tiết.

---

### NGÀY 6: TÍCH HỢP MINT ON-CHAIN QUA METAMASK
- **Mục tiêu:** Kích hoạt giao dịch đưa tài sản lên chuỗi khi hồ sơ đã được Admin phê duyệt.
- **Chi tiết các bước thực hiện:**
  1. Viết tiện ích `src/lib/onchain.ts`:
     - Khởi tạo `BrowserProvider` và `getSigner` từ `window.ethereum`.
     - Khởi tạo `Contract` với ABI từ `AssetRegistry.json`.
     - Chuyển đổi mã băm 64 hex thành chuẩn `bytes32` (`0x...`).
     - Đóng gói metadata JSON (tiêu đề, hash, đường dẫn ảnh) làm `tokenURI`.
  2. Tạo nút **"Đưa lên Blockchain"** trên giao diện:
     - Nút chỉ kích hoạt khi tài sản có trạng thái `APPROVED` (đã được Admin Thành viên B duyệt).
     - Khi tác giả bấm nút: MetaMask bật pop-up yêu cầu ký giao dịch gọi hàm `registerAsset(userAddress, metadataUri, bytes32Hash)`.
     - Xử lý trạng thái loading: hiển thị spinner *"Đang chờ mạng đóng block..."*.
     - Đọc `receipt.logs`, dùng contract interface parse event `AssetRegistered` để trích xuất `tokenId` và `txHash`.
- **Đầu ra Ngày 6:** Bấm nút trên web -> MetaMask xác nhận -> Block đào trong 0.5s -> Nhận về Token ID #1 và Transaction Hash thực tế trên mạng Hardhat.

---

### NGÀY 7: ĐỒNG BỘ DỮ LIỆU ON-CHAIN VÀO SQLITE
- **Mục tiêu:** Cập nhật trạng thái chính thức của tài sản trong database và lưu vết lịch sử sở hữu ban đầu.
- **Chi tiết các bước thực hiện:**
  1. Viết API Route `POST /api/assets/[id]/sync-onchain`:
     - Nhận payload: `{ tokenId, txHash, blockNumber, ownerWallet }`.
     - Cập nhật bản ghi `Asset` trong SQLite:
       - `status = "REGISTERED"`.
       - `tokenId = payload.tokenId`.
       - `txHash = payload.txHash`.
       - `blockNumber = payload.blockNumber`.
       - `registeredAt = new Date()`.
     - Tạo bản ghi khởi đầu trong bảng `OwnershipHistory`:
       - `eventType: "MINT"`.
       - `fromWallet: "0x0000000000000000000000000000000000000000"`.
       - `toWallet: payload.ownerWallet`.
       - `txHash: payload.txHash`.
       - `blockNumber: payload.blockNumber`.
  2. Xử lý kịch bản lỗi: Nếu người dùng từ chối ký giao dịch trên MetaMask (User rejected request), giao diện hiển thị thông báo nhẹ nhàng và cho phép bấm nút ký lại mà không làm mất dữ liệu.
- **Đầu ra Ngày 7:** Hoàn thành trọn vẹn nửa đầu lát cắt dọc: Upload -> SQLite (`PENDING_APPROVAL`) -> Mint on-chain -> SQLite (`REGISTERED`).

---

### NGÀY 8: MỐC TÍCH HỢP M2 (KIỂM THỬ LIÊN MÁY LẦN 1)
- **Mục tiêu:** Hợp nhất mã nguồn 2 nhánh vào `main`, kiểm thử chéo luồng liên máy end-to-end lần đầu tiên.
- **Chi tiết các bước thực hiện:**
  1. Tạo Pull Request từ `feature/member-a-registration` vào `main`.
  2. Họp kỹ thuật 30 phút với Thành viên B: review code chéo, giải quyết xung đột (nếu có).
  3. Kịch bản kiểm thử liên máy:
     - **Máy A:** Đăng ký tác phẩm "Sen Vàng" -> Trạng thái `PENDING_APPROVAL`.
     - **Máy B:** Mở Cổng Admin `/admin/approvals` -> Bấm "Phê duyệt" -> Trạng thái đổi thành `APPROVED`.
     - **Máy A:** Tải lại trang, thấy nút "Đưa lên Blockchain" sáng lên -> Bấm ký MetaMask -> Mint thành công Token #1.
     - **Máy B:** Mở `/verify`, nhập Token #1 hoặc kéo thả file ảnh -> Hệ thống tra cứu đúng dữ liệu on-chain và tải được chứng nhận PDF do Thành viên B sinh ra.
  4. Ghi nhận và sửa toàn bộ lỗi liên quan đến format dữ liệu hoặc sai lệch kiểu số BigInt của ethers v6.
- **Đầu ra Ngày 8 (MỐC M2):** Luồng nghiệp vụ cốt lõi chạy thông suốt 100% giữa hai máy, merge an toàn vào nhánh `main`.

---

### NGÀY 9: BẢNG ĐIỀU KHIỂN TÁC GIẢ (CREATOR DASHBOARD)
- **Mục tiêu:** Hoàn thiện giao diện quản lý tài sản chuyên nghiệp cho tác giả, phân loại trạng thái trực quan.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng trang `/creator/my-assets`:
     - Thanh thống kê trên cùng: Tổng số tài sản, Số tác phẩm đã lên chuỗi, Số hồ sơ đang chờ duyệt, Số hồ sơ bị từ chối.
     - Hệ thống Tabs phân loại:
       - **Tab 1: Tất cả tác phẩm**.
       - **Tab 2: Đã ghi nhận On-Chain** (hiển thị Badge xanh, Token ID, TxHash rút gọn).
       - **Tab 3: Chờ xét duyệt** (hiển thị Badge vàng, ngày nộp).
       - **Tab 4: Cần xử lý / Bị từ chối** (hiển thị Badge đỏ kèm lý do từ chối của Admin để tác giả chỉnh sửa nộp lại).
     - Bộ lọc tìm kiếm theo tiêu đề tác phẩm hoặc mã băm.
  2. Thẻ hiển thị tài sản (Asset Card):
     - Ảnh thumbnail sắc nét, tiêu đề, mã băm rút gọn kèm nút copy 1-click.
     - Các nút hành động tương ứng theo trạng thái: "Đưa lên Blockchain", "Xem chứng nhận", "Chuyển nhượng".
- **Đầu ra Ngày 9:** Dashboard tác giả hoàn thiện giao diện Dark/Light sang trọng, dữ liệu load nhanh và mượt mà.

---

### NGÀY 10: CHỨC NĂNG CHUYỂN NHƯỢNG QUYỀN SỞ HỮU (MỐC M3)
- **Mục tiêu:** Thực hiện chuyển nhượng NFT ERC-721 sang địa chỉ ví mới và lưu vết lịch sử.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng trang/modal Chuyển nhượng (`/creator/transfer`):
     - Hiển thị thông tin tài sản: Token ID, tên tác phẩm, ví sở hữu hiện tại.
     - Ô nhập địa chỉ ví người nhận (`toWalletAddress`).
     - Kiểm tra địa chỉ hợp lệ bằng `ethers.isAddress(address)` trước khi gửi giao dịch.
     - Cảnh báo: *"Hành động chuyển nhượng trên Blockchain không thể đảo ngược. Vui lòng kiểm tra kỹ địa chỉ ví!"*.
  2. Kích hoạt giao dịch chuyển quyền:
     - Gọi hàm smart contract: `contract.transferAsset(toWallet, tokenId)`.
     - MetaMask bật xác nhận giao dịch chuyển nhượng.
     - Đợi giao dịch hoàn tất, gọi API ghi nhận sự kiện vào SQLite:
       - Cập nhật `currentOwnerWallet = toWallet` trong bảng `Asset`.
       - Tạo bản ghi mới trong `OwnershipHistory`: `eventType: "TRANSFER"`.
- **Đầu ra Ngày 10 (MỐC M3):** Chuyển nhượng NFT thành công từ Ví A sang Ví B; Smart contract đổi `ownerOf`; Database cập nhật đúng chủ sở hữu mới.

---

### NGÀY 11: DÒNG THỜI GIAN NGUỒN GỐC (PROVENANCE TIMELINE)
- **Mục tiêu:** Trực quan hóa toàn bộ lịch sử vòng đời của tác phẩm từ lúc khởi tạo đến các lần đổi chủ.
- **Chi tiết các bước thực hiện:**
  1. Xây dựng component `src/components/ProvenanceTimeline.tsx`:
     - Thiết kế giao diện dòng thời gian (Vertical Stepper Timeline) hiện đại.
     - **Mốc 1 (Khởi tạo):** Ngày giờ tác giả nộp hồ sơ, mã băm SHA-256 ban đầu.
     - **Mốc 2 (Phê duyệt):** Thời điểm Admin phê duyệt hồ sơ.
     - **Mốc 3 (Mint On-Chain):** Token ID sinh ra, khối block number, Transaction Hash đính kèm link mở rộng.
     - **Các Mốc tiếp theo (Chuyển nhượng):** Lịch sử chuyển quyền từ ví `0x...` sang `0x...` qua từng thời kỳ.
  2. Tích hợp component vào trang chi tiết tài sản (`/creator/assets/[id]`).
- **Đầu ra Ngày 11:** Người xem có thể nhìn thấy trọn vẹn lý lịch bất biến của tác phẩm — bằng chứng minh bạch không thể chối cãi của công nghệ sổ cái phân tán.

---

### NGÀY 12: MỐC TÍCH HỢP M4 (KIỂM THỬ CHỊU LỖI & PHẢN HỒI GIAO DIỆN)
- **Mục tiêu:** Kiểm thử các trường hợp ngoại lệ, bẫy lỗi triệt để và tối ưu hóa hiệu năng.
- **Chi tiết các bước thực hiện:**
  1. Kiểm thử kịch bản ngoại lệ Web3:
     - Tác giả hủy ký giao dịch MetaMask -> Giao diện hiện Toast thông báo vàng: *"Bạn đã hủy giao dịch, dữ liệu chưa được ghi lên chuỗi"*.
     - Tác giả gửi giao dịch nhưng thiếu gas -> Báo lỗi thân thiện.
     - Nhập địa chỉ ví đích sai định dạng hoặc ví 0x0 -> Báo lỗi đỏ ngay tại input form.
  2. Tối ưu hóa phản hồi:
     - Thêm trạng thái Skeleton loading khi đang tải danh sách tài sản.
     - Bổ sung hiệu ứng chuyển động mượt mà khi đổi tab trên dashboard.
  3. Phối hợp với Thành viên B: Chạy kiểm thử toàn bộ hệ thống từ đầu đến cuối trên 2 máy độc lập.
- **Đầu ra Ngày 12 (MỐC M4):** Hệ thống đạt độ ổn định cao, không xuất hiện bất kỳ unhandled exception nào trên trình duyệt.

---

### NGÀY 13: SCRIPT 1-CLICK RESET DEMO & DIỄN TẬP BÁO CÁO
- **Mục tiêu:** Chuẩn bị kịch bản reset môi trường demo tức thì và diễn tập thuyết trình 5 phút.
- **Chi tiết các bước thực hiện:**
  1. Viết script `contracts/scripts/demo-reset.js`:
     ```javascript
     const { execSync } = require("child_process");
     console.log("=== RESETTING DEMO ENVIRONMENT ===");
     // 1. Reset database SQLite về trạng thái sạch
     execSync("npx prisma db push --force-reset", { stdio: "inherit" });
     // 2. Deploy lại hợp đồng lên Hardhat Node
     execSync("npx hardhat run contracts/scripts/deploy.js --network localhost", { stdio: "inherit" });
     console.log("=== DEMO ENVIRONMENT READY IN 5 SECONDS! ===");
     ```
  2. Đăng ký script trong `package.json`: `"demo:reset": "node contracts/scripts/demo-reset.js"`.
  3. Nạp sẵn 3 dữ liệu mẫu chuẩn bị cho bài thuyết trình:
     - 1 tác phẩm "Sen Vàng" đã được duyệt và mint on-chain thành công (Token #1).
     - 1 tác phẩm "Thiết kế Đồ họa 3D" đang ở trạng thái `PENDING_APPROVAL` để demo duyệt sống.
     - 1 tác phẩm bị từ chối kèm lý do mẫu.
  4. Cùng Thành viên B diễn tập thuyết trình thử 2 lần, canh chuẩn thời lượng 5 phút.
- **Đầu ra Ngày 13:** Chỉ cần chạy 1 lệnh `npm run demo:reset`, hệ thống lập tức sẵn sàng 100% cho buổi bảo vệ.

---

### NGÀY 14: BẢO VỆ ĐỒ ÁN TRƯỚC HỘI ĐỒNG (MỤC TIÊU 10/10)
- **Mục tiêu:** Thuyết trình tự tin, làm chủ công nghệ, phối hợp demo nhịp nhàng và trả lời xuất sắc câu hỏi của hội đồng.
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

### Quy tắc Merge Git an toàn cho Thành viên A:
1. Trước khi tạo Pull Request, luôn pull mã mới nhất từ `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/member-a-registration
   git merge main
   ```
2. Nếu có xung đột, ưu tiên giữ nguyên file thuộc thẩm quyền của mình; tuyệt đối không tự ý xóa sửa các file của Thành viên B (`src/lib/certificate.ts`, `src/app/verify/*`, `src/app/admin/*`).
3. Chạy lệnh kiểm thử smart contract trước khi merge:
   ```bash
   npx hardhat test
   ```
   *(Chỉ merge khi 100% unit tests đều pass xanh)*.

---

# 6. CHECKLIST TỰ KIỂM THỬ (DEFINITION OF DONE)

Thành viên A tự kiểm tra từng tiêu chí kỹ thuật trước khi bàn giao module:

- [x] **Smart Contract Logic:**
  - [x] Contract biên dịch không có warning với Solidity `^0.8.24`.
  - [x] 15+ unit test cases đều pass màu xanh (`npx hardhat test`).
  - [x] Chống trùng lặp on-chain: Không thể mint 2 lần cho cùng một `contentHash`.
  - [x] Chuyển nhượng tài sản chỉ chủ sở hữu hợp pháp mới gọi được.
- [x] **Băm SHA-256 Client-side:**
  - [x] Băm trực tiếp trên trình duyệt bằng Web Crypto API trong < 0.1s.
  - [x] Mã băm hiển thị đúng định dạng Hex 64 ký tự.
  - [x] Chuyển đổi chuẩn xác sang `bytes32` (`0x...`) tương thích Solidity.
- [x] **Database & API:**
  - [x] Lưu file nhị phân thành công vào thư mục vật lý `public/uploads/`.
  - [x] Database SQLite cập nhật đúng trạng thái qua từng bước: `PENDING_APPROVAL` -> `APPROVED` -> `REGISTERED`.
  - [x] Ghi nhận đầy đủ thông tin vào bảng `OwnershipHistory` mỗi khi có sự kiện MINT hoặc TRANSFER.
- [x] **Giao diện & Web3:**
  - [x] Nút "Đưa lên Blockchain" kích hoạt popup MetaMask chính xác.
  - [x] Trạng thái chờ đóng block hiển thị spinner rõ ràng, không gây đơ trang.
  - [x] Giao diện Dashboard tác giả hiển thị đầy đủ danh sách, bộ lọc mượt mà.
  - [x] Provenance Timeline hiển thị trực quan lịch sử chuyển quyền.
- [x] **Môi trường Demo:**
  - [x] Lệnh `npm run demo:reset` chạy trơn tru trong vòng 5 giây.

---

# 7. KỊCH BẢN THUYẾT TRÌNH & VẤN ĐÁP ĐIỂM 10/10

### 7.1. Phân vai và Thao tác của Thành viên A trong 5 phút Demo

- **Phút 01 — Mở đầu & Kiến trúc Hệ thống:**
  - *Lời thoại:* "Kính thưa quý Thầy/Cô hội đồng, em là [Tên Thành viên A]. Hôm nay nhóm chúng em xin trình bày đồ án AssetChain — Hệ thống đăng ký và xác minh quyền sở hữu tài sản số trên nền tảng Blockchain. Nhóm em lựa chọn kiến trúc Local-First Fullstack gồm Next.js App Router, SQLite Prisma và Hardhat EVM Node cục bộ. Kiến trúc này giúp hệ thống vận hành hoàn toàn độc lập, tốc độ xử lý tức thì và không bị phụ thuộc vào hạ tầng đám mây bên thứ ba."
- **Phút 02 — Thao tác Đăng ký Tác phẩm & Băm Client-side:**
  - *Thao tác:* Mở form `/creator/register`, chọn bức ảnh nghệ thuật "Sen Vàng.png".
  - *Lời thoại & Chỉ tay vào màn hình:* "Thưa thầy cô, điểm đặc biệt đầu tiên là tính năng bảo vệ quyền riêng tư: Tệp ảnh gốc không cần gửi lên máy chủ để tính toán. Ngay khi em vừa chọn file, Web Crypto API đã thực hiện băm nhị phân SHA-256 trực tiếp trên trình duyệt trong 0.04 giây, sinh ra mã vân tay số 64 ký tự hex ở đây. Mã băm này là duy nhất và không thể làm giả. Em nhấn Gửi và hồ sơ đã vào hàng đợi thẩm định của Quản trị viên."
- **Phút 04 — Đưa lên Blockchain (Mint NFT ERC-721):**
  - *Thao tác:* Sau khi Thành viên B bấm duyệt ở tab Admin, Thành viên A quay lại Creator Dashboard bấm nút **"Đưa lên Blockchain"**.
  - *Thao tác:* MetaMask pop-up hiện lên -> Bấm Confirm -> Màn hình thông báo giao dịch thành công.
  - *Lời thoại:* "Sau khi được phê duyệt, em tiến hành khắc dấu quyền sở hữu lên blockchain. Em bấm 'Đưa lên Blockchain', ví MetaMask yêu cầu ký giao dịch. Smart Contract `AssetRegistry` thực hiện mint một NFT chuẩn ERC-721 với Token ID #1, ghi nhận địa chỉ ví tác giả, mốc thời gian block và mã băm SHA-256 vào sổ cái EVM. Giao dịch đã được đóng block thành công!"
  - *Chuyển giao:* Chuyển phần thuyết trình sang cho Thành viên B biểu diễn màn kiểm tra Thật/Giả siêu tốc.

---

### 7.2. Bộ Câu Hỏi Vấn Đáp Chuyên Sâu Dành Cho Thành Viên A & Câu Trả Lời Mẫu

#### Câu hỏi 1: "Tại sao nhóm lại dùng hàm băm SHA-256 ở client nhưng trong Smart Contract lại dùng bytes32 và các hàm EVM thường dùng Keccak-256?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, việc phân định này dựa trên tiêu chuẩn kỹ thuật tối ưu giữa Web2 và Web3:  
> 1. **SHA-256 tại Client:** SHA-256 là tiêu chuẩn mật mã học toàn cầu dành cho tệp tin nhị phân (tương thích hoàn toàn với Git, hệ điều hành và chuẩn nhận dạng file quốc tế). Web Crypto API của trình duyệt hỗ trợ phần cứng nguyên bản (native hardware acceleration) cho SHA-256, giúp tính toán cực nhanh (< 0.05s) mà không làm lag giao diện người dùng.  
> 2. **Kiểu dữ liệu bytes32 trong Solidity:** Mã SHA-256 có độ dài chính xác 256 bits (32 bytes). Trong Solidity, kiểu `bytes32` là kiểu dữ liệu kích thước cố định được lưu trực tiếp trong 1 slot bộ nhớ 32 bytes của máy ảo EVM, tiêu tốn cực ít gas so với việc lưu trữ kiểu chuỗi động `string` (vốn tốn thêm ít nhất 20,000 gas cho việc cấp phát bộ nhớ động).  
> 3. **Keccak-256 on-chain:** Hợp đồng chỉ dùng opcode Keccak-256 khi cần băm nội bộ các biến trạng thái trên EVM, còn với vân tay tệp tin, smart contract nhận trực tiếp tham số `bytes32 contentHash` từ client và đối chiếu qua mapping O(1) `mapping(bytes32 => bool) public isHashRegistered`, đảm bảo chi phí gas tối thiểu và ngăn chặn 100% gian lận trùng lặp."

#### Câu hỏi 2: "Cơ chế nào trên Smart Contract đảm bảo một tác phẩm không bị đăng ký hai lần?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, hệ thống bảo vệ 2 lớp:  
> - **Lớp 1 (Off-chain):** Database SQLite đánh chỉ mục `@unique` trên trường `fileHash`. Nếu có ai cố tình gửi API lần hai, Prisma sẽ reject ngay lập tức với mã lỗi 409 Conflict.  
> - **Lớp 2 (On-chain — Tuyệt đối):** Trong Smart Contract `AssetRegistry.sol`, em thiết kế mapping trạng thái `mapping(bytes32 => bool) public isHashRegistered`. Trong hàm `registerAsset`, dòng lệnh đầu tiên bắt buộc kiểm tra: `require(!isHashRegistered[contentHash], 'Hash already registered on-chain');`. Nếu mã băm đó đã từng được mint trong bất kỳ khối nào trước đây, giao dịch trên blockchain sẽ revert ngay lập tức và toàn bộ trạng thái không bị thay đổi. Điều này đảm bảo tính toàn vẹn và duy nhất của tài sản số kể cả khi có ai đó gọi trực tiếp vào hợp đồng mà không thông qua giao diện web."

#### Câu hỏi 3: "Tại sao không lưu toàn bộ file ảnh lên Blockchain mà chỉ lưu mã băm?"
> **Câu trả lời chuẩn 10/10:**  
> "Dạ thưa Thầy/Cô, lưu trữ trực tiếp tệp nhị phân trên bộ nhớ trạng thái (EVM Storage) của Blockchain là điều tối kỵ trong kỹ thuật phần mềm vì 2 lý do:  
> 1. **Chi phí Gas khổng lồ:** Lưu trữ 1 MB dữ liệu on-chain trên mạng EVM tốn khoảng 32,000 slots 32-bytes, tương đương hơn 640 triệu đơn vị Gas (vượt xa giới hạn Gas Limit của 1 khối là 30 triệu gas, tức là về mặt kỹ thuật không thể đóng khối được).  
> 2. **Phình to kích thước sổ cái (State Bloat):** Khiến các node xác thực bị quá tải bộ nhớ và làm chậm toàn mạng lưới.  
> Do đó, mô hình chuẩn công nghiệp thế giới là **Proof of Existence (Bằng chứng Tồn tại)**: File gốc được lưu trữ off-chain, còn Blockchain chỉ lưu mã vân tay mật mã học `bytes32 contentHash` kết hợp với `block.timestamp` bất biến. Nhờ đặc tính toán học của hàm băm một chiều, chỉ cần 32 bytes trên chuỗi là đủ để chứng minh toàn bộ tệp tin hàng gigabytes tồn tại nguyên bản mà không thể bị sửa đổi dù chỉ 1 bit."
