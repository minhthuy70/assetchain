# Phân Chia Công Việc Team 2 Người - AssetChain

## Tổng Quan

| Thành Viên | Vai Trò Chính | Kỹ Năng Cần Thiết |
|-----------|---------------|-------------------|
| **Thành Viên A** | Backend + Smart Contract Developer | Solidity, Hardhat, NestJS, Prisma, PostgreSQL, ethers.js |
| **Thành Viên B** | Frontend + Integration Developer | Next.js, React, TypeScript, Tailwind CSS, ethers.js, MetaMask |

---

## Phân Chiả Chi Tiết Theo Phase

### Phase 1 - Khởi tạo Workspace (Có thể làm song song)

#### Thành Viên A - Backend + Smart Contract
- [ ] **Task 1.1** - Chốt ma trận phiên bản (Node.js, Solidity, Hardhat, NestJS, Prisma, PostgreSQL)
- [ ] **Task 1.2** - Khởi tạo Hardhat project:
  - Cấu hình TypeScript, network local chain `31337`
  - Cài đặt OpenZeppelin contracts
  - Cấu hình test runner và script deploy
- [ ] **Task 1.3** - Khởi tạo NestJS backend:
  - Cấu hình TypeScript, lint/test
  - Cấu hình prefix `/api/v1`
  - Setup validation pipe, CORS, error response chuẩn
  - Cấu hình environment variables
- [ ] **Task 1.4** - Khởi tạo Prisma/PostgreSQL:
  - Tạo Prisma schema theo ERD
  - Setup enum trạng thái, index/unique constraints
  - Tạo migration đầu tiên
  - Seed admin account an toàn cho local
- [ ] **Task 1.6** - Chuẩn hóa local runbook:
  - Hướng dẫn chạy Hardhat node, deploy
  - Hướng dẫn chạy PostgreSQL
  - Kiểm tra không để private key thật vào source control

#### Thành Viên B - Frontend
- [ ] **Task 1.1** - Chốt ma trận phiên bản (Next.js, TypeScript, Tailwind, ethers.js)
- [ ] **Task 1.5** - Khởi tạo Next.js frontend:
  - Cấu hình App Router, TypeScript
  - Setup Tailwind CSS
  - Tạo layout cơ bản
  - Cấu hình env public/private đúng ranh giới
  - Tạo API client foundation
- [ ] **Task 1.6** - Chuẩn hóa local runbook:
  - Hướng dẫn chạy frontend dev server
  - Cấu hình MetaMask local network (chain ID 31337)

---

### Phase 2 - Smart Contract (Thành Viên A chính, B hỗ trợ review)

#### Thành Viên A
- [ ] **Task 2.1** - Triển khai cấu trúc contract `AssetRegistry.sol`:
  - Kế thừa ERC-721URIStorage, Ownable, Pausable
  - Implement struct AssetRecord
  - Implement mapping và state variables
- [ ] **Task 2.2** - Implement đăng ký và tra cứu:
  - `registerAsset()` function
  - `getAssetByHash()` function
  - Các getter cần thiết
  - Bảo vệ input (zero address, URI rỗng, hash zero, trùng hash)
- [ ] **Task 2.3** - Implement revoke và access control:
  - `revokeAsset()` (chỉ owner)
  - Cơ chế pause/unpause
- [ ] **Task 2.4** - Viết unit test contract:
  - Test mint, ownership, URI
  - Test hash uniqueness
  - Test event fields, timestamp
  - Test duplicate/invalid input
  - Test revoke authorization, pause
  - Test transfer ERC-721
- [ ] **Task 2.5** - Deploy và xuất artifact local:
  - Deploy vào Hardhat network
  - Lấy ABI, address, chain ID
  - Test gọi read function từ client
- [ ] **Task 2.6** - Kiểm tra chuẩn hash:
  - Xác nhận SHA-256 binary → bytes32 ổn định
  - Không nhầm với hash chuỗi hex

#### Thành Viên B
- [ ] **Review** contract code và unit tests
- [ ] **Học** cách tích hợp ethers.js với contract ABI
- [ ] **Chuẩn bị** frontend structure để tích hợp contract khi sẵn sàng

---

### Phase 3 - Backend Core (Thành Viên A chính)

#### Thành Viên A
- [ ] **Task 3.1** - Hoàn thiện schema và service dữ liệu:
  - Implement Prisma repositories/services cho User, CreatorProfile, Asset, OwnershipHistory, DisputeReport, BlockchainSyncLog
  - Áp dụng unique/index, transaction boundary
- [ ] **Task 3.2a** - Implement Creator Profile module:
  - Tạo/Update CreatorProfile (displayName, bio, avatarUrl, portfolioUrl)
  - API get public profile by userId hoặc walletAddress
  - Validation cho profile fields
