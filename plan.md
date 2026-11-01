# KẾ HOẠCH HÀNH ĐỘNG 2 TUẦN - ĐỒ ÁN BLOCKCHAIN (ĐẠT ĐIỂM 10/10)

> **Đề tài:** Hệ thống đăng ký và quản lý quyền sở hữu tài sản số (**AssetChain**)  
> **Quy mô nhóm:** 2 Thành viên (**Thành viên A** & **Thành viên B**)  
> **Thời gian thực hiện:** 14 ngày (2 tuần)  
> **Phương thức đánh giá:** Giảng viên kiểm tra trực tiếp qua GitHub Repository (Commit history, Contributors graph, Code quality, PR review, Test coverage & Demo).

---

## 🎯 I. MỤC TIÊU DỰ ÁN & TIÊU CHÍ ĐẠT ĐIỂM 10/10

### 1. Luồng nghiệp vụ cốt lõi theo đề bài
1. **Đăng ký tài sản số:** Người dùng tải lên tác phẩm số (hình ảnh nghệ thuật, thiết kế đồ họa, vector, UI/UX design, ảnh chụp). Hệ thống tự động tính toán mã băm vân tay số `SHA-256` của file ngay tại máy người dùng và kiểm tra trùng lặp.
2. **Quy trình xét duyệt hồ sơ:** Hồ sơ chuyển sang trạng thái chờ duyệt (`Pending Approval`). Quản trị viên (Admin/Hội đồng thẩm định) xem xét hồ sơ, đối chiếu tính hợp lệ và phê duyệt (`Approved`) hoặc từ chối (`Rejected`).
3. **Phát hành chứng nhận & Lưu trữ Blockchain:**
   - Sau khi duyệt, hệ thống tự động sinh **Chứng nhận điện tử mô phỏng (E-Certificate)** chứa mã QR, thông tin tác giả, mã băm SHA-256, con dấu số và chữ ký điện tử.
   - Đẩy thông tin xác nhận lên Blockchain (Smart Contract ERC-721 / Proof of Existence): mint Token ID, lưu `contentHash`, `creatorAddress`, `timestamp`, `tokenURI` (chứa metadata và chứng nhận trên IPFS).
4. **Tra cứu và xác minh chứng nhận (Verification Portal):**
   - Tra cứu qua mã Token ID hoặc Quét mã QR trên chứng nhận.
   - **Tính năng độc đáo:** Kéo thả bất kỳ file ảnh/thiết kế vào trang web -> Hệ thống tự băm SHA-256 trực tiếp ở trình duyệt -> Đối chiếu ngay với Smart Contract -> Báo tình trạng thật/giả tức thì!

---

## 🏆 II. 6 YẾU TỐ "WOW" ĐỂ THUYẾT PHỤC THẦY CHO 10/10

Giảng viên chấm Git không chỉ chấm tính năng chạy được, mà chấm **tư duy kỹ thuật, độ chỉn chu và tiêu chuẩn công nghiệp**. Đây là 6 điểm nhấn đặc biệt:

| # | Yếu Tố WOW | Mô Tả Kỹ Thuật Chi Tiết | Giá Trị Thuyết Phục Thầy |
|---|------------|-------------------------|--------------------------|
| **1** | **Client-side Hash & Anti-Duplicate On-chain** | File không cần tải lên server để verify; Web Crypto API tính `SHA-256` trên browser. Smart Contract có mapping `bytes32 contentHash => bool` chống đăng ký 2 lần cho cùng 1 file. | Chứng minh hiểu bản chất "bảo vệ quyền tác giả" và tiết kiệm tài nguyên hệ thống. |
| **2** | **Dynamic E-Certificate có QR Code** | Tự động render chứng nhận bản quyền số (SVG/PDF/Canvas) có thiết kế sang trọng, chứa Watermark, Transaction Hash, Token ID và QR Code dẫn trực tiếp tới trang verify. | Trực quan, đúng yêu cầu đề bài về "chứng nhận điện tử mô phỏng". |
| **3** | **Tích hợp IPFS Phi Tập Trung** | Lưu trữ metadata chuẩn ERC-721 và file chứng nhận lên mạng IPFS thật (qua Pinata / Helia node) thay vì chỉ lưu thư mục local. | Chuẩn Web3 thực thụ, không bị "Web2 nửa mùa". |
| **4** | **100% Smart Contract Unit Test & Gas Report** | Viết từ 20-25 test cases bằng Hardhat + Chai/Ethers, đo lượng Gas tiêu thụ cho từng hàm `registerAsset`, `revokeAsset`, `transfer`. | Thầy dạy CNTT cực thích sinh viên có test tự động bài bản. |
| **5** | **GitHub Actions CI/CD Tự Động** | Cấu hình workflow `.github/workflows/ci.yml`. Mỗi khi tạo Pull Request hoặc Push code, GitHub tự động chạy test contract và linting, hiển thị badge xanh `build: passing`. | Thể hiện tác phong Software Engineering chuyên nghiệp. |
| **6** | **Trang Xác Minh "Kéo - Thả Siêu Tốc" (1-Click Verification)** | Cho phép bất kỳ ai (khách vãng lai không cần đăng nhập/kết nối ví) thả file ảnh vào -> Hiển thị chứng nhận, tác giả, thời điểm đăng ký trên chain và link explorer. | Kịch bản demo cực kỳ bùng nổ, gây ấn tượng mạnh mẽ chỉ trong 30 giây. |

