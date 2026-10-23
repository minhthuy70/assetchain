# Đặc Tả API RESTful (NestJS Backend)

Tất cả các API được phục vụ dưới tiền tố `/api/v1`. Các endpoint yêu cầu xác thực cần kèm header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication & Wallet Management (`/auth`)

### 1.1. Đăng ký tài khoản
- **Method:** `POST /api/v1/auth/register`
- **Body:**
  ```json
  {
    "email": "creator@assetchain.io",
    "password": "StrongPassword123!",
    "fullName": "Nguyen Van A",
    "role": "CREATOR"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-v4",
      "email": "creator@assetchain.io",
      "fullName": "Nguyen Van A",
      "role": "CREATOR"
    }
  }
  ```

### 1.2. Đăng nhập
- **Method:** `POST /api/v1/auth/login`
- **Body:**
  ```json
  {
    "email": "creator@assetchain.io",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid-v4",
      "email": "creator@assetchain.io",
      "fullName": "Nguyen Van A",
      "role": "CREATOR",
      "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    }
  }
  ```

### 1.3. Lấy Nonce để ký xác thực ví (Signature Challenge)
- **Method:** `GET /api/v1/auth/wallet/nonce`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "nonce": "a7b3c9d1e2f3g4h5",
    "message": "AssetChain Wallet Binding Authentication\nPlease sign this message to verify ownership of your wallet.\nNonce: a7b3c9d1e2f3g4h5\nIssued At: 2026-10-23T08:00:00.000Z"
  }
  ```

### 1.4. Xác thực và Liên kết địa chỉ ví
- **Method:** `POST /api/v1/auth/wallet/bind`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "signature": "0x4355c3c391f427563114f56b4d1a2a005f..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Wallet verified and bound successfully",
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
  ```

---

## 2. Quản Lý Tài Sản Số (`/assets`)

### 2.1. Upload tệp gốc & Tạo mã băm
- **Method:** `POST /api/v1/assets/upload`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:** `file: <binary_file>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "tempFileId": "temp-uuid",
      "originalName": "digital_artwork_01.png",
      "fileHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "mimeType": "image/png",
      "fileSizeBytes": 4512030,
      "previewUrl": "/uploads/temp-uuid.png",
      "isDuplicate": false
    }
  }
  ```

### 2.2. Chuẩn bị đăng ký tài sản (Tạo Metadata & Kiểm tra điều kiện)
- **Method:** `POST /api/v1/assets/prepare-registration`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "tempFileId": "temp-uuid",
    "title": "Cosmic Genesis #01",
    "description": "Original 3D rendered digital art created using Blender.",
    "category": "3D_ART",
    "fileHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "assetId": "asset-uuid",
    "metadataUri": "http://localhost:3001/api/v1/assets/metadata/asset-uuid",
    "contentHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "status": "DRAFT"
  }
  ```

### 2.3. Xác nhận giao dịch on-chain (Client gửi txHash sau khi MetaMask ký)
- **Method:** `POST /api/v1/assets/confirm-registration`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "assetId": "asset-uuid",
    "txHash": "0x98f2195f487e41e5...",
    "chainId": 31337
  }
  ```
- **Processing:** Backend kết nối EVM RPC node, kiểm tra txReceipt, bóc tách event `AssetRegistered`, cập nhật `tokenId`, `blockNumber`, `status: REGISTERED`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "assetId": "asset-uuid",
    "tokenId": 1,
    "status": "REGISTERED",
    "blockNumber": 14,
    "registeredAt": "2026-10-23T08:15:30.000Z"
  }
  ```

### 2.4. Danh sách tài sản (Public / Search / Filter)
- **Method:** `GET /api/v1/assets?page=1&limit=10&search=Cosmic&category=3D_ART&status=REGISTERED`
- **Response (200 OK):** Trả về mảng tài sản phân trang kèm thông tin creator.

### 2.5. Chi tiết tài sản kèm lịch sử
- **Method:** `GET /api/v1/assets/:id`
- **Response (200 OK):** Toàn bộ thông tin metadata, creator, owner hiện tại, thông tin on-chain đối chiếu và lịch sử giao dịch.

### 2.6. Xác minh tính toàn vẹn tài sản (Public Verification Engine)
- **Method:** `POST /api/v1/assets/verify`
- **Body hoặc Multipart File:**
  - Cách 1: Gửi mã băm `{"fileHash": "0xe3b0..."}`
  - Cách 2: Tải trực tiếp tệp lên qua Form-Data `file: <binary>`
- **Response (200 OK):**
  ```json
  {
    "status": "VERIFIED_VALID",
    "computedHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "match": {
      "assetId": "asset-uuid",
      "tokenId": 1,
      "title": "Cosmic Genesis #01",
      "creator": {
        "name": "Nguyen Van A",
        "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      },
      "currentOwner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "registeredAt": "2026-10-23T08:15:30.000Z",
      "blockNumber": 14,
      "txHash": "0x98f2195f487e41e5...",
      "onChainVerification": {
        "verifiedOnChain": true,
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "isRevoked": false
      }
    }
  }
  ```

---

## 3. Lịch Sử & Chuyển Nhượng Quyền Sở Hữu (`/ownership`)

### 3.1. Xác nhận chuyển nhượng on-chain
- **Method:** `POST /api/v1/ownership/confirm-transfer`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "assetId": "asset-uuid",
    "toAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "txHash": "0xabcdef..."
  }
  ```
- **Response (200 OK):** Backend xác thực `Transfer` event trên RPC node và cập nhật `currentOwnerWalletAddress` cùng bản ghi mới vào bảng `OwnershipHistory`.

### 3.2. Lấy dòng thời gian lịch sử tài sản (Provenance Timeline)
- **Method:** `GET /api/v1/ownership/history/:assetId`
- **Response (200 OK):** Danh sách các mốc thời gian: MINT -> TRANSFER -> LICENSE...

---

## 4. Quản Lý Cấp Phép Bản Quyền (`/licenses`) - Phase 2

- `POST /api/v1/licenses/issue`: Tạo thỏa thuận cấp phép sử dụng có thời hạn.
- `GET /api/v1/licenses/my-licenses`: Tra cứu các giấy phép đang sở hữu hoặc đã cấp.
- `PATCH /api/v1/licenses/:id/revoke`: Hủy cấp phép trước hạn (nếu vi phạm điều khoản).

---

## 5. Quản Trị Hệ Thống (`/admin`)

- `GET /api/v1/admin/users`: Danh sách người dùng hệ thống.
- `PATCH /api/v1/admin/users/:id/status`: Kích hoạt / Khóa tài khoản.
- `GET /api/v1/admin/disputes`: Danh sách khiếu nại tranh chấp bản quyền.
- `PATCH /api/v1/admin/disputes/:id/resolve`: Ra quyết định xử lý khiếu nại (bác bỏ hoặc gắn cờ/thu hồi tài sản).