- [ ] **Task 3.2** - Implement đăng ký/đăng nhập JWT:
  - Hash password (bcrypt/argon2)
  - Validate DTO
  - Phát access token
  - RBAC guard (USER/CREATOR/ADMIN)
- [ ] **Task 3.3** - Implement wallet challenge/binding:
  - Sinh nonce ngẫu nhiên
  - Tạo message có domain/chain/time
  - Verify chữ ký bằng ethers
  - Chống replay
  - Xử lý wallet đã gắn với tài khoản khác
- [ ] **Task 3.4** - Implement upload và fingerprint:
  - Giới hạn kích thước, MIME/extension
  - Lưu file an toàn
  - Tính SHA-256 theo binary stream
  - Tạo temp file với cleanup/expiry
- [ ] **Task 3.5** - Implement prepare-registration:
  - Kiểm tra quyền sở hữu temp file
  - Kiểm tra duplicate DB và on-chain
  - Tạo metadata URI
  - Ghi asset DRAFT/PENDING_ONCHAIN
- [ ] **Task 3.6** - Implement confirm-registration:
  - Lấy receipt từ RPC
  - Kiểm tra transaction success, contract address, sender/receiver
  - Kiểm tra event AssetRegistered
  - Kiểm tra idempotency
  - Cập nhật REGISTERED
- [ ] **Task 3.7** - Implement public asset query/detail:
  - List có pagination, search/category/status filter
  - Detail metadata, owner hiện tại, on-chain đối chiếu
  - Provenance
- [ ] **Task 3.8** - Implement integrity verification:
  - Nhận file hoặc hash
  - Tính hash server-side
  - Truy vấn DB và contract song song
  - Trả valid/unregistered/modified/flagged/revoked
- [ ] **Task 3.9** - Implement transfer confirmation và history:
  - Xác thực event Transfer độc lập
  - Kiểm tra token/địa chỉ đích/transaction chain
  - Cập nhật owner và append OwnershipHistory
- [ ] **Task 3.10** - Viết backend unit/integration tests:
  - Test DTO/guard/service/repository
  - Test invalid auth, replay signature
  - Test upload limit, duplicate hash
  - Test malformed receipt, wrong chain/contract/event
  - Test retry idempotency

#### Thành Viên B
- [ ] **Review** API endpoints và DTO
- [ ] **Test** API bằng Postman/Insomnia
- [ ] **Chuẩn bị** frontend API client structure

---

### Phase 4 - Frontend MVP (Thành Viên B chính, A hỗ trợ API)

#### Thành Viên B
- [ ] **Task 4.1** - Xây dựng app shell và API state:
  - Navigation, auth session
  - Typed API client
  - Loading/error/empty states
  - Route protection
  - Thông báo lỗi không làm lộ secret
- [ ] **Task 4.2** - Xây dựng auth và wallet binding UI:
  - Register, login UI
  - Connect MetaMask
  - Nonce/message signing
  - Bind wallet
  - Xử lý chain mismatch, user reject, account change
- [ ] **Task 4.3** - Xây dựng Integrity Verifier public:
  - Kéo-thả/chọn file hoặc nhập hash
  - Hiển thị progress
  - Kết quả valid/modified/unregistered/flagged/revoked
  - Token/creator/owner/time và provenance link
- [ ] **Task 4.4** - Xây dựng registration flow:
  - Upload preview
  - Metadata form
  - Duplicate warning
  - Prepare API
  - Gọi registerAsset bằng MetaMask
  - Chờ mined và confirm API
  - Hiển thị retry/cancel/failure
- [ ] **Task 4.5** - Xây dựng asset explorer/detail/provenance:
  - Pagination/search/filter
  - Detail, on-chain status
  - Timeline
  - Phân biệt stale, pending, confirmed
- [ ] **Task 4.6** - Xây dựng Creator Dashboard:
  - Quản lý tài sản số cá nhân (list, filter by status)
  - Xem thống kê (số lượng tài sản, trạng thái)
  - Quick action cho từng asset (view, transfer, revoke nếu có quyền)
- [ ] **Task 4.7** - Xây dựng Creator Profile UI:
  - Hiển thị thông tin Creator (displayName, bio, avatar, portfolioUrl)
  - Danh sách tài sản công khai của Creator
  - Badge verified (nếu isVerified = true)
- [ ] **Task 4.8** - Xây dựng transfer UI:
  - Cho phép đúng owner chọn địa chỉ đích
  - Ký transfer
  - Gửi confirm
  - Hiển thị pending
  - Không cập nhật thành công nếu receipt/event không đạt
