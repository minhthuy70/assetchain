# 🎯 BẢNG TRA CỨU NHANH TỆP DEMO KÉO THẢ (CHEATSHEET CHO BUỔI BÁO CÁO)

> **Mẹo trình diễn:** Mở song song 2 cửa sổ:  
> - Nửa màn hình bên trái: **Trình duyệt Web (`http://localhost:3000`)**  
> - Nửa màn hình bên phải: **Thư mục `DEMO_FILES` trong File Explorer**  
> Chỉ cần gắp từng tệp thả vào ô kéo thả (Dropzone) trên web để trình diễn các kịch bản thực tế.

---

## 📋 DANH SÁCH 10 TỆP DEMO & KỊCH BẢN TƯƠNG ỨNG

| STT | Tên tệp tin | Kéo vào trang nào? | Kết quả hiển thị trên Web | Ý nghĩa kỹ thuật & Lời thoại gợi ý |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `1_Xac_Minh_Hop_Le_Sen_Vang.png` | **Xác minh tệp** (`/verify`) |  **TÍCH XANH:** Hợp lệ & Nguyên bản (Token #1 On-Chain) | Băm SHA-256 trong RAM 0.02s, đối chiếu hàm `view` on-chain 0 Gas. Khắc dấu tại khối #1024. |
| **02** | `2_Xac_Minh_Bi_Sua_Doi_Fake.png` | **Xác minh tệp** (`/verify`) | ❌ **BÁO ĐỎ:** Không tìm thấy / Tệp đã bị sửa đổi | Minh họa tính nhạy cảm tuyệt đối của SHA-256: Dù sửa đúng 1 bit màu, mã băm lệch 100%, hệ thống phát hiện hàng giả ngay! |
| **03** | `3_Xac_Minh_Thu_Hoi_Revoked.png` | **Xác minh tệp** (`/verify`) | ⚠️ **CẢNH BÁO VÀNG/CAM:** Đã bị thu hồi (Revoked Token #2) | Token #2 vi phạm dữ liệu AI, Admin đã thu hồi on-chain. Smart Contract đóng băng chuyển nhượng vĩnh viễn. |
| **04** | `4_Dang_Ky_Moi_ArtWork_2026.png` | **Đăng ký tác phẩm** (`/creator/register`) | 🟢 **TÍCH XANH:** "Tác phẩm độc bản" | Tệp chưa từng xuất hiện trên chuỗi. Web cho phép điền tên tác phẩm, tác giả và bấm "Nộp hồ sơ". |
| **05** | `5_Xac_Minh_Dang_Cho_Duyet_Cyberpunk.png` | **Xác minh tệp** (`/verify`) | 🔵 **XANH DƯƠNG:** "Đang trong quy trình thẩm định" | Hồ sơ đã lưu trữ off-chain nhưng chưa được Admin phê duyệt. Chuỗi khối chưa cấp Token ID. |
| **06** | `6_Xac_Minh_Bi_Tu_Choi_TranhSaoChep.png` | **Xác minh tệp** (`/verify`) | 🔴 **BÁO ĐỎ/HỒNG:** "Bị từ chối thẩm định" | Hồ sơ bị Admin từ chối kèm lý do: "Trùng khớp 98% ảnh Pinterest chưa mua bản quyền". |
| **07** | `7_Dang_Ky_Thu_Trung_Lap_Bao_Do.png` | **Đăng ký tác phẩm** (`/creator/register`) | 🚫 **BÁO ĐỎ & KHÓA NÚT:** "Tác phẩm đã tồn tại" | **Tính năng chống gian lận thời gian thực:** Vừa băm xong SHA-256 là web chặn ngay, không cho nộp trùng tệp đã có! |
| **08** | `8_Dang_Ky_Tai_Lieu_Hop_Dong.pdf` | **Đăng ký tác phẩm** (`/creator/register`) | 📄 **TỰ ĐỔI DANH MỤC:** Auto switch sang `DOCUMENT` | Minh họa hệ thống hỗ trợ cả tài liệu hợp đồng PDF pháp lý, tự động phân loại thông minh và băm nhị phân siêu tốc. |
| **09** | `9_Creator_Mint_NFT_Pho_Co_Ha_Noi.png` | **Tác phẩm của tôi** (`/creator/my-assets`) | ⚡ **NÚT MINT SÁNG:** "Đưa Lên Blockchain (Mint NFT)" | Hồ sơ đã được Admin duyệt (`APPROVED`), có E-Cert #0002. Kết nối ví Creator để ký MetaMask đúc Token lên EVM. |
| **10** | `10_Xac_Minh_Hop_Le_TechCorp_Token3.png` | **Xác minh tệp** (`/verify`) |  **TÍCH XANH:** Hợp lệ chính chủ (Token #3 On-Chain) | Hồ sơ thương hiệu đã đăng ký của Designer (Account #2) trên mạng Blockchain. |

---

## 🎬 3 KỊCH BẢN KÉO THẢ "ĂN ĐIỂM TUYỆT ĐỐI" TRƯỚC HỘI ĐỒNG

### Kịch bản A: So sánh Thật vs Giả (30 giây)
1. Mở trang `/verify`.
2. Kéo `1_Xac_Minh_Hop_Le_Sen_Vang.png` thả vào $\rightarrow$ Hiện **XANH LÁ** (Hợp lệ on-chain Token #1).
3. Kéo `2_Xac_Minh_Bi_Sua_Doi_Fake.png` thả vào $\rightarrow$ Hiện **ĐỎ** (Giả mạo / Sai lệch mã băm).
> **Lời thoại:** *"Thưa thầy cô, 2 bức tranh nhìn mắt thường hoàn toàn giống hệt nhau, nhưng bức số 2 bị kẻ xấu đổi màu 1 pixel. Nhờ đặc tính Avalanche Effect của SHA-256, chuỗi băm thay đổi hoàn toàn và Smart Contract phát hiện giả mạo ngay lập tức mà không tốn 1 đồng phí Gas nào."*

---

### Kịch bản B: Chống trùng lặp thời gian thực khi Đăng ký (30 giây)
1. Mở trang `/creator/register`.
2. Kéo `7_Dang_Ky_Thu_Trung_Lap_Bao_Do.png` thả vào Bước 1.
3. Form ngay lập tức quét DB và hiện cảnh báo đỏ: *"Tác phẩm này đã tồn tại trong hệ thống..."* và nút nộp hồ sơ bị khóa lại.
4. Kéo `4_Dang_Ky_Moi_ArtWork_2026.png` thay thế vào $\rightarrow$ Hiện tích xanh *"Tác phẩm độc bản"* và nút nộp mở lại bình thường.
> **Lời thoại:** *"Hệ thống không bắt người dùng điền hết thông tin rồi bấm nộp mới báo lỗi. Ngay tại RAM trình duyệt, khi băm xong trong 0.02 giây, hệ thống đã đối soát trùng lặp lập tức để bảo vệ tính độc bản của tài sản số."*

---

### Kịch bản C: Đăng ký tài liệu hợp đồng PDF thông minh (20 giây)
1. Mở trang `/creator/register`.
2. Kéo `8_Dang_Ky_Tai_Lieu_Hop_Dong.pdf` thả vào.
3. Giao diện nhận diện định dạng PDF, tự động chuyển trường danh mục sang **`DOCUMENT (Tài liệu)`**.
> **Lời thoại:** *"Hệ thống không giới hạn ở tranh nghệ thuật mà quản lý được cả tài liệu scan, hợp đồng số, chứng từ với khả năng tự động phân loại danh mục thông minh."*
