# Đặc Tả Hợp Đồng Thông Minh (Smart Contract Specification)

AssetChain sử dụng một Smart Contract duy nhất mang tên **`AssetRegistry.sol`** chạy trên mạng máy ảo Ethereum cục bộ (**Hardhat Local EVM Network**, Chain ID: `31337`).

---

## 1. Thông Tin Chung

- **Tên hợp đồng:** `AssetRegistry.sol`
- **Ngôn ngữ:** Solidity `^0.8.24`
- **Thư viện tiêu chuẩn:** OpenZeppelin Contracts v5.x
  - `@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol`
  - `@openzeppelin/contracts/access/Ownable.sol`
  - `@openzeppelin/contracts/utils/Pausable.sol`
- **Mạng triển khai:** Hardhat Local (`http://127.0.0.1:8545`)
- **Tài khoản quản trị (Deployer):** Hardhat Account #0 (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)

---

## 2. Cấu Trúc Dữ Liệu On-Chain

```solidity
struct AssetRecord {
    uint256 tokenId;          // ID duy nhất của tài sản (ERC-721)
    bytes32 contentHash;      // Vân tay số SHA-256 nhị phân của file (32 bytes)
    address creator;          // Địa chỉ ví người đăng ký ban đầu
    uint256 registeredAt;     // Mốc thời gian on-chain (block.timestamp)
    bool isRevoked;           // Trạng thái thu hồi bản quyền
    string revocationReason;  // Lý do thu hồi (nếu có)
}
```

---

## 3. Biến Trạng Thái & Mapping

```solidity
uint256 private _nextTokenId;

// Mapping từ tokenId sang AssetRecord chi tiết
mapping(uint256 => AssetRecord) public assets;

// Mapping từ contentHash sang tokenId (đảm bảo mỗi file chỉ được đăng ký 1 lần duy nhất)
mapping(bytes32 => uint256) public hashToTokenId;

// Kiểm tra nhanh hash đã tồn tại hay chưa
mapping(bytes32 => bool) public isHashRegistered;
```

---

## 4. Sự Kiện (Events)

```solidity
event AssetRegistered(
    uint256 indexed tokenId,
    address indexed creator,
    bytes32 indexed contentHash,
    string tokenURI,
    uint256 timestamp
);

event AssetTransferred(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp
);

event AssetRevoked(
    uint256 indexed tokenId,
    address indexed admin,
    string reason,
    uint256 timestamp
);
```

---

## 5. Các Hàm Chính (Core Functions)

### 5.1. `registerAsset`
```solidity
function registerAsset(
    address to,
    string memory uri,
    bytes32 contentHash
) external whenNotPaused returns (uint256)
```
- **Mục đích:** Ghi nhận sự tồn tại của tài sản lên blockchain và mint NFT ERC-721 đại diện cho quyền sở hữu ban đầu.
- **Quyền gọi:** Người dùng/Creator kết nối ví MetaMask ký giao dịch (sau khi hồ sơ đã được Admin duyệt trong SQLite).
- **Ràng buộc:**
  - `to != address(0)`
  - `contentHash != bytes32(0)`
  - `!isHashRegistered[contentHash]`: **Bắt buộc file chưa từng được đăng ký trước đây!** (Ngăn ngừa duplicate on-chain).
- **Hành động:**
  1. Tăng `_nextTokenId`.
  2. Lưu bản ghi `AssetRecord`.
  3. Gán `hashToTokenId[contentHash] = tokenId` và `isHashRegistered[contentHash] = true`.
  4. Gọi `_safeMint(to, tokenId)`.
  5. Gọi `_setTokenURI(tokenId, uri)`.
  6. Phát sự kiện `AssetRegistered`.
  7. Trả về `tokenId`.

### 5.2. `getAssetByHash`
```solidity
function getAssetByHash(bytes32 contentHash) external view returns (
    uint256 tokenId,
    address creator,
    address currentOwner,
    uint256 registeredAt,
    bool isRevoked,
    string memory uri
)
```
- **Mục đích:** Hỗ trợ cổng tra cứu nhanh (*Instant 1-Click Verification*). Người dùng chỉ cần kéo thả file vào trình duyệt, tính SHA-256 rồi gọi hàm `view` này trực tiếp qua RPC mà không cần đăng nhập hay tốn phí gas.

### 5.3. `getAssetById`
```solidity
function getAssetById(uint256 tokenId) external view returns (
    AssetRecord memory record,
    address currentOwner,
    string memory uri
)
```
- **Mục đích:** Tra cứu chi tiết tài sản theo Token ID (phục vụ quét mã QR từ chứng nhận điện tử).

### 5.4. `transferAsset`
```solidity
function transferAsset(address to, uint256 tokenId) external whenNotPaused
```
- **Mục đích:** Chủ sở hữu hiện tại (`ownerOf(tokenId)`) chuyển nhượng quyền sở hữu tài sản sang địa chỉ ví khác. Kế thừa cơ chế chuyển nhượng an toàn của ERC-721 (`safeTransferFrom`).
- **Sự kiện phát ra:** `AssetTransferred`.

### 5.5. `revokeAsset`
```solidity
function revokeAsset(uint256 tokenId, string memory reason) external onlyOwner
```
- **Mục đích:** Admin hệ thống đánh dấu thu hồi chứng nhận tài sản khi có vi phạm bản quyền hoặc gian lận hồ sơ.
- **Quyền gọi:** `onlyOwner` (ví Admin deployer).

---

## 6. Quy Định Về Chuyển Đổi Mã Băm (SHA-256 → bytes32)

- File nhị phân được tính mã băm bằng **Web Crypto API** ở frontend hoặc thư viện `crypto` ở backend:
  $$\text{SHA-256}(\text{fileBuffer}) \to \text{Chuỗi Hex 64 ký tự (ví dụ: } \texttt{e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855}\text{)}$$
- Khi gửi vào Smart Contract qua `ethers.js v6`:
  ```typescript
  // Định dạng đúng cho kiểu bytes32 trong Solidity
  const contentHashBytes32 = "0x" + hexString;
  ```
- **Quy tắc an toàn:** Không băm chuỗi hex một lần nữa (tránh lỗi double-hashing).