- [ ] **Task 4.9** - Xây dựng trang Home/Landing:
  - Hero section giới thiệu hệ thống
  - Quick link: Verify asset, Explore assets, Register
  - Hiển thị số liệu thống kê cơ bản (số tài sản đã đăng ký, số creator)
- [ ] **Task 4.10** - Kiểm thử frontend:
  - Form validation
  - Wallet rejection, wrong network
  - Upload lỗi
  - Transaction pending/reverted
  - Refresh sau confirm
  - Responsive và keyboard accessibility

---

### Phase 6 - Nghiệp vụ Nâng cao (Sau MVP - Tùy chọn triển khai)

#### Thành Viên A - Backend + Contract
- [ ] **Task 6.1** - Chốt thiết kế licensing:
  - Phân tích quyền owner/licensee, thời hạn, loại license, phí
  - Quyết định dữ liệu on-chain vs off-chain
- [ ] **Task 6.2** - Implement AssetLicensing.sol:
  - Contract với access control, expiry, revoke
  - Test owner transfer, license overlap, invalid dates
- [ ] **Task 6.3** - Implement licensing backend:
  - Migration cho LicenseAgreement
  - APIs issue/list/revoke
  - Authorization, terms URI
- [ ] **Task 6.4** - Implement admin dispute workflow:
  - API nhận dispute, evidence access control
  - Review/resolve, flag/revoke đồng bộ DB và contract
  - Audit trail
- [ ] **Task 6.5** - Implement blockchain event worker:
  - Thiết kế cursor từ BlockchainSyncLog
  - Scan block range an toàn
  - Deduplicate event, retry/reorg policy
- [ ] **Task 6.6** - Tích hợp IPFS có kiểm soát:
  - Chọn Pinata/Kubo
  - Pin metadata/file
  - Fallback/error policy

#### Thành Viên B - Frontend
- [ ] **Task 6.7** - Xây dựng Licensing UI:
  - Form tạo license agreement
  - Dashboard danh sách license
  - Timeline license (active/expired/terminated)
- [ ] **Task 6.8** - Xây dựng Admin Dashboard:
  - Quản lý user (list, activate/suspend)
  - Xem dispute reports
  - Form review dispute với evidence
  - Action: flag/revoke asset
  - Audit trail viewer
- [ ] **Task 6.9** - Xây dựng IPFS integration UI:
  - Hiển thị CID khi upload
  - Fallback indicator khi IPFS unavailable
  - Privacy/retention settings
- [ ] **Task 6.10** - Kiểm thử Phase 2:
  - E2E test licensing flow
  - Dispute workflow
  - Worker restart/reorg
  - IPFS unavailable scenario

#### Thành Viên A
- [ ] **Hỗ trợ** debug API issues
- [ ] **Đảm bảo** contract ABI/address cung cấp đúng
- [ ] **Review** ethers.js integration

---

### Phase 5 - Tích hợp & Release MVP (Cả 2 người cùng làm)

#### Thành Viên A
- [ ] **Task 5.1** - Dựng môi trường tích hợp reproducible:
  - Chạy PostgreSQL, Hardhat node/deploy, backend theo runbook
  - Kiểm tra env separation, health checks
- [ ] **Task 5.3** - Kiểm tra lỗi và khôi phục:
  - Test restart backend
  - Test RPC unavailable
  - Test transaction reverted
  - Test duplicate callback
  - Test DB failure
  - Test temp upload cleanup
- [ ] **Task 5.4** - Rà soát bảo mật MVP:
  - Secret leakage check
  - Private key scope local-only
  - Password hashing, JWT expiry
  - RBAC, nonce replay
  - Upload traversal/type spoofing
  - Rate/size limits, CORS
  - SQL/ORM input
  - Không đưa PII/file binary lên chain
- [ ] **Task 5.5** - Chạy quality gates:
  - Compile, lint, type-check
  - Contract unit tests
  - Backend tests
  - Sửa lỗi MVP scope

#### Thành Viên B
- [ ] **Task 5.1** - Dựng môi trường tích hợp:
  - Chạy frontend
  - Kiểm tra contract address/ABI đồng nhất
- [ ] **Task 5.2** - Kiểm thử acceptance end-to-end:
  - Register/login/bind wallet
  - Upload/register/mint/confirm
  - Public verify
  - Modified file, duplicate file
  - Transfer/history
  - Revoke/flag outcome
- [ ] **Task 5.4** - Rà soát bảo mật:
  - Check frontend không lộ secret
  - Check environment variables đúng public/private
- [ ] **Task 5.5** - Chạy quality gates:
  - Frontend tests/build
  - Check coverage/known failures

#### Cả 2 người cùng làm
- [ ] **Task 5.6** - Hoàn thiện tài liệu vận hành:
  - Cập nhật README theo implementation thực tế
  - Bổ sung API examples
  - Local deployment guide
  - Seed accounts
  - Troubleshooting
  - Giới hạn pháp lý

