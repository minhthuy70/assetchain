# AssetChain - TASK PLAN

## Goal

Xây dựng nền tảng đăng ký, xác minh và quản lý quyền sở hữu tài sản số bằng
Blockchain EVM, kết hợp Web2 để lưu metadata, tài khoản và tệp ngoài chuỗi.
Mục tiêu MVP là chứng minh được toàn bộ luồng:

1. Người dùng đăng ký tài khoản và liên kết ví MetaMask bằng chữ ký.
2. Creator upload tài sản, tạo SHA-256 fingerprint và mint bản ghi
   `AssetRegistry.sol` trên blockchain.
3. Backend xác thực độc lập transaction receipt/event rồi đồng bộ trạng thái
   vào PostgreSQL.
4. Guest có thể xác minh tệp hoặc hash, xem metadata và provenance.
5. Chủ sở hữu có thể chuyển quyền; hệ thống lưu lại lịch sử và đối chiếu
   on-chain.

Công nghệ và công cụ dự kiến:

- **Smart contract:** Solidity `^0.8.24`, Hardhat, OpenZeppelin,
  ethers.js v6, Chai.
- **Backend:** NestJS, TypeScript, Prisma ORM, PostgreSQL 16, JWT, SIWE/
  EIP-4361 hoặc thông điệp chữ ký tương thích, Multer và ethers.js v6.
- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, ethers.js v6,
  MetaMask browser extension.
- **Vận hành cục bộ:** Docker Compose, Hardhat local EVM (chain ID `31337`),
  Adminer.
- **Kiểm thử:** Hardhat/Chai, Jest/NestJS Testing Module, API E2E và kiểm thử
  luồng trình duyệt khi môi trường cho phép.

Blockchain chỉ lưu `tokenId`, `contentHash`, địa chỉ ví, timestamp và URI;
password, private key, PII và file nhị phân chỉ được lưu ngoài chuỗi. Hệ
thống cung cấp bằng chứng kỹ thuật về tồn tại/tính toàn vẹn, không tuyên bố
thay thế văn bằng pháp lý về quyền sở hữu trí tuệ.

## Current Phase

**Phase 0 - Khảo sát và lập kế hoạch (complete); Phase 1 - Khởi tạo workspace
và nền tảng thực thi (pending).**

Đã kiểm chứng trong repository:

- Đã có `README.md`, các đặc tả kiến trúc/API/contract/ERD, `.env.example`,
  `.gitignore` và `docker-compose.yml`.
- Chưa có thư mục hoặc mã nguồn `contracts/`, `backend/`, `frontend/`.
- Chưa có bằng chứng về migration, contract deployment, API runtime, UI hoặc
  test implementation; các mục này không được đánh dấu hoàn thành trước khi
  chạy và kiểm tra thực tế.

## Roadmap & Detailed Task Checklist

### Phase 0 - Khảo sát hiện trạng và chốt phạm vi

**Status: complete**

- [x] **Task 0.1 - Kiểm kê repository và tài liệu hiện có:** Đọc README,
  architecture, ERD, API spec, contracts spec, Docker Compose, env template
  và gitignore; xác nhận repository mới chỉ có tài liệu/cấu hình.
- [x] **Task 0.2 - Xác định phạm vi MVP và Phase 2:** Chốt MVP gồm auth,
  wallet binding, upload/hash, đăng ký on-chain, receipt verification,
  public verification, provenance và transfer; đưa licensing, dispute
  workflow, worker sync và IPFS vào Phase 6.
- [x] **Task 0.3 - Xác định phụ thuộc kiến trúc:** Ghi nhận thứ tự bắt buộc
  `contract ABI/address -> database -> backend -> frontend -> tích hợp`,
  đồng thời phân định dữ liệu on-chain/off-chain và ranh giới bảo mật.

### Phase 1 - Khởi tạo workspace và môi trường phát triển

**Status: pending**

- [ ] **Task 1.1 - Chốt ma trận phiên bản và package boundary:** Ghi nhận
  phiên bản Node.js, npm/pnpm, Solidity, Hardhat, NestJS, Next.js, Prisma,
  PostgreSQL và OpenZeppelin; xác định workspace scripts và cách chạy từng
  package.
  **Phụ thuộc:** Task 0.1.
  **Đầu ra:** Các manifest/config nền tảng nhất quán, không có dependency
  không được sử dụng.