---

## 👥 III. PHÂN CHIA CÔNG VIỆC CÂN BẰNG 50% - 50%

Để giảng viên nhìn vào biểu đồ GitHub Contributors thấy **2 cột đóng góp bằng chằn chặn**, phân định rõ vai trò nhưng đan xen công việc:

```
+-----------------------------------------------------------------------------------+
|                                 DỰ ÁN ASSETCHAIN                                  |
+-----------------------------------------+-----------------------------------------+
|      THÀNH VIÊN A (Backend & Web3)      |     THÀNH VIÊN B (Frontend & E-Cert)    |
|   Tỷ trọng đóng góp: ~50% (Commit: 45-55)|   Tỷ trọng đóng góp: ~50% (Commit: 45-55)|
+-----------------------------------------+-----------------------------------------+
| - Smart Contract Solidity & Unit Tests  | - Next.js App Router UI/UX & Tailwind   |
| - Hardhat Deploy, Gas Reporter, Scripts | - Web3 Provider (MetaMask + Ethers v6)  |
| - Backend NestJS Core & Prisma Postgres | - Bộ máy tạo Chứng nhận điện tử (SVG/PDF)|
| - Module Upload, Hash SHA-256 Server    | - Cổng tra cứu xác minh kéo-thả (Verify)|
| - Dịch vụ lắng nghe Sự kiện Blockchain  | - Giao diện Quản trị Xét duyệt (Admin)  |
| - Tích hợp Pinata IPFS Service          | - Setup GitHub Actions CI/CD & Tài liệu |
+-----------------------------------------+-----------------------------------------+
```

---

## 📅 IV. LỊCH TRÌNH CHI TIẾT 14 NGÀY (CÓ KẾ HOẠCH COMMIT TỪNG NGÀY)

### 📌 QUY ƯỚC COMMIT CHUẨN (Conventional Commits)
- `feat:` Thêm tính năng mới
- `fix:` Sửa lỗi
- `test:` Viết hoặc cập nhật unit/integration test
- `docs:` Viết tài liệu (README, Guide, Architecture)
- `refactor:` Tái cấu trúc code (không đổi logic)
- `chore:` Cấu hình tooling, CI/CD, dependencies

Mỗi ngày, **mỗi thành viên thực hiện từ 3 đến 5 commits chất lượng**. Tuyệt đối không dồn việc commit 1 cục vào ngày cuối!

---

### TUẦN 1: NỀN TẢNG, SMART CONTRACT, BACKEND VÀ GIAO DIỆN XÉT DUYỆT

#### 🗓️ Ngày 1: Khởi tạo Kiến trúc & Hạ tầng Workspace
*Mục tiêu: Cả 2 cùng lên GitHub tạo nền tảng, thiết lập môi trường chuẩn, không xung đột.*
- **Thành viên A (Branch: `setup/contracts-backend`):**
  - Cấu hình Hardhat (`contracts/`), TypeScript, mạng local chain `31337`.
  - Khởi tạo NestJS backend (`backend/`), cài đặt Prisma, Docker Compose (`postgres`).
  - *Commit 1:* `chore(contracts): initialize hardhat project with typescript and openzeppelin`
  - *Commit 2:* `chore(backend): scaffold nestjs api with validation pipe and cors`
  - *Commit 3:* `chore(infra): add docker-compose for postgres and adminer`
- **Thành viên B (Branch: `setup/frontend-cicd`):**
  - Khởi tạo Next.js 14/15 App Router (`frontend/`), Tailwind CSS, Lucide icons.
  - Cấu hình Base Layout, Header, Footer và Theme chuẩn Web3 Dark/Light.
  - Tạo GitHub Actions CI workflow cơ bản (`.github/workflows/ci.yml`).
  - *Commit 1:* `chore(frontend): initialize nextjs app router with tailwindcss`
  - *Commit 2:* `feat(frontend): create base responsive layout with navigation header`
  - *Commit 3:* `ci(github): setup automated lint and build workflow`
- **Hoạt động Git chung:** Tạo Pull Request #1 & #2, review chéo và merge vào `develop`.

---

#### 🗓️ Ngày 2: Smart Contract Core & Kết nối Ví MetaMask
*Mục tiêu: Hoàn thiện logic hợp đồng thông minh cốt lõi & giao diện kết nối ví.*
- **Thành viên A (Branch: `feat/smart-contract-registry`):**
  - Viết `AssetRegistry.sol` kế thừa `ERC721URIStorage`, `Ownable`, `Pausable`.
  - Định nghĩa `struct AssetRecord { bytes32 contentHash; address creator; uint256 registeredAt; bool isApproved; }`.
  - Hàm `registerAsset(address to, bytes32 contentHash, string tokenURI)`.
  - *Commit 1:* `feat(contracts): implement AssetRegistry ERC-721 base structure`
  - *Commit 2:* `feat(contracts): add hash uniqueness check and registration events`
  - *Commit 3:* `feat(contracts): add admin approval status flag and revoke logic`
