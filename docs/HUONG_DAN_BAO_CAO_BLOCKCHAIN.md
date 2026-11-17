# CẨM NANG TOÀN DIỆN BÁO CÁO ĐỒ ÁN BLOCKCHAIN: ASSETCHAIN
> **Dự án:** AssetChain – Nền Tảng Đăng Ký & Xác Thực Bản Quyền Tác Phẩm Kỹ Thuật Số  
> **Chuẩn Token:** ERC-721 (Non-Fungible Token - NFT) trên Máy ảo Ethereum (EVM)  
> **Cơ chế cốt lõi:** Proof of Existence (Bằng chứng tồn tại) & Zero-Gas Public Verification  

---

## MỤC LỤC
1. [Bản Chất Dự Án & Kiến Trúc Blockchain (Hiểu Trong 3 Phút)](#1-bản-chất-dự-án--kiến-trúc-blockchain)
2. [Hướng Dẫn Chạy Mạng Blockchain & Triển Khai Hợp Đồng Từ A-Z](#2-hướng-dẫn-chạy-mạng-blockchain--triển-khai-hợp-đồng-từ-a-z)
3. [Hướng Dẫn Cài Đặt MetaMask & Nhập 3 Tài Khoản Thử Nghiệm](#3-hướng-dẫn-cài-đặt-metamask--nhập-3-tài-khoản-thử-nghiệm)
4. [Thư Mục Tệp Demo Kéo Thả (DEMO_FILES)](#4-thư-mục-tệp-demo-kéo-thả-demo_files)
5. [Kịch Bản Demo Trực Tiếp & Lời Thoại Cho Thầy Cô](#5-kịch-bản-demo-trực-tiếp--lời-thoại-cho-thầy-cô)
6. [Bộ Câu Hỏi & Trả Lời Vấn Đáp Giảng Viên (Defense Q&A)](#6-bộ-câu-hỏi--trả-lời-vấn-đáp-giảng-viên)
7. [Bảng Tra Cứu Lệnh & Xử Lý Sự Cố Nhanh](#7-bảng-tra-cứu-lệnh--xử-lý-sự-cố-nhanh)

---

## 1. BẢN CHẤT DỰ ÁN & KIẾN TRÚC BLOCKCHAIN

### 1.1. Vấn đề thực tế đặt ra (Problem)
Trong môi trường kỹ thuật số, tranh ảnh, đồ họa và tài liệu rất dễ bị sao chép nguyên bản chỉ bằng một cú nhấp chuột (Ctrl+C, Ctrl+V). Tác giả gặp khó khăn trong việc:
* Chứng minh **tính nguyên bản** và **thời điểm tạo lập đầu tiên** của tác phẩm.
* Chứng minh lịch sử chuyển nhượng quyền sở hữu minh bạch mà không phụ thuộc vào một bên trung gian tập trung (vốn có thể bị tấn công hoặc sửa đổi cơ sở dữ liệu).

### 1.2. Giải pháp kỹ thuật của AssetChain (Solution)
AssetChain ứng dụng cơ chế **Proof of Existence (Bằng chứng tồn tại)** kết hợp mô hình Hybrid Web2/Web3:
* **Off-chain (Web2):** Lưu trữ file gốc tại máy chủ cục bộ (`public/uploads/`) và metadata trong SQLite via Prisma ORM để tối ưu chi phí và tốc độ truy vấn.
* **On-chain (Web3 Blockchain):** Sử dụng Smart Contract `AssetRegistry.sol` (kế thừa OpenZeppelin v5) để ghi nhận:
  1. **Mã băm SHA-256 (32 bytes):** Đóng vai trò là "dấu vân tay số" bất biến của tệp.
  2. **Token ID (ERC-721):** Định danh duy nhất của tác phẩm trên sổ cái Blockchain.
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

## 2. HƯỚNG DẪN CHẠY MẠNG BLOCKCHAIN & TRIỂN KHAI HỢP ĐỒNG TỪ A-Z

Để hệ thống hoạt động, bạn và đồng đội cần mở **2 cửa sổ Terminal (PowerShell)** trong VS Code:

### 🖥 TERMINAL 1: BẬT MÁY CHỦ BLOCKCHAIN ETHEREUM NỘI BỘ
Mở PowerShell trong VS Code (`Ctrl + ~`) và chạy:
```powershell
cd d:\GITHUB\assetchain\contracts
npx hardhat node
```
* **Dấu hiệu thành công:** Màn hình hiện `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/` và liệt kê 20 tài khoản có sẵn `(10000 ETH)`.
* ⚠️ **LƯU Ý BẮT BUỘC:** Giữ nguyên cửa sổ Terminal này chạy liên tục, **KHÔNG ĐƯỢC TẮT**!

---

### 🖥 TERMINAL 2: DEPLOY HỢP ĐỒNG & KHỞI CHẠY WEB
Nhìn góc trên bên phải khung Terminal của VS Code, bấm dấu **`+`** để mở thêm **Terminal thứ 2**:

1. **Triển khai Smart Contract lên node:**
   ```powershell
   cd d:\GITHUB\assetchain
   npx hardhat run contracts/scripts/deploy.js --network localhost
   ```
   *(Thấy thông báo màu xanh: `✅ HỢP ĐỒNG ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG TẠI: 0x5FbDB...`)*

2. **Nạp dữ liệu mẫu On-Chain (Đúc Token #1, #2, #3):**
   ```powershell
   npx hardhat run contracts/scripts/seed-onchain.js --network localhost
   ```
   *(Thấy thông báo: `🎉 ĐỒNG BỘ HOÀN TẤT! TỔNG SỐ TOKEN TRÊN CHUỖI: 3`)*

3. **Bật máy chủ Web Next.js:**
   ```powershell
   npm run dev
   ```
   *(Mở trình duyệt truy cập: `http://localhost:3000`)*

---

## 3. HƯỚNG DẪN CÀI ĐẶT METAMASK & NHẬP 3 TÀI KHOẢN THỬ NGHIỆM

### Bước 3.1: Thêm mạng Hardhat Local vào MetaMask
1. Mở tiện ích mở rộng **MetaMask** trên trình duyệt (Chrome, Brave, Edge).
2. Nhấp vào menu chọn mạng ở góc trên bên trái $\rightarrow$ Chọn **Add Network (Thêm mạng)** $\rightarrow$ Cuộn xuống chọn **Add a network manually (Thêm mạng thủ công)**.
3. Điền các thông số sau:
   * **Network Name:** `Hardhat Local EVM`
   * **New RPC URL:** `http://127.0.0.1:8545`
   * **Chain ID:** `31337`
   * **Currency Symbol:** `ETH`
   * **RPC Name (Optional):** Bỏ trống (hoặc gõ `Hardhat Local RPC`)
   * **Block explorer URL:** Bỏ trống
4. ⚠️ **LƯU Ý CẢNH BÁO MÀU CAM:** MetaMask sẽ hiện dòng chữ màu cam: *"Suggested name: GoChain Testnet... Suggested currency symbol: GO"*. Đây chỉ là cảnh báo nhắc nhở mặc định của MetaMask, **KHÔNG PHẢI LỖI**. Bạn chỉ cần **cuộn màn hình xuống dưới cùng** $\rightarrow$ Bấm nút **Save (Lưu)** hoặc **Add (Thêm)** là xong!

---

### Bước 3.2: Nhập 3 tài khoản có sẵn 10,000 ETH bằng Private Key

> **Cách nhập Private Key vào MetaMask:**  
> Bấm biểu tượng hình tròn avatar tài khoản trên MetaMask $\rightarrow$ Chọn **Add account or hardware wallet** $\rightarrow$ Chọn **Import account (Nhập tài khoản)** $\rightarrow$ Dán mã Private Key $\rightarrow$ Đổi tên ví để tránh nhầm lẫn khi demo.

#### 👑 1. Tài khoản Quản trị viên (Đổi tên thành: `Admin Council`)
* **Địa chỉ ví:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
* **Private Key:**
  ```text
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  ```
* **Quyền hạn:** Deployer hợp đồng, duyệt hồ sơ (`APPROVED`), từ chối hồ sơ (`REJECTED`), thu hồi tài sản vi phạm (`REVOKED`).

#### 🎨 2. Tài khoản Tác giả chính (Đổi tên thành: `Creator - Nguyen Van A`)
* **Địa chỉ ví:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
* **Private Key:**
  ```text
  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  ```
* **Quyền hạn:** Đăng ký tác phẩm mới, đúc NFT on-chain, sở hữu Token #1 (Sen Vàng), chuyển nhượng tác phẩm.

#### 💼 3. Tài khoản Người mua / Tác giả 2 (Đổi tên thành: `Buyer - Tran Thi B`)
* **Địa chỉ ví:** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
* **Private Key:**
  ```text
  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
  ```
* **Quyền hạn:** Người nhận quyền sở hữu tác phẩm sau giao dịch chuyển nhượng, sở hữu Token #3.

---

### Bước 3.3: Kết nối ví & Tính năng Đổi tài khoản nhanh trên Website
1. Mở trang web: `http://localhost:3000`.
2. Bấm nút màu cam **Kết nối ví** ở góc trên bên phải thanh Navbar $\rightarrow$ MetaMask hiện popup $\rightarrow$ Bấm Kết nối.
3. **Mẹo chuyển đổi giữa 3 tài khoản:**  
   Bấm chuột vào ô hiển thị ví trên góc phải web $\rightarrow$ Bấm nút màu vàng **`[ Đổi tài khoản ví ]`** $\rightarrow$ MetaMask tự động bật bảng chọn tài khoản $\rightarrow$ Chỉ cần tích chọn ví khác là website tự động cập nhật ngay lập tức!

---

## 4. THƯ MỤC TỆP DEMO KÉO THẢ (DEMO_FILES)

Các tệp demo chuẩn đã được chuẩn bị sẵn tại thư mục dự án:  
👉 **`assetchain\DEMO_FILES`**

*(Mở thư mục này trong Windows Explorer và kéo sang một góc màn hình để tiện kéo thả trực tiếp vào trình duyệt)*

| Tên tệp tin | Kéo vào trang nào? | Kết quả hiển thị trên Web |
| :--- | :--- | :--- |
| **`1_Xac_Minh_Hop_Le_Sen_Vang.png`** | Cổng **Xác minh tệp** (`/verify`) | ✅ **TÍCH XANH:** Hợp lệ chính chủ Token #1 on-chain. |
| **`2_Xac_Minh_Bi_Sua_Doi_Fake.png`** | Cổng **Xác minh tệp** (`/verify`) | ❌ **BÁO ĐỎ:** Bị sửa 1 byte $\rightarrow$ Mã băm lệch, báo tệp giả mạo / chưa đăng ký! |
| **`3_Xac_Minh_Thu_Hoi_Revoked.png`** | Cổng **Xác minh tệp** (`/verify`) | ⚠️ **CẢNH BÁO VÀNG/CAM:** Token #2 đã bị Admin thu hồi on-chain do vi phạm! |
| **`4_Dang_Ky_Moi_ArtWork_2026.png`** | Form **Đăng ký tác phẩm** (`/creator/register`) | 🟢 **TÍCH XANH:** Báo "Tác phẩm độc bản", dùng nộp hồ sơ mới từ đầu đến cuối. |
| **`5_Xac_Minh_Dang_Cho_Duyet_Cyberpunk.png`** | Cổng **Xác minh tệp** (`/verify`) | 🔵 **XANH DƯƠNG:** "Đang trong quy trình thẩm định" (hồ sơ `PENDING_APPROVAL`). |
| **`6_Xac_Minh_Bi_Tu_Choi_TranhSaoChep.png`** | Cổng **Xác minh tệp** (`/verify`) | 🔴 **BÁO ĐỎ:** "Hồ sơ bị từ chối thẩm định" kèm lý do trùng ảnh Pinterest. |
| **`7_Dang_Ky_Thu_Trung_Lap_Bao_Do.png`** | Form **Đăng ký tác phẩm** (`/creator/register`) | 🚫 **BÁO ĐỎ & KHÓA NÚT:** Demo tính năng real-time chặn nộp trùng tác phẩm đã có! |
| **`8_Dang_Ky_Tai_Lieu_Hop_Dong.pdf`** | Form **Đăng ký tác phẩm** (`/creator/register`) | 📄 **TỰ ĐỔI DANH MỤC:** Tự động chuyển category sang `DOCUMENT (Tài liệu)`. |
| **`9_Creator_Mint_NFT_Pho_Co_Ha_Noi.png`** | Dashboard **Tác phẩm của tôi** (`/creator/my-assets`) | ⚡ **MINT ON-CHAIN:** Hồ sơ đã duyệt (`APPROVED`), sẵn sàng bấm nút Mint NFT. |
| **`10_Xac_Minh_Hop_Le_TechCorp_Token3.png`** | Cổng **Xác minh tệp** (`/verify`) | ✅ **TÍCH XANH:** Hợp lệ chính chủ Token #3 on-chain (thương hiệu Designer). |

---

## 5. KỊCH BẢN DEMO TRỰC TIẾP & LỜI THOẠI CHO THẦY CÔ

### ⏱ PHẦN 1: MỞ ĐẦU (30 GIÂY)
* **Bạn nói:**
  > *"Kính thưa thầy/cô, đề tài của em là **AssetChain – Nền tảng Đăng ký & Bảo chứng Sở hữu Trí tuệ Kỹ thuật số**. Hệ thống giải quyết bài toán chống sao chép và tranh chấp bản quyền bằng cơ chế **Proof of Existence (Bằng chứng tồn tại)** kết hợp Smart Contract **ERC-721** trên máy ảo EVM. Em xin phép demo trực tiếp luồng hoạt động của hệ thống ạ."*

---

### ⏱ PHẦN 2: THỰC HÀNH KÉO THẢ XÁC MINH CÔNG KHAI 0 GAS (1 PHÚT)
*(Mở menu **Xác minh tệp** `/verify` – không cần kết nối ví)*

1. **Kéo tệp `1_Xac_Minh_Hop_Le_Sen_Vang.png` thả vào ô:**
   * **Bạn nói:** *"Khi người dùng tải tệp lên, hệ thống dùng Web Crypto API tính mã băm SHA-256 ngay trong RAM trong 0.02s và gọi hàm `view` on-chain không tốn gas. Màn hình báo **XANH**: Tác phẩm hợp lệ, đúc tại Token #1, kèm thời gian khối và chủ sở hữu."*
   * Bấm nút **"Xem chứng nhận E-Certificate"** cho thầy cô thấy file PDF có mã QR Code.

2. **Kéo tệp `2_Xac_Minh_Bi_Sua_Doi_Fake.png` thả vào ô:**
   * **Bạn nói:** *"Bức ảnh này nhìn bằng mắt thường y hệt bản gốc, nhưng em đã can thiệp sửa đổi đúng 1 byte dữ liệu. Nhờ tính chất lan truyền (Avalanche Effect) của hàm băm SHA-256, mã băm bị thay đổi hoàn toàn và hệ thống lập tức báo **ĐỎ**: Không tìm thấy dấu vân tay số này trên Blockchain."*

3. **Kéo tệp `3_Xac_Minh_Thu_Hoi_Revoked.png` thả vào ô:**
   * **Bạn nói:** *"Còn bức ảnh này là Token #2, đã bị Hội đồng Quản trị ban hành lệnh thu hồi on-chain do tranh chấp bản quyền. Hệ thống cảnh báo rõ lý do thu hồi và Smart Contract đã đóng băng vĩnh viễn, không ai có thể giao dịch token này được nữa."*

---

### ⏱ PHẦN 3: TỰ TAY NỘP HỒ SƠ & DUYỆT THẬT (2 PHÚT)

1. **Nộp hồ sơ (Ví Creator 1):**
   * Đảm bảo ví đang là **`Creator - Nguyen Van A`**.
   * Vào menu **Đăng ký** (`/creator/register`).
   * Kéo tệp **`4_Dang_Ky_Moi_ArtWork_2026.png`** vào ô Dropzone $\rightarrow$ Nhập Tiêu đề: *"Thiết Kế Đồ Họa Tương Lai 2026"* $\rightarrow$ Bấm **Nộp hồ sơ**.
   * **Bạn nói:** *"Hồ sơ được lưu vào hệ thống và chuyển sang trạng thái `PENDING_APPROVAL` (Chờ thẩm định)."*

2. **Admin phê duyệt:**
   * Bấm ô ví góc trên bên phải $\rightarrow$ Bấm **`[ Đổi tài khoản ví ]`** $\rightarrow$ Chọn ví **`Admin Council`**.
   * Vào menu **Thẩm định** (`/admin/approvals`) $\rightarrow$ Thấy hồ sơ vừa nộp $\rightarrow$ Bấm **Xem hồ sơ** $\rightarrow$ Bấm **Phê duyệt**.
   * **Bạn nói:** *"Hồ sơ được Admin phê duyệt và tự động sinh mã chứng nhận số (E-Certificate)."*

---

### ⏱ PHẦN 4: ĐÚC NFT ON-CHAIN & KÝ METAMASK (1.5 PHÚT)

1. **Đúc lên Blockchain:**
   * Bấm ô ví $\rightarrow$ Chọn **`[ Đổi tài khoản ví ]`** $\rightarrow$ Chọn lại ví **`Creator - Nguyen Van A`**.
   * Vào menu **Tác phẩm của tôi** (`/creator/my-assets`).
   * Tìm tác phẩm vừa duyệt $\rightarrow$ Bấm nút màu cam: **`Đúc NFT lên Blockchain`**.
   * Cửa sổ MetaMask bật lên $\rightarrow$ Bấm **Xác nhận (Confirm)**.
2. **Chỉ cho thầy cô xem:**
   * **Bạn nói:** *"Giao dịch gọi hàm `registerAsset` đã được thợ đào đóng gói vào Block mới trên node Hardhat. Tác phẩm đã được khắc vĩnh viễn với Token ID trên Blockchain!"*

---

### ⏱ PHẦN 5: CHUYỂN NHƯỢNG QUYỀN SỞ HỮU (1 PHÚT)
1. Vào trang **Chuyển quyền** (`/creator/transfer`).
2. Chọn tác phẩm, nhập địa chỉ ví của **`Buyer - Tran Thi B`**:  
   `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
3. Bấm **Xác nhận chuyển nhượng** $\rightarrow$ Ký MetaMask.
4. Bấm vào xem chi tiết tác phẩm $\rightarrow$ Chỉ vào mục **Lịch sử chuỗi sở hữu (Provenance)**:
   * **Bạn nói:** *"Quyền sở hữu đã chuyển sang Chị B, toàn bộ lịch sử từ ngày tạo lập đến các lần sang tên đều được lưu trữ minh bạch, không thể làm giả."*

---

### ⏱ PHẦN 6: KẾT LUẬN (30 GIÂY)
* **Bạn nói:**
  > *"Dạ thưa thầy/cô, hệ thống AssetChain đã chứng minh được tính ứng dụng thực tiễn của Blockchain trong việc bảo vệ bản quyền: Tối ưu chi phí bằng mô hình Off-chain kết hợp On-chain, xác minh 0 Gas cho cộng đồng và kiểm soát vòng đời tài sản số minh bạch. Em xin cảm ơn thầy cô đã lắng nghe ạ!"*

---

## 6. BỘ CÂU HỎI & TRẢ LỜI VẤN ĐÁP GIẢNG VIÊN (DEFENSE Q&A)

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

### Câu 5: Chuyển nhượng (Transfer) có giống Bán (Sale) không? Giá cả xử lý thế nào?
* **Trả lời:**
  > *"Hệ thống AssetChain tập trung vào bài toán cốt lõi là **Quản lý Bản quyền & Nguồn gốc (Provenance)**. Chuyển nhượng ở đây là việc **sang tên đổi chủ sở hữu** trên sổ cái Blockchain (dùng hàm `transferAsset`). Giao dịch mua bán tài chính hiện tại có thể diễn ra thông qua thỏa thuận ngoài đời. Trong tương lai, nhóm có thể tích hợp thêm một Smart Contract dạng **Marketplace Escrow** (hàm `buyAsset(tokenId) payable`) để người mua trả ETH và nhận token tự động theo cơ chế Atomic Swap."*

---

## 7. BẢNG TRA CỨU LỆNH & XỬ LÝ SỰ CỐ NHANH

| Mục đích | Câu lệnh thực thi (PowerShell) | Ghi chú |
| :--- | :--- | :--- |
| **Khởi động Blockchain Node** | `cd contracts; npx hardhat node` | Cần mở đầu tiên, giữ chạy ngầm |
| **Deploy Hợp đồng lên chuỗi** | `npx hardhat run contracts/scripts/deploy.js --network localhost` | Chạy ở Terminal 2 |
| **Nạp dữ liệu mẫu On-Chain** | `npx hardhat run contracts/scripts/seed-onchain.js --network localhost` | Tạo sẵn Token #1, #2 (revoked), #3 |
| **Khởi động ứng dụng Web** | `npm run dev` | Truy cập tại `http://localhost:3000` |
| **Chạy kiểm thử Smart Contract** | `cd contracts; npx hardhat test` | Kiểm tra 23/23 unit tests pass |

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