- [ ] **Task 1.2 - Khởi tạo Hardhat project:** Tạo `contracts/` với cấu hình
  TypeScript, network local chain `31337`, compiler `^0.8.24`, OpenZeppelin,
  test runner và script deploy.
  **Phụ thuộc:** Task 1.1.
  **Kiểm chứng:** `compile` và test command chạy được trên workspace mới.
- [ ] **Task 1.3 - Khởi tạo NestJS backend:** Tạo `backend/`, cấu hình
  TypeScript, lint/test, prefix `/api/v1`, validation pipe, CORS, error
  response chuẩn và cấu hình environment có kiểm tra giá trị bắt buộc.
  **Phụ thuộc:** Task 1.1.
- [ ] **Task 1.4 - Khởi tạo Prisma/PostgreSQL:** Tạo Prisma schema/migration
  bám ERD, enum trạng thái, index/unique constraint cần thiết và seed admin
  an toàn cho local.
  **Phụ thuộc:** Task 1.3.
  **Kiểm chứng:** `prisma validate`, migration trên PostgreSQL Docker và
  truy vấn seed thành công.
- [ ] **Task 1.5 - Khởi tạo Next.js frontend:** Tạo `frontend/` với App
  Router, TypeScript, Tailwind, API client, layout cơ bản và cấu hình env
  public/private đúng ranh giới.
  **Phụ thuộc:** Task 1.1.
- [ ] **Task 1.6 - Chuẩn hóa local runbook:** Cập nhật hướng dẫn chạy Hardhat
  node, deploy, PostgreSQL, backend và frontend; kiểm tra không để private key
  thật hoặc `.env` vào source control.
  **Phụ thuộc:** Task 1.2, Task 1.4, Task 1.5.

### Phase 2 - Smart contract AssetRegistry và bằng chứng on-chain

**Status: pending**

- [ ] **Task 2.1 - Triển khai cấu trúc contract:** Implement
  `AssetRegistry.sol` với ERC-721 URI storage, Ownable, Pausable, record
  asset, mapping hash duy nhất và các event theo `contracts_spec.md`.
  **Phụ thuộc:** Task 1.2.
- [ ] **Task 2.2 - Implement đăng ký và tra cứu:** Implement
  `registerAsset`, `getAssetByHash` và các getter cần thiết; bảo vệ input
  zero address/URI rỗng/hash zero/trùng hash; giữ token ID tăng tuần tự.
  **Phụ thuộc:** Task 2.1.
- [ ] **Task 2.3 - Implement revoke và access control:** Chỉ owner được
  revoke, lưu reason, phát event, hỗ trợ pause/unpause và định nghĩa rõ hành
  vi của các hàm khi paused hoặc token không tồn tại.
  **Phụ thuộc:** Task 2.1.
- [ ] **Task 2.4 - Viết unit test contract:** Kiểm tra mint, ownership,
  URI, hash uniqueness, event fields, timestamp, duplicate/invalid input,
  revoke authorization, pause và transfer ERC-721.
  **Phụ thuộc:** Task 2.2, Task 2.3.
- [ ] **Task 2.5 - Deploy và xuất artifact local:** Deploy vào Hardhat
  network, lấy ABI/address/chain ID cho backend/frontend, kiểm tra gọi read
  function từ client/provider.
  **Phụ thuộc:** Task 2.4.
- [ ] **Task 2.6 - Kiểm tra chuẩn hash:** Xác nhận SHA-256 binary từ backend
  được chuyển ổn định thành `bytes32`, không nhầm với hash chuỗi hex hoặc
  thay đổi chữ hoa/thường.
  **Phụ thuộc:** Task 2.2, Task 2.5.

### Phase 3 - Backend core, dữ liệu và xác thực

**Status: pending**

- [ ] **Task 3.1 - Hoàn thiện schema và service dữ liệu:** Implement Prisma
  repositories/services cho User, CreatorProfile, Asset,
  OwnershipHistory, DisputeReport và BlockchainSyncLog; áp dụng unique/index,
  transaction boundary và trạng thái chuyển hợp lệ.
  **Phụ thuộc:** Task 1.4, Task 2.5.