- **Thành viên B (Branch: `feat/wallet-connection`):**
  - Xây dựng component `WalletConnectButton` hỗ trợ MetaMask qua `ethers.js v6`.
  - Quản lý trạng thái ví (Address, Chain ID, Switch Network tự động sang Hardhat local).
  - Viết hook `useWeb3` tái sử dụng trong toàn bộ ứng dụng.
  - *Commit 1:* `feat(frontend): implement useWeb3 custom hook for metamask provider`
  - *Commit 2:* `feat(frontend): build wallet connection modal and network badge`
  - *Commit 3:* `feat(frontend): handle network switching and account change events`
- **Hoạt động Git chung:** B test contract compilation của A; A test UI kết nối ví của B.

---

#### 🗓️ Ngày 3: 100% Contract Unit Tests & Form Đăng Ký Tài Sản
*Mục tiêu: Đạt chỉ số test contract hoàn hảo & giao diện người dùng tải tác phẩm.*
- **Thành viên A (Branch: `test/contract-test-suite`):**
  - Viết bộ unit test `AssetRegistry.test.ts` (kiểm tra 15+ trường hợp: mint thành công, trùng hash bị revert, kiểm tra quyền owner, event emission).
  - Thiết lập Hardhat Gas Reporter để đo gas.
  - Viết deployment script `scripts/deploy.ts` tự động lưu ABI và địa chỉ ra file JSON.
  - *Commit 1:* `test(contracts): add comprehensive unit tests for asset registration`
  - *Commit 2:* `test(contracts): assert revert on duplicate sha256 content hash`
  - *Commit 3:* `chore(contracts): configure hardhat gas reporter and deployment script`
- **Thành viên B (Branch: `feat/asset-registration-form`):**
  - Xây dựng trang `/register` cho phép chọn loại tài sản (Hình ảnh, Bản vẽ, UI Design).
  - Tích hợp kéo thả file (Drag and Drop File Dropzone) có preview ảnh.
  - Tích hợp Web Crypto API tính toán ngay mã băm `SHA-256` trên trình duyệt và hiển thị trực tiếp cho user thấy.
  - *Commit 1:* `feat(frontend): create drag-and-drop file upload component with preview`
  - *Commit 2:* `feat(frontend): calculate sha256 client-side using browser web crypto api`
  - *Commit 3:* `feat(frontend): build asset metadata input fields with zod validation`
- **Hoạt động Git chung:** Review PR chéo, merge vào `develop`.

---

#### 🗓️ Ngày 4: Backend Database, Upload Pipeline & Lưu Off-Chain
*Mục tiêu: Lưu trữ metadata tác phẩm off-chain an toàn và kiểm tra tính toàn vẹn.*
- **Thành viên A (Branch: `feat/backend-asset-module`):**
  - Thiết lập Prisma Schema: `User`, `Asset`, `AssetApprovalHistory`, `BlockchainTx`.
  - Viết API `POST /api/v1/assets/upload` (Multer lưu file cục bộ/cloud, băm SHA-256 server để đối chiếu).
  - Viết API `GET /api/v1/assets` có phân trang, lọc theo trạng thái (`PENDING`, `APPROVED`).
  - *Commit 1:* `feat(backend): setup prisma models for assets and approval workflows`
  - *Commit 2:* `feat(backend): implement multipart upload and server-side hash verification`
  - *Commit 3:* `feat(backend): add assets crud service and filter endpoints`
- **Thành viên B (Branch: `feat/frontend-upload-integration`):**
  - Nối Form đăng ký của Frontend với API Upload của Backend.
  - Hiển thị thanh tiến trình tải file (Upload Progress Bar), thông báo trạng thái Toast (Thành công/Chờ duyệt).
  - Trang chi tiết tài sản đã gửi `/assets/[id]` hiển thị nhãn: "Đang chờ Hội đồng thẩm định xét duyệt".
  - *Commit 1:* `feat(frontend): integrate asset submission form with backend upload api`
  - *Commit 2:* `feat(frontend): create asset pending review status view`
  - *Commit 3:* `feat(frontend): add loading skeletons and optimistic status updates`
- **Hoạt động Git chung:** Test tích hợp luồng: User upload -> Backend lưu DB với status `PENDING`.

---

#### 🗓️ Ngày 5: Hệ Thống Xét Duyệt Hồ Sơ (Admin Approval Flow) - CỐT LÕI ĐỀ BÀI
*Mục tiêu: Xây dựng quy trình thẩm định hồ sơ trước khi đưa lên Blockchain.*
- **Thành viên A (Branch: `feat/admin-approval-api`):**
  - Viết cơ chế xác thực Admin (Role-based Guard trong NestJS).
  - API `POST /api/v1/admin/assets/:id/review`: Cập nhật trạng thái `APPROVED` hoặc `REJECTED`, kèm lý do thẩm định.
  - Chuẩn bị dữ liệu để sẵn sàng ghi lên Blockchain sau khi duyệt.
  - *Commit 1:* `feat(backend): implement role-based access control for admin review`
  - *Commit 2:* `feat(backend): build asset approval and rejection endpoints with notes`
  - *Commit 3:* `test(backend): add unit tests for admin asset review logic`
