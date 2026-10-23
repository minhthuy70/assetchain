# Đặc Tả Hợp Đồng Thông Minh (Smart Contracts Specification)

AssetChain sử dụng mạng máy ảo Ethereum (EVM) để đảm bảo tính minh bạch, bất biến và truy xuất nguồn gốc. Các hợp đồng được phát triển bằng Solidity `^0.8.24` trên nền tảng Hardhat.

---

## 1. Hợp Đồng Cốt Lõi: `AssetRegistry.sol`

Hợp đồng chính kế thừa các tiêu chuẩn bảo mật được kiểm toán từ OpenZeppelin:
- `ERC721URIStorage`: Chuẩn quản lý quyền sở hữu tài sản độc nhất (NFT) kèm liên kết metadata URI.
- `Ownable`: Quản trị quyền sở hữu hợp đồng (dành cho Admin hệ thống).
- `Pausable`: Cơ chế tạm dừng khẩn cấp khi phát hiện lỗi hoặc bảo trì.

### 1.1. Cấu Trúc Dữ Liệu On-Chain

```solidity
struct AssetRecord {
    uint256 tokenId;
    bytes32 contentHash;      // SHA-256 fingerprint của tệp tài sản nhị phân
    address creator;          // Địa chỉ ví của người đăng ký đầu tiên
    uint256 registeredAt;     // Mốc thời gian (block.timestamp) ghi nhận sự tồn tại
    bool isRevoked;           // Cờ thu hồi trong trường hợp tranh chấp bản quyền
    string revocationReason;  // Lý do thu hồi (nếu có)
}
```

### 1.2. Biến Trạng Thái (State Variables)
- `_nextTokenId`: Biến đếm tự tăng quản lý `tokenId`.
- `mapping(uint256 => AssetRecord) public assets`: Ánh xạ từ `tokenId` tới bản ghi chi tiết.
- `mapping(bytes32 => uint256) public hashToTokenId`: Ánh xạ từ `contentHash` tới `tokenId` (Bảo đảm tính duy nhất của mã băm trên chuỗi).
- `mapping(bytes32 => bool) public isHashRegistered`: Kiểm tra nhanh mã băm đã từng được đăng ký hay chưa.

### 1.3. Sự Kiện (Events)

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

### 1.4. Các Hàm Chính (Core Functions)

#### a. `registerAsset(address to, string memory uri, bytes32 contentHash)`
- **Mục đích:** Đăng ký tài sản số mới, tạo mốc thời gian Proof of Existence và mint token ERC-721.
- **Điều kiện kiểm tra:**
  - `to != address(0)`.
  - `bytes(uri).length > 0`.
  - `contentHash != bytes32(0)`.
  - `!isHashRegistered[contentHash]`: Mã băm chưa từng được đăng ký trước đó (ngăn chặn hành vi mạo danh hoặc upload lại cùng một file).
- **Hành động:**
  - Tăng `_nextTokenId`.
  - Lưu trữ `AssetRecord` và cập nhật các mapping.
  - Gọi `_safeMint(to, tokenId)`.
  - Gọi `_setTokenURI(tokenId, uri)`.
  - Phát sự kiện `AssetRegistered`.

#### b. `getAssetByHash(bytes32 contentHash)`
- **Mục đích:** Tra cứu nhanh thông tin nguồn gốc tài sản công khai trực tiếp từ blockchain mà không cần phụ thuộc vào cơ sở dữ liệu backend.
- **Modifiers:** `external view`.
- **Trả về:** `(uint256 tokenId, address creator, address currentOwner, uint256 registeredAt, bool isRevoked, string memory uri)`.

#### c. `revokeAsset(uint256 tokenId, string memory reason)`
- **Mục đích:** Thu hồi tài sản trong trường hợp cơ quan có thẩm quyền hoặc hội đồng quản trị xác định hành vi gian lận / vi phạm bản quyền.
- **Modifiers:** `onlyOwner`.
- **Hành động:** Đánh dấu `isRevoked = true`, lưu lý do và phát sự kiện `AssetRevoked`.

---

## 2. Hợp Đồng Mở Rộng: `AssetLicensing.sol` (Phase 2)

Quản lý thỏa thuận cấp quyền sử dụng:
- Cho phép chủ sở hữu (`ownerOf(tokenId)`) cấp phép cho bên thứ ba (`licensee`) với các điều kiện:
  - Thời hạn bắt đầu (`validFrom`) và kết thúc (`validUntil`).
  - Phân loại giấy phép: `NON_COMMERCIAL`, `COMMERCIAL`, `EXCLUSIVE`.
  - Mức phí bản quyền (nếu tích hợp thanh toán token/native coin).
- Đảm bảo quyền sở hữu gốc không bị chuyển giao khi chỉ cấp phép quyền sử dụng.

---

## 3. Thực Hành An Toàn Mật Mã Học & Smart Contract
1. **Reentrancy Protection:** Sử dụng `ReentrancyGuard` từ OpenZeppelin cho bất kỳ hàm có tương tác giá trị.
2. **Access Control:** Áp dụng phân quyền chặt chẽ (`onlyOwner` cho quyền quản trị khẩn cấp).
3. **No Private Keys On-Chain:** Hợp đồng chỉ làm việc với địa chỉ ví công khai (`msg.sender`, `address`).
4. **Deterministic Hash Standard:** Quy định chuẩn mã băm SHA-256 từ phía client/backend để đối chiếu tương thích với `bytes32`.
