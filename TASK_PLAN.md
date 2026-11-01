# AssetChain - KẾ HOẠCH HÀNH ĐỘNG VÀ DANH MỤC CÔNG VIỆC 14 NGÀY

## 🎯 Mục Tiêu Dự Án

Xây dựng hệ thống đăng ký, xét duyệt, phát hành chứng nhận và xác minh quyền sở hữu tài sản số bằng công nghệ **Blockchain EVM cục bộ** kết hợp **Next.js Fullstack (App Router + Route Handlers + SQLite + Prisma ORM)**.

- **Quy mô:** Nhóm 2 thành viên (**Thành viên A** & **Thành viên B**).
- **Thời gian thực hiện:** 14 ngày (2 tuần).
- **Môi trường vận hành:** 100% Cục bộ (Localhost), loại bỏ hoàn toàn Docker/PostgreSQL/NestJS cồng kềnh, sẵn sàng demo trực tiếp mượt mà.

---

## 📅 Lộ Trình Triển Khai 14 Ngày Chi Tiết

```
[Tuần 1: Ngày 1 - 7]
D1: Khởi tạo Project Next.js, Prisma SQLite, Hardhat
D2: Hoàn thiện Smart Contract AssetRegistry.sol & Unit Test
D3: Deploy Contract local, tích hợp Web3 Provider & Mốc M1
D4: [A] Upload & Client SHA-256 | [B] Giao diện Admin Review
D5: [A] API Đăng ký & SQLite   | [B] API Duyệt/Từ chối hồ sơ
D6: [A] Giao dịch Mint on-chain| [B] Bộ sinh E-Certificate PDF & QR
D7: [A] Đồng bộ On-Chain       | [B] Cổng Tra Cứu & Xác Minh /verify
============================================================
[Tuần 2: Ngày 8 - 14]
D8: MỐC M2: Tích hợp chéo end-to-end lần 1
D9: [A] Dashboard & My Assets  | [B] Drag-and-Drop Instant Verify
D10: [A] Chuyển nhượng (Transfer)| [B] Trang chủ & Explore Gallery (Mốc M3)
D11: [A] Provenance Timeline   | [B] Thu hồi bản quyền (Revoke) & Watermark
D12: MỐC M4: Kiểm thử chịu lỗi, mạng gián đoạn, từ chối ví
D13: Chuẩn hóa dữ liệu Demo, 1-Click Reset Script, diễn tập thuyết trình
D14: BẢO VỆ ĐỒ ÁN / DEMO TRỰC TIẾP
```

---

## 📋 Danh Mục Công Việc Chi Tiết Theo Ngày (Day-by-Day Checklist)

### NGÀY 1: Khởi Tạo Dự Án & Cấu Hình Dùng Chung
- [ ] **Task 1.1 (Thành viên A):** Khởi tạo repository Next.js 14/15 TypeScript với Tailwind CSS.
- [ ] **Task 1.2 (Thành viên A):** Cài đặt Prisma ORM, cấu hình SQLite (`DATABASE_URL="file:./dev.db"`), tạo schema cơ bản (`User`, `Asset`, `OwnershipHistory`, `Certificate`).
- [ ] **Task 1.3 (Thành viên A):** Khởi tạo cấu trúc Hardhat trong thư mục `contracts/`, cài đặt `@openzeppelin/contracts` và `ethers`.
- [ ] **Task 1.4 (Thành viên B):** Xây dựng Layout tổng thể (`Navbar`, `Footer`, `ThemeContainer`).
- [ ] **Task 1.5 (Thành viên B):** Viết module tiện ích băm `SHA-256` phía client sử dụng `window.crypto.subtle.digest`.
- **Đầu ra Ngày 1:** Project Next.js chạy được trên cả 2 máy (`npm run dev`), kết nối được SQLite qua Prisma Studio (`npx prisma studio`).

---

### NGÀY 2: Smart Contract Lõi & Thư Viện Chứng Nhận
- [ ] **Task 2.1 (Thành viên A):** Viết hợp đồng `AssetRegistry.sol` (kế thừa `ERC721URIStorage`, `Ownable`, `Pausable`, struct `AssetRecord`, mapping `hashToTokenId`, `isHashRegistered`).
- [ ] **Task 2.2 (Thành viên A):** Viết bộ Unit Test toàn diện (15-20 test cases: mint, trùng lặp hash, transfer, revoke, quyền admin).
- [ ] **Task 2.3 (Thành viên B):** Tích hợp thư viện `jspdf` và `qrcode` vào Next.js.
- [ ] **Task 2.4 (Thành viên B):** Tạo bản vẽ mẫu E-Certificate dạng component/canvas có logo, viền hoa văn, con dấu số và mã QR.
- **Đầu ra Ngày 2:** Chạy test smart contract đạt 100% pass (`npx hardhat test`); Component E-Certificate xuất được bản PDF mẫu đầu tiên.