- **Thành viên B (Branch: `feat/admin-review-portal`):**
  - Xây dựng giao diện Admin Dashboard tại `/admin/reviews`.
  - Bảng danh sách hồ sơ cần duyệt, nút xem chi tiết tác phẩm (kèm ảnh gốc, tác giả, mã băm SHA-256).
  - Modal "Phê Duyệt Hồ Sơ" & Modal "Từ Chối" (nhập lý do từ chối).
  - *Commit 1:* `feat(frontend): create admin dossier review dashboard layout`
  - *Commit 2:* `feat(frontend): implement approve and reject action modals with notes`
  - *Commit 3:* `feat(frontend): display digital asset inspection lightbox for admin`
- **Hoạt động Git chung:** Test luồng nghiệp vụ: Admin phê duyệt hồ sơ -> Chuyển trạng thái sẵn sàng mint lên Blockchain.

---

#### 🗓️ Ngày 6: Tích Hợp Minting Lên Blockchain Sau Khi Phê Duyệt
*Mục tiêu: Ghi dữ liệu đã duyệt lên Smart Contract và lưu trữ bằng chứng.*
- **Thành viên A (Branch: `feat/blockchain-minting-engine`):**
  - Xây dựng module `BlockchainService`: Gọi Smart Contract từ server (Admin Relayer) hoặc trả Transaction Request để Admin ký bằng ví MetaMask.
  - Lưu lại `transactionHash`, `blockNumber`, `tokenId` vào PostgreSQL.
  - Lắng nghe event `AssetRegistered` on-chain để đồng bộ trạng thái tự động.
  - *Commit 1:* `feat(backend): integrate ethers contract runner for asset registration`
  - *Commit 2:* `feat(backend): persist transaction receipt block details and tokenId`
  - *Commit 3:* `feat(backend): create event listener for asset registered contract events`
- **Thành viên B (Branch: `feat/onchain-mint-ui`):**
  - Giao diện Admin: Sau khi nhấn Phê duyệt -> Hiện popup nhắc xác nhận giao dịch ghi lên Blockchain.
  - Hiển thị Transaction Hash kèm link xem trực tiếp (Etherscan hoặc Local Explorer).
  - Hiệu ứng pháo hoa/huy hiệu "Đã được bảo hộ trên Blockchain EVM".
  - *Commit 1:* `feat(frontend): integrate metamask contract write call for approval minting`
  - *Commit 2:* `feat(frontend): add transaction broadcasting progress with block confirm wait`
  - *Commit 3:* `feat(frontend): render on-chain registration success modal with tx hash`
- **Hoạt động Git chung:** Cả 2 cùng demo luồng: Upload -> Admin Review -> Ký Smart Contract -> Lưu on-chain thành công.

---

#### 🗓️ Ngày 7: Tổng Kết Tuần 1, Tích Hợp E2E & Code Review
*Mục tiêu: Đảm bảo toàn bộ luồng Tuần 1 ổn định, test không lỗi, commit của 2 bạn đồng đều.*
- **Thành viên A:**
  - Viết API E2E test cho luồng đăng ký và duyệt hồ sơ (`test/assets-flow.e2e-spec.ts`).
  - Viết tài liệu API cập nhật vào Swagger (`/api/docs`).
  - *Commit 1:* `test(backend): add end-to-end integration test for full asset registration flow`
  - *Commit 2:* `docs(api): update swagger openapi documentation for asset review endpoints`
- **Thành viên B:**
  - Hoàn thiện trang Dashboard cá nhân `/my-assets`: hiển thị danh sách các tài sản đã đăng ký của user kèm trạng thái (Chờ duyệt, Đã cấp chứng nhận).
  - Tối ưu UI/UX, thêm thông báo lỗi thân thiện khi user từ chối giao dịch MetaMask.
  - *Commit 1:* `feat(frontend): build user personal asset management dashboard`
  - *Commit 2:* `fix(frontend): improve web3 error handling for rejected transactions`
- **Hoạt động Git chung:** Cùng ngồi review code, merge toàn bộ vào nhánh `main` (gắn tag `v0.5.0-milestone1`).

---

### TUẦN 2: CHỨNG NHẬN ĐIỆN TỬ, IPFS, CỔNG XÁC MINH "WOW", CI/CD VÀ HOÀN THIỆN 10/10

#### 🗓️ Ngày 8: Bộ Máy Sinh Chứng Nhận Điện Tử (E-Certificate Engine) - YẾU TỐ WOW #2
*Mục tiêu: Tự động tạo bản chứng nhận số mô phỏng đẹp mắt, có con dấu, mã QR và chữ ký số.*
- **Thành viên A (Branch: `feat/cert-crypto-signature`):**
  - Viết hàm ký số mật mã (ECDSA/HMAC signature) cho chứng nhận bằng khóa của hệ thống: chứng minh chứng nhận được cấp bởi đúng nền tảng.
  - Viết API `GET /api/v1/assets/:id/certificate`: Trả về dữ liệu chứng nhận bảo mật.
  - *Commit 1:* `feat(backend): implement cryptographic signature generation for certificate data`
  - *Commit 2:* `feat(backend): build certificate verification payload endpoint`
  - *Commit 3:* `test(backend): unit test certificate signature integrity verification`
