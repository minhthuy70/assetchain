# KẾ HOẠCH HÀNH ĐỘNG 14 NGÀY - ĐỒ ÁN BLOCKCHAIN ASSETCHAIN (MỤC TIÊU 10/10)

> **Đề tài:** Nền tảng Đăng ký, Xét duyệt, Phát hành Chứng nhận và Quản lý Quyền sở hữu Tài sản số (**AssetChain**)  
> **Quy mô nhóm:** 2 Thành viên (**Thành viên A** & **Thành viên B**)  
> **Thời gian thực hiện:** 14 ngày (2 tuần)  
> **Kiến trúc:** Local-First Fullstack (Next.js 14/15 App Router + SQLite Prisma + Hardhat EVM + Ethers.js v6)  
> **Phương thức đánh giá:** Giảng viên kiểm tra trực tiếp qua GitHub Repository (Commit history, Contributor graph, Code quality, PR review, Test coverage & Demo trực tiếp).

---

## 🎯 I. MỤC TIÊU DỰ ÁN & TIÊU CHÍ ĐÁNH GIÁ ĐẠT ĐIỂM TỐI ĐA (10/10)

### 1. Luồng nghiệp vụ cốt lõi theo đề bài
1. **Đăng ký tài sản số (Creator):** Người dùng tải lên tác phẩm số (hình ảnh nghệ thuật, thiết kế đồ họa, văn bản). Trình duyệt tự động tính toán mã băm vân tay số `SHA-256` của file bằng **Web Crypto API** ngay tại máy người dùng và kiểm tra trùng lặp trước khi gửi.
2. **Quy trình thẩm định hồ sơ (Admin):** Hồ sơ lưu vào SQLite với trạng thái chờ duyệt (`PENDING_APPROVAL`). Quản trị viên thẩm định tính hợp lệ trên Cổng quản trị và bấm phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED` kèm lý do).
3. **Phát hành chứng nhận & Ghi nhận Blockchain:**
   - Sau khi duyệt, tác giả kích hoạt MetaMask để mint bản ghi quyền sở hữu lên Smart Contract `AssetRegistry.sol` (lưu `contentHash`, `creator`, `timestamp`, `tokenId`).
   - Hệ thống tự động sinh **Chứng nhận điện tử (E-Certificate)** định dạng PDF chứa mã QR động, thông tin tác giả, mã băm SHA-256, Transaction Hash và con dấu số.
4. **Cổng tra cứu và xác minh độc lập (Public Verification):**
   - Tra cứu qua mã Token ID hoặc quét mã QR trên chứng nhận.
   - **Tính năng bùng nổ:** Kéo thả bất kỳ file ảnh nào vào trang web -> Trình duyệt tự băm SHA-256 trực tiếp -> Đối chiếu ngay với Smart Contract qua RPC -> Báo tình trạng THẬT / GIẢ tức thì mà không cần đăng nhập hay tốn phí gas!

---

## 🏆 II. 6 YẾU TỐ "WOW" ĐỂ THUYẾT PHỤC HỘI ĐỒNG CHO ĐIỂM 10/10

Giảng viên chấm đồ án không chỉ chấm việc "chạy được", mà đặc biệt đánh giá **tư duy kiến trúc, độ hoàn thiện trải nghiệm và kỹ năng giải quyết bài toán thực tế**. Dưới đây là 6 điểm nhấn đặc biệt:

| # | Yếu Tố WOW | Mô Tả Kỹ Thuật Chi Tiết | Giá Trị Thuyết Phục Hội Đồng |
|---|------------|-------------------------|------------------------------|
| **1** | **Client-side Hash & Chống Trùng Lặp On-chain** | File nhị phân không cần upload lên server để kiểm tra; Web Crypto API tính `SHA-256` trên browser. Smart Contract có mapping `bytes32 contentHash => bool` ngăn chặn tuyệt đối việc đăng ký 2 lần cho cùng một file. | Chứng minh hiểu đúng bản chất "Proof of Existence" và tiết kiệm băng thông tối đa. |
| **2** | **Bộ Sinh E-Certificate Động Kèm Mã QR Sống** | Tự động render file chứng nhận bản quyền số định dạng PDF với thiết kế trang trọng, chứa Watermark, Transaction Hash, Token ID và QR Code dẫn trực tiếp tới trang verify. | Trực quan, hoàn thiện đúng 100% yêu cầu đề bài về "chứng nhận điện tử mô phỏng". |
| **3** | **Cổng Xác Minh Kéo - Thả Siêu Tốc (1-Click Verification)** | Cho phép bất kỳ khách vãng lai nào kéo thả file ảnh vào -> Trình duyệt tính hash và gọi hàm `getAssetByHash` trên contract -> Hiển thị kết quả thật/giả kèm mốc thời gian đăng ký trong 1 giây. | Kịch bản demo cực kỳ bùng nổ, gây ấn tượng mạnh mẽ ngay từ 30 giây đầu tiên của buổi bảo vệ. |
| **4** | **100% Smart Contract Unit Test Với Chai & Ethers** | Bộ test tự động từ 15-20 test cases bao phủ toàn bộ các hàm `registerAsset`, `transferAsset`, `revokeAsset`, kiểm tra trùng hash, chống zero address, kiểm tra sự kiện event. | Thể hiện tác phong lập trình chuẩn mực, tự động hóa kiểm thử bài bản. |
| **5** | **Kiến Trúc Local-First Tinh Gọn (Zero-Docker)** | Toàn bộ ứng dụng (Next.js App Router + SQLite Prisma + Hardhat Node) chạy 100% native local, khởi động trong 5 giây bằng 2 lệnh đơn giản, không phụ thuộc internet hay Docker. | Triển khai nhanh, cực kỳ ổn định, không bao giờ bị lỗi kết nối mạng hay xung đột cổng khi đi demo. |
| **6** | **Dòng Thời Gian Nguồn Gốc (Provenance Timeline)** | Giao diện hiển thị trực quan lịch sử chuyển nhượng quyền sở hữu từ tác giả ban đầu qua các chủ sở hữu kế tiếp, đối chiếu trực tiếp giữa logs SQLite và sự kiện on-chain. | Thể hiện tính minh bạch và truy xuất nguồn gốc - giá trị cốt lõi của công nghệ Blockchain. |

---

## 👥 III. PHÂN CHIA CÔNG VIỆC CÂN BẰNG 50% - 50% (VERTICAL SLICING)

Để đảm bảo biểu đồ GitHub Contributors hiển thị đóng góp đồng đều và không ai bị quá tải hay phụ thuộc:

```
+-----------------------------------------------------------------------------------+
|                         HỆ THỐNG ASSETCHAIN (14 NGÀY)                             |
+-----------------------------------------+-----------------------------------------+
|     THÀNH VIÊN A (Nền tảng & Đăng ký)   |     THÀNH VIÊN B (Xét duyệt & Chứng nhận)|
|   Tỷ trọng đóng góp: ~50% (Commit: 45-55)|   Tỷ trọng đóng góp: ~50% (Commit: 45-55)|
+-----------------------------------------+-----------------------------------------+
| - Khởi tạo Next.js, Prisma SQLite, Hardhat | - Thiết kế UI Layout chung (Navbar, Footer)|
| - Smart Contract AssetRegistry & Unit Tests | - Cổng thẩm định hồ sơ Admin (/admin)  |
| - Luồng Đăng ký tài sản & Web Crypto SHA-256| - API Duyệt / Từ chối (Approve / Reject)|
| - Form Upload & Kiểm tra trùng lặp SQLite | - Bộ máy tạo E-Certificate PDF & QR Code|
| - Tích hợp MetaMask Mint NFT On-chain    | - Cổng tra cứu xác minh /verify         |
| - Dashboard tác giả (Quản lý tài sản)   | - Tính năng 1-Click Drag-and-Drop Verify|
| - Chức năng Chuyển nhượng quyền sở hữu  | - Thu hồi chứng nhận (Revoke on-chain)  |
| - Script Reset & Seed dữ liệu demo      | - Landing Page & Thư viện Khám phá      |
+-----------------------------------------+-----------------------------------------+
```

---

## 📅 IV. LỊCH TRÌNH 14 NGÀY VÀ 4 MỐC TÍCH HỢP QUAN TRỌNG

### Tuần 1: Xây Dựng Khung & Luồng Cốt Lõi
- **Ngày 1:** Khởi tạo Next.js, Prisma SQLite, Hardhat, Web Crypto helper.
- **Ngày 2:** Smart Contract lõi `AssetRegistry.sol`, Unit tests, Thư viện tạo PDF/QR.
- **Ngày 3 (MỐC TÍCH HỢP M1):** Deploy contract local, kết nối MetaMask đọc dữ liệu on-chain.
- **Ngày 4:** Form đăng ký tài sản (A) | Giao diện quản trị Admin (B).
- **Ngày 5:** API Upload & lưu SQLite (A) | API Duyệt & từ chối hồ sơ (B).
- **Ngày 6:** Tích hợp giao dịch Mint on-chain (A) | Sinh chứng nhận PDF và mã QR (B).
- **Ngày 7:** Đồng bộ dữ liệu On-chain vào SQLite (A) | Cổng tra cứu theo mã băm/Token ID (B).

### Tuần 2: Nâng Cấp Trải Nghiệm & Tích Hợp Toàn Diện
- **Ngày 8 (MỐC TÍCH HỢP M2):** Kiểm thử tích hợp luồng chéo lần 1 (Đăng ký -> Duyệt -> Mint -> Xuất chứng nhận -> Tra cứu).
- **Ngày 9:** Dashboard tác giả (A) | Cổng kéo-thả xác minh 1-Click siêu tốc (B).
- **Ngày 10 (MỐC TÍCH HỢP M3):** Chuyển nhượng quyền sở hữu (A) | Landing Page & Explore Gallery (B).
- **Ngày 11:** Provenance Timeline (A) | Nghiệp vụ thu hồi bản quyền Revoke (B).
- **Ngày 12 (MỐC TÍCH HỢP M4):** Kiểm thử chịu lỗi, từ chối giao dịch ví, tối ưu hóa giao diện và loading state.
- **Ngày 13:** Tạo script 1-Click Reset Demo Data (`npm run demo:reset`), diễn tập thuyết trình 5 phút.
- **Ngày 14:** BẢO VỆ ĐỒ ÁN VÀ THUYẾT TRÌNH BẢO VỆ ĐIỂM 10/10.

---

## 🔍 V. TIÊU CHÍ NGHIỆM THU ĐỒ ÁN (CHECKLIST ĐẠT ĐIỂM 10)

- [ ] Smart Contract biên dịch không lỗi, có đầy đủ Unit Tests pass 100%.
- [ ] Tính năng băm SHA-256 client-side hoạt động chính xác trước khi gửi file lên server.
- [ ] Không thể đăng ký 2 lần cùng một file (cả SQLite lẫn Smart Contract đều từ chối).
- [ ] Quản trị viên duyệt hồ sơ mượt mà, lưu lý do rõ ràng khi từ chối.
- [ ] Mint NFT thành công trên Hardhat node, hiển thị đúng địa chỉ ví sở hữu.
- [ ] Xuất file PDF chứng nhận điện tử sắc nét, có mã QR quét dẫn thẳng đến link verify.
- [ ] Khách vãng lai kéo thả file vào trang web, hệ thống nhận diện đúng 100% file thật và file bị chỉnh sửa.
- [ ] Hai thành viên trả lời lưu loát toàn bộ câu hỏi vấn đáp của hội đồng.
