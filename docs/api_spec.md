# Đặc Tả API RESTful (Next.js App Router Route Handlers)

Toàn bộ các API được triển khai trực tiếp bên trong ứng dụng **Next.js Fullstack** qua thư mục `src/app/api/...`. Cách tiếp cận này loại bỏ việc duy trì riêng biệt NestJS server, giúp nhóm 2 người phát triển và chạy local dễ dàng chỉ với một cổng duy nhất (`http://localhost:3000`).

---

## 1. Authentication & Session (`/api/auth`)

Xác thực người dùng sử dụng JWT token lưu trữ trong HTTP-only Cookie hoặc gửi qua header `Authorization: Bearer <token>`.

### 1.1. Đăng ký tài khoản
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "email": "creator@assetchain.local",
    "password": "Password123!",
    "fullName": "Nguyễn Văn Creator",
    "role": "CREATOR",
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "user": {
      "id": "cuid_123",
      "email": "creator@assetchain.local",
      "fullName": "Nguyễn Văn Creator",
      "role": "CREATOR",
      "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    }
  }
  ```

### 1.2. Đăng nhập
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "creator@assetchain.local",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "cuid_123",
      "email": "creator@assetchain.local",
      "role": "CREATOR",
      "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    }
  }
  ```

---

## 2. Quản Lý Đăng Ký Tài Sản (`/api/assets`) - Do Thành viên A phụ trách

### 2.1. Đăng ký tài sản mới & Upload file
- **Endpoint:** `POST /api/assets`
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:**
  - `file`: File nhị phân (Ảnh, tài liệu thiết kế)
  - `title`: Tên tài sản (VD: "Tranh kỹ thuật số Sen Vàng")
  - `description`: Mô tả chi tiết
  - `category`: Thể loại ("ART", "DESIGN", "PHOTOGRAPHY")
  - `clientHash`: Mã SHA-256 tính từ client (để backend đối chiếu tính toàn vẹn)
  - `walletAddress`: Địa chỉ ví của tác giả
- **Quy trình xử lý:**
  1. Backend lưu file vào `public/uploads/`.
  2. Backend tính lại SHA-256 của file đã lưu, đối chiếu với `clientHash`.
  3. Kiểm tra trùng lặp `fileHash` trong SQLite. Nếu đã tồn tại -> Trả về lỗi 409 Conflict.
  4. Tạo bản ghi Asset với trạng thái khởi tạo: `PENDING_APPROVAL`.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "asset_cuid_456",
      "title": "Tranh kỹ thuật số Sen Vàng",
      "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "filePath": "/uploads/1730000000_sen_vang.png",
      "status": "PENDING_APPROVAL",
      "createdAt": "2026-11-01T10:00:00.000Z"
    }
  }
  ```

### 2.2. Lấy danh sách tài sản của người dùng hiện tại
- **Endpoint:** `GET /api/assets/my-assets`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Danh sách tài sản của user với các trạng thái (`PENDING_APPROVAL`, `APPROVED`, `REGISTERED`, `REJECTED`).

### 2.3. Cập nhật đồng bộ sau khi Mint on-chain thành công
- **Endpoint:** `POST /api/assets/[id]/sync-onchain`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "tokenId": 1,
    "txHash": "0x123abc456def...",
    "blockNumber": 12,
    "ownerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
  ```
- **Quy trình xử lý:**
  1. Backend xác nhận giao dịch qua Local RPC Provider (kiểm tra event `AssetRegistered`).
  2. Cập nhật `status = "REGISTERED"`, lưu `tokenId`, `txHash`, `blockNumber`.
  3. Tự động ghi bản ghi vào bảng `OwnershipHistory` (eventType: "MINT").
- **Response (200 OK):** `{ "success": true, "message": "Synchronized on-chain status successfully" }`.

---

## 3. Quản Trị & Xét Duyệt Hồ Sơ (`/api/admin`) - Do Thành viên B phụ trách

### 3.1. Danh sách hồ sơ cần xét duyệt
- **Endpoint:** `GET /api/admin/assets?status=PENDING_APPROVAL`
- **Headers:** `Authorization: Bearer <token>` (Role: ADMIN)
- **Response (200 OK):** Danh sách tất cả tài sản đang chờ duyệt kèm thông tin tác giả.

### 3.2. Phê duyệt hoặc Từ chối hồ sơ
- **Endpoint:** `POST /api/admin/assets/[id]/review`
- **Headers:** `Authorization: Bearer <token>` (Role: ADMIN)
- **Body:**
  ```json
  {
    "action": "APPROVE", // hoặc "REJECT"
    "rejectionReason": "" // nếu action là REJECT
  }
  ```
- **Quy trình xử lý:**
  - Nếu `APPROVE`: Đổi trạng thái sang `APPROVED`. Cho phép Creator kích hoạt giao dịch mint on-chain, hoặc Admin mint thay. Đồng thời kích hoạt sinh mã chứng nhận ban đầu.
  - Nếu `REJECT`: Đổi trạng thái sang `REJECTED`, lưu `rejectionReason`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "asset_cuid_456",
      "status": "APPROVED"
    }
  }
  ```

---

## 4. Chứng Nhận Điện Tử & Tra Cứu (`/api/certificate`, `/api/verify`) - Do Thành viên B phụ trách

### 4.1. Tạo và lấy thông tin chứng nhận điện tử (E-Certificate)
- **Endpoint:** `GET /api/certificate/[assetId]`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "certificate": {
      "certificateNumber": "CERT-2026-0001",
      "assetTitle": "Tranh kỹ thuật số Sen Vàng",
      "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "tokenId": 1,
      "creatorName": "Nguyễn Văn Creator",
      "creatorWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "verifyUrl": "http://localhost:3000/verify?hash=e3b0c442...",
      "qrCodeBase64": "data:image/png;base64,iVBORw0KGgo...",
      "issuedAt": "2026-11-02T14:30:00.000Z"
    }
  }
  ```

### 4.2. Cổng tra cứu và xác minh tính toàn vẹn (Public Verification)
- **Endpoint:** `POST /api/verify`
- **Body:**
  ```json
  {
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "tokenId": 1 // (optional, có thể truyền 1 trong 2)
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "verified": true,
    "source": "BOTH_DATABASE_AND_BLOCKCHAIN",
    "asset": {
      "title": "Tranh kỹ thuật số Sen Vàng",
      "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "tokenId": 1,
      "creatorWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "currentOwnerWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "registeredAt": "2026-11-02T14:30:00.000Z",
      "isRevoked": false,
      "txHash": "0x123abc...",
      "certificateNumber": "CERT-2026-0001"
    }
  }
  ```