- **Thành viên B (Branch: `feat/certificate-visual-renderer`):**
  - Xây dựng component `DigitalCertificateView`: Thiết kế khung chứng chỉ sang trọng (Gold border, con dấu số Blockchain, vân bảo mật, chữ ký đại diện).
  - Tích hợp thư viện sinh QR Code trỏ thẳng tới URL xác thực: `https://.../verify?tokenId=123`.
  - Hỗ trợ xuất chứng nhận ra ảnh PNG hoặc PDF chất lượng cao (sử dụng `html2canvas` hoặc `@react-pdf/renderer`).
  - *Commit 1:* `feat(frontend): design responsive digital certificate template with security watermark`
  - *Commit 2:* `feat(frontend): embed dynamic qr code linked to verification page`
  - *Commit 3:* `feat(frontend): implement certificate download as high-res pdf and png`
- **Hoạt động Git chung:** Review PR, kiểm tra việc quét mã QR trên điện thoại thật xem có nhảy vào đúng trang tra cứu không.

---

#### 🗓️ Ngày 9: Tích Hợp IPFS Phi Tập Trung Thực Sự - YẾU TỐ WOW #3
*Mục tiêu: Đưa metadata và chứng nhận lên mạng lưu trữ phi tập trung IPFS.*
- **Thành viên A (Branch: `feat/ipfs-pinata-storage`):**
  - Cấu hình tích hợp Pinata SDK / Helia IPFS client.
  - Đẩy file ảnh tác phẩm và metadata JSON lên IPFS, lấy về mã CID (`ipfs://...`).
  - Cập nhật Smart Contract để `tokenURI` trỏ thẳng tới IPFS CID.
  - *Commit 1:* `feat(backend): implement ipfs pinning service via pinata sdk`
  - *Commit 2:* `feat(backend): generate decentralized erc721 metadata json to ipfs`
  - *Commit 3:* `feat(contracts): update minting script to store canonical ipfs tokenURI`
- **Thành viên B (Branch: `feat/ipfs-gateway-viewer`):**
  - Viết utility phân giải link `ipfs://` sang HTTP gateway công cộng (Pinata gateway, Cloudflare IPFS).
  - Thêm nút "Xem Metadata trên IPFS" và "Xem trên IPFS Gateway" tại trang chi tiết tài sản.
  - *Commit 1:* `feat(frontend): add ipfs uri resolver and public gateway fallback utility`
  - *Commit 2:* `feat(frontend): display ipfs cid badges and raw metadata inspector`
  - *Commit 3:* `fix(frontend): handle ipfs image loading latency with fallback placeholders`
- **Hoạt động Git chung:** Kiểm tra xem tokenURI trên smart contract có mở được thật qua IPFS không.

---

#### 🗓️ Ngày 10: Cổng Tra Cứu & Xác Minh Kéo-Thả (Verification Portal) - YẾU TỐ WOW #1 & #6
*Mục tiêu: Tính năng "sát thủ" gây ấn tượng mạnh nhất khi trình bày cho thầy.*
- **Thành viên A (Branch: `feat/public-verification-api`):**
  - Viết API tra cứu công khai không cần auth: `GET /api/v1/verify/hash/:hash` và `GET /api/v1/verify/token/:id`.
  - Trực tiếp gọi hàm `getAssetByHash` trên Smart Contract để kiểm tra tính toàn vẹn on-chain.
  - So sánh hash trong DB và hash on-chain, trả về kết quả đối chiếu tính toàn vẹn.
  - *Commit 1:* `feat(backend): build public on-chain verification query service`
  - *Commit 2:* `feat(backend): implement cryptographic proof comparison against smart contract`
  - *Commit 3:* `test(backend): add integration tests for valid and tampered hash lookups`
- **Thành viên B (Branch: `feat/instant-drag-drop-verify-ui`):**
  - Xây dựng trang công khai `/verify`:
    - Ô tra cứu bằng Token ID / Transaction Hash / Tên tác phẩm.
    - **Hộp kéo-thả file ma thuật:** Thả ảnh bất kỳ vào -> Trình duyệt tự tính `SHA-256` -> Bắn truy vấn kiểm tra.
    - Nếu đúng: Hiển thị ngay huy hiệu xanh lá "✅ Tác phẩm chính chủ đã được xác thực trên Blockchain", hiển thị Chứng nhận số, Ngày đăng ký, Tác giả.
    - Nếu file bị chỉnh sửa (dù chỉ 1 pixel): Báo đỏ "❌ File này chưa từng được đăng ký bản quyền hoặc đã bị chỉnh sửa!".
  - *Commit 1:* `feat(frontend): construct public verification portal page`
  - *Commit 2:* `feat(frontend): implement instant drag-and-drop hash checker with zero-upload`
  - *Commit 3:* `feat(frontend): render verification result certificate badge and chain proof details`
- **Hoạt động Git chung:** Cực kỳ hào hứng cùng test: Lấy ảnh gốc thả vào -> Báo xanh. Mở Paint chấm 1 dấu đen vào ảnh rồi thả vào -> Báo đỏ ngay lập tức!