- [ ] **Task 3.2 - Implement đăng ký/đăng nhập JWT:** Hash password bằng
  thư viện chuẩn, validate DTO, không trả passwordHash, phát access token,
  kiểm tra user status và RBAC guard cho USER/CREATOR/ADMIN.
  **Phụ thuộc:** Task 3.1.
- [ ] **Task 3.3 - Implement wallet challenge/binding:** Sinh nonce đủ ngẫu
  nhiên, tạo message có domain/chain/time phù hợp, verify chữ ký bằng
  ethers, chống replay, chuẩn hóa địa chỉ và xử lý wallet đã gắn với tài
  khoản khác.
  **Phụ thuộc:** Task 3.2.
- [ ] **Task 3.4 - Implement upload và fingerprint:** Giới hạn kích thước,
  MIME/extension theo chính sách, lưu file ngoài database với tên an toàn,
  tính SHA-256 theo binary stream, tạo temp file có cleanup/expiry và trả
  duplicate result chính xác.
  **Phụ thuộc:** Task 3.1.
- [ ] **Task 3.5 - Implement prepare-registration:** Kiểm tra quyền sở hữu
  temp file, duplicate ở DB và on-chain, tạo metadata URI ổn định, ghi asset
  `DRAFT`/`PENDING_ONCHAIN` theo transaction boundary và không nhận hash do
  client khai báo thay cho hash đã tính.
  **Phụ thuộc:** Task 3.4, Task 2.5.
- [ ] **Task 3.6 - Implement confirm-registration:** Lấy receipt từ đúng
  RPC/chain, kiểm tra transaction success, contract address, sender/receiver,
  event `AssetRegistered`, tokenId/hash/creator và idempotency trước khi cập
  nhật `REGISTERED`; ghi lỗi rõ ràng khi receipt không hợp lệ.
  **Phụ thuộc:** Task 3.5.
- [ ] **Task 3.7 - Implement public asset query/detail:** Tạo list có
  pagination giới hạn, search/category/status filter, detail metadata,
  owner hiện tại, on-chain đối chiếu và provenance; không làm lộ file hoặc
  dữ liệu riêng tư ngoài chính sách public.
  **Phụ thuộc:** Task 3.1, Task 3.6.
- [ ] **Task 3.8 - Implement integrity verification:** Nhận file hoặc hash,
  tính hash server-side, truy vấn DB và contract song song, trả các trạng
  thái valid/unregistered/modified/flagged/revoked cùng bằng chứng kiểm tra.
  **Phụ thuộc:** Task 3.6, Task 3.7.
- [ ] **Task 3.9 - Implement transfer confirmation và history:** Xác thực
  event `Transfer` độc lập, kiểm tra token/địa chỉ đích/transaction chain,
  cập nhật owner và append OwnershipHistory idempotently; hỗ trợ timeline
  MINT/TRANSFER/REVOKE.
  **Phụ thuộc:** Task 2.4, Task 3.6.
- [ ] **Task 3.10 - Viết backend unit/integration tests:** Test DTO/guard/
  service/repository, invalid auth, replay signature, upload limit,
  duplicate hash, malformed receipt, wrong chain/contract/event, retry
  idempotency và các trạng thái lỗi database/RPC.
  **Phụ thuộc:** Task 3.2 đến Task 3.9.

### Phase 4 - Frontend MVP và trải nghiệm người dùng

**Status: pending**

- [ ] **Task 4.1 - Xây dựng app shell và API state:** Tạo navigation, auth
  session, typed API client, loading/error/empty states, route protection và
  thông báo lỗi không làm lộ secret/RPC nội bộ.
  **Phụ thuộc:** Task 1.5, Task 3.2.
- [ ] **Task 4.2 - Xây dựng auth và wallet binding UI:** Implement register,
  login, connect MetaMask, nonce/message signing, bind wallet, xử lý chain
  mismatch, user reject và account change.
  **Phụ thuộc:** Task 3.3, Task 4.1.
- [ ] **Task 4.3 - Xây dựng Integrity Verifier public:** Cho kéo-thả/chọn
  file hoặc nhập hash, hiển thị progress, kết quả valid/modified/
  unregistered/flagged/revoked, token/creator/owner/time và provenance link.
  **Phụ thuộc:** Task 3.8, Task 4.1.
