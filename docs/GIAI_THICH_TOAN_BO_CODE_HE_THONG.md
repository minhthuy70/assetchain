# TÀI LIỆU ÔN TẬP & ĐẠI TỪ ĐIỂN GIẢI THÍCH TOÀN BỘ CODE HỆ THỐNG ASSETCHAIN
> **Dành cho:** Báo cáo môn Blockchain, Khóa luận & Ứng biến khi Giảng viên hỏi code / chỉ tay vào một dòng bất kỳ bắt giải thích hoặc yêu cầu sửa code tại chỗ.  
> **Kiến trúc:** Full-stack Web3: Smart Contract (Solidity) $\rightarrow$ Backend API (Next.js & Prisma) $\rightarrow$ Frontend & Web3 (Ethers.js v6 & React).

---

## MỤC LỤC
1. [Bản Đồ Kiến Trúc Hệ Thống (End-to-End Architecture)](#1-bản-đồ-kiến-trúc-hệ-thống)
2. [Hợp Đồng Thông Minh (Solidity - AssetRegistry.sol)](#2-hợp-đồng-thông-minh-solidity)
3. [Tầng Cơ Sở Dữ Liệu (Prisma & SQLite Schema)](#3-tầng-cơ-sở-dữ-liệu-prisma--sqlite)
4. [Tầng Backend API (Next.js Route Handlers)](#4-tầng-backend-api-nextjs-route-handlers)
5. [Tầng Frontend & Tích Hợp Web3 (Ethers.js v6)](#5-tầng-frontend--tích-hợp-web3)
6. [Tập Dượt 5 Tình Huống Giảng Viên Kêu Sửa Code Tại Chỗ (Live Coding)](#6-tập-dược-5-tình-huống-thầy-kêu-sửa-code-tại-chỗ)
7. [Tổng Kết Bí Kíp Đi Báo Cáo](#7-tổng-kết-bí-kíp-đi-báo-cáo)
8. [TỪ ĐIỂN TRA CỨU CODE CHI TIẾT TỪNG DÒNG (LINE-BY-LINE MASTER DICTIONARY)](#8-từ-điển-tra-cứu-code-chi-tiết-từng-dòng)
   - [8.1. Hợp đồng Smart Contract (AssetRegistry.sol - Từng dòng từ 1 đến 323)](#81-hợp-đồng-smart-contract-assetregistrysol)
   - [8.2. Thư viện Web3 Client (src/lib/onchain.ts)](#82-thư-viện-web3-client-srclibonchaints)
   - [8.3. Thư viện Mật mã Băm (src/lib/crypto.ts)](#83-thư-viện-mật-mã-băm-srclibcryptots)
   - [8.4. Component Kéo Thả Băm File (src/components/FileDropzone.tsx)](#84-component-kéo-thả-băm-file-srccomponentsfiledropzonetsx)
   - [8.5. Component Nút Ví & Đổi Tài Khoản (src/components/WalletButton.tsx)](#85-component-nút-ví--đổi-tài-khoản-srccomponentswalletbuttontsx)
   - [8.6. Route Nộp Hồ Sơ (src/app/api/assets/route.ts)](#86-route-nộp-hồ-sơ-srcappapiassetsroutets)
   - [8.7. Route Thẩm Định Admin (src/app/api/admin/assets/[id]/review/route.ts)](#87-route-thẩm-định-admin-srcappapiadminassetsidreviewroutets)
   - [8.8. Route Đối Soát Kép On-chain (src/app/api/assets/[id]/sync-onchain/route.ts)](#88-route-đối-soát-kép-on-chain-srcappapiassetsidsync-onchainroutets)
   - [8.9. Route Cổng Xác Minh 0 Gas (src/app/api/verify/route.ts)](#89-route-cổng-xác-minh-0-gas-srcappapiverifyroutets)
9. [BẢNG PHẢN XẠ NHANH 20 CÂU HỎI KINH ĐIỂN CỦA HỘI ĐỒNG (QUICK Q&A CHEATSHEET)](#9-bảng-phản-xạ-nhanh-20-câu-hỏi-kinh-điển-của-hội-đồng)

---

# 1. BẢN ĐỒ KIẾN TRÚC HỆ THỐNG

### Luồng đi của một tác phẩm từ lúc nộp đến khi lên Blockchain:
```
[1. TRÌNH DUYỆT (Client)]
   Kéo ảnh vào FileDropzone.tsx
   └── Dùng Web Crypto API (crypto.subtle) băm SHA-256 ngay trong RAM máy tính (0.02s).
   └── Gửi FormData (file, title, hash, wallet) lên Backend API.
          │
          ▼
[2. BACKEND API & DATABASE (Off-chain)]
   src/app/api/assets/route.ts
   └── Kiểm tra fileHash trong SQLite (chống trùng lặp).
   └── Băm lại server-side bằng crypto của Node.js để kiểm chứng tính trung thực của client.
   └── Lưu file vào public/uploads/.
   └── Tạo bản ghi Asset với trạng thái PENDING_APPROVAL.
          │
          ▼
[3. ADMIN THẨM ĐỊNH (Off-chain)]
   src/app/api/admin/assets/[id]/review/route.ts
   └── Admin kiểm tra tác phẩm, bấm Phê duyệt (APPROVE).
   └── Trạng thái chuyển thành APPROVED, sinh số Certificate (ví dụ CERT-2026-0004).
          │
          ▼
[4. ĐÚC LÊN BLOCKCHAIN (On-chain Transaction)]
   src/lib/onchain.ts (mintAssetOnChain) ──► MetaMask ký giao dịch
   └── Gọi hàm registerAsset(to, uri, contentHash) trên Smart Contract AssetRegistry.sol.
   └── EVM đào block mới, sinh Token ID (ERC-721), lưu mốc thời gian block.timestamp.
          │
          ▼
[5. ĐỒNG BỘ DỮ LIỆU KÉP (Dual Sync)]
   src/app/api/assets/[id]/sync-onchain/route.ts
   └── Backend đối soát trực tiếp qua JSON-RPC (hàm ownerOf) để đảm bảo EVM đã đào thành công.
   └── Cập nhật SQLite: status = "REGISTERED", lưu tokenId và txHash.
          │
          ▼
[6. XÁC MINH CÔNG KHAI 0 GAS (Zero-Gas Public Verification)]
   src/app/api/verify/route.ts & /verify
   └── Bất kỳ ai kéo ảnh vào -> Tính lại SHA-256 -> Gọi hàm view getAssetByHash trên Smart Contract.
   └── Miễn phí Gas 100%, không cần kết nối ví.
```

---

# 2. HỢP ĐỒNG THÔNG MINH (SOLIDITY)
📁 **Đường dẫn tệp:** [`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol)

### 2.1. Thư viện kế thừa (Kế thừa từ OpenZeppelin v5)
```solidity
contract AssetRegistry is ERC721URIStorage, Ownable, Pausable
```
* **`ERC721URIStorage`**: Chuẩn NFT quốc tế của Ethereum, cho phép mỗi Token ID có một đường link metadata JSON riêng (`tokenURI`).
* **`Ownable`**: Phân quyền, gán địa chỉ người deploy (`msg.sender`) làm chủ hợp đồng (Admin), cung cấp modifier `onlyOwner`.
* **`Pausable`**: Cơ chế cầu dao khẩn cấp, cho phép Admin tạm dừng hợp đồng (`pause()`) khi phát hiện tấn công hoặc sự cố kỹ thuật.

---

### 2.2. Cấu trúc dữ liệu & Biến lưu trữ (Storage)
```solidity
struct AssetRecord {
    uint256 tokenId;           // Mã ID định danh duy nhất của NFT
    bytes32 contentHash;       // Mã băm SHA-256 nhị phân (32 bytes) của file gốc
    address creator;           // Địa chỉ ví tác giả nộp hồ sơ
    uint256 registeredAt;      // Thời điểm đào block (block.timestamp)
    bool isRevoked;            // Cờ thu hồi (true = bị tước bản quyền)
    string revocationReason;   // Lý do thu hồi nếu có
}

mapping(uint256 => AssetRecord) public assets;         // Token ID => Thông tin chi tiết
mapping(bytes32 => uint256) public hashToTokenId;       // Mã SHA-256 => Token ID (Tra cứu nhanh O(1))
mapping(bytes32 => bool) public isHashRegistered;       // Mã SHA-256 => Đã đăng ký chưa (Chống trùng lặp)
```
> **💡 Câu hỏi giảng viên:** *"Tại sao `contentHash` lại dùng kiểu `bytes32` mà không dùng `string`?"*  
> **👉 Trả lời:** *"Mã băm SHA-256 có kích thước cố định là 256 bits = 32 bytes. Sử dụng `bytes32` (kiểu dữ liệu cố định) giúp tiết kiệm hơn **85% phí Gas** so với kiểu `string` (mảng byte động)."*

---

### 2.3. Giải thích từng hàm cốt lõi trong Smart Contract

#### Hàm 1: `constructor()` (Dòng 104)
```solidity
constructor() ERC721("AssetChain Digital Asset", "ASSET") Ownable(msg.sender) {
    _nextTokenId = 1; // Bắt đầu đếm Token ID từ số 1
}
```
* Đặt tên bộ sưu tập NFT là *"AssetChain Digital Asset"*, ký hiệu mã là *"ASSET"*.
* Người bấm deploy (ví dụ `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) sẽ trở thành Owner (Admin).

#### Hàm 2: `registerAsset(...)` (Dòng 127) – Đúc NFT & Ghi mốc thời gian
```solidity
function registerAsset(
    address to,
    string memory uri,
    bytes32 contentHash
) external whenNotPaused returns (uint256)
```
* **Các bước thực thi:**
  1. `require(to != address(0))`: Chặn ví rỗng (burn address).
  2. `require(!isHashRegistered[contentHash], "Hash already registered")`: **Chống gian lận!** Nếu file này đã từng được đưa lên Blockchain thì lập tức Revert (hủy giao dịch).
  3. Tăng `_nextTokenId`.
  4. Lưu dữ liệu vào `assets[currentId]`.
  5. Đánh dấu `hashToTokenId[contentHash] = currentId` và `isHashRegistered[contentHash] = true`.
  6. Gọi `_safeMint(to, currentId)`: Đúc NFT chuyển thẳng vào ví người tạo.
  7. Gọi `_setTokenURI(currentId, uri)`: Gắn link metadata.
  8. `emit AssetRegistered(...)`: Bắn sự kiện ra Blockchain để Web lắng nghe.

#### Hàm 3: `getAssetByHash(bytes32 contentHash)` (Dòng 189) – Xác minh 0 Gas
```solidity
function getAssetByHash(bytes32 contentHash) external view returns (...)
```
* **Từ khóa `view`**: Hàm này chỉ đọc dữ liệu từ node, **hoàn toàn miễn phí Gas (0 Gas)**.
* Nhận vào mã băm SHA-256, tra cứu ngược ra `tokenId`, trả về địa chỉ tác giả, chủ sở hữu hiện tại (`ownerOf(id)`), mốc thời gian và trạng thái thu hồi.

#### Hàm 4: `transferAsset(address to, uint256 tokenId)` (Dòng 244) – Chuyển nhượng
```solidity
function transferAsset(address to, uint256 tokenId) external whenNotPaused {
    require(ownerOf(tokenId) == msg.sender, "Caller is not asset owner");
    require(to != address(0), "Cannot transfer to zero address");
    require(to != msg.sender, "Cannot transfer to yourself");
    require(!assets[tokenId].isRevoked, "Asset is revoked: transfers are frozen");

    safeTransferFrom(msg.sender, to, tokenId);
    emit AssetTransferred(tokenId, msg.sender, to, block.timestamp);
}
```
* Chỉ chủ sở hữu thực sự mới được chuyển.
* Chặn tự chuyển cho chính mình.
* **Chặn chuyển nhượng nếu tài sản đã bị thu hồi (`isRevoked == true`)**.

#### Hàm 5: `revokeAsset(uint256 tokenId, string memory reason)` (Dòng 274) – Thu hồi
```solidity
function revokeAsset(uint256 tokenId, string memory reason) external onlyOwner
```
* Chỉ Admin (`onlyOwner`) mới gọi được.
* **Tại sao không dùng hàm `_burn` (đốt token)?**  
  Vì nếu đốt token thì bản ghi biến mất, người sau tra cứu sẽ tưởng file chưa từng được cấp phép. Ta giữ lại token nhưng đánh dấu `isRevoked = true` và lưu `reason` để cảnh báo công khai rằng tác phẩm này đã bị tước bản quyền do vi phạm!

#### Hàm 6: `_update(...)` (Dòng 291) – Chốt chặn bảo vệ tầng sâu của OpenZeppelin v5
* Ghi đè (override) hook nội tại của OpenZeppelin: Dù kẻ xấu có dùng code ngoài gọi `transferFrom` bỏ qua hàm `transferAsset`, thì hook `_update` này vẫn kiểm tra `require(!assets[tokenId].isRevoked)` $\rightarrow$ Đóng băng tuyệt đối 100%!

---

# 3. TẦNG CƠ SỞ DỮ LIỆU (PRISMA & SQLITE)
📁 **Đường dẫn tệp:** [`schema.prisma`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/prisma/schema.prisma)

### 4 Bảng dữ liệu chính:

1. **Bảng `User`:**
   * Lưu thông tin người dùng: `id`, `email`, `fullName`, `walletAddress` (độc nhất), `role` (`CREATOR` hoặc `ADMIN`).
2. **Bảng `Asset` (Trung tâm):**
   * `id`: Khóa chính CUID.
   * `tokenId`: Số nguyên on-chain (ví dụ 1, 2, 3), đánh dấu `@unique`, chỉ có sau khi mint.
   * `title`, `description`, `category` (ART, PHOTOGRAPHY, DESIGN, DOCUMENT).
   * `filePath`: Đường dẫn lưu file trên ổ cứng (`/uploads/...`).
   * `fileHash`: Mã SHA-256 64 ký tự hex, đánh dấu `@unique` để chặn upload trùng ở tầng CSDL.
   * `status`: **Máy trạng thái (State Machine):**  
     `PENDING_APPROVAL` $\rightarrow$ `APPROVED` (hoặc `REJECTED`) $\rightarrow$ `REGISTERED` (đã lên chuỗi) $\rightarrow$ `REVOKED` (bị thu hồi).
   * `currentOwnerWallet`: Lưu ví người đang nắm giữ tác phẩm để phục vụ kiểm tra quyền.
3. **Bảng `OwnershipHistory`:**
   * Lưu vết lịch sử chuyển nhượng: `fromWallet`, `toWallet`, `txHash` (@unique), `blockNumber`, `eventType` (`MINT`, `TRANSFER`, `REVOKE`).
4. **Bảng `Certificate`:**
   * Lưu thông tin chứng nhận: `certificateNumber` (`CERT-2026-0001`), `verifyUrl`, `issuedAt`, `issuedBy`.

---

# 4. TẦNG BACKEND API (NEXT.JS ROUTE HANDLERS)

### 1. `POST /api/assets` – Nộp hồ sơ tác phẩm mới
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/assets/route.ts)
* **Xử lý:** Nhận `multipart/form-data` gồm file ảnh, tiêu đề, địa chỉ ví.
* **Server-side Hash:** Dùng thư viện `crypto` của Node.js băm lại SHA-256 của file tải lên để đảm bảo tính toàn vẹn (không tin tưởng 100% hash client gửi lên).
* **Kiểm tra trùng:** Nếu `fileHash` đã có trong bảng `Asset` $\rightarrow$ Trả về lỗi `409 Conflict`.
* **Lưu file vật lý:** Ghi file vào thư mục `public/uploads/` với tên chuẩn hóa theo timestamp.
* Tạo bản ghi Asset với trạng thái `PENDING_APPROVAL`.

### 2. `POST /api/admin/assets/[id]/review` – Thẩm định hồ sơ
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/admin/assets/[id]/review/route.ts)
* **Xác thực quyền:** Kiểm tra ví người gọi (`callerWallet`) thông qua hàm `verifyAdminWallet()`: bắt buộc phải là ví Admin (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`). Nếu không $\rightarrow$ Lỗi `403 Forbidden`.
* **Bảo vệ máy trạng thái:** Chặn duyệt các hồ sơ đã ở trạng thái `REGISTERED` hoặc `REVOKED`.
* Nếu chọn `APPROVE`: Cập nhật status = `APPROVED`, tự động sinh mã `certificateNumber` (ví dụ `CERT-2026-0004`) và tạo bản ghi trong bảng `Certificate`.
* Nếu chọn `REJECT`: Bắt buộc nhập `rejectionReason`, cập nhật status = `REJECTED`.

### 3. `POST /api/assets/[id]/sync-onchain` – Đồng bộ sau khi đúc NFT
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/assets/[id]/sync-onchain/route.ts)
* **Đối soát kép On-Chain (Dual Verification):** Không chỉ nhận `tokenId` và `txHash` từ client gửi lên, backend khởi tạo kết nối `ethers.JsonRpcProvider` gọi trực tiếp hàm `contract.ownerOf(tokenId)` trên Blockchain để xác thực xem token này có thực sự thuộc về ví tác giả hay không.
* Nếu đối soát on-chain khớp: Cập nhật status = `REGISTERED`, lưu `tokenId`, `txHash`, `blockNumber`.

### 4. `POST /api/assets/[id]/transfer` – Chuyển nhượng quyền sở hữu
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/assets/[id]/transfer/route.ts)
* **Chống lỗ hổng BOLA/IDOR:** Bắt buộc người gọi phải là chủ sở hữu hợp pháp (`callerWallet === asset.currentOwnerWallet`).
* **Đối soát on-chain:** Kiểm tra trên Smart Contract xem quyền sở hữu của Token ID đã thực sự chuyển sang `toWallet` chưa.
* Cập nhật `currentOwnerWallet = toWallet` và ghi nhận một dòng lịch sử vào bảng `OwnershipHistory` (sử dụng `upsert` chống trùng lặp giao dịch).

### 5. `POST /api/verify` – Cổng tra cứu xác minh 2 tầng
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/verify/route.ts)
* **Tầng 1 (Database):** Tìm kiếm theo `fileHash` hoặc `tokenId` trong SQLite.
* **Tầng 2 (Blockchain EVM):** Gọi hàm `contract.getAssetByHash()` trên Smart Contract.
* Tổng hợp dữ liệu từ cả 2 nguồn để trả về: Có hợp lệ không (`verified`), Có on-chain không (`isOnchain`), Có bị thu hồi không (`isRevoked`).

### 6. `GET /api/certificate/[assetId]` – Xuất Chứng nhận E-Certificate PDF
📁 [`route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/certificate/[assetId]/route.ts)
* Dùng thư viện `jspdf` vẽ chứng nhận khổ A4 Landscape trang trọng với khung viền hoàng gia.
* Dùng thư viện `qrcode` tạo mã QR dẫn thẳng về link `/verify?hash=...`.
* Sử dụng hàm `removeVietnameseAccents` để chuẩn hóa font chữ tiếng Việt, đảm bảo file PDF không bao giờ bị vỡ font hay lỗi ký tự lạ.

---

# 5. TẦNG FRONTEND & TÍCH HỢP WEB3

### 1. `src/lib/onchain.ts` – Cầu nối giao tiếp với Blockchain
📁 [`onchain.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/lib/onchain.ts)
* `getBrowserProvider()`: Lấy `ethers.BrowserProvider` từ `window.ethereum` (MetaMask).
* `ensureHardhatNetwork()`: Tự động kiểm tra mạng, nếu sai mạng thì gửi request `wallet_switchEthereumChain` yêu cầu chuyển sang Chain ID `31337`.
* `mintAssetOnChain(...)`:
  ```ts
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const bytes32Hash = hexToBytes32(asset.fileHash);
  const tx = await contract.registerAsset(asset.walletAddress, uri, bytes32Hash);
  const receipt = await tx.wait(); // Chờ đào block thành công
  ```
* `parseWeb3ErrorMessage(err)`: Bẫy các mã lỗi phổ biến của MetaMask (ví dụ `4001` - người dùng từ chối ký, `INSUFFICIENT_FUNDS` - không đủ gas) và dịch sang tiếng Việt thân thiện.

### 2. `src/components/FileDropzone.tsx` – Băm SHA-256 Client-Side
📁 [`FileDropzone.tsx`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/components/FileDropzone.tsx)
* Sử dụng Web Crypto API tiêu chuẩn của trình duyệt (`window.crypto.subtle.digest("SHA-256", arrayBuffer)`).
* Tính toán mã băm ngay trong RAM của trình duyệt trong 0.02 giây mà không cần gửi file lên server, giúp bảo mật và tiết kiệm băng thông.

### 3. `src/components/WalletButton.tsx` – Nút kết nối & Đổi tài khoản
📁 [`WalletButton.tsx`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/components/WalletButton.tsx)
* Sử dụng `wallet_requestPermissions` để mở hộp thoại cho phép người dùng đổi qua lại giữa ví `Admin Council`, `Creator 1` và `Buyer` chỉ trong 1 cú click.
* Tự động lắng nghe sự kiện `accountsChanged` và `chainChanged` của MetaMask để cập nhật giao diện.

---

# 6. TẬP DƯỢT 5 TÌNH HUỐNG THẦY KÊU SỬA CODE TẠI CHỖ (LIVE CODING)

Dưới đây là 5 tình huống kinh điển mà giảng viên hay thử thách sinh viên để xem bạn có thực sự hiểu code hay không:

---

### TÌNH HUỐNG 1: "Thầy muốn thêm phí đúc NFT là 0.01 ETH, người tạo phải trả tiền thì mới cho đúc?"
👉 **Nơi sửa:** File [`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol)
1. Tìm đến hàm `registerAsset` (dòng 127).
2. Thêm từ khóa **`payable`** vào khai báo hàm:
   ```solidity
   function registerAsset(
       address to,
       string memory uri,
       bytes32 contentHash
   ) external payable whenNotPaused returns (uint256) { // <-- Thêm payable
   ```
3. Thêm dòng `require` kiểm tra số tiền ETH gửi kèm:
   ```solidity
   require(msg.value >= 0.01 ether, "Fee is 0.01 ETH");
   ```
4. Giải thích với thầy: *"Em thêm từ khóa `payable` để hàm nhận được ETH và dùng `msg.value` để kiểm tra số tiền người dùng gửi kèm giao dịch."*

---

### TÌNH HUỐNG 2: "Thầy muốn đổi tên Token và ký hiệu Symbol của NFT thì sửa ở đâu?"
👉 **Nơi sửa:** File [`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol)
* Tìm hàm `constructor()` (dòng 104):
  ```solidity
  constructor() ERC721("Ten_Moi_O_Day", "SYMBOL_MOI") Ownable(msg.sender) {
      _nextTokenId = 1;
  }
  ```
* Sửa chữ `"AssetChain Digital Asset"` thành tên mới, `"ASSET"` thành ký hiệu mới. Sau đó chạy lại lệnh deploy: `npx hardhat run contracts/scripts/deploy.js --network localhost`.

---

### TÌNH HUỐNG 3: "Viết thêm cho thầy một hàm kiểm tra xem 1 mã hash đã đăng ký chưa?"
👉 **Nơi sửa:** File [`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol)
* Viết thêm hàm này vào cuối contract (trước dấu `}` cuối cùng):
  ```solidity
  function checkHashExist(bytes32 hash) external view returns (bool) {
      return isHashRegistered[hash];
  }
  ```
* Giải thích với thầy: *"Hàm này dùng từ khóa `view` để tốn 0 Gas, tra cứu trực tiếp vào mapping `isHashRegistered` với độ phức tạp $O(1)$."*

---

### TÌNH HUỐNG 4: "Thầy muốn giới hạn dung lượng file upload chỉ cho phép tối đa 10MB thay vì 50MB?"
👉 **Có 2 nơi sửa:**
1. **Frontend:** File [`FileDropzone.tsx`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/components/FileDropzone.tsx) (Dòng 36):
   Sửa `maxSizeMB = 50` thành `maxSizeMB = 10`.
2. **Backend:** File [`.env`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/.env) (Dòng 24):
   Sửa `MAX_FILE_SIZE_BYTES=52428800` thành `MAX_FILE_SIZE_BYTES=10485760` (10 * 1024 * 1024).

---

### TÌNH HUỐNG 5: "Thầy muốn cho phép Admin mở khóa (Un-revoke / Phục hồi) tài sản đã bị thu hồi nhầm?"
👉 **Nơi sửa:** File [`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol)
* Viết thêm hàm `unrevokeAsset` ngay bên dưới hàm `revokeAsset`:
  ```solidity
  function unrevokeAsset(uint256 tokenId) external onlyOwner {
      require(_ownerOf(tokenId) != address(0), "Asset does not exist");
      require(assets[tokenId].isRevoked, "Asset is not revoked");

      assets[tokenId].isRevoked = false;
      assets[tokenId].revocationReason = "";
  }
  ```
* Giải thích với thầy: *"Chỉ Admin (`onlyOwner`) mới có quyền phục hồi, hàm kiểm tra tài sản phải đang bị thu hồi thì mới cho phép gán lại `isRevoked = false`."*

---

# 7. TỔNG KẾT BÍ KÍP ĐI BÁO CÁO

* **Khi thầy hỏi về Blockchain:** Nhấn mạnh vào 3 từ khóa: **Proof of Existence (PoE)**, **ERC-721 bất biến** và **Xác minh 0 Gas (`view` function)**.
* **Khi thầy hỏi về Bảo mật:** Nêu rõ cơ chế **Đối soát kép On-Chain (Dual Verification)** giữa Backend SQLite và hàm `contract.ownerOf(tokenId)` trên chuỗi khối, cùng với việc ghi đè hook `_update()` để đóng băng chuyển nhượng tài sản vi phạm.
* **Tự tin trả lời:** Hệ thống được chia tách rõ ràng: Việc nặng (lưu file, tìm kiếm) để Web2 lo; việc bảo chứng tính toàn vẹn, quyền sở hữu và mốc thời gian pháp lý để Web3 Blockchain lo!

---

# 8. TỪ ĐIỂN TRA CỨU CODE CHI TIẾT TỪNG DÒNG
> **Mẹo sử dụng:** Khi giảng viên chỉ vào bất kỳ dòng code nào trên màn hình, hãy bấm `Ctrl + F` trong file này và gõ từ khóa của dòng đó (ví dụ: `whenNotPaused`, `_safeMint`, `crypto.subtle`, `ownerOf`, `upsert`...). Bạn sẽ thấy ngay lời giải thích chính xác từ ngữ nghĩa, lý do tại sao phải dùng đến hậu quả nếu xóa dòng đó!

---

## 8.1. HỢP ĐỒNG SMART CONTRACT ([`AssetRegistry.sol`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/contracts/contracts/AssetRegistry.sol))

| Dòng code | Cú pháp thực tế trong file | Ý nghĩa kỹ thuật & Cách trả lời giảng viên |
| :--- | :--- | :--- |
| **Dòng 1** | `// SPDX-License-Identifier: MIT` | **Giấy phép mã nguồn mở (Software Package Data Exchange).** Bắt buộc từ Solidity 0.6.8 trở đi để trình biên dịch xác định tính hợp lệ và tương thích bản quyền của code. `MIT` cho phép sử dụng, sửa đổi và phân phối tự do. |
| **Dòng 2** | `pragma solidity ^0.8.24;` | **Khai báo phiên bản trình biên dịch.** Dấu mũ `^` có nghĩa là chấp nhận mọi bản vá từ `0.8.24` đến trước `0.9.0`. *Lý do dùng bản 0.8.x:* Từ bản này, Solidity đã tích hợp sẵn cơ chế chống tràn số (Overflow/Underflow check) tự động, không còn cần dùng thư viện `SafeMath` cồng kềnh như bản 0.7 trở về trước. |
| **Dòng 9** | `import ".../ERC721URIStorage.sol";` | **Thư viện mở rộng chuẩn ERC-721 của OpenZeppelin.** Cung cấp hàm `_setTokenURI()` và `tokenURI()` để lưu chuỗi đường dẫn Metadata JSON riêng biệt cho từng Token ID. |
| **Dòng 12** | `import ".../Ownable.sol";` | **Thư viện phân quyền cơ bản.** Cung cấp biến địa chỉ `owner` và modifier `onlyOwner`, giúp giới hạn quyền thực thi các tác vụ nhạy cảm (như thu hồi tài sản, dừng khẩn cấp) chỉ cho ví Admin deployer. |
| **Dòng 15** | `import ".../Pausable.sol";` | **Thư viện cầu dao khẩn cấp (Circuit Breaker).** Cung cấp modifier `whenNotPaused`, cho phép đóng băng mọi thao tác ghi dữ liệu khi hệ thống bị tấn công hoặc đang bảo trì. |
| **Dòng 25** | `contract AssetRegistry is ERC721URIStorage, Ownable, Pausable` | **Đa kế thừa (Multiple Inheritance).** Hợp đồng kế thừa toàn bộ tính năng của 3 thư viện chuẩn theo thuật toán C3 Linearization của Solidity. |
| **Dòng 28** | `uint256 private _nextTokenId;` | **Biến đếm nội bộ sinh Token ID.** Khai báo `private` để bảo vệ Storage, ngăn chặn các hợp đồng bên ngoài can thiệp làm sai lệch số thứ tự của tài sản. |
| **Dòng 39-46** | `struct AssetRecord { ... }` | **Cấu trúc dữ liệu gom nhóm thông tin tài sản:** Gồm `tokenId`, `contentHash` (`bytes32`), `creator` (`address`), `registeredAt` (`uint256`), `isRevoked` (`bool`), `revocationReason` (`string`). Dữ liệu này được đóng gói và lưu vĩnh viễn trên chuỗi. |
| **Dòng 41** | `bytes32 contentHash;` | **Tại sao dùng `bytes32` thay vì `string`?** SHA-256 có độ dài cố định 256 bits = 32 bytes. Lưu `bytes32` (kích thước cố định) chỉ tốn 1 slot storage (20.000 gas), tiết kiệm hơn **85% phí Gas** so với `string` (kiểu dữ liệu mảng byte động tốn nhiều slot). |
| **Dòng 53** | `mapping(uint256 => AssetRecord) public assets;` | **Bảng tra cứu thông tin tài sản theo Token ID.** Từ khóa `public` giúp compiler tự động sinh hàm getter `assets(uint256)` để bên ngoài đọc dữ liệu miễn phí. |
| **Dòng 57** | `mapping(bytes32 => uint256) public hashToTokenId;` | **Bảng ánh xạ ngược từ SHA-256 sang Token ID.** Giúp hàm xác minh tra cứu tức thì trong thời gian $O(1)$ mà không cần duyệt mảng tốn Gas. |
| **Dòng 61** | `mapping(bytes32 => bool) public isHashRegistered;` | **Chốt chặn chống trùng lặp (Anti-Duplication).** Kiểm tra file đã từng được cấp bằng hay chưa trước khi mint. |
| **Dòng 70-76** | `event AssetRegistered(uint256 indexed tokenId, ...)` | **Sự kiện ghi vào Logs của Transaction Receipt.** Từ khóa `indexed` (tối đa 3 tham số) cho phép các Web3 Client (Ethers.js) tạo bộ lọc (filter) tìm kiếm sự kiện cực nhanh. |
| **Dòng 104** | `constructor() ERC721(...) Ownable(msg.sender)` | **Hàm khởi tạo chạy duy nhất 1 lần khi deploy.** Đặt tên bộ sưu tập NFT và truyền `msg.sender` (ví người deploy) vào constructor của `Ownable` theo chuẩn OpenZeppelin v5. |
| **Dòng 105** | `_nextTokenId = 1;` | **Khởi tạo Token ID từ 1 thay vì 0.** Bắt đầu từ 1 giúp tránh nhầm lẫn giữa Token ID số 0 và giá trị mặc định của biến uninitialized trong Solidity. |
| **Dòng 131** | `external whenNotPaused returns (uint256)` | **Modifier & visibility:** `external` tối ưu Gas hơn `public` khi nhận mảng/chuỗi từ ngoài vì đọc trực tiếp từ `calldata`. `whenNotPaused` đảm bảo cầu dao đang mở mới cho đúc. |
| **Dòng 133** | `require(to != address(0), "Invalid recipient");` | **Chặn ví rỗng 0x0.** Tránh việc vô tình đúc NFT vào địa chỉ đốt (burn address) khiến tài sản biến mất vĩnh viễn. |
| **Dòng 136** | `require(bytes(uri).length > 0, "URI cannot be empty");` | **Kiểm tra độ dài chuỗi:** Chuyển `string` sang `bytes` để đo độ dài bằng `.length`, đảm bảo tác phẩm luôn có đường dẫn metadata. |
| **Dòng 139** | `require(contentHash != bytes32(0), "Invalid hash");` | **Chặn mã băm rỗng.** Đảm bảo mã băm không phải là chuỗi 32 byte số 0 `0x000...000`. |
| **Dòng 143** | `require(!isHashRegistered[contentHash], ...);` | **Chống đăng ký trùng lặp.** Nếu mã băm đã có trong mapping, giao dịch bị đảo ngược (Revert) lập tức, hoàn trả lại trạng thái ban đầu. |
| **Dòng 146-147**| `uint256 currentId = _nextTokenId; _nextTokenId++;` | **Cơ chế tự tăng ID:** Gán ID hiện tại cho tài sản và tăng biến đếm lên 1 để chuẩn bị cho tài sản kế tiếp. |
| **Dòng 154** | `registeredAt: block.timestamp,` | **Khắc dấu thời gian (Proof of Existence).** Lấy mốc thời gian của block đang đào làm chứng cứ pháp lý xác định ai là người tạo ra tác phẩm đầu tiên. |
| **Dòng 164** | `_safeMint(to, currentId);` | **Tại sao dùng `_safeMint` thay vì `_mint`?** `_mint` chuyển token bất chấp, nếu ví nhận là Smart Contract không hỗ trợ ERC-721 thì token sẽ bị kẹt vĩnh viễn. `_safeMint` kiểm tra hàm `onERC721Received`, nếu người nhận không hỗ trợ thì hủy giao dịch để bảo vệ người dùng! |
| **Dòng 167** | `_setTokenURI(currentId, uri);` | **Gắn URI metadata vào Token ID:** Lưu trữ liên kết metadata JSON chuẩn OpenSea / MetaMask vào mapping nội bộ của ERC721URIStorage. |
| **Dòng 170** | `emit AssetRegistered(...)` | **Phát sự kiện ra chuỗi:** Thông báo cho Frontend cập nhật giao diện và các dịch vụ Indexer lưu lại lịch sử. |
| **Dòng 189** | `function getAssetByHash(...) external view` | **Xác minh 0 Gas.** Từ khóa `view` cam kết hàm chỉ đọc dữ liệu từ Storage, không ghi, do đó khi gọi qua RPC node **hoàn toàn miễn phí Gas** và không cần kết nối ví. |
| **Dòng 208** | `ownerOf(id)` | **Lấy chủ sở hữu hiện tại.** Hàm chuẩn của OpenZeppelin trả về địa chỉ ví đang nắm giữ token tại thời điểm tra cứu. |
| **Dòng 226** | `require(_ownerOf(tokenId) != address(0))` | **Kiểm tra sự tồn tại của Token:** Hàm nội bộ `_ownerOf` trả về `address(0)` nếu Token ID chưa được đúc hoặc đã bị đốt. |
| **Dòng 233-235**| `function totalAssets() external view returns (uint256)` | **Theo dõi tổng số lượng tài sản:** Trả về `_nextTokenId - 1` để người dùng biết tổng số NFT đã đăng ký trên chuỗi. |
| **Dòng 246** | `require(ownerOf(tokenId) == msg.sender)` | **Xác thực quyền chuyển nhượng:** Chỉ người đang nắm giữ NFT mới có quyền chuyển nhượng tài sản của mình sang ví khác. |
| **Dòng 252** | `require(to != msg.sender)` | **Chống chuyển nhượng vô nghĩa:** Ngăn chặn người dùng tốn phí Gas khi vô tình chuyển token cho chính bản thân mình. |
| **Dòng 255** | `require(!assets[tokenId].isRevoked)` | **Đóng băng tài sản bị thu hồi:** Nếu tài sản đã bị đánh dấu vi phạm, cấm tuyệt đối mọi hành vi chuyển nhượng tiếp theo. |
| **Dòng 258** | `safeTransferFrom(msg.sender, to, tokenId);` | **Chuyển giao NFT chuẩn an toàn:** Cập nhật quyền sở hữu trong OpenZeppelin ERC-721 và kiểm tra khả năng tiếp nhận của ví nhận. |
| **Dòng 274** | `function revokeAsset(...) external onlyOwner` | **Chỉ Admin mới có quyền thu hồi:** Modifier `onlyOwner` bảo vệ hàm thu hồi, chỉ ví deployer/admin mới được phép kích hoạt. |
| **Dòng 280-281**| `assets[tokenId].isRevoked = true; revocationReason = reason;` | **Tại sao không burn token?** Nếu burn token, toàn bộ bản ghi bị xóa, người sau kiểm tra sẽ tưởng file chưa từng được cấp phép. Ta giữ lại token và đánh dấu `isRevoked = true` kèm lý do để công khai minh bạch bằng chứng vi phạm. |
| **Dòng 291-302**| `function _update(address to, uint256 tokenId, address auth) internal virtual override` | **Hook kiểm soát tầng sâu của OpenZeppelin v5.** Trong OZ v5, hook cũ `_beforeTokenTransfer` đã bị loại bỏ và thay thế bằng `_update`. Ta override hàm này để chặn mọi hành vi chuyển nhượng (dù gọi gián tiếp qua `transferFrom` bên ngoài) đối với tài sản bị thu hồi. |
| **Dòng 312-322**| `pause()` và `unpause()` | **Cầu dao khẩn cấp:** Gọi `_pause()` và `_unpause()` để tạm dừng hoặc khôi phục hoạt động của hợp đồng khi cần thiết. |

---

## 8.2. THƯ VIỆN WEB3 CLIENT ([`src/lib/onchain.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/lib/onchain.ts))

| Cụm code | Dòng | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- | :--- |
| `new ethers.BrowserProvider(window.ethereum)` | ~Dòng 35 | **Ethers.js v6 Browser Provider.** Kết nối trực tiếp với ví Web3 (MetaMask) được inject vào trình duyệt thông qua chuẩn EIP-1193. Khác với v5 (`providers.Web3Provider`), v6 rút gọn thành `BrowserProvider`. |
| `await provider.getSigner()` | ~Dòng 42 | **Lấy đối tượng Signer.** Signer đại diện cho tài khoản người dùng đang được chọn trong MetaMask, nắm giữ private key để ký xác nhận các giao dịch ghi dữ liệu tốn Gas. |
| `wallet_switchEthereumChain` | ~Dòng 70 | **Tự động chuyển mạng MetaMask.** Gửi lệnh RPC yêu cầu MetaMask chuyển sang Chain ID của mạng Hardhat Local (`31337` tương ứng `0x7a69` dạng hex). |
| `error.code === 4902` | ~Dòng 82 | **Mã lỗi Chain chưa tồn tại trong ví.** Bắt mã lỗi 4902 của MetaMask khi mạng Hardhat chưa được thêm vào ví, từ đó tự động gọi tiếp lệnh `wallet_addEthereumChain` để thêm mạng cho người dùng. |
| `hexToBytes32(asset.fileHash)` | ~Dòng 115 | **Chuẩn hóa chuỗi băm sang bytes32.** Đảm bảo chuỗi 64 ký tự hex có tiền tố `0x` và đủ 66 ký tự để Smart Contract Solidity nhận diện chính xác kiểu `bytes32`. |
| `await tx.wait()` | ~Dòng 130 | **Chờ xác nhận khối (Block Confirmation).** Tạm dừng luồng JavaScript chờ cho đến khi thợ đào (EVM) đưa giao dịch vào một block hợp lệ và trả về `TransactionReceipt` chứa mã băm block và block number. |
| `parseWeb3ErrorMessage(err)` | ~Dòng 180 | **Bẫy lỗi thân thiện:** Phân tích mã lỗi Web3 như mã `4001` (`ACTION_REJECTED` - người dùng bấm Reject trên MetaMask), `INSUFFICIENT_FUNDS` (hết gas) để dịch sang tiếng Việt dễ hiểu thay vì hiển thị lỗi thô. |

---

## 8.3. THƯ VIỆN MẬT MÃ BĂM ([`src/lib/crypto.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/lib/crypto.ts))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `file.arrayBuffer()` | **Đọc nhị phân tệp tin:** Đọc toàn bộ nội dung file nhị phân vào một vùng nhớ đệm ArrayBuffer trong RAM của trình duyệt. |
| `window.crypto.subtle.digest("SHA-256", arrayBuffer)` | **Web Crypto API tiêu chuẩn W3C:** Sử dụng hàm băm phần cứng có sẵn của trình duyệt. Tính toán trực tiếp trên RAM máy khách trong 0.02 giây mà không cần gửi file lên server hay ra internet, bảo mật tuyệt đối 100%. |
| `new Uint8Array(hashBuffer)` | **Chuyển đổi vùng đệm:** Chuyển kết quả băm 256 bits thành mảng gồm 32 phần tử byte, mỗi phần tử là một số nguyên từ 0 đến 255. |
| `b.toString(16).padStart(2, "0")` | **Tại sao phải `padStart(2, '0')`?** Chuyển số nguyên sang dạng hex cơ số 16. Nếu giá trị byte nhỏ hơn 16 (ví dụ byte = 10 cho ra chữ `a`), `padStart(2, '0')` sẽ bù số 0 ở đầu thành `0a` để đảm bảo mỗi byte luôn có đúng 2 ký tự hex, giúp chuỗi SHA-256 luôn đủ 64 ký tự chuẩn. |

---

## 8.4. COMPONENT KÉO THẢ BĂM FILE ([`src/components/FileDropzone.tsx`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/components/FileDropzone.tsx))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `e.preventDefault()` | **Chặn hành vi mặc định:** Ngăn trình duyệt tự động mở và hiển thị file ảnh khi người dùng kéo thả file vào cửa sổ web. |
| `URL.createObjectURL(file)` | **Tạo ảnh xem trước (Preview) tức thì:** Sinh một đường dẫn URL tạm trỏ thẳng vào vùng nhớ RAM của file trong trình duyệt để hiển thị thumbnail ảnh mà không cần tốn thời gian upload lên máy chủ. |
| `performance.now()` | **Đo thời gian băm chính xác:** Sử dụng hàm đo thời gian có độ chính xác micro-giây của trình duyệt để hiển thị tốc độ băm siêu tốc (< 0.05 giây) trước hội đồng. |

---

## 8.5. COMPONENT NÚT VÍ & ĐỔI TÀI KHOẢN ([`src/components/WalletButton.tsx`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/components/WalletButton.tsx))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `wallet_requestPermissions` | **Đổi ví 1 cú click:** Mở popup chọn tài khoản MetaMask, cho phép người thuyết trình chuyển đổi nhanh qua lại giữa ví Admin (`#0`), Creator (`#1`) và Buyer (`#2`) mà không cần vào setting MetaMask. |
| `window.ethereum.on("accountsChanged", ...)` | **Lắng nghe sự kiện đổi tài khoản:** Khi người dùng đổi ví trên MetaMask, web tự động bắt sự kiện và cập nhật lại quyền hạn (Admin / Creator) ngay lập tức mà không cần F5 tải lại trang. |
| `window.ethereum.on("chainChanged", ...)` | **Lắng nghe sự kiện đổi mạng:** Tự động reload trang khi người dùng chuyển mạng Blockchain để đảm bảo tính nhất quán dữ liệu. |

---

## 8.6. ROUTE NỘP HỒ SƠ ([`src/app/api/assets/route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/assets/route.ts))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `await request.formData()` | **Nhận dữ liệu đa phần (Multipart):** Đọc file nhị phân kèm các trường text (tiêu đề, mô tả, danh mục, ví người nộp) từ HTTP request. |
| `crypto.createHash("sha256").update(buffer).digest("hex")` | **Xác minh kép phía Server (Server-Side Verification):** Backend băm lại nội dung file độc lập bằng thư viện `crypto` của Node.js để kiểm chứng xem mã hash client gửi lên có chính xác hay không, ngăn chặn kẻ xấu sửa code client để gửi mã băm giả mạo. |
| `prisma.asset.findUnique({ where: { fileHash } })` | **Kiểm tra trùng lặp cơ sở dữ liệu:** Tận dụng chỉ mục `@unique` trên trường `fileHash` để tìm kiếm với độ phức tạp $O(1)$, trả về lỗi `409 Conflict` nếu file đã tồn tại. |
| `fs.promises.writeFile(filePath, buffer)` | **Lưu trữ file vật lý:** Ghi file vào thư mục `public/uploads/` với tên file gắn timestamp để tránh ghi đè tên tệp. |

---

## 8.7. ROUTE THẨM ĐỊNH ADMIN ([`src/app/api/admin/assets/[id]/review/route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/admin/assets/[id]/review/route.ts))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `verifyAdminWallet(callerWallet)` | **Kiểm soát truy cập dựa trên vai trò (RBAC):** Chuẩn hóa địa chỉ ví người gọi về chữ thường (`toLowerCase()`) và so sánh với danh sách ví Admin được cấp quyền. Trả về `403 Forbidden` nếu người gọi không phải Admin. |
| `asset.status === "REGISTERED" \|\| asset.status === "REVOKED"` | **Bảo vệ máy trạng thái (State Machine Guard):** Ngăn chặn Admin duyệt lại các hồ sơ đã được đúc lên Blockchain hoặc đã bị thu hồi bản quyền. |
| `prisma.certificate.create(...)` | **Cấp số chứng nhận số:** Khi hồ sơ được duyệt (`APPROVE`), tự động tạo bản ghi chứng chỉ với định danh chuẩn `CERT-2026-XXXX`. |

---

## 8.8. ROUTE ĐỐI SOÁT KÉP ON-CHAIN ([`src/app/api/assets/[id]/sync-onchain/route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/assets/[id]/sync-onchain/route.ts))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `new ethers.JsonRpcProvider(rpcUrl)` | **Kết nối trực tiếp Node EVM:** Backend chủ động mở kết nối RPC độc lập với trình duyệt để tự mình kiểm tra sự thật trên Blockchain. |
| `const onchainOwner = await contract.ownerOf(tokenId)` | **Đối soát kép (Dual Verification):** Không tin tưởng mù quáng vào `tokenId` mà client gửi lên; backend gọi trực tiếp hàm `ownerOf` trên chuỗi để xác minh NFT có thực sự thuộc về ví người nộp hay không. |
| `prisma.asset.update(...)` | **Đồng bộ trạng thái:** Chỉ khi kết quả on-chain hoàn toàn khớp, trạng thái trong SQLite mới được chuyển sang `REGISTERED`, lưu lại `txHash` và `blockNumber`. |

---

## 8.9. ROUTE CỔNG XÁC MINH 0 GAS ([`src/app/api/verify/route.ts`](file:///d:/CNTT2311/HK9/Blockchain/assetchain/src/app/api/verify/route.ts))

| Cụm code | Ý nghĩa kỹ thuật & Cách trả lời |
| :--- | :--- |
| `contract.getAssetByHash(bytes32Hash)` | **Gọi hàm view On-chain:** Thực hiện truy vấn trên Smart Contract mà không tốn phí Gas, lấy ra mốc thời gian `registeredAt`, trạng thái `isRevoked` và địa chỉ tác giả. |
| `verified: true, isOnchain: true` | **Hợp nhất dữ liệu đa tầng:** Trả về kết quả đối chứng hoàn chỉnh giữa cơ sở dữ liệu off-chain và sổ cái on-chain cho người dùng. |

---

# 9. BẢNG PHẢN XẠ NHANH 20 CÂU HỎI KINH ĐIỂN CỦA HỘI ĐỒNG
> **Mẹo ứng biến:** Giảng viên thường hỏi nhanh để thử phản xạ. Bạn chỉ cần trả lời đúng 1-2 câu trọng tâm theo bảng dưới đây:

1. **❓ Giảng viên hỏi: Hệ thống của em dùng thuật toán đồng thuận gì?**  
   👉 *Trả lời:* "Dạ hiện tại hợp đồng chạy trên nền EVM tương thích với Ethereum (sử dụng Proof of Stake). Trong môi trường phát triển cục bộ, nhóm em chạy Hardhat EVM Node để mô phỏng đóng block và kiểm thử."
2. **❓ Giảng viên hỏi: Tại sao không lưu thẳng file ảnh lên Blockchain mà phải lưu mã băm?**  
   👉 *Trả lời:* "Dạ lưu 1MB dữ liệu trên Ethereum có thể tốn hàng nghìn USD phí Gas và gây phình to sổ cái (state bloat). Thay vào đó, ta lưu mã băm SHA-256 (32 bytes) làm bằng chứng tồn tại (Proof of Existence), vừa tiết kiệm 99.9% chi phí vừa đảm bảo tính toàn vẹn tuyệt đối."
3. **❓ Giảng viên hỏi: Nếu kẻ gian sửa đúng 1 pixel trên bức ảnh thì hệ thống có biết không?**  
   👉 *Trả lời:* "Dạ có! Nhờ hiệu ứng tuyết lở (Avalanche Effect) của hàm băm mật mã SHA-256, chỉ cần thay đổi 1 bit hay 1 pixel thì toàn bộ chuỗi băm 64 ký tự hex sẽ thay đổi hoàn toàn, hệ thống sẽ báo ngay là tệp không tồn tại hoặc đã bị sửa đổi."
4. **❓ Giảng viên hỏi: Hàm `registerAsset` có bị tấn công Reentrancy (tái nhập) không?**  
   👉 *Trả lời:* "Dạ không, vì hàm tuân thủ mẫu thiết kế Checks-Effects-Interactions: Kiểm tra `require` trước, cập nhật mapping `assets` và `isHashRegistered` trước, rồi mới gọi `_safeMint` ở cuối cùng, đồng thời không có bất kỳ lệnh chuyển ETH nào."
5. **❓ Giảng viên hỏi: `view` function trong Solidity khác gì với hàm bình thường?**  
   👉 *Trả lời:* "Dạ hàm `view` chỉ đọc dữ liệu từ Storage của hợp đồng mà không thay đổi trạng thái của chuỗi. Do đó khi gọi từ bên ngoài thông qua RPC node, nó hoàn toàn không tốn phí Gas và không cần người dùng ký ví."
6. **❓ Giảng viên hỏi: Tại sao trong OpenZeppelin v5 lại dùng hàm `_update`?**  
   👉 *Trả lời:* "Dạ trong OpenZeppelin v5, các hook cũ như `_beforeTokenTransfer` và `_afterTokenTransfer` đã được hợp nhất thành một hook duy nhất là `_update(to, tokenId, auth)` để tối ưu hóa Gas và giảm kích thước bytecode của hợp đồng."
7. **❓ Giảng viên hỏi: `msg.sender` trong Solidity là gì?**  
   👉 *Trả lời:* "Dạ `msg.sender` là địa chỉ của tài khoản hoặc hợp đồng đang trực tiếp kích hoạt giao dịch hiện tại."
8. **❓ Giảng viên hỏi: Modifier `onlyOwner` hoạt động như thế nào?**  
   👉 *Trả lời:* "Dạ trước khi thực thi thân hàm, modifier này sẽ kiểm tra `require(owner() == msg.sender)`. Nếu ví gọi hàm không phải là chủ hợp đồng thì giao dịch sẽ bị Revert ngay lập tức."
9. **❓ Giảng viên hỏi: Mã băm SHA-256 có bị đụng độ (Collision) không?**  
   👉 *Trả lời:* "Dạ về mặt lý thuyết xác suất đụng độ của SHA-256 là $1/2^{256}$, nhỏ hơn cả số nguyên tử trong vũ trụ quan sát được, do đó trong thực tế coi như bất khả thi để tìm được 2 file khác nhau có cùng mã băm."
10. **❓ Giảng viên hỏi: Tại sao lại cần cả Database SQLite lẫn Blockchain?**  
    👉 *Trả lời:* "Dạ Blockchain đóng vai trò Lớp Bảo Chứng (Trust & Settlement Layer) bất biến và minh bạch; còn Database SQLite đóng vai trò Lớp Lưu Trữ Hiệu Năng Cao (High-Performance Query Layer) để tìm kiếm nhanh, phân trang và lưu thông tin người dùng."
11. **❓ Giảng viên hỏi: Người dùng chuyển nhượng NFT thì Database có tự cập nhật không?**  
    👉 *Trả lời:* "Dạ sau khi MetaMask hoàn tất giao dịch `transferAsset` on-chain, web sẽ gọi API `POST /api/assets/[id]/transfer` để đối soát lại trên chuỗi khối rồi cập nhật trường `currentOwnerWallet` và ghi nhận lịch sử vào bảng `OwnershipHistory`."
12. **❓ Giảng viên hỏi: Nếu server bị sập cơ sở dữ liệu thì chứng nhận bản quyền có bị mất không?**  
    👉 *Trả lời:* "Dạ không! Vì mã băm file, Token ID, địa chỉ tác giả và mốc thời gian đều đã được ghi bất biến trên Blockchain. Bất kỳ ai cầm file gốc kéo vào cổng xác minh đều có thể truy xuất trực tiếp từ hợp đồng thông minh mà không phụ thuộc vào cơ sở dữ liệu."
13. **❓ Giảng viên hỏi: `bytes32(0)` trong Solidity có giá trị là gì?**  
    👉 *Trả lời:* "Dạ là một dãy gồm 32 bytes toàn số 0 (`0x0000000000000000000000000000000000000000000000000000000000000000`), tương đương với giá trị mặc định của một biến `bytes32` chưa được gán dữ liệu."
14. **❓ Giảng viên hỏi: Chức năng `pause()` dùng để làm gì?**  
    👉 *Trả lời:* "Dạ là cơ chế dừng khẩn cấp (Emergency Circuit Breaker). Khi phát hiện lỗ hổng hoặc có tranh chấp lớn, Admin có thể tạm dừng chức năng đăng ký và chuyển nhượng để bảo vệ tài sản người dùng."
15. **❓ Giảng viên hỏi: Token ID được sinh ra như thế nào?**  
    👉 *Trả lời:* "Dạ Token ID được sinh tuần tự tự động từ biến đếm `_nextTokenId` trong Smart Contract, bắt đầu từ số 1 và tăng dần mỗi khi có tác phẩm mới được mint."
16. **❓ Giảng viên hỏi: QR code trên file PDF dẫn về đâu?**  
    👉 *Trả lời:* "Dạ mã QR chứa đường link động `http://localhost:3000/verify?hash=<fileHash>`. Bất kỳ ai dùng điện thoại quét mã QR sẽ được chuyển thẳng đến trang xác minh tác quyền của tác phẩm đó."
17. **❓ Giảng viên hỏi: Tại sao lại dùng Ethers.js v6 mà không dùng Web3.js?**  
    👉 *Trả lời:* "Dạ Ethers.js v6 có dung lượng nhẹ hơn, hỗ trợ TypeScript hoàn chỉnh, xử lý kiểu dữ liệu `BigInt` tự nhiên và có cú pháp hiện đại, rõ ràng hơn."
18. **❓ Giảng viên hỏi: Tại sao lại gọi là "Proof of Existence"?**  
    👉 *Trả lời:* "Dạ vì khi băm file và đưa mã băm lên chuỗi kèm `block.timestamp`, chuỗi khối chứng minh không thể chối cãi rằng tệp tin số đó đã tồn tại vào thời điểm đó và thuộc về người ký giao dịch đó."
19. **❓ Giảng viên hỏi: Cơ chế Dual Verification (Đối soát kép) bảo vệ hệ thống khỏi điều gì?**  
    👉 *Trả lời:* "Dạ bảo vệ hệ thống khỏi gian lận Client-Side. Người dùng không thể giả mạo request gửi mã giao dịch rác lên server, vì server sẽ dùng JSON-RPC kiểm tra trực tiếp trạng thái sở hữu thực tế trên Smart Contract trước khi ghi nhận vào CSDL."
20. **❓ Giảng viên hỏi: Nếu giảng viên muốn cấp quyền Admin cho một ví khác thì làm thế nào?**  
    👉 *Trả lời:* "Dạ trong Smart Contract, Admin hiện tại có thể gọi hàm `transferOwnership(newAdminAddress)` được kế thừa từ thư viện `Ownable` của OpenZeppelin để chuyển quyền quản trị sang ví mới."