---

#### 🗓️ Ngày 11: Chuyển Nhượng Quyền Sở Hữu & Lịch Sử Nguồn Gốc (Provenance)
*Mục tiêu: Đầy đủ tính năng quản lý quyền sở hữu số theo đúng tên đề tài.*
- **Thành viên A (Branch: `feat/ownership-transfer-backend`):**
  - Viết logic ghi nhận lịch sử chuyển nhượng (`OwnershipHistory`).
  - Lắng nghe event `Transfer` của ERC-721 trên Blockchain để tự động cập nhật chủ sở hữu mới trong PostgreSQL.
  - *Commit 1:* `feat(backend): implement asset ownership transfer tracking service`
  - *Commit 2:* `feat(backend): sync erc721 transfer events to off-chain ownership history`
  - *Commit 3:* `test(backend): unit test ownership history timeline generation`
- **Thành viên B (Branch: `feat/provenance-timeline-ui`):**
  - Tạo giao diện Transfer Ownership: Chủ sở hữu nhập địa chỉ ví người nhận mới -> Ký giao dịch MetaMask `safeTransferFrom`.
  - Component `ProvenanceTimeline`: Hiển thị dòng thời gian minh bạch: Người tạo ban đầu -> Ngày phê duyệt -> Các lần chuyển quyền sở hữu (kèm mã giao dịch TxHash).
  - *Commit 1:* `feat(frontend): implement transfer ownership action modal with web3 confirmation`
  - *Commit 2:* `feat(frontend): build interactive provenance history timeline component`
  - *Commit 3:* `feat(frontend): update certificate display to reflect current legal owner`
- **Hoạt động Git chung:** Review PR, thử chuyển quyền sở hữu giữa 2 tài khoản MetaMask và đối chiếu lịch sử.

---

#### 🗓️ Ngày 12: CI/CD GitHub Actions Hoàn Chỉnh & Test Coverage - YẾU TỐ WOW #4 & #5
*Mục tiêu: Biến repository thành đồ án chuẩn Enterprise với huy hiệu xanh mướt.*
- **Thành viên A (Branch: `ci/contract-and-backend-tests`):**
  - Hoàn thiện test suite: Đạt trên 90% test coverage cho Smart Contract và Backend.
  - Thêm script chạy test và xuất báo cáo coverage: `npm run test:cov`.
  - *Commit 1:* `test(contracts): achieve comprehensive edge-case test coverage for registry`
  - *Commit 2:* `test(backend): complete integration tests for auth and verification modules`
  - *Commit 3:* `chore(scripts): add automated local test and coverage reporting scripts`
- **Thành viên B (Branch: `ci/github-actions-pipeline`):**
  - Hoàn thiện file GitHub Action `.github/workflows/main.yml`:
    - Tự động chạy lint code (Frontend & Backend).
    - Tự động chạy Hardhat contract test.
    - Tự động chạy Backend NestJS test.
    - Tự động build Next.js.
  - Thêm các Badges đẹp mắt vào đầu file `README.md` (CI Status, Solidity Version, Next.js, License MIT).
  - *Commit 1:* `ci(github): configure full pipeline for contracts compilation and tests`
  - *Commit 2:* `ci(github): add frontend build verification step in pull requests`
  - *Commit 3:* `docs(readme): add dynamic ci status and tech stack badges`
- **Hoạt động Git chung:** Tạo PR để kích hoạt GitHub Actions chạy thật -> Tận hưởng cảm giác tích xanh `All checks have passed`!

---

#### 🗓️ Ngày 13: Tạo Dữ Liệu Mẫu (Seed Data), Kịch Bản Demo & Tài Liệu Chuẩn Quốc Tế
*Mục tiêu: Thầy mở repo lên là thấy chuyên nghiệp, chạy 1 lệnh là có ngay 10 tác phẩm mẫu để chấm.*
- **Thành viên A (Branch: `feat/seed-data-and-deploy-docs`):**
  - Viết kịch bản seed tự động (`scripts/seed-showcase.ts`):
    - Tự động tạo sẵn 1 tài khoản Admin, 2 tài khoản Tác giả mẫu.
    - Tự động mint sẵn 5 tác phẩm số mẫu (Ảnh nghệ thuật, Logo, Thiết kế giao diện) đã được duyệt và ghi lên chain.
    - 2 tác phẩm đang ở trạng thái `Pending Approval` để thầy bấm nút duyệt thử!
  - Cập nhật hướng dẫn cài đặt `RUNBOOK.md` chỉ với Docker Compose.
  - *Commit 1:* `feat(backend): create comprehensive database and blockchain demo seed script`
  - *Commit 2:* `docs(setup): write step-by-step local execution runbook with docker`
  - *Commit 3:* `chore(docker): refine compose configuration for one-command startup`