- [ ] **Task 4.4 - Xây dựng registration flow:** Implement upload preview,
  metadata form, duplicate warning, prepare API, gọi `registerAsset` bằng
  MetaMask, chờ mined và confirm API; hiển thị retry/cancel/failure rõ ràng.
  **Phụ thuộc:** Task 2.5, Task 3.5, Task 3.6, Task 4.2.
- [ ] **Task 4.5 - Xây dựng asset explorer/detail/provenance:** Implement
  pagination/search/filter, detail, on-chain status và timeline; phân biệt
  dữ liệu stale, pending và confirmed.
  **Phụ thuộc:** Task 3.7, Task 3.9.
- [ ] **Task 4.6 - Xây dựng transfer UI:** Cho phép đúng owner chọn địa chỉ
  đích hợp lệ, ký transfer, gửi confirm, hiển thị pending và không cập nhật
  thành công nếu receipt/event không đạt kiểm tra.
  **Phụ thuộc:** Task 3.9, Task 4.2.
- [ ] **Task 4.7 - Kiểm thử frontend:** Kiểm tra form validation, wallet
  rejection, wrong network, upload lỗi, transaction pending/reverted,
  refresh sau confirm, responsive và keyboard accessibility trên các màn MVP.
  **Phụ thuộc:** Task 4.2 đến Task 4.6.

### Phase 5 - Tích hợp hệ thống, bảo mật và release MVP

**Status: pending**

- [ ] **Task 5.1 - Dựng môi trường tích hợp reproducible:** Chạy PostgreSQL,
  Hardhat node/deploy, backend và frontend theo runbook; kiểm tra env
  separation, health checks và contract address/ABI đồng nhất.
  **Phụ thuộc:** Task 1.6, Task 2.5, Task 3.10, Task 4.7.
- [ ] **Task 5.2 - Kiểm thử acceptance end-to-end:** Thực hiện kịch bản
  register/login/bind wallet, upload/register/mint/confirm, public verify,
  modified file, duplicate file, transfer/history và revoke/flag outcome.
  **Phụ thuộc:** Task 5.1.
- [ ] **Task 5.3 - Kiểm tra lỗi và khôi phục:** Kiểm tra restart backend,
  RPC unavailable, transaction reverted, duplicate callback, DB failure,
  temp upload cleanup, partial registration và retry không tạo bản ghi
  hoặc token trùng.
  **Phụ thuộc:** Task 5.2.
- [ ] **Task 5.4 - Rà soát bảo mật MVP:** Kiểm tra secret leakage, private key
  scope local-only, password hashing, JWT expiry, RBAC, nonce replay,
  upload traversal/type spoofing, rate/size limits, CORS, SQL/ORM input và
  không đưa PII/file binary lên chain.
  **Phụ thuộc:** Task 3.10, Task 4.7, Task 5.2.
- [ ] **Task 5.5 - Chạy quality gates:** Chạy compile, lint, type-check,
  contract unit tests, backend tests, frontend tests/build và kiểm tra
  coverage/known failures; sửa chỉ các lỗi thuộc phạm vi MVP.
  **Phụ thuộc:** Task 5.2 đến Task 5.4.
- [ ] **Task 5.6 - Hoàn thiện tài liệu vận hành:** Cập nhật README và các
  spec liên quan theo implementation thực tế, bổ sung API examples, local
  deployment, seed accounts, troubleshooting và giới hạn pháp lý; không đánh
  dấu task nếu tài liệu chưa khớp runtime.
  **Phụ thuộc:** Task 5.5.

### Phase 6 - Nghiệp vụ nâng cao sau MVP

**Status: pending**

- [ ] **Task 6.1 - Chốt thiết kế licensing:** Phân tích lại quyền owner/
  licensee, thời hạn, loại license, phí, revoke và dữ liệu cần on-chain hay
  off-chain trước khi code `AssetLicensing.sol`.
  **Phụ thuộc:** Task 5.6.
- [ ] **Task 6.2 - Implement AssetLicensing và test:** Xây dựng contract,
  access control, expiry, revoke và test các trường hợp owner transfer,
  license overlap, invalid dates và payment nếu được phê duyệt.
  **Phụ thuộc:** Task 6.1.
