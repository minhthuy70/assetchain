# AssetChain - Nền Tảng Đăng Ký & Quản Lý Quyền Sở Hữu Bản Quyền Số Trên Blockchain

> **Học phần:** Công Nghệ Blockchain & Ứng Dụng (Đồ án Kỹ thuật Chuyên đề)  
> **Kiến trúc:** Local-First Fullstack Web3 (Next.js 14 App Router + SQLite Prisma + Hardhat Local EVM)  
> **Tiêu chuẩn Smart Contract:** ERC-721 (Non-Fungible Token) kế thừa OpenZeppelin Contracts v5.x  
> **Cơ chế cốt lõi:** Proof of Existence (PoE), Zero-Gas Public Verification, Dual On-Chain Verification  

---

## MỤC LỤC
1. [Tổng Quan Dự Án & Triết Lý Thiết Kế](#1-tổng-quan-dự-án--triết-lý-thiết-kế)
2. [Kiến Trúc Hệ Thống Tổng Thể](#2-kiến-trúc-hệ-thống-tổng-thể)
3. [Chi Tiết 4 Trụ Cột Kỹ Thuật](#3-chi-tiết-4-trụ-cột-kỹ-thuật)
   - [3.1. Blockchain & Smart Contract (Solidity & Hardhat)](#31-blockchain--smart-contract-solidity--hardhat)
   - [3.2. Cơ Sở Dữ Liệu & Prisma ORM (Data Layer)](#32-cơ-sở-dữ-liệu--prisma-orm-data-layer)
   - [3.3. Backend API & An Toàn Bảo Mật (Next.js Route Handlers)](#33-backend-api--an-toàn-bảo-mật-nextjs-route-handlers)
   - [3.4. Frontend Web3 Client & Xử Lý RAM (Ethers.js v6)](#34-frontend-web3-client--xử-lý-ram-ethersjs-v6)
4. [Hệ Thống Giao Diện (Sitemap)](#4-hệ-thống-giao-diện-sitemap)
5. [Các Luồng Nghiệp Vụ Thực Tế (Workflows)](#5-các-luồng-nghiệp-vụ-thực-tế-workflows)
6. [Bảng Công Nghệ Toàn Dự Án (Tech Stack)](#6-bảng-công-nghệ-toàn-dự-án-tech-stack)
7. [Hướng Dẫn Khởi Chạy & Kịch Bản Demo Nhanh](#7-hướng-dẫn-khởi-chạy--kịch-bản-demo-nhanh)
8. [Checklist Kiểm Thử (Unit Tests & Quality Assurance)](#8-checklist-kiểm-thử-unit-tests--quality-assurance)

---

## 1. TỔNG QUAN DỰ ÁN & TRIẾT LÝ THIẾT KẾ

**AssetChain** là nền tảng quản trị và bảo chứng quyền sở hữu tác phẩm kỹ thuật số (Digital Art, Thiết kế đồ họa, Nhiếp ảnh, Tài liệu bản quyền), cho phép tác giả xác lập mốc thời gian sáng tạo không thể chối cãi, bảo vệ quyền tác giả chống sao chép và chuyển nhượng quyền sở hữu minh bạch trên sổ cái Blockchain.

```
                    TRIẾT LÝ THIẾT KẾ CỐT LÕI (CORE PHILOSOPHY)
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ BLOCKCHAIN: SINGLE SOURCE OF    │       │ DATABASE: READ-MODEL / FAST     │
│ TRUTH (Nguồn Sự Thật Duy Nhất)  │       │ CACHE (Bản Sao Đọc Tốc Độ Cao) │
│ • Lưu trữ mã băm SHA-256 bất    │       │ • SQLite + Prisma ORM lưu       │
│   biến dạng bytes32.            │       │   metadata, tệp gốc off-chain.  │
│ • Token ID độc bản (ERC-721).   │       │ • Tối ưu 100% chi phí Gas lưu   │
│ • Mốc thời gian block.timestamp │       │   trữ, tìm kiếm & phân trang    │
│   pháp lý không thể sửa đổi.    │       │   tức thì mà không nghẽn RPC.   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └───────────────────┬─────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │ HYBRID WEB2/WEB3 & PROOF OF EXISTENCE (PoE)            │
        │ • Băm SHA-256 trực tiếp trong RAM trình duyệt (0.02s). │
        │ • Xác minh công khai tốn 0 Gas cho cộng đồng toàn cầu. │
        │ • Đối soát kép on-chain: Backend kiểm tra RPC trước    │
        │   khi cập nhật CSDL để triệt tiêu lỗ hổng BOLA/IDOR.  │
        └────────────────────────────────────────────────────────┘
```

### Nguyên tắc vận hành:
1. **Blockchain là Nguồn Sự Thật Duy Nhất:** Mã băm SHA-256, mốc thời gian khối (`block.timestamp`), quyền sở hữu Token ERC-721 và trạng thái thu hồi (`isRevoked`) đều được khắc vĩnh viễn trên Smart Contract.
2. **Không lưu trữ file dung lượng lớn On-Chain:** Tệp nhị phân gốc được lưu trữ tại `public/uploads/` của máy chủ. Trên Blockchain chỉ lưu trữ duy nhất 32 bytes dấu vân tay số nhị phân (`bytes32 contentHash`).
3. **Người dùng tự nắm giữ Private Key:** Hệ thống tuyệt đối không lưu private key của người dùng trên máy chủ backend. Mọi thao tác đúc NFT (`mint`), chuyển quyền (`transfer`) hay thu hồi (`revoke`) đều do chính người dùng và quản trị viên ký trực tiếp thông qua ví **MetaMask**.

---

## 2. KIẾN TRÚC HỆ THỐNG TỔNG THỂ

Hệ thống được tổ chức theo kiến trúc phân tầng chuyên nghiệp:

```
+---------------------------------------------------------------------------------------+
|                                1. CLIENT TIER (Browser)                               |
|  - Next.js 14 App Router UI (Tailwind CSS, Dark Mode, Typography Inter)               |
|  - Web Crypto API (crypto.subtle băm SHA-256 trong RAM 0.02s)                        |
|  - MetaMask Wallet Integration (Ethers.js v6 BrowserProvider & Signer)                |
|  - Multi-Account Switcher (wallet_requestPermissions 1-Click Fast Switch)             |
+---------------------------+-----------------------------------+-----------------------+
                            │                                   │
         HTTP REST API      │                                   │ JSON-RPC (Port 8545)
         (Multipart/JSON)   │                                   │ (Ký Tx, View call)
                            ▼                                   ▼
+-------------------------------------------+   +---------------------------------------+
|      2. APPLICATION TIER (Next.js)        |   |         3. BLOCKCHAIN TIER            |
|  - Route Handlers (/api/assets, /admin,   |   |  - Hardhat Local EVM Node             |
|    /api/verify, /api/certificate)         |   |    (Chain ID: 31337, RPC: Port 8545)  |
|  - Dual On-Chain Verification Engine      |   |  - Smart Contract: AssetRegistry.sol  |
|    (JSON-RPC contract.ownerOf cross-check)│   |    (ERC-721 + PoE + Ownable + Pausable|
|  - jsPDF Engine + QR Code Generator       |   |     + Transfer Freeze on Revoke)      |
+---------------------+---------------------+   +---------------------------------------+
                      │
         Prisma ORM   │ File System IO
                      ▼
+---------------------+---------------------+
|        4. PERSISTENCE TIER (Storage)      |
|  - SQLite Database (prisma/dev.db)        |
|  - Local File Storage (public/uploads/)   |
|  - Certificate PDF Cache (public/certs/)  |
+-------------------------------------------+
```

### Bảng phân định ranh giới dữ liệu On-Chain vs Off-Chain:
| Dữ liệu | Vị trí lưu trữ | Định dạng | Mục đích |
| :--- | :--- | :--- | :--- |
| **Dấu vân tay số (Hash)** | On-Chain (Blockchain) | `bytes32` (32 bytes) | Bảo chứng toàn vẹn, chống sửa đổi, tiết kiệm 85% gas |
| **Mã định danh Token ID** | On-Chain (Blockchain) | `uint256` | Định danh độc bản theo chuẩn quốc tế ERC-721 |
| **Ví tác giả & Chủ sở hữu** | On-Chain (Blockchain) | `address` (20 bytes) | Xác lập quyền sở hữu pháp lý không thể chối cãi |
| **Mốc thời gian (Timestamp)** | On-Chain (Blockchain) | `uint256` (`block.timestamp`) | Bằng chứng tồn tại (PoE) ghi dấu thời điểm sáng tạo |
| **Trạng thái Thu hồi** | On-Chain (Blockchain) | `bool` + `string` reason | Đóng băng chuyển nhượng vĩnh viễn khi vi phạm |
| **Tệp nhị phân gốc (Ảnh/PDF)**| Off-Chain (Local Storage)| `/public/uploads/*` | Hiển thị xem trước, tải về, không tốn gas blockchain |
| **Metadata & Lịch sử duyệt** | Off-Chain (SQLite CSDL)| Bảng `Asset`, `User` | Hỗ trợ tìm kiếm, lọc danh mục, phân trang siêu tốc |
| **Văn bằng E-Certificate** | Off-Chain (PDF Engine) | File PDF + Mã QR | Cung cấp tài liệu trang trọng có thể in ấn & quét QR |

---

## 3. CHI TIẾT 4 TRỤ CỘT KỸ THUẬT

### 3.1. Blockchain & Smart Contract (Solidity & Hardhat)
📁 **Vị trí mã nguồn:** [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)  
Môi trường biên dịch: **Solidity `^0.8.24`**, Hardhat Local EVM (Chain ID: `31337`), OpenZeppelin Contracts v5.x.

```solidity
contract AssetRegistry is ERC721URIStorage, Ownable, Pausable
```

#### A. Cấu trúc dữ liệu On-Chain (Struct & Storage):
* **`struct AssetRecord`**:
  ```solidity
  struct AssetRecord {
      uint256 tokenId;           // Mã ID định danh NFT
      bytes32 contentHash;       // Mã băm SHA-256 nhị phân (32 bytes)
      address creator;           // Địa chỉ ví tác giả nộp hồ sơ
      uint256 registeredAt;      // Mốc thời gian khối (block.timestamp)
      bool isRevoked;            // true = Đã bị cơ quan quản trị thu hồi
      string revocationReason;   // Lý do thu hồi nếu có tranh chấp
  }
  ```
* **Bảng ánh xạ (Mappings):**
  * `mapping(uint256 => AssetRecord) public assets`: Tra cứu thông tin chi tiết tài sản theo Token ID.
  * `mapping(bytes32 => uint256) public hashToTokenId`: Ánh xạ ngược từ mã băm file sang Token ID (Tra cứu nhanh $O(1)$).
  * `mapping(bytes32 => bool) public isHashRegistered`: Cờ đánh dấu kiểm tra nhanh, chặn đứng mọi nỗ lực đăng ký trùng file (*Anti-Duplication*).

#### B. Các hàm nghiệp vụ lõi:
1. **`registerAsset(address to, string memory uri, bytes32 contentHash)`**:
   * Kiểm tra `require(!isHashRegistered[contentHash])`: Nếu hash đã tồn tại, Revert giao dịch.
   * Tăng `_nextTokenId`, khởi tạo `AssetRecord`, gán mapping ngược.
   * Gọi `_safeMint(to, currentId)` và `_setTokenURI(currentId, uri)`.
   * Phát sự kiện `AssetRegistered(tokenId, creator, contentHash, uri, timestamp)`.
2. **`getAssetByHash(bytes32 contentHash)` (View Function - 0 Gas):**
   * Cho phép tra cứu công khai trực tiếp từ node RPC mà không tốn phí gas. Trả về `tokenId`, `creator`, `currentOwner`, `registeredAt`, `isRevoked`, `uri`.
3. **`transferAsset(address to, uint256 tokenId)`**:
   * Kiểm tra chính chủ: `require(ownerOf(tokenId) == msg.sender)`.
   * Chặn tự chuyển cho chính mình: `require(to != msg.sender)`.
   * Chặn chuyển nhượng nếu tài sản đã bị thu hồi: `require(!assets[tokenId].isRevoked)`.
   * Gọi `safeTransferFrom` và phát sự kiện `AssetTransferred`.
4. **`revokeAsset(uint256 tokenId, string memory reason)`**:
   * Phân quyền quản trị: `onlyOwner` (chỉ Admin Council mới được gọi).
   * Không dùng hàm `_burn` (đốt token) vì việc đốt token sẽ làm mất dấu vết lịch sử. Giữ nguyên token nhưng đánh dấu `isRevoked = true` và ghi nhận `revocationReason`.
5. **Hook bảo vệ tầng sâu `_update()` (OpenZeppelin v5 Override):**
   * Ghi đè hàm móc nội tại: Bất kỳ lệnh chuyển nhượng nào (dù gọi gián tiếp hay dùng script ngoài) đều bị chặn đứng nếu `assets[tokenId].isRevoked == true`.

#### C. Quy trình xuất ABI tự động:
Khi chạy script `contracts/scripts/deploy.js`, hệ thống tự động biên dịch và xuất file cấu hình chuẩn xác gồm Contract Address và ABI ra [`src/contracts/AssetRegistry.json`](file:///d:/GITHUB/assetchain/src/contracts/AssetRegistry.json) để Frontend và Backend sử dụng đồng bộ.

---

### 3.2. Cơ Sở Dữ Liệu & Prisma ORM (Data Layer)
📁 **Vị trí mã nguồn:** [`prisma/schema.prisma`](file:///d:/GITHUB/assetchain/prisma/schema.prisma)  
Hệ thống sử dụng **SQLite** kết hợp cùng **Prisma ORM**, đảm bảo tính cơ động (*Local-First*), không cần cài đặt Docker hay PostgreSQL server cồng kềnh.

#### Các thực thể dữ liệu chính:
* **`User`:** Lưu tài khoản, email, họ tên, vai trò (`CREATOR` / `ADMIN`), `walletAddress` (độc nhất).
* **`Asset`:** Bản ghi trung tâm:
  * `id`: Khóa chính CUID.
  * `tokenId`: Số nguyên on-chain (`Int? @unique`), cấp phát sau khi mint.
  * `fileHash`: Chuỗi 64 ký tự hex SHA-256 (`String @unique`), chặn upload trùng lặp ngay tại CSDL.
  * `status`: Máy trạng thái nghiêm ngặt:
    $$\text{PENDING\_APPROVAL} \longrightarrow \begin{cases} \text{APPROVED} \longrightarrow \text{REGISTERED} \longrightarrow \text{REVOKED} \\ \text{REJECTED} \end{cases}$$
  * `currentOwnerWallet`: Địa chỉ ví đang sở hữu tác phẩm để kiểm tra quyền.
* **`OwnershipHistory`:** Ghi nhận nhật ký dòng đời tài sản (*Provenance*): `fromWallet`, `toWallet`, `txHash` (`@unique`), `blockNumber`, `eventType` (`MINT`, `TRANSFER`, `REVOKE`).
* **`Certificate`:** Lưu thông tin chứng nhận: `certificateNumber` (`CERT-2026-XXXX`), `verifyUrl`, `issuedAt`, `issuedBy`.

---

### 3.3. Backend API & An Toàn Bảo Mật (Next.js Route Handlers)
📁 **Vị trí mã nguồn:** `src/app/api/...`  
Chạy dưới dạng Next.js Route Handlers (Edge-compatible & Node.js Runtime), xử lý đầy đủ nghiệp vụ:

1. **`POST /api/assets`:**
   * Nhận `multipart/form-data`.
   * **Server-side SHA-256 Hashing:** Dùng module `crypto` tính lại mã băm server-side đối soát với client.
   * Chống trùng lặp CSDL: Kiểm tra `prisma.asset.findUnique({ where: { fileHash } })`.
   * Ghi file an toàn vào `public/uploads/` theo tên timestamp chuẩn hóa.
2. **`POST /api/admin/assets/[id]/review`:**
   * Xác thực quyền Admin từ header `x-admin-wallet` hoặc body thông qua hàm `verifyAdminWallet()`.
   * Bảo vệ máy trạng thái: Chặn duyệt các hồ sơ đã lên chuỗi hoặc đã thu hồi.
   * Nếu duyệt (`APPROVE`): Tự động tạo bản ghi `Certificate` với số hiệu `CERT-2026-XXXX`.
3. **`POST /api/assets/[id]/sync-onchain` (Dual Verification Engine):**
   * **Cơ chế Đối soát kép On-Chain:** Backend sử dụng `ethers.JsonRpcProvider` gọi trực tiếp hàm `contract.ownerOf(numericTokenId)` trên Blockchain EVM để xác minh giao dịch thực sự đã được đào thành công và đúng ví tác giả trước khi cập nhật SQLite sang trạng thái `REGISTERED`.
4. **`POST /api/assets/[id]/transfer`:**
   * **Chống lỗ hổng BOLA / IDOR:** Kiểm tra chặt chẽ `callerWallet === asset.currentOwnerWallet`.
   * Chặn tự chuyển cho chính mình (`toWallet !== currentOwnerWallet`).
   * Đối soát RPC on-chain đảm bảo NFT đã sang tên trước khi cập nhật CSDL và ghi nhận dòng lịch sử vào bảng `OwnershipHistory`.
5. **`POST /api/verify`:**
   * Cổng xác minh 2 tầng: Tầng 1 tra cứu SQLite; Tầng 2 truy vấn trực tiếp Smart Contract qua RPC `contract.getAssetByHash(bytes32Hash)`.
6. **`GET /api/certificate/[assetId]`:**
   * Sinh file PDF Chứng nhận sở hữu số A4 Landscape hoàng gia bằng thư viện `jspdf`.
   * Sinh mã QR Code động trỏ thẳng về link xác minh công khai bằng `qrcode`.
   * Chuẩn hóa font chữ tiếng Việt qua hàm `removeVietnameseAccents` đảm bảo file PDF không bị vỡ font.

---

### 3.4. Frontend Web3 Client & Xử Lý RAM (Ethers.js v6)
📁 **Vị trí mã nguồn:** `src/lib/onchain.ts`, `src/components/...`

* **Băm mã vân tay số trong RAM (0.02s):** Thành phần [`FileDropzone.tsx`](file:///d:/GITHUB/assetchain/src/components/FileDropzone.tsx) sử dụng chuẩn Web Crypto API (`window.crypto.subtle.digest("SHA-256", arrayBuffer)`). Mã băm được sinh ngay trong bộ nhớ RAM của trình duyệt trước khi upload, tiết kiệm 100% băng thông nếu phát hiện file trùng.
* **Bộ chuyển đổi tài khoản ví 1-Click:** Thành phần [`WalletButton.tsx`](file:///d:/GITHUB/assetchain/src/components/WalletButton.tsx) tích hợp nút **`[ Đổi tài khoản ví ]`** gọi phương thức chuẩn `wallet_requestPermissions`, cho phép chuyển đổi tức thì giữa các vai trò `Admin Council`, `Creator 1` và `Buyer` mà không bị MetaMask lưu cache cũ.
* **Tự động chuyển mạng:** Hàm `ensureHardhatNetwork()` tự động phát hiện và gửi yêu cầu `wallet_switchEthereumChain` chuyển sang mạng Hardhat Local (Chain ID `31337`).
* **Bẫy lỗi Web3 thân thiện:** Hàm `parseWeb3ErrorMessage()` bẫy mã lỗi revert từ Smart Contract (từ chối ký, thiếu gas, hợp đồng tạm dừng) và hiển thị thông báo tiếng Việt rõ ràng.

---

## 4. HỆ THỐNG GIAO DIỆN (SITEMAP)

| Đường dẫn (URL) | Trang / Component | Tệp mã nguồn | Chức năng nghiệp vụ chi tiết |
| :--- | :--- | :--- | :--- |
| **`/`** | Trang chủ Landing Page | `src/app/page.tsx` | Giới thiệu dự án, kiến trúc PoE, demo tính mã băm SHA-256 trực tiếp trong RAM. |
| **`/explore`** | Thư viện Tác phẩm số | `src/app/explore/page.tsx` | Khám phá các tác phẩm đã xác thực on-chain, lọc danh mục (Art, Photo, Design, Doc). |
| **`/creator/register`**| Đăng ký tác phẩm mới | `src/app/creator/register/page.tsx` | Form tải file, tính mã băm SHA-256 client-side, nộp hồ sơ chờ thẩm định. |
| **`/creator/my-assets`**| Quản lý tác phẩm | `src/app/creator/my-assets/page.tsx`| Dashboard tác giả: Theo dõi trạng thái, bấm **Đúc NFT lên Blockchain**, xem PDF E-Cert. |
| **`/creator/assets/[id]`**| Chi tiết tác phẩm | `src/app/creator/assets/[id]/page.tsx`| Xem chi tiết mốc khối on-chain, mã hash SHA-256, chuỗi lịch sử sở hữu (Provenance). |
| **`/creator/transfer`**| Chuyển quyền sở hữu | `src/app/creator/transfer/page.tsx` | Chuyển giao quyền sở hữu NFT ERC-721 sang ví người mua, ký giao dịch MetaMask. |
| **`/admin/approvals`** | Cổng Thẩm định hồ sơ | `src/app/admin/approvals/page.tsx` | Dành cho Admin: Kiểm duyệt tác phẩm, Phê duyệt (APPROVED) hoặc Từ chối kèm lý do. |
| **`/admin/revoke`** | Cổng Thu hồi bản quyền | `src/app/admin/revoke/page.tsx` | Dành cho Admin: Thu hồi chứng nhận on-chain, đóng băng token vi phạm bản quyền. |
| **`/verify`** | Cổng Xác minh 0 Gas | `src/app/verify/page.tsx` | Cổng kiểm chứng công khai: Kéo thả file ảnh hoặc nhập Token ID/Hash để tra cứu on-chain. |

---

## 5. CÁC LUỒNG NGHIỆP VỤ THỰC TẾ (WORKFLOWS)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. LUỒNG ĐĂNG KÝ VÀ BĂM DẤU VÂN TAY SỐ                                                 │
│ Tác giả kéo ảnh vào /creator/register ──► Web Crypto API sinh SHA-256 trong 0.02s      │
│ ──► Gửi multipart lên /api/assets ──► SQLite ghi nhận trạng thái PENDING_APPROVAL      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. LUỒNG HỘI ĐỒNG ADMIN THẨM ĐỊNH HỒ SƠ                                               │
│ Admin mở /admin/approvals ──► Xem xét ảnh và hash ──► Bấm Phê duyệt (APPROVE)          │
│ ──► SQLite đổi trạng thái thành APPROVED ──► Tự động cấp số hiệu CERT-2026-XXXX        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. LUỒNG ĐÚC NFT ON-CHAIN (MINT BLOCKCHAIN)                                            │
│ Tác giả vào /creator/my-assets ──► Bấm "Đúc NFT lên Blockchain"                        │
│ ──► MetaMask bật popup ký gọi registerAsset(to, uri, hash)                             │
│ ──► Hardhat Node đào block mới ──► Sinh Token ID ERC-721 và mốc block.timestamp       │
│ ──► Backend đối soát kép qua RPC ownerOf() ──► SQLite đổi trạng thái REGISTERED       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. LUỒNG XÁC MINH CÔNG KHAI 0 GAS & XUẤT CHỨNG NHẬN                                    │
│ Bất kỳ ai vào /verify ──► Kéo thả file ảnh cần kiểm tra ──► Trình duyệt tính SHA-256   │
│ ──► Gọi hàm view getAssetByHash trên Smart Contract (0 Gas, không cần ví)              │
│ ──► Màn hình hiện TÍCH XANH chính chủ ──► Bấm tải file PDF E-Certificate có mã QR Code │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. LUỒNG CHUYỂN NHƯỢNG QUYỀN SỞ HỮU (TRANSFER)                                         │
│ Tác giả vào /creator/transfer ──► Chọn tác phẩm ──► Nhập ví Người mua (Buyer)          │
│ ──► Ký giao dịch transferAsset trên MetaMask ──► Quyền sở hữu NFT chuyển sang ví mới   │
│ ──► Bảng Provenance Timeline ghi nhận lịch sử chuyển nhượng minh bạch                  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 6. LUỒNG THU HỒI KHI CÓ TRANH CHẤP BẢN QUYỀN (REVOCATION)                              │
│ Admin vào /admin/revoke ──► Chọn Token vi phạm ──► Nhập lý do ──► Ký gọi revokeAsset   │
│ ──► Smart Contract gán isRevoked = true ──► Hook _update() đóng băng token vĩnh viễn   │
│ ──► Cổng xác minh /verify cảnh báo ĐỎ: "TÀI SẢN ĐÃ BỊ THU HỒI HIỆU LỰC"                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. BẢNG CÔNG NGHỆ TOÀN DỰ ÁN (TECH STACK)

| Hạng mục | Công nghệ / Thư viện | Phiên bản | Vai trò kỹ thuật trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Smart Contract** | Solidity + OpenZeppelin | `^0.8.24` / `v5.x` | Xây dựng logic token ERC-721, quản lý mốc PoE và kiểm soát chuyển nhượng. |
| **Blockchain Dev** | Hardhat Local EVM | `^2.22.x` | Mạng node blockchain nội bộ tại cổng 8545, Chain ID 31337, cấp sẵn 20 ví test. |
| **Frontend/Backend** | Next.js (App Router) | `14.2.18` | Framework Fullstack React + TypeScript, kiêm nhiệm UI Client và REST API. |
| **Cơ sở dữ liệu** | SQLite + Prisma ORM | `^5.x` | Read-Model Cache lưu trữ bộ nhớ đệm metadata, tìm kiếm và phân trang tức thì. |
| **Web3 Client SDK** | Ethers.js | `^6.13.x` | Thư viện tương tác Blockchain, kết nối MetaMask, gọi hàm contract và giải mã hex. |
| **Mật mã học (Crypto)**| Web Crypto API + Node crypto | Tiêu chuẩn W3C | Tính toán mã băm SHA-256 an toàn trong RAM máy tính trong 0.02s. |
| **Xuất chứng nhận** | jsPDF + qrcode | `^2.5.x` / `^1.5.x` | Lập trình đồ họa xuất file PDF chứng nhận A4 Landscape kèm mã QR Code động. |
| **Styling & UI** | Tailwind CSS + Lucide Icons | `^3.4.x` | Giao diện Dark theme hiện đại, đáp ứng chuẩn Typography Inter đồng bộ. |

---

## 7. HƯỚNG DẪN KHỞI CHẠY & KỊCH BẢN DEMO NHANH

### 7.1. Khởi chạy 2 Terminal trong VS Code:

* **Terminal 1: Khởi động Blockchain Local Node (Giữ chạy liên tục)**
  ```powershell
  cd d:\GITHUB\assetchain\contracts
  npx hardhat node
  ```
  *(Node phát sóng tại `http://127.0.0.1:8545`, hiển thị 20 tài khoản có sẵn 10,000 ETH)*

* **Terminal 2: Triển khai Hợp đồng, Nạp dữ liệu mẫu & Chạy Web Server**
  ```powershell
  cd d:\GITHUB\assetchain
  # 1. Deploy Smart Contract lên node
  npx hardhat run contracts/scripts/deploy.js --network localhost

  # 2. Nạp sẵn 3 Token mẫu lên Blockchain (Token 1 hợp lệ, Token 2 thu hồi, Token 3 chuyển nhượng)
  npx hardhat run contracts/scripts/seed-onchain.js --network localhost

  # 3. Khởi động Web Next.js
  npm run dev
  ```
  *(Truy cập ứng dụng tại: `http://localhost:3000`)*

---

### 7.2. Cấu hình MetaMask & 3 Tài khoản mẫu có sẵn 10,000 ETH:

1. **Thêm mạng Hardhat Local EVM:**  
   * Network Name: `Hardhat Local EVM` | New RPC URL: `http://127.0.0.1:8545` | Chain ID: `31337` | Symbol: `ETH`.  
   *(Nếu MetaMask hiện cảnh báo màu cam về GoChain, đây là cảnh báo an toàn mặc định, chỉ cần cuộn xuống bấm **Save/Lưu**).*
2. **Nhập 3 tài khoản bằng Private Key:**
   * 👑 **Ví Admin Council:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Duyệt & Thu hồi)
   * 🎨 **Ví Creator 1:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` (Đăng ký & Đúc NFT)
   * 💼 **Ví Buyer (Chị B):** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` (Nhận chuyển nhượng)

---

### 7.3. Thư mục tệp kéo thả sẵn (`D:\GITHUB\assetchain\DEMO_FILES`):

| Tệp tin | Vị trí thao tác | Kết quả hiển thị |
| :--- | :--- | :--- |
| **`1_Xac_Minh_Hop_Le_Sen_Vang.png`** | Kéo vào `/verify` | ✅ **TÍCH XANH:** Hợp lệ chính chủ Token #1 on-chain, xem PDF E-Certificate. |
| **`2_Xac_Minh_Bi_Sua_Doi_Fake.png`** | Kéo vào `/verify` | ❌ **BÁO ĐỎ:** Bị sửa 1 byte $\rightarrow$ Hash lệch hoàn toàn, báo chưa đăng ký / giả mạo! |
| **`3_Xac_Minh_Thu_Hoi_Revoked.png`** | Kéo vào `/verify` | ⚠️ **CẢNH BÁO ĐỎ:** Tác phẩm Token #2 đã bị thu hồi do vi phạm bản quyền! |
| **`4_Dang_Ky_Moi_ArtWork_2026.png`** | Kéo vào `/creator/register` | 🎨 Nộp hồ sơ mới $\rightarrow$ Đổi ví Admin duyệt $\rightarrow$ Đổi ví Creator đúc NFT! |

---

## 8. CHECKLIST KIỂM THỬ (UNIT TESTS & QUALITY ASSURANCE)

Hệ thống đã trải qua quy trình kiểm thử đơn vị (*Unit Testing*) và kiểm toán toàn diện:

```powershell
cd contracts
npx hardhat test
```

### Kết quả kiểm thử Smart Contract: **23/23 Tests Passed (100%)**
- [x] **Deployment & Init:** Khởi tạo chính xác tên token (`AssetChain Digital Asset`), ký hiệu (`ASSET`), gán quyền `Ownable`.
- [x] **Registration & PoE:** Đúc NFT Token #1 tuần tự, lưu trữ mã hash 32 bytes, Revert nếu hash trùng lặp (*Anti-Duplication*).
- [x] **1-Click Verification (0 Gas):** Trả về bản ghi chính xác qua `getAssetByHash` và `getAssetById`, Revert khi hash không tồn tại.
- [x] **Ownership Transfer:** Chuyển nhượng an toàn, chặn chuyển cho `address(0)`, chặn tự chuyển cho chính mình (`require(to != msg.sender)`), chặn chuyển nếu tài sản bị thu hồi.
- [x] **Admin Revocation:** Chỉ Admin mới được thu hồi, chặn thu hồi lần 2, chặn thu hồi với lý do rỗng.
- [x] **Transfer Freeze Guard:** Hook `_update()` của OpenZeppelin v5 đóng băng vĩnh viễn mọi giao dịch của token đã thu hồi.
- [x] **Pausable Mechanism:** Tạm dừng và kích hoạt lại hợp đồng thành công khi có sự cố.

### Kết quả biên dịch Next.js Production Build:
- [x] **12/12 Routes** tĩnh và động biên dịch thành công (`exit code 0`), 0 lỗi cú pháp hoặc TypeScript.
- [x] **Tài liệu học tập & Kịch bản vấn đáp:** Được lưu đầy đủ tại [`docs/HUONG_DAN_BAO_CAO_BLOCKCHAIN.md`](file:///d:/GITHUB/assetchain/docs/HUONG_DAN_BAO_CAO_BLOCKCHAIN.md), [`docs/GIAI_THICH_TOAN_BO_CODE_HE_THONG.md`](file:///d:/GITHUB/assetchain/docs/GIAI_THICH_TOAN_BO_CODE_HE_THONG.md) và tệp in Word [`docs/TAI_LIEU_ON_TAP_VA_BAO_CAO_ASSETCHAIN.docx`](file:///d:/GITHUB/assetchain/docs/TAI_LIEU_ON_TAP_VA_BAO_CAO_ASSETCHAIN.docx).