- **Thành viên B (Branch: `docs/readme-and-presentation`):**
  - Làm mới toàn bộ `README.md`: Thêm ảnh chụp màn hình các trang (Dashboard, Certificate, Verification), sơ đồ kiến trúc Mermaid sinh động.
  - Viết tài liệu `DEMO_SCRIPT.md`: Kịch bản thuyết trình 5 phút từng bước cho buổi chấm điểm.
  - Xuất file Slide tóm tắt đồ án dạng Markdown/PDF.
  - *Commit 1:* `docs(readme): update comprehensive documentation with ui screenshots and diagrams`
  - *Commit 2:* `docs(presentation): add step-by-step 5-minute evaluation demo script`
  - *Commit 3:* `docs(architecture): clarify legal-technical boundary and erc721 data flow`
- **Hoạt động Git chung:** Cả 2 cùng clone repo ra thư mục mới, chạy theo đúng hướng dẫn xem có chạy mượt mà từ con số 0 hay không.

---

#### 🗓️ Ngày 14: Kiểm Tra Chéo Git Insight, Rehearsal Demo & Đóng Release v1.0.0
*Mục tiêu: Đạt tỷ lệ đóng góp 50/50 hoàn hảo trên GitHub và sẵn sàng nhận điểm 10.*
- **Thành viên A & Thành viên B cùng làm:**
  1. **Kiểm tra GitHub Insights -> Contributors:**
     - Xem số commit của Bạn A (ước tính: 48 - 52 commits).
     - Xem số commit của Bạn B (ước tính: 48 - 52 commits).
     - Xem biểu đồ đóng góp theo tuần: Cả 2 đều có dải xanh đều đặn trong 14 ngày.
  2. **Kiểm tra Pull Requests:**
     - Tối thiểu 10 - 14 Pull Requests được mở và merge vào `develop`/`main`.
     - Mỗi PR đều có comment review qua lại giữa 2 bạn (VD: *"Đã kiểm tra code chạy tốt, logic hash chặt chẽ, approve!"*).
  3. **Tạo Release chính thức trên GitHub:**
     - Tạo Git Tag: `git tag -a v1.0.0 -m "Release v1.0.0 - Full Digital Asset Ownership System"`.
     - Push tag lên GitHub và tạo Release với Release Notes đầy đủ tính năng.
  4. **Tập dượt demo (Dry Run):**
     - Thực hiện đúng theo kịch bản 5 phút trong `DEMO_SCRIPT.md`.
  - *Commit kết thúc của A:* `chore(release): bump version to v1.0.0 and finalize production configs`
  - *Commit kết thúc của B:* `docs(changelog): write release notes and final verification checklist`

---

## 📊 V. CHIẾN LƯỢC QUẢN LÝ GIT ĐỂ ĐẠT ĐIỂM ĐÓNG GÓP TUYỆT ĐỐI (50% - 50%)

Giảng viên CNTT khi chấm đồ án nhóm qua Git thường dùng 3 công cụ trên GitHub:
1. **Insights -> Contributors:** Xem tỷ lệ commit và số dòng code của từng người.
2. **Network Graph:** Xem cách nhóm rẽ nhánh, merge và phối hợp.
3. **Pull Requests tab:** Xem tinh thần làm việc nhóm và code review.

### 1. Quy tắc phân nhánh (Branching Strategy)
- Nhánh `main`: Mã nguồn ổn định nhất, chỉ merge khi tính năng đã hoàn thiện và test pass.
- Nhánh `develop`: Nhánh tích hợp chính trong suốt 2 tuần.
- Nhánh tính năng: Đặt tên theo chuẩn `feat/<tên-tính-năng>`, `test/<tên-module>`, `docs/<nội-dung>`.

### 2. Ma trận Pull Request & Review chéo (Bắt buộc)
| PR Số | Nhánh Tính Năng | Người Tạo (Author) | Người Review & Approve | Nội Dung Chính |
|:-----:|-----------------|:------------------:|:---------------------:|----------------|
| **PR #1** | `setup/contracts-backend` | **Thành viên A** | **Thành viên B** | Khởi tạo Hardhat & NestJS |
| **PR #2** | `setup/frontend-cicd` | **Thành viên B** | **Thành viên A** | Khởi tạo Next.js & CI GitHub |
| **PR #3** | `feat/smart-contract-registry` | **Thành viên A** | **Thành viên B** | Smart Contract ERC-721 Core |
| **PR #4** | `feat/wallet-connection` | **Thành viên B** | **Thành viên A** | Hook kết nối MetaMask |
| **PR #5** | `test/contract-test-suite` | **Thành viên A** | **Thành viên B** | 20+ Unit tests cho Contract |
| **PR #6** | `feat/asset-registration-form` | **Thành viên B** | **Thành viên A** | Form đăng ký & Hash client |
| **PR #7** | `feat/admin-approval-api` | **Thành viên A** | **Thành viên B** | Backend duyệt hồ sơ tài sản |
| **PR #8** | `feat/admin-review-portal` | **Thành viên B** | **Thành viên A** | Giao diện Admin duyệt hồ sơ |
| **PR #9** | `feat/cert-crypto-signature` | **Thành viên A** | **Thành viên B** | Chữ ký số cho chứng nhận |
| **PR #10**| `feat/certificate-visual-renderer`| **Thành viên B** | **Thành viên A** | Render chứng nhận số & QR code |
| **PR #11**| `feat/ipfs-pinata-storage` | **Thành viên A** | **Thành viên B** | Tích hợp lưu trữ IPFS Pinata |
| **PR #12**| `feat/instant-drag-drop-verify-ui`| **Thành viên B** | **Thành viên A** | Trang tra cứu kéo-thả tức thì |
| **PR #13**| `feat/blockchain-minting-engine` | **Thành viên A** | **Thành viên B** | Đồng bộ Event Blockchain |
| **PR #14**| `ci/github-actions-pipeline` | **Thành viên B** | **Thành viên A** | Pipeline CI/CD tự động |