---

## Checkpoint Sync (Quan Trọng)

### Checkpoint 1: Sau Phase 1
- ✅ Hardhat project đã chạy được `npx hardhat compile` và `npx hardhat test`
- ✅ NestJS backend đã chạy được `npm run start:dev`
- ✅ Prisma migration đã thành công trên PostgreSQL
- ✅ Next.js frontend đã chạy được `npm run dev`
- ✅ Cả 2 người đều có thể chạy local environment

### Checkpoint 2: Sau Phase 2 (Critical)
- ✅ **Thành Viên A** cung cấp cho **Thành Viên B**:
  - Contract ABI (file JSON)
  - Contract address (địa chỉ trên local chain)
  - Chain ID (31337)
  - Example ethers.js integration code
- ✅ Contract unit tests 100% pass
- ✅ Contract đã deploy lên local Hardhat node

### Checkpoint 3: Sau Phase 3 (Critical)
- ✅ **Thành Viên A** cung cấp cho **Thành Viên B**:
  - API spec đầy đủ (endpoint, method, request/response)
  - DTO types TypeScript
  - Example API calls (Postman collection hoặc documentation)
  - JWT token example cho testing
- ✅ Backend tests pass
- ✅ Auth endpoint sẵn sàng (register, login, wallet binding)

### Checkpoint 4: Sau Phase 4
- ✅ Frontend có thể gọi API backend thành công
- ✅ Frontend có thể kết nối MetaMask
- ✅ Frontend có thể gọi contract function qua ethers.js
- ✅ End-to-end flow cơ bản hoạt động (register → mint → verify)

### Checkpoint 5: Sau Phase 5
- ✅ Toàn bộ E2E flow pass
- ✅ Security audit cơ bản hoàn thành
- ✅ Documentation cập nhật
- ✅ MVP sẵn sàng demo

---

## Công Cụ Hỗ Trợ Sync

### Communication
- **Daily Standup:** 15 phút mỗi ngày
  - Thành viên A: Progress backend/contract, blockers
  - Thành Viên B: Progress frontend, blockers
  - Sync dependencies: API changes, contract changes

### Version Control
- **Branch Strategy:**
  - `main` - Production ready
  - `dev` - Integration branch
  - `feature/backend-xxx` - Backend features
  - `feature/frontend-xxx` - Frontend features
  - `feature/contract-xxx` - Contract features
- **Merge Rules:**
  - Contract changes → review bởi cả 2 người
  - API changes → update docs trước khi merge
  - Frontend integration → test với backend dev server trước

### Documentation Sharing
- **Contract Artifacts:** Commit vào repo (để frontend dễ access)
- **API Spec:** Cập nhật file `docs/api_spec.md` khi có thay đổi
- **Environment Variables:** Cập nhật `.env.example` khi có biến mới

---

## Timeline Gợi Ý (MVP)

| Phase | Thời Gian Ước Tính | Deliverable |
|-------|-------------------|-------------|
| Phase 1 | 2-3 ngày | Workspace sẵn sàng, cả 2 có thể chạy local |
| Phase 2 | 3-4 ngày | Contract hoàn chỉnh, tests pass, deploy local |
| Phase 3 | 5-7 ngày | Backend hoàn chỉnh, API sẵn sàng, tests pass |
| Phase 4 | 5-7 ngày | Frontend hoàn chỉnh, integration thành công |
| Phase 5 | 2-3 ngày | E2E pass, security check, documentation |
| **Tổng** | **17-24 ngày** | MVP demo ready |

---

## Lưu Ý Quan Trọng

1. **Thành Viên A** cần hoàn thành contract deploy và API auth sớm nhất có thể để **Thành Viên B** bắt đầu frontend integration
2. **Thành Viên B** có thể bắt đầu làm UI components không phụ thuộc API (shell, layout, components cơ bản) trong khi chờ backend
3. **Sync thường xuyên** - Đừng để frontend chờ API quá lâu, hãy mock data nếu cần
4. **Review code chéo** - Thành viên A review frontend code, Thành viên B review backend/contract code
5. **Test local cùng nhau** - Trước khi commit, cả 2 chạy full E2E flow local

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contract có bug sau khi frontend đã tích hợp | High | Unit tests kỹ lưỡng, review chéo, deploy local test trước |
| API changes break frontend | Medium | Version API, update docs, communicate changes sớm |
| Hash inconsistency giữa backend và contract | Critical | Test cross-platform hash, document standard rõ ràng |
| MetaMask integration issues | Medium | Test trên nhiều browser, handle edge cases |
| Database schema changes late | High | Chốt schema sớm, migration strategy rõ ràng |