- [ ] **Task 6.3 - Implement licensing backend/frontend:** Migration,
  APIs issue/list/revoke, authorization, terms URI, dashboard và timeline;
  kiểm tra license không thay đổi ownership token.
  **Phụ thuộc:** Task 6.2.
- [ ] **Task 6.4 - Implement admin dispute workflow:** Tạo API/UI nhận
  dispute, evidence access control, review/resolve, flag/revoke đồng bộ DB
  và contract, audit trail và trạng thái verify tương ứng.
  **Phụ thuộc:** Task 3.7, Task 5.6, Task 6.2.
- [ ] **Task 6.5 - Implement blockchain event worker:** Thiết kế cursor từ
  `BlockchainSyncLog`, scan block range an toàn, deduplicate event, retry/
  reorg policy và reconcile ownership/registration khi backend restart.
  **Phụ thuộc:** Task 3.9, Task 5.3.
- [ ] **Task 6.6 - Tích hợp IPFS có kiểm soát:** Chọn Pinata/Kubo, pin
  metadata/file phù hợp, lưu CID, fallback/error policy, privacy/retention
  và kiểm thử không làm hỏng local storage hoặc verification.
  **Phụ thuộc:** Task 6.5 và quyết định kiến trúc được ghi nhận.
- [ ] **Task 6.7 - Acceptance Phase 2:** Kiểm thử licensing, dispute,
  worker restart/reorg và IPFS unavailable; cập nhật tài liệu và trạng thái
  phase theo bằng chứng runtime.
  **Phụ thuộc:** Task 6.3 đến Task 6.6.

## Status Summary

| Phase | Phạm vi | Status |
|---|---|---|
| Phase 0 | Khảo sát, phân tích, chốt phạm vi | complete |
| Phase 1 | Workspace và môi trường | pending |
| Phase 2 | AssetRegistry và on-chain proof | pending |
| Phase 3 | Backend, database, auth, verification | pending |
| Phase 4 | Frontend MVP | pending |
| Phase 5 | Tích hợp, bảo mật, release MVP | pending |
| Phase 6 | Licensing, dispute, worker, IPFS | pending |

## Final Acceptance

Chỉ nghiệm thu khi các bằng chứng sau đã tồn tại và các checkbox liên quan
được cập nhật sau khi kiểm chứng thực tế:

1. **Build và môi trường:** Có thể dựng lại PostgreSQL/Hardhat/backend/
   frontend từ hướng dẫn; compile, migration, type-check, lint và production
   build đều thành công.
2. **Contract:** Unit tests pass cho mint, duplicate hash, ownership,
   transfer, revoke, pause, access control và event payload; address/ABI
   đúng chain `31337`.
3. **API và dữ liệu:** Auth/RBAC/wallet challenge không replay được; upload
   hash đúng binary; transaction receipt/event được verify độc lập; các
   endpoint trả đúng status/error và thao tác retry không tạo duplicate.
4. **MVP E2E:** Một creator có thể đăng ký và mint tài sản; Guest verify được
   file nguyên bản, file đã sửa và hash chưa đăng ký; detail hiển thị
   provenance; owner transfer thành công và history cập nhật đúng.
5. **Ngoại lệ quan trọng:** Duplicate asset, file vượt giới hạn, MIME giả,
   account/wallet sai, chain sai, user từ chối MetaMask, RPC/database down,
   transaction revert, receipt sai contract/event và backend restart đều có
   thông báo lỗi rõ ràng, không ghi trạng thái thành công giả.
6. **Bảo mật và dữ liệu:** Không có secret/private key thật trong git; không
   có password, PII nhạy cảm hoặc file binary on-chain; file path được
   sandbox; JWT, nonce, RBAC, CORS và input validation đã được test.
7. **Tài liệu và bàn giao:** README, API/architecture/ERD/contracts spec phản
   ánh implementation; có lệnh chạy, biến môi trường, seed local, địa chỉ
   contract, test commands, troubleshooting và danh sách giới hạn đã biết.
8. **Phase 2 (nếu được triển khai):** Licensing, dispute, worker và IPFS chỉ
   được nghiệm thu riêng sau khi có test/acceptance tương ứng; không xem các
   mục này là điều kiện hoàn thành MVP nếu chưa đưa vào release scope.