> [!TIP]
> **Cách comment review để thầy chấm điểm cao:**  
> Trong mỗi PR, người review không chỉ bấm Merge đơn thuần mà hãy để lại 1-2 comment chuyên môn:  
> *Ví dụ:* *"Mình đã review logic hàm `registerAsset`, mapping `bytes32 contentHash` chống trùng lặp rất tốt. Đã test trên local pass 15 test cases. Approved!"* -> Thầy đọc sẽ thấy nhóm làm việc cực kỳ nghiêm túc!

---

## 🎬 VI. KỊCH BẢN DEMO 5 PHÚT HẠ GỤC MỌI CÂU HỎI CỦA THẦY

Khi thầy gọi lên chấm điểm, hãy trình bày đúng 5 phút theo kịch bản này:

1. **Phút 1: Đặt vấn đề & Kiến trúc (Thành viên A trình bày)**
   - *"Thưa thầy, hệ thống AssetChain giải quyết bài toán chứng minh quyền tác giả ban đầu và tính toàn vẹn cho tài sản số. Blockchain lưu trữ dấu vân tay SHA-256 không thể tẩy xóa, còn Web2 lưu trữ metadata."*
   - Mở file `README.md` chỉ vào sơ đồ kiến trúc và các badge GitHub Actions xanh mướt.
2. **Phút 2: Luồng Đăng ký & Tính Hash tại Trình duyệt (Thành viên B trình bày)**
   - Mở màn hình Đăng ký, kéo 1 tác phẩm thiết kế vào.
   - Chỉ cho thầy thấy: Mã SHA-256 được tính ngay lập tức tại máy người dùng mà chưa cần gửi file lên mạng.
   - Nhấn gửi hồ sơ -> Trạng thái chuyển sang `Pending Approval`.
3. **Phút 3: Xét Duyệt Hồ Sơ & Đẩy Lên Blockchain (Thành viên A trình bày)**
   - Đăng nhập tài khoản Admin vào trang `/admin/reviews`.
   - Xem xét hồ sơ, bấm nút **Phê Duyệt**.
   - MetaMask bật lên, ký giao dịch ghi dữ liệu lên Smart Contract `AssetRegistry.sol`.
   - Chỉ cho thầy xem Transaction Hash và Event được phát ra trên mạng EVM.
4. **Phút 4: Sinh Chứng Nhận Điện Tử & Xuất QR Code (Thành viên B trình bày)**
   - Mở trang chi tiết tác phẩm: Chứng nhận số sang trọng xuất hiện với đầy đủ con dấu điện tử, mã Token ID, thời gian khắc trên chuỗi và mã QR.
   - Bấm nút **Tải chứng nhận (PDF/PNG)**.
5. **Phút 5: Tiết mục "WOW" - Kéo thả xác thực tính toàn vẹn (Thành viên A & B cùng demo)**
   - Mở trang tra cứu công khai `/verify`.
   - Kéo file ảnh gốc thả vào -> Hệ thống báo xanh ngay lập tức: *"Tác phẩm chính chủ của tác giả Nguyễn Văn A, đăng ký lúc 14:30 ngày 01/11/2026 trên Blockchain"*.
   - Mở phần mềm chỉnh sửa ảnh, thêm đúng 1 nét vẽ nhỏ vào ảnh rồi lưu lại. Kéo file vừa chỉnh sửa thả vào -> Hệ thống báo đỏ ngay: *"Cảnh báo: Dữ liệu chưa từng được đăng ký hoặc đã bị chỉnh sửa trái phép!"*.
   - Cho thầy quét mã QR trên điện thoại để kiểm tra trực tiếp.

---

## 📋 VII. CHECKLIST TRƯỚC NGÀY NỘP BÀI

- [ ] Đã kiểm tra `.gitignore`: Không bị lọt `node_modules`, `.env`, private key thật.
- [ ] Tỷ lệ commit của 2 người trên GitHub Contributors xấp xỉ 50% - 50%.
- [ ] Tất cả PR đều đã được review và merge vào `main`.
- [ ] GitHub Actions CI badge báo `passing` (màu xanh lá).
- [ ] Smart Contract có trên 20 unit tests chạy `PASS`.
- [ ] Chạy lệnh `docker-compose up` khởi động mượt mà không lỗi.
- [ ] Đã có sẵn 10 tác phẩm mẫu (seed data) phục vụ chấm thi.
- [ ] Đã chuẩn bị sẵn 1 ảnh gốc và 1 ảnh đã sửa 1 pixel để chuẩn bị cho màn demo "kéo-thả".

---
*Chúc hai bạn hoàn thành xuất sắc đồ án và đạt trọn vẹn điểm 10/10 môn Blockchain!*