---

### NGÀY 3: Deploy Local Node & Mốc Tích Hợp M1
- [ ] **Task 3.1 (Thành viên A):** Viết script deploy contract lên Hardhat local node (`scripts/deploy.js`), tự động xuất file ABI và địa chỉ contract vào `src/contracts/AssetRegistry.json`.
- [ ] **Task 3.2 (Thành viên A):** Viết helper `getContractInstance(signerOrProvider)` hỗ trợ cả client component và server handler.
- [ ] **Task 3.3 (Thành viên B):** Xây dựng component `WalletConnectButton` kết nối MetaMask, chuyển mạng Hardhat Chain ID `31337`, hiển thị địa chỉ ví rút gọn và số dư test ETH.
- [ ] **Task 3.4 (Cả hai):** Thống nhất API contract ABI giữa 2 người.
- **Đầu ra Ngày 3 (Mốc M1):** Kết nối thành công MetaMask tới Hardhat node local; đọc được thông tin contract từ trình duyệt.

---

### NGÀY 4: Đăng Ký Tài Sản (Slice A) & Giao Diện Quản Trị (Slice B)
- [ ] **Task 4.1 (Thành viên A):** Xây dựng giao diện Form Đăng ký tài sản (`/creator/register`): kéo thả file, tự động hiển thị mã SHA-256 ngay khi chọn file.
- [ ] **Task 4.2 (Thành viên A):** Tạo API upload file `POST /api/assets`, lưu file nhị phân vào thư mục `public/uploads/`.
- [ ] **Task 4.3 (Thành viên B):** Xây dựng giao diện Cổng xét duyệt Admin (`/admin/approvals`): bảng danh sách các tài sản đang chờ duyệt (`PENDING_APPROVAL`).
- [ ] **Task 4.4 (Thành viên B):** Xây dựng modal xem trước file gốc (hình ảnh phóng to, thông tin kích thước, mốc thời gian tải lên).
- **Đầu ra Ngày 4:** Tải được file từ UI lưu vào `public/uploads/`; Trang Admin hiển thị được danh sách hồ sơ mẫu.

---

### NGÀY 5: Lưu Trữ Off-Chain & Nghiệp Vụ Xét Duyệt
- [ ] **Task 5.1 (Thành viên A):** Hoàn thiện API `POST /api/assets`: kiểm tra trùng lặp `fileHash` trong SQLite, lưu bản ghi mới với trạng thái `PENDING_APPROVAL`.
- [ ] **Task 5.2 (Thành viên A):** Xây dựng trang thông báo đăng ký thành công kèm mã theo dõi hồ sơ.
- [ ] **Task 5.3 (Thành viên B):** Xây dựng API Route `POST /api/admin/assets/[id]/review`: xử lý phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED` + lý do từ chối).
- [ ] **Task 5.4 (Thành viên B):** Kết nối nút "Duyệt" và "Từ chối" trên giao diện Admin với API backend.
- **Đầu ra Ngày 5:** Người dùng đăng ký -> Dữ liệu lưu vào SQLite -> Admin mở giao diện bấm Duyệt/Từ chối và trạng thái thay đổi tức thì.

---

### NGÀY 6: Đưa Lên Blockchain (Mint) & Sinh Chứng Nhận Điện Tử
- [ ] **Task 6.1 (Thành viên A):** Tích hợp MetaMask gọi hàm `registerAsset(to, uri, contentHash)` trên smart contract từ giao diện khi tài sản đã được duyệt.
- [ ] **Task 6.2 (Thành viên A):** Xử lý giao diện hiển thị trạng thái đang gửi giao dịch, chờ xác nhận block và thông báo mã giao dịch (`txHash`).
- [ ] **Task 6.3 (Thành viên B):** Xây dựng chức năng tự động tạo bản ghi `Certificate` trong SQLite khi tài sản được cấp phép/mint.
- [ ] **Task 6.4 (Thành viên B):** Tự động sinh mã QR chứa link tra cứu công khai: `http://localhost:3000/verify?hash=<contentHash>`.
- [ ] **Task 6.5 (Thành viên B):** Xuất file PDF chứng nhận chất lượng cao lưu vào `public/certificates/`.
- **Đầu ra Ngày 6:** Mint thành công NFT on-chain trên Hardhat node; Tải được file PDF chứng nhận có mã QR quét được bằng điện thoại.

