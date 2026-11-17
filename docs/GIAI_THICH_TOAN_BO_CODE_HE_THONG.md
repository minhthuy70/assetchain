# TÀI LIỆU ÔN TẬP & GIẢI THÍCH TOÀN BỘ CODE HỆ THỐNG ASSETCHAIN
> **Dành cho:** Báo cáo môn Blockchain & Ứng biến khi Giảng viên hỏi code / yêu cầu sửa code tại chỗ.  
> **Cấu trúc:** Full-stack Web3: Smart Contract (Solidity) $\rightarrow$ Backend API (Next.js & Prisma) $\rightarrow$ Frontend & Web3 (Ethers.js & React).

---

## MỤC LỤC
1. [Bản Đồ Kiến Trúc Hệ Thống (End-to-End Architecture)](#1-bản-đồ-kiến-trúc-hệ-thống)
2. [Hợp Đồng Thông Minh (Solidity - AssetRegistry.sol)](#2-hợp-đồng-thông-minh-solidity)
3. [Tầng Cơ Sở Dữ Liệu (Prisma & SQLite Schema)](#3-tầng-cơ-sở-dữ-liệu-prisma--sqlite)
4. [Tầng Backend API (Next.js API Routes)](#4-tầng-backend-api-nextjs-route-handlers)
5. [Tầng Frontend & Tích Hợp Web3 (Ethers.js v6)](#5-tầng-frontend--tích-hợp-web3)
6. [TẬP DƯỢT 5 TÌNH HUỐNG THẦY KÊU SỬA CODE TẠI CHỖ (LIVE CODING)](#6-tập-dược-5-tình-huống-thầy-kêu-sửa-code-tại-chỗ)

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
📁 **Đường dẫn tệp:** [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)

### 2.1. Thư viện kế thừa (Kế thừa từ OpenZeppelin v5)
```solidity
contract AssetRegistry is ERC721URIStorage, Ownable, Pausable
```
* **`ERC721URIStorage`**: Chuẩn NFT quốc tế của Ethereum, cho phép mỗi Token ID có một đường link metadata JSON riêng (`tokenURI`).
* **`Ownable`**: Phân quyền, gán địa chỉ người deploy (`msg.sender`) làm chủ hợp đồng (Admin), cung cấp modifier `onlyOwner`.
* **`Pausable`**: Cơ chế cầu dao khẩn cấp, cho phép Admin tạm dừng hợp đồng (`pause()`) khi phát hiện tấn công.

---

### 2.2. Cấu trúc dữ liệu & Biến lưu trữ (Storage)
```solidity
struct AssetRecord {
    uint256 tokenId;           // Mã ID định danh NFT
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

### 2.3. Giải thích từng hàm trong Smart Contract

#### Hàm 1: `constructor()` (Dòng 104)
```solidity
constructor() ERC721("AssetChain Digital Asset", "ASSET") Ownable(msg.sender) {
    _nextTokenId = 1; // Bắt đầu đếm Token ID từ số 1
}
```
* Đặt tên bộ sưu tập NFT là *"AssetChain Digital Asset"*, ký hiệu mã là *"ASSET"*.
* Người bấm deploy ví dụ `0xf39Fd...` sẽ trở thành Owner (Admin).

#### Hàm 2: `registerAsset(...)` (Dòng 127) – Đúc NFT & Ghi mốc thời gian
```solidity
function registerAsset(
    address to,
    string memory uri,
    bytes32 contentHash
) external whenNotPaused returns (uint256)
```
* **Các bước thực thi:**
  1. `require(to != address(0))`: Chặn ví rỗng.
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
* Ghi đè (override) hook nội tại của OpenZeppelin: Dù hacker có dùng code ngoài gọi `transferFrom` bỏ qua hàm `transferAsset`, thì hook `_update` này vẫn kiểm tra `require(!assets[tokenId].isRevoked)` $\rightarrow$ Đóng băng tuyệt đối 100%!

---

# 3. TẦNG CƠ SỞ DỮ LIỆU (PRISMA & SQLITE)
📁 **Đường dẫn tệp:** [`prisma/schema.prisma`](file:///d:/GITHUB/assetchain/prisma/schema.prisma)

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
📁 [`src/app/api/assets/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/assets/route.ts)
* **Xử lý:** Nhận `multipart/form-data` gồm file ảnh, tiêu đề, địa chỉ ví.
* **Server-side Hash:** Dùng thư viện `crypto` của Node.js băm lại SHA-256 của file tải lên để đảm bảo tính toàn vẹn (không tin tưởng 100% hash client gửi lên).
* **Kiểm tra trùng:** Nếu `fileHash` đã có trong bảng `Asset` $\rightarrow$ Trả về lỗi `409 Conflict`.
* **Lưu file vật lý:** Ghi file vào thư mục `public/uploads/` với tên chuẩn hóa theo timestamp.
* Tạo bản ghi Asset với trạng thái `PENDING_APPROVAL`.

### 2. `POST /api/admin/assets/[id]/review` – Thẩm định hồ sơ
📁 [`src/app/api/admin/assets/[id]/review/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/admin/assets/[id]/review/route.ts)
* **Xác thực quyền:** Kiểm tra ví người gọi (`callerWallet`) thông qua hàm `verifyAdminWallet()`: bắt buộc phải là ví Admin (`0xf39Fd...`). Nếu không $\rightarrow$ Lỗi `403 Forbidden`.
* **Bảo vệ máy trạng thái:** Chặn duyệt các hồ sơ đã ở trạng thái `REGISTERED` hoặc `REVOKED`.
* Nếu chọn `APPROVE`: Cập nhật status = `APPROVED`, tự động sinh mã `certificateNumber` (ví dụ `CERT-2026-0004`) và tạo bản ghi trong bảng `Certificate`.
* Nếu chọn `REJECT`: Bắt buộc nhập `rejectionReason`, cập nhật status = `REJECTED`.

### 3. `POST /api/assets/[id]/sync-onchain` – Đồng bộ sau khi đúc NFT
📁 [`src/app/api/assets/[id]/sync-onchain/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/assets/[id]/sync-onchain/route.ts)
* **Đối soát kép On-Chain (Dual Verification):** Không chỉ nhận `tokenId` và `txHash` từ client gửi lên, backend khởi tạo kết nối `ethers.JsonRpcProvider` gọi trực tiếp hàm `contract.ownerOf(tokenId)` trên Blockchain để xác thực xem token này có thực sự thuộc về ví tác giả hay không.
* Nếu đối soát on-chain khớp: Cập nhật status = `REGISTERED`, lưu `tokenId`, `txHash`, `blockNumber`.

### 4. `POST /api/assets/[id]/transfer` – Chuyển nhượng quyền sở hữu
📁 [`src/app/api/assets/[id]/transfer/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/assets/[id]/transfer/route.ts)
* **Chống lỗ hổng BOLA/IDOR:** Bắt buộc người gọi phải là chủ sở hữu hợp pháp (`callerWallet === asset.currentOwnerWallet`).
* **Đối soát on-chain:** Kiểm tra trên Smart Contract xem quyền sở hữu của Token ID đã thực sự chuyển sang `toWallet` chưa.
* Cập nhật `currentOwnerWallet = toWallet` và ghi nhận một dòng lịch sử vào bảng `OwnershipHistory`.

### 5. `POST /api/verify` – Cổng tra cứu xác minh 2 tầng
📁 [`src/app/api/verify/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/verify/route.ts)
* **Tầng 1 (Database):** Tìm kiếm theo `fileHash` hoặc `tokenId` trong SQLite.
* **Tầng 2 (Blockchain EVM):** Gọi hàm `contract.getAssetByHash()` trên Smart Contract.
* Tổng hợp dữ liệu từ cả 2 nguồn để trả về: Có hợp lệ không (`verified`), Có on-chain không (`isOnchain`), Có bị thu hồi không (`isRevoked`).

### 6. `GET /api/certificate/[assetId]` – Xuất Chứng nhận E-Certificate PDF
📁 [`src/app/api/certificate/[assetId]/route.ts`](file:///d:/GITHUB/assetchain/src/app/api/certificate/[assetId]/route.ts)
* Dùng thư viện `jspdf` vẽ chứng nhận khổ A4 Landscape trang trọng với khung viền hoàng gia.
* Dùng thư viện `qrcode` tạo mã QR dẫn thẳng về link `/verify?hash=...`.
* Sử dụng hàm `removeVietnameseAccents` để chuẩn hóa font chữ tiếng Việt, đảm bảo file PDF không bao giờ bị vỡ font hay lỗi ký tự lạ.

---

# 5. TẦNG FRONTEND & TÍCH HỢP WEB3

### 1. `src/lib/onchain.ts` – Cầu nối giao tiếp với Blockchain
📁 [`src/lib/onchain.ts`](file:///d:/GITHUB/assetchain/src/lib/onchain.ts)
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
📁 [`src/components/FileDropzone.tsx`](file:///d:/GITHUB/assetchain/src/components/FileDropzone.tsx)
* Sử dụng Web Crypto API tiêu chuẩn của trình duyệt (`window.crypto.subtle.digest("SHA-256", arrayBuffer)`).
* Tính toán mã băm ngay trong RAM của trình duyệt trong 0.02 giây mà không cần gửi file lên server, giúp bảo mật và tiết kiệm băng thông.

### 3. `src/components/WalletButton.tsx` – Nút kết nối & Đổi tài khoản
📁 [`src/components/WalletButton.tsx`](file:///d:/GITHUB/assetchain/src/components/WalletButton.tsx)
* Sử dụng `wallet_requestPermissions` để mở hộp thoại cho phép người dùng đổi qua lại giữa ví `Admin Council`, `Creator 1` và `Buyer` chỉ trong 1 cú click.
* Tự động lắng nghe sự kiện `accountsChanged` và `chainChanged` của MetaMask để cập nhật giao diện.

---

# 6. TẬP DƯỢT 5 TÌNH HUỐNG THẦY KÊU SỬA CODE TẠI CHỖ (LIVE CODING)

Dưới đây là 5 tình huống kinh điển mà giảng viên hay thử thách sinh viên để xem bạn có thực sự hiểu code hay không:

---

### TÌNH HUỐNG 1: "Thầy muốn thêm phí đúc NFT là 0.01 ETH, người tạo phải trả tiền thì mới cho đúc?"
👉 **Nơi sửa:** File [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)
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
👉 **Nơi sửa:** File [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)
* Tìm hàm `constructor()` (dòng 104):
  ```solidity
  constructor() ERC721("Ten_Moi_O_Day", "SYMBOL_MOI") Ownable(msg.sender) {
      _nextTokenId = 1;
  }
  ```
* Sửa chữ `"AssetChain Digital Asset"` thành tên mới, `"ASSET"` thành ký hiệu mới. Sau đó chạy lại lệnh deploy: `npx hardhat run contracts/scripts/deploy.js --network localhost`.

---

### TÌNH HUỐNG 3: "Viết thêm cho thầy một hàm kiểm tra xem 1 mã hash đã đăng ký chưa?"
👉 **Nơi sửa:** File [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)
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
1. **Frontend:** File [`src/components/FileDropzone.tsx`](file:///d:/GITHUB/assetchain/src/components/FileDropzone.tsx) (Dòng 36):
   Sửa `maxSizeMB = 50` thành `maxSizeMB = 10`.
2. **Backend:** File [`.env`](file:///d:/GITHUB/assetchain/.env) (Dòng 24):
   Sửa `MAX_FILE_SIZE_BYTES=52428800` thành `MAX_FILE_SIZE_BYTES=10485760` (10 * 1024 * 1024).

---

### TÌNH HUỐNG 5: "Thầy muốn cho phép Admin mở khóa (Un-revoke / Phục hồi) tài sản đã bị thu hồi nhầm?"
👉 **Nơi sửa:** File [`contracts/contracts/AssetRegistry.sol`](file:///d:/GITHUB/assetchain/contracts/contracts/AssetRegistry.sol)
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

## 7. TỔNG KẾT BÍ KÍP ĐI BÁO CÁO

* **Khi thầy hỏi về Blockchain:** Nhấn mạnh vào 3 từ khóa: **Proof of Existence (PoE)**, **ERC-721 bất biến** và **Xác minh 0 Gas (`view` function)**.
* **Khi thầy hỏi về Bảo mật:** Nêu rõ cơ chế **Đối soát kép On-Chain (Dual Verification)** giữa Backend SQLite và hàm `contract.ownerOf(tokenId)` trên chuỗi khối, cùng với việc ghi đè hook `_update()` để đóng băng chuyển nhượng tài sản vi phạm.
* **Tự tin trả lời:** Hệ thống được chia tách rõ ràng: Việc nặng (lưu file, tìm kiếm) để Web2 lo; việc bảo chứng tính toàn vẹn, quyền sở hữu và mốc thời gian pháp lý để Web3 Blockchain lo!
