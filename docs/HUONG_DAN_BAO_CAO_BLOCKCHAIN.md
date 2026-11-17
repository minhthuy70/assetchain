# CẨM NANG TOÀN DIỆN BÁO CÁO ĐỒ ÁN BLOCKCHAIN: ASSETCHAIN
> **Dự án:** AssetChain – Nền Tảng Đăng Ký & Xác Thực Bản Quyền Tác Phẩm Kỹ Thuật Số  
> **Chuẩn Token:** ERC-721 (Non-Fungible Token - NFT) trên Máy ảo Ethereum (EVM)  
> **Cơ chế cốt lõi:** Proof of Existence (Bằng chứng tồn tại) & Zero-Gas Public Verification  

---

## MỤC LỤC
1. [Bản Chất Dự Án & Kiến Trúc Blockchain (Hiểu Trong 3 Phút)](#1-bản-chất-dự-án--kiến-trúc-blockchain)
2. [Thông Số Kỹ Thuật & Cấu Hình Mạng Hardhat EVM](#2-thông-số-kỹ-thuật--cấu-hình-mạng-hardhat-evm)
3. [Hướng Dẫn Cài Đặt MetaMask & 3 Tài Khoản Thử Nghiệm](#3-hướng-dẫn-cài-đặt-metamask--3-tài-khoản-thử-nghiệm)
4. [Kịch Bản Demo Trực Tiếp Từng Bước (Walkthrough Cheat-Sheet)](#4-kịch-bản-demo-trực-tiếp-từng-bước)
5. [Bộ Câu Hỏi & Trả Lời Vấn Đáp Giảng Viên (Defense Q&A)](#5-bộ-câu-hỏi--trả-lời-vấn-đáp-giảng-viên)
6. [Bảng Tra Cứu Lệnh Terminal & Xử Lý Sự Cố Nhanh](#6-bảng-tra-cứu-lệnh-terminal--xử-lý-sự-cố-nhanh)

---

## 1. BẢN CHẤT DỰ ÁN & KIẾN TRÚC BLOCKCHAIN

### 1.1. Vấn đề thực tế đặt ra (Problem)
Trong môi trường kỹ thuật số, tranh ảnh, đồ họa và tài liệu rất dễ bị sao chép nguyên bản chỉ bằng một cú nhấp chuột (Ctrl+C, Ctrl+V). Tác giả gặp khó khăn trong việc:
* Chứng minh **tính nguyên bản** và **thời điểm tạo lập đầu tiên** của tác phẩm.
* Chứng minh lịch sử chuyển nhượng quyền sở hữu minh bạch mà không phụ thuộc vào một bên trung gian tập trung (vốn có thể bị tấn công hoặc sửa đổi database).

### 1.2. Giải pháp kỹ thuật của AssetChain (Solution)
AssetChain ứng dụng cơ chế **Proof of Existence (Bằng chứng tồn tại)** kết hợp mô hình Hybrid Web2/Web3:
* **Off-chain (Web2):** Lưu trữ file gốc tại máy chủ cục bộ (`public/uploads/`) và metadata trong SQLite via Prisma ORM để tối ưu chi phí và tốc độ truy vấn.
* **On-chain (Web3 Blockchain):** Sử dụng Smart Contract `AssetRegistry.sol` (kế thừa OpenZeppelin v5) để ghi nhận:
  1. **Mã băm SHA-256 (32 bytes):** Đóng vai trò là "dấu vân tay số" bất biến của tệp.
  2. **Token ID (ERC-721):** Định danh duy nhất của tác phẩm trên sổ cái.
  3. **Địa chỉ ví tác giả & Mốc thời gian khối (`block.timestamp`):** Bằng chứng pháp lý số không thể chối cãi.
  4. **Cơ chế thu hồi (Revoke):** Cho phép cơ quan quản trị hủy hiệu lực chứng nhận nếu phát hiện tranh chấp bản quyền và lập tức đóng băng mọi giao dịch chuyển nhượng của token đó.

```
[ Người dùng chọn file ] 
        │ (Web Crypto API - RAM Browser)
        ▼
[ Tính mã băm SHA-256 (64 hex / 32 bytes) ]
        │
        ├─► [ Gửi hồ sơ lên Web2 ] ──► Trạng thái: PENDING_APPROVAL
        │
        ├─► [ Admin thẩm định ]    ──► Trạng thái: APPROVED (Cấp E-Certificate)
        │
        ├─► [ Đúc NFT On-chain ]   ──► Ký ví MetaMask ──► Smart Contract `registerAsset`
        │                                                     │
        │                                                     ▼
        │                                          [ Sinh Token ID ERC-721 ]
        │                                          [ Ghi nhận block.timestamp ]
        │
        └─► [ Xác minh công khai 0 Gas ] ◄── Tra cứu RPC hàm view `getAssetByHash`
```

---

## 2. THÔNG SỐ KỸ THUẬT & CẤU HÌNH MẠNG HARDHAT EVM

* **Mạng thử nghiệm (Local Network):** Hardhat Local EVM
* **RPC URL:** `http://127.0.0.1:8545`
* **Chain ID (Thập phân):** `31337`
* **Chain ID (Hex):** `0x7a69`
* **Đồng tiền cơ sở (Native Currency):** `ETH` (18 Decimals)
* **Smart Contract:** `AssetRegistry.sol`
* **Tiêu chuẩn Smart Contract:** ERC-721 (`ERC721URIStorage`, `Ownable`, `Pausable`)

---

## 3. HƯỚNG DẪN CÀI ĐẶT METAMASK & 3 TÀI KHOẢN THỬ NGHIỆM

### Bước 3.1: Thêm mạng Hardhat Local vào tiện ích MetaMask
1. Mở tiện ích mở rộng MetaMask trên trình duyệt (Chrome, Brave, Edge).
2. Nhấp vào menu chọn mạng ở góc trên bên trái $\rightarrow$ Chọn **Add Network (Thêm mạng)** $\rightarrow$ Chọn **Add a network manually (Thêm mạng thủ công)**.
3. Nhập chính xác thông số:
   * **Network Name:** `Hardhat Local EVM`
   * **New RPC URL:** `http://127.0.0.1:8545`
   * **Chain ID:** `31337`
   * **Currency Symbol:** `ETH`
4. Bấm **Save (Lưu)** và chuyển sang mạng này.

---

### Bước 3.2: Nhập 3 tài khoản mẫu bằng Private Key

> **Cách nhập Private Key vào MetaMask:**  
> Bấm biểu tượng hình tròn avatar tài khoản trên MetaMask $\rightarrow$ Chọn **Add account or hardware wallet** $\rightarrow$ Chọn **Import account (Nhập tài khoản)** $\rightarrow$ Dán mã Private Key $\rightarrow$ Đổi tên ví để tránh nhầm lẫn khi demo.

#### 1. Tài khoản Quản trị viên (Đổi tên thành: `Admin Council`)
* **Địa chỉ ví:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
* **Private Key:**
  ```text
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  ```
* **Quyền hạn:** Deployer hợp đồng, duyệt hồ sơ đăng ký (`APPROVED`), từ chối hồ sơ (`REJECTED`), thu hồi tài sản vi phạm (`REVOKED`).

#### 2. Tài khoản Tác giả chính (Đổi tên thành: `Creator - Nguyen Van A`)
* **Địa chỉ ví:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
* **Private Key:**
  ```text
  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  ```
* **Quyền hạn:** Nộp hồ sơ đăng ký tác phẩm, đúc NFT Token #1 on-chain, chuyển quyền sở hữu tác phẩm của mình.

#### 3. Tài khoản Người mua / Tác giả 2 (Đổi tên thành: `Buyer - Tran Thi B`)
* **Địa chỉ ví:** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
* **Private Key:**
  ```text
  0x5de4111afa1a4b94908f83103eb2f954082b8d388cc379e77e2c294a538ea4f
  ```
* **Quyền hạn:** Người nhận quyền sở hữu tác phẩm sau giao dịch chuyển nhượng, sở hữu Token #3.

---

## 4. KỊCH BẢN DEMO TRỰC TIẾP TỪNG BƯỚC

### Chuẩn bị trước giờ báo cáo (Mở 2 Terminal):
* **Terminal 1 (Blockchain Node):**
  ```powershell
  cd contracts
  npx hardhat node
  ```
  *(Để terminal này chạy liên tục)*

* **Terminal 2 (Web Server):**
  ```powershell
  npm run dev
  ```
  *(Mở trình duyệt vào `http://localhost:3000`)*

---

### Kịch bản trình diễn (5 - 7 phút):

#### CẢNH 1: Đăng ký tác phẩm mới & Băm dấu vân tay số
1. Mở MetaMask, chọn ví **`Creator - Nguyen Van A`**.
2. Trên thanh menu, vào **Đăng ký** (`/creator/register`).
3. Kéo thả 1 bức ảnh demo bất kỳ vào khung Dropzone.
   * *Lời bình cho giảng viên:* "Thưa thầy/cô, hệ thống sử dụng Web Crypto API tính toán mã băm SHA-256 ngay trong bộ nhớ RAM trình duyệt trong 0.02 giây. Bức ảnh chưa hề được tải lên máy chủ trước khi có mã băm."
4. Nhập Tiêu đề và Mô tả tác phẩm $\rightarrow$ Bấm **Nộp hồ sơ thẩm định**.
5. Hệ thống báo thành công, hồ sơ chuyển sang trạng thái **PENDING_APPROVAL**.

#### CẢNH 2: Admin thẩm định hồ sơ & Cấp Chứng nhận E-Certificate
1. Mở MetaMask, chuyển sang ví **`Admin Council`**.
2. Vào trang **Thẩm định** (`/admin/approvals`).
3. Tìm hồ sơ vừa nộp $\rightarrow$ Bấm **Xem hồ sơ** $\rightarrow$ Kiểm tra ảnh và mã băm SHA-256.
4. Bấm **Phê duyệt hồ sơ**.
5. Hồ sơ chuyển sang trạng thái **APPROVED** và được tự động gán số hiệu chứng nhận (ví dụ: `CERT-2026-0004`).

#### CẢNH 3: Đúc NFT lên Blockchain EVM (Mint On-Chain)
1. Mở MetaMask, chuyển lại ví **`Creator - Nguyen Van A`**.
2. Vào menu **Tác phẩm của tôi** (`/creator/my-assets`).
3. Tại tác phẩm vừa được phê duyệt, bấm nút **Đúc NFT lên Blockchain**.
4. Tiện ích MetaMask tự động kích hoạt yêu cầu xác thực giao dịch `registerAsset`.
5. Bấm **Confirm** trên MetaMask $\rightarrow$ Sau 1 giây, tác phẩm được cấp **Token ID** trên Blockchain, hiển thị mã `txHash` và block number. Trạng thái chuyển thành **REGISTERED**.

#### CẢNH 4: Cổng xác minh công khai 0 Gas & Xuất file PDF
1. Vào trang **Xác minh tệp** (`/verify`).
2. *Thao tác biểu diễn:* Có thể ngắt kết nối ví MetaMask (chứng minh tính công khai).
3. Kéo thả chính bức ảnh vừa đúc vào ô kiểm tra:
   * Màn hình lập tức hiện biểu tượng **Xanh lục** kèm thông báo: *"ĐÃ XÁC THỰC CHÍNH CHỦ TRÊN BLOCKCHAIN EVM"*.
   * Hiển thị chi tiết: Token ID, Chủ sở hữu hiện tại, Mốc thời gian khối (Timestamp).
   * *Lời bình cho giảng viên:* "Chức năng này không tốn một đồng phí Gas nào vì gọi qua hàm `view` RPC `getAssetByHash`."
4. Bấm nút **Xem Chứng nhận E-Certificate** $\rightarrow$ Mở ra bản PDF chuẩn quốc tế với khung viền hoàng gia sang trọng và mã QR Code xác thực.

#### CẢNH 5: Chuyển nhượng quyền sở hữu minh bạch (Transfer)
1. Kết nối lại ví **`Creator - Nguyen Van A`**, vào menu **Chuyển quyền** (`/creator/transfer`).
2. Chọn tác phẩm của mình, điền địa chỉ ví của **`Buyer - Tran Thi B`** (`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`).
3. Bấm **Xác nhận chuyển nhượng** $\rightarrow$ Ký giao dịch trên MetaMask.
4. Truy cập trang chi tiết tác phẩm: Chủ sở hữu hiện tại đã đổi thành Chị B; bảng lịch sử dòng đời (Provenance Timeline) ghi lại từng block và từng transaction hash rõ ràng.

#### CẢNH 6: Cơ chế thu hồi khi có tranh chấp (Revocation)
1. Chuyển ví sang **`Admin Council`**, vào menu **Thu hồi** (`/admin/revoke`).
2. Nhập Token ID hoặc chọn Token #2 $\rightarrow$ Nhập lý do: *"Tranh chấp bản quyền sở hữu trí tuệ"* $\rightarrow$ Bấm **Xác nhận thu hồi on-chain** $\rightarrow$ Ký giao dịch.
3. Khi vào lại trang **Xác minh tệp**, hệ thống lập tức hiển thị cảnh báo **Đỏ**: *"TÀI SẢN ĐÃ BỊ THU HỒI HIỆU LỰC"*.
4. *Điểm nhấn kỹ thuật:* Smart Contract lập tức đóng băng (freeze), chặn đứng mọi nỗ lực chuyển nhượng hoặc mua bán token này trên toàn mạng.

---

## 5. BỘ CÂU HỎI & TRẢ LỜI VẤN ĐÁP GIẢNG VIÊN (DEFENSE Q&A)

### Câu 1: Tại sao không lưu trực tiếp toàn bộ bức ảnh lên Blockchain mà lại lưu mã hash SHA-256?
* **Trả lời:**
  > *"Lưu trữ dữ liệu lớn (ảnh/video) trực tiếp vào storage của Smart Contract cực kỳ tốn phí Gas và gây phình to kích thước sổ cái của các node mạng (State Bloat). Vì vậy, hệ thống áp dụng kiến trúc chuẩn quốc tế **Proof of Existence (PoE)** kết hợp Off-chain và On-chain: File gốc lưu ở off-chain, còn trên Blockchain chỉ lưu mã băm mật mã **SHA-256 (32 bytes)** và **Token ID**. Vì SHA-256 có tính kháng va chạm (Collision Resistance) và tính một chiều, chỉ cần đổi 1 pixel trong ảnh thì mã băm sẽ thay đổi hoàn toàn, do đó 32 bytes trên chuỗi đủ sức bảo chứng toàn vẹn cho bất kỳ tệp tin dung lượng lớn nào."*

### Câu 2: Smart Contract của nhóm sử dụng chuẩn gì và có những cơ chế bảo mật nào?
* **Trả lời:**
  > *"Hợp đồng `AssetRegistry.sol` kế thừa tiêu chuẩn **ERC-721** (NFT) từ thư viện bảo mật **OpenZeppelin v5**:
  > 1. `ERC721URIStorage` để quản lý metadata token.
  > 2. `Ownable` để phân quyền cho tài khoản Admin.
  > 3. `Pausable` để có thể tạm dừng khẩn cấp toàn bộ hợp đồng khi phát hiện sự cố.
  > 4. **Ghi đè hook `_update()`** để đóng băng chuyển nhượng đối với các token đã bị thu hồi (`require(!assets[tokenId].isRevoked)`).
  > 5. Kiểm tra chống trùng lặp mã hash (`contentHashExists`) và chống tự chuyển nhượng cho chính mình (`require(to != msg.sender)`)."*

### Câu 3: Làm thế nào hệ thống ngăn chặn việc một người đăng ký trùng một tác phẩm nhiều lần?
* **Trả lời:**
  > *"Hệ thống thiết lập cơ chế bảo vệ 2 tầng:
  > * **Tầng CSDL (Off-chain):** Cột `fileHash` trong bảng `Asset` của SQLite được đánh chỉ mục `UNIQUE`. Nếu gửi trùng, API sẽ trả về lỗi HTTP 409 Conflict.
  > * **Tầng Smart Contract (On-chain):** Hợp đồng sử dụng `mapping(bytes32 => bool) public isHashRegistered`. Trong hàm `registerAsset`, hợp đồng kiểm tra `require(!isHashRegistered[contentHash], "Hash already registered")`. Nếu trùng, máy ảo EVM sẽ tự động Revert giao dịch ngay lập tức."*

### Câu 4: Tại sao chức năng xác minh tệp trên web lại không tốn phí Gas (0 Gas)?
* **Trả lời:**
  > *"Vì hàm `getAssetByHash` và `getAssetById` trên Smart Contract được khai báo với từ khóa `view` (chỉ đọc). Khi gọi hàm này, ứng dụng chỉ truy vấn dữ liệu từ bộ nhớ trạng thái của Node thông qua giao thức JSON-RPC mà không ghi dữ liệu mới lên Blockchain, do đó theo quy chuẩn của Ethereum sẽ hoàn toàn miễn phí Gas và người dùng không cần kết nối ví vẫn tra cứu được."*

### Câu 5: Nếu người dùng cố tình gửi lệnh chuyển nhượng bằng script ngoài hoặc Etherscan để né tránh website thì sao?
* **Trả lời:**
  > *"Bảo mật của hệ thống nằm ở **tầng lõi Smart Contract** chứ không chỉ dựa vào giao diện web:
  > 1. Trong hàm `_update` của Smart Contract có điều kiện `require(!assets[tokenId].isRevoked)`. Do đó, nếu token đã bị thu hồi, dù dùng script trực tiếp gọi hàm `transferFrom` thì EVM vẫn từ chối và Revert giao dịch.
  > 2. Phía backend API cũng có cơ chế **Đối soát kép On-Chain (Dual Verification)**: API chỉ cập nhật trạng thái trong database khi kiểm tra hàm `ownerOf(tokenId)` trên Blockchain xác nhận giao dịch đã được đào thành công."*

### Câu 6: Làm sao biết tệp Chứng nhận E-Certificate (PDF) không bị làm giả?
* **Trả lời:**
  > *"Trên mỗi bản E-Certificate đều có:
  > 1. Mã băm SHA-256 đầy đủ của tác phẩm.
  > 2. Mã QR Code chứa đường dẫn trực tiếp đến cổng xác minh công khai kèm tham số hash.
  > Bất kỳ ai nhận được bản PDF chỉ cần quét mã QR hoặc tải tệp gốc lên hệ thống để đối soát với sổ cái Blockchain. Nếu nội dung bị chỉnh sửa dù 1 ký tự, mã băm sẽ không khớp và hệ thống sẽ báo giả mạo ngay lập tức."*

---

## 6. BẢNG TRA CỨU LỆNH TERMINAL & XỬ LÝ SỰ CỐ NHANH

| Mục đích | Câu lệnh thực thi (PowerShell) | Ghi chú |
| :--- | :--- | :--- |
| **Khởi động Blockchain Node** | `cd contracts; npx hardhat node` | Cần mở đầu tiên, giữ chạy ngầm |
| **Chạy kiểm thử Smart Contract** | `cd contracts; npx hardhat test` | Kiểm tra 23/23 unit tests pass |
| **Nạp dữ liệu mẫu On-Chain** | `npx hardhat run contracts/scripts/seed-onchain.js --network localhost` | Tạo sẵn Token #1, #2 (revoked), #3 |
| **Khởi động ứng dụng Web** | `npm run dev` | Truy cập tại `http://localhost:3000` |
| **Build kiểm tra lỗi toàn dự án** | `npm run build` | Đảm bảo 12/12 routes build pass |

---

### Xử lý sự cố thường gặp trong lúc demo (Troubleshooting):

1. **MetaMask báo lỗi `Nonce too high` hoặc giao dịch bị treo:**
   * *Nguyên nhân:* Do bạn tắt đi bật lại lệnh `npx hardhat node`, làm số đếm khối trên blockchain reset về 0 trong khi MetaMask vẫn nhớ số nonce cũ.
   * *Cách khắc phục trong 5 giây:* Mở MetaMask $\rightarrow$ Cài đặt (Settings) $\rightarrow$ Nâng cao (Advanced) $\rightarrow$ Bấm **Xóa dữ liệu tài khoản (Clear activity and nonce data / Reset account)**.

2. **Web báo lỗi "Không thể kết nối mạng Hardhat Local EVM":**
   * *Nguyên nhân:* Quên chưa chạy terminal `npx hardhat node` ở thư mục `contracts`.
   * *Cách khắc phục:* Mở PowerShell, gõ `cd contracts; npx hardhat node`.

3. **Tài khoản Creator không đủ tiền Gas:**
   * *Khắc phục:* Đảm bảo bạn đã nhập đúng Private Key của tài khoản Hardhat Account #1 hoặc #2 được cấp sẵn 10,000 ETH ảo.