---

### NGÀY 7: Đồng Bộ Dữ Liệu & Cổng Tra Cứu Xác Minh
- [ ] **Task 7.1 (Thành viên A):** Viết API Route `POST /api/assets/[id]/sync-onchain`: kiểm tra transaction receipt qua RPC, cập nhật `tokenId`, `txHash`, đổi trạng thái sang `REGISTERED`, ghi vào `OwnershipHistory`.
- [ ] **Task 7.2 (Thành viên A):** Xây dựng cơ chế xử lý khi giao dịch blockchain bị hủy hoặc lỗi (nút bấm "Thực hiện lại giao dịch").
- [ ] **Task 7.3 (Thành viên B):** Xây dựng Cổng tra cứu công khai (`/verify`): cho phép nhập số Token ID hoặc mã băm SHA-256 để kiểm tra.
- [ ] **Task 7.4 (Thành viên B):** Viết API Route `POST /api/verify`: đối chiếu dữ liệu đồng thời giữa SQLite và Smart Contract.
- **Đầu ra Ngày 7:** Luồng dữ liệu khép kín từ Đăng ký -> Duyệt -> Mint -> Đồng bộ -> Tra cứu.

---

### NGÀY 8: MỐC TÍCH HỢP M2 (KIỂM THỬ TÍCH HỢP ĐẦU TIÊN)
- [ ] **Task 8.1 (Cả hai):** Hợp nhất code nhánh của Thành viên A và Thành viên B vào nhánh `main` (hoặc `develop`).
- [ ] **Task 8.2 (Cả hai):** Thực hiện kịch bản kiểm thử liên máy:
  - Máy A đăng ký tác phẩm số "Tranh hoa sen".
  - Máy B mở trang Admin thấy hồ sơ -> bấm Duyệt.
  - Máy A nhận được thông báo đã duyệt -> kích hoạt MetaMask ký mint on-chain.
  - Máy B mở trang Xác minh gõ mã băm -> Hệ thống hiển thị bản ghi on-chain và tải được chứng nhận PDF.
- [ ] **Task 8.3 (Cả hai):** Rà soát và sửa các lỗi phát sinh trong lần tích hợp đầu tiên.
- **Đầu ra Ngày 8:** Hoàn thành 100% luồng nghiệp vụ cốt lõi, không còn phụ thuộc kỹ thuật tồn đọng.

---

### NGÀY 9: Bảng Điều Khiển Tác Giả & Xác Minh 1-Click Siêu Tốc
- [ ] **Task 9.1 (Thành viên A):** Hoàn thiện Dashboard cá nhân (`/creator/my-assets`): thống kê tổng tài sản, chia tab (Chờ duyệt, Đã chứng nhận, Bị từ chối).
- [ ] **Task 9.2 (Thành viên A):** Bổ sung chức năng lọc, tìm kiếm tài sản cá nhân.
- [ ] **Task 9.3 (Thành viên B):** Nâng cấp cổng `/verify` với tính năng **"1-Click Verification"**: Vùng kéo thả file bất kỳ vào trình duyệt -> Web Crypto API băm SHA-256 -> Tự động gọi `getAssetByHash` trên Smart Contract -> Hiển thị kết quả thật/giả kèm visual banner xanh/đỏ ấn tượng.
- [ ] **Task 9.4 (Thành viên B):** Kiểm thử kéo thả file gốc (báo THẬT) và file đã chỉnh sửa 1 pixel (báo GIẢ MẠO).
- **Đầu ra Ngày 9:** Dashboard tác giả chuyên nghiệp; Cổng xác minh kéo-thả hoạt động hoàn hảo tạo hiệu ứng ấn tượng cho buổi demo.

---

### NGÀY 10: Chuyển Nhượng Quyền Sở Hữu & Khám Phá Công Khai
- [ ] **Task 10.1 (Thành viên A):** Xây dựng chức năng Chuyển nhượng quyền sở hữu (`/creator/transfer`): nhập địa chỉ ví người nhận, gọi hàm `transferAsset` trên contract.
- [ ] **Task 10.2 (Thành viên A):** Cập nhật bảng `OwnershipHistory` trong SQLite sau khi giao dịch chuyển nhượng thành công on-chain.
- [ ] **Task 10.3 (Thành viên B):** Thiết kế Landing Page giới thiệu hệ thống (`/`) với giao diện hiện đại, các số liệu thống kê trực quan.
- [ ] **Task 10.4 (Thành viên B):** Xây dựng trang Thư viện khám phá (`/explore`): trưng bày các tài sản đã được bảo vệ bản quyền.
- **Đầu ra Ngày 10 (Mốc M3):** Chuyển nhượng NFT on-chain mượt mà; Trang chủ và trang khám phá hoàn thiện thẩm mỹ.

---

### NGÀY 11: Nguồn Gốc Lịch Sử (Provenance) & Thu Hồi Bản Quyền
- [ ] **Task 11.1 (Thành viên A):** Xây dựng giao diện Dòng thời gian lịch sử nguồn gốc (*Provenance Timeline*) trên trang chi tiết tài sản: hiển thị người tạo ban đầu, ngày giờ mint, các lần đổi chủ kèm txHash.
- [ ] **Task 11.2 (Thành viên B):** Xây dựng chức năng Thu hồi chứng nhận (*Revoke Asset*): Admin có quyền đánh dấu thu hồi khi có gian lận, gọi hàm `revokeAsset` on-chain và cập nhật trạng thái `REVOKED`.
- [ ] **Task 11.3 (Thành viên B):** Khi file bị thu hồi, chứng nhận PDF hiển thị watermark đỏ "REVOKED / ĐÃ THU HỒI".
- **Đầu ra Ngày 11:** Hệ thống hoàn thiện đầy đủ các tính năng nâng cao và trường hợp vi phạm bản quyền.

---

### NGÀY 12: MỐC TÍCH HỢP M4 (KIỂM THỬ CHỊU LỖI & PHẢN ỨNG GIAO DIỆN)
- [ ] **Task 12.1 (Cả hai):** Kiểm thử các kịch bản lỗi:
  - Người dùng bấm nút từ chối ký giao dịch trên MetaMask.
  - Người dùng nhập trùng file đã từng đăng ký -> Hệ thống báo lỗi trước khi tốn phí gas.
  - Tắt Hardhat node và bật lại -> Xem hệ thống phản hồi thông báo thân thiện.
- [ ] **Task 12.2 (Cả hai):** Tối ưu hóa UI/UX: thêm loading spinners, toast notifications, hiệu ứng chuyển trang mượt mà.
- **Đầu ra Ngày 12:** Toàn bộ ứng dụng hoạt động ổn định, không có crash hoặc unhandled promise rejections.

---

### NGÀY 13: Chuẩn Hóa Môi Trường Demo & Diễn Tập Thuyết Trình
- [ ] **Task 13.1 (Thành viên A):** Viết script chuẩn bị môi trường demo 1 dòng lệnh (`npm run demo:reset`):
  - Reset SQLite database.
  - Khởi động và deploy lại hợp đồng `AssetRegistry.sol`.
  - Tạo sẵn 3 tài sản mẫu (1 tài sản đã đăng ký thành công, 1 hồ sơ đang chờ duyệt, 1 tài sản bị từ chối).
- [ ] **Task 13.2 (Thành viên B):** Chuẩn bị kịch bản thuyết trình & demo 5 phút:
  - Phút 1: Giới thiệu bài toán bản quyền số và giải pháp AssetChain.
  - Phút 2: Tác giả tải lên tác phẩm nghệ thuật, băm SHA-256 client-side.
  - Phút 3: Admin duyệt hồ sơ trên cổng quản trị.
  - Phút 4: Tác giả mint on-chain, hệ thống xuất E-Certificate PDF có mã QR.
  - Phút 5: Khách vãng lai kéo file vào cổng `/verify` để chứng thực ngay lập tức.
- [ ] **Task 13.3 (Cả hai):** Diễn tập thuyết trình thử ít nhất 2 lần.
- **Đầu ra Ngày 13:** Bộ dữ liệu demo chuẩn chỉn; Nhóm tự tin làm chủ toàn bộ bài thuyết trình.

---

### NGÀY 14: BẢO VỆ ĐỒ ÁN / DEMO TRỰC TIẾP
- [ ] **Task 14.1:** Kiểm tra lần cuối máy tính, mạng local, ví MetaMask demo (đảm bảo đủ test ETH).
- [ ] **Task 14.2:** Tự tin trình bày và trả lời câu hỏi vấn đáp của giảng viên về Smart Contract, tính toàn vẹn dữ liệu, và phân định On-chain/Off-chain.
- **Kết quả mong đợi:** Đạt điểm tối đa (10/10) với sự khen ngợi từ Hội đồng đánh giá!
