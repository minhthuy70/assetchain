// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ==============================================================================
// 1. IMPORT CÁC THƯ VIỆN CHUẨN CÔNG NGHIỆP TỪ OPENZEPPELIN
// ==============================================================================

// Thư viện chuẩn ERC-721 có hỗ trợ quản lý Metadata URI cho từng Token ID riêng biệt
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Thư viện cung cấp cơ chế phân quyền: chỉ có ví Người sở hữu (Owner/Admin) mới được gọi hàm
import "@openzeppelin/contracts/access/Ownable.sol";

// Thư viện cơ chế cầu dao dừng khẩn cấp (Circuit Breaker) khi có sự cố kỹ thuật hoặc bảo trì
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AssetRegistry - Hợp Đồng Thông Minh Quản Lý Bản Quyền Tài Sản Số
 * @notice Hợp đồng lõi phục vụ bảo chứng quyền tác giả (Proof of Existence) trên EVM:
 *         1. Mint NFT ERC-721 đại diện quyền sở hữu độc bản cho tác phẩm số.
 *         2. Lưu trữ mã băm SHA-256 (dạng bytes32) bất biến kèm mốc thời gian (timestamp).
 *         3. Cung cấp hàm tra cứu 1-Click Verification miễn phí Gas cho cộng đồng.
 *         4. Hỗ trợ chuyển nhượng quyền sở hữu minh bạch và cơ chế thu hồi khi vi phạm.
 */
contract AssetRegistry is ERC721URIStorage, Ownable, Pausable {

    // Biến đếm nội bộ tự tăng để sinh Token ID tuần tự (1, 2, 3...)
    uint256 private _nextTokenId;

    // ==============================================================================
    // 2. ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU ON-CHAIN (STRUCT)
    // ==============================================================================
    /**
     * @dev Bản ghi thông tin pháp lý & kỹ thuật của tài sản được khắc dấu trên Blockchain.
     *      LƯU Ý THIẾT KẾ: Ta dùng `bytes32` thay vì `string` cho contentHash vì:
     *      - Mã SHA-256 có độ dài cố định 32 bytes (256 bits).
     *      - Lưu dạng `bytes32` giúp tiết kiệm hơn 85% phí Gas so với kiểu `string` động.
     */
    struct AssetRecord {
        uint256 tokenId;           // Mã định danh duy nhất của NFT tác phẩm
        bytes32 contentHash;       // Mã băm SHA-256 đại diện cho file gốc (dấu vân tay số)
        address creator;           // Địa chỉ ví của tác giả nộp hồ sơ ban đầu
        uint256 registeredAt;      // Mốc thời gian đưa lên chuỗi (block.timestamp)
        bool isRevoked;            // Cờ đánh dấu: true = Đã bị cơ quan quản trị thu hồi
        string revocationReason;   // Lý do thu hồi bản quyền nếu có tranh chấp hoặc vi phạm
    }

    // ==============================================================================
    // 3. CÁC BẢNG ÁNH XẠ DỮ LIỆU (STORAGE MAPPINGS)
    // ==============================================================================

    // Bảng 1: Tra cứu thông tin chi tiết tài sản dựa theo Token ID (Token ID => AssetRecord)
    mapping(uint256 => AssetRecord) public assets;

    // Bảng 2: Ánh xạ ngược từ mã băm file sang Token ID (Mã băm => Token ID)
    // Giúp cổng xác minh tìm thấy tác phẩm chỉ trong 1 thao tác đọc O(1)
    mapping(bytes32 => uint256) public hashToTokenId;

    // Bảng 3: Cờ đánh dấu kiểm tra nhanh mã băm đã được đăng ký hay chưa
    // Đảm bảo tính độc nhất: Tuyệt đối không cho phép 1 file bị đăng ký 2 lần (Anti-Duplication)
    mapping(bytes32 => bool) public isHashRegistered;

    // ==============================================================================
    // 4. SỰ KIỆN HỆ THỐNG (EVENTS - PHỤC VỤ THEO DÕI VÀ LẮNG NGHE OFF-CHAIN)
    // ==============================================================================
    // Khi một hàm phát ra (emit) Event, dữ liệu sẽ được ghi vào Transaction Receipt Logs.
    // Frontend (Ethers.js) hoặc Backend có thể lắng nghe các event này để tự động cập nhật UI.

    // Sự kiện 1: Đăng ký và mint NFT thành công
    event AssetRegistered(
        uint256 indexed tokenId,       // Có `indexed` để có thể lọc (filter) tìm kiếm nhanh
        address indexed creator,       // Địa chỉ ví tác giả
        bytes32 indexed contentHash,   // Mã băm SHA-256 của file
        string tokenURI,               // Đường dẫn Metadata JSON
        uint256 timestamp              // Thời điểm giao dịch được đóng block
    );

    // Sự kiện 2: Chuyển nhượng quyền sở hữu tài sản sang ví mới
    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // Sự kiện 3: Hội đồng quản trị thu hồi chứng nhận do vi phạm bản quyền
    event AssetRevoked(
        uint256 indexed tokenId,
        address indexed admin,
        string reason,
        uint256 timestamp
    );

    // ==============================================================================
    // 5. HÀM KHỞI TẠO (CONSTRUCTOR)
    // ==============================================================================
    /**
     * @dev Chạy 1 lần duy nhất khi hợp đồng được Deploy lên mạng Blockchain.
     *      - Tên Token: "AssetChain Digital Asset"
     *      - Ký hiệu mã Token: "ASSET"
     *      - Gán quyền Admin (Ownable) cho chính địa chỉ ví vừa bấm Deploy (msg.sender)
     *      - Khởi tạo Token ID bắt đầu từ số 1
     */
    constructor() ERC721("AssetChain Digital Asset", "ASSET") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    // ==============================================================================
    // 6. CÁC HÀM NGHIỆP VỤ CHÍNH (CORE BUSINESS FUNCTIONS)
    // ==============================================================================

    /**
     * @notice Đăng ký tài sản số mới lên Blockchain và mint NFT ERC-721 cho tác giả.
     * @dev Luồng hoạt động:
     *      1. Kiểm tra tính hợp lệ của tham số đầu vào bằng các lệnh `require`.
     *      2. Tăng biến đếm `_nextTokenId`.
     *      3. Lưu bản ghi `AssetRecord` vào mảng băm `assets`.
     *      4. Lưu ánh xạ `contentHash` để chống trùng lặp.
     *      5. Gọi `_safeMint` để đúc NFT cho ví tác giả.
     *      6. Gọi `_setTokenURI` để gắn link JSON metadata.
     *      7. Phát event `AssetRegistered` để thông báo cho toàn hệ thống.
     * @param to Địa chỉ ví tác giả sẽ sở hữu NFT sau khi mint
     * @param uri Chuỗi URI (hoặc JSON metadata) chứa thông tin tác phẩm
     * @param contentHash Mã băm nhị phân 32 bytes (SHA-256) của tác phẩm gốc
     * @return currentId Token ID vừa được cấp phát
     */
    function registerAsset(
        address to,
        string memory uri,
        bytes32 contentHash
    ) external whenNotPaused returns (uint256) {
        // [Kiểm tra an toàn 1]: Địa chỉ người nhận không được là địa chỉ rỗng 0x0
        require(to != address(0), "Invalid recipient");

        // [Kiểm tra an toàn 2]: Metadata URI không được để trống
        require(bytes(uri).length > 0, "URI cannot be empty");

        // [Kiểm tra an toàn 3]: Mã băm phải hợp lệ (khác 0x00...00)
        require(contentHash != bytes32(0), "Invalid hash");

        // [Kiểm tra an toàn 4]: Cơ chế chống gian lận & trùng lặp (Anti-Duplication)
        // Nếu mã băm này đã từng được đưa lên chuỗi thì lập tức đảo ngược giao dịch (Revert)
        require(!isHashRegistered[contentHash], "Hash already registered on-chain");

        // Cấp phát Token ID kế tiếp
        uint256 currentId = _nextTokenId;
        _nextTokenId++;

        // Khởi tạo bản ghi dữ liệu on-chain
        assets[currentId] = AssetRecord({
            tokenId: currentId,
            contentHash: contentHash,
            creator: to,
            registeredAt: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        // Đánh dấu bảng tra cứu ngược và khóa mã băm này lại
        hashToTokenId[contentHash] = currentId;
        isHashRegistered[contentHash] = true;

        // Đúc NFT chuẩn ERC-721 vào ví người nhận một cách an toàn
        _safeMint(to, currentId);

        // Gắn đường dẫn metadata vào Token ID
        _setTokenURI(currentId, uri);

        // Bắn sự kiện ra Blockchain
        emit AssetRegistered(currentId, to, contentHash, uri, block.timestamp);

        return currentId;
    }

    /**
     * @notice Cổng xác minh 1-Click Verification: Tra cứu trực tiếp thông tin bằng mã băm SHA-256.
     * @dev ĐẶC ĐIỂM QUAN TRỌNG:
     *      Hàm này có từ khóa `external view`, nghĩa là CHỈ ĐỌC dữ liệu từ Blockchain mà không thay đổi trạng thái.
     *      => Bất kỳ người dùng vãng lai nào gọi hàm này đều HOÀN TOÀN MIỄN PHÍ GAS (0 Gas Fee),
     *      không cần kết nối ví MetaMask và không cần có tài khoản trong hệ thống!
     * @param contentHash Mã băm SHA-256 (bytes32) của file ảnh/tài liệu cần kiểm định
     * @return tokenId Mã số NFT của tác phẩm
     * @return creator Địa chỉ ví của tác giả gốc đã đăng ký
     * @return currentOwner Địa chỉ ví của chủ sở hữu hiện tại (tính đến thời điểm hiện tại)
     * @return registeredAt Mốc thời gian được khắc dấu trên Blockchain
     * @return isRevoked Trạng thái: false = Hợp lệ, true = Đã bị thu hồi do vi phạm
     * @return uri Đường dẫn Metadata JSON của tác phẩm
     */
    function getAssetByHash(bytes32 contentHash) external view returns (
        uint256 tokenId,
        address creator,
        address currentOwner,
        uint256 registeredAt,
        bool isRevoked,
        string memory uri
    ) {
        // Kiểm tra xem mã băm này có tồn tại trong hệ thống Blockchain không
        require(isHashRegistered[contentHash], "Asset hash not found");

        // Tìm Token ID thông qua bảng ánh xạ ngược
        uint256 id = hashToTokenId[contentHash];
        AssetRecord memory item = assets[id];

        // Trả về đầy đủ dữ liệu xác thực
        return (
            item.tokenId,
            item.creator,
            ownerOf(id),          // Lấy chủ sở hữu hiện thời từ hợp đồng ERC-721
            item.registeredAt,
            item.isRevoked,
            tokenURI(id)          // Lấy metadata URI từ ERC721URIStorage
        );
    }

    /**
     * @notice Tra cứu toàn bộ thông tin tài sản dựa theo Token ID.
     * @dev Tương tự như hàm getAssetByHash, hàm này là `external view` nên tốn 0 Gas.
     * @param tokenId Mã ID của NFT cần xem
     */
    function getAssetById(uint256 tokenId) external view returns (
        AssetRecord memory record,
        address currentOwner,
        string memory uri
    ) {
        // Kiểm tra Token ID này có tồn tại hay không bằng hàm nội bộ _ownerOf
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        return (assets[tokenId], ownerOf(tokenId), tokenURI(tokenId));
    }

    /**
     * @notice Chuyển nhượng quyền sở hữu tài sản số sang địa chỉ ví mới.
     * @dev Chỉ có chủ sở hữu hợp pháp hiện tại của tác phẩm (`ownerOf(tokenId) == msg.sender`)
     *      mới có quyền gọi hàm này. Giao dịch chuyển giao NFT và phát sự kiện AssetTransferred.
     * @param to Địa chỉ ví người nhận mới
     * @param tokenId Mã ID của tài sản cần bàn giao
     */
    function transferAsset(address to, uint256 tokenId) external whenNotPaused {
        // [Xác thực quyền]: Người gọi hàm (msg.sender) bắt buộc phải là chủ sở hữu tác phẩm
        require(ownerOf(tokenId) == msg.sender, "Caller is not asset owner");

        // [Kiểm tra địa chỉ]: Không được gửi vào ví đốt 0x0
        require(to != address(0), "Cannot transfer to zero address");

        // Thực hiện chuyển nhượng NFT ERC-721 an toàn
        safeTransferFrom(msg.sender, to, tokenId);

        // Bắn sự kiện chuyển nhượng để cập nhật chuỗi sở hữu (Provenance Timeline)
        emit AssetTransferred(tokenId, msg.sender, to, block.timestamp);
    }

    /**
     * @notice Thu hồi chứng nhận bản quyền khi phát hiện hồ sơ gian lận hoặc có tranh chấp pháp lý.
     * @dev ĐẶC TÍNH BẢO VỆ DỮ LIỆU:
     *      - Chỉ có Hội đồng Quản trị / Admin Deployer (`onlyOwner`) mới được quyền thu hồi.
     *      - Ta KHÔNG dùng hàm `_burn` (đốt token) vì việc đốt token sẽ làm mất dấu tích lịch sử.
     *        Thay vào đó, ta đánh dấu `isRevoked = true` và ghi nhận rõ `reason`. Nhờ vậy, cổng tra cứu
     *        và file PDF vẫn có thể cảnh báo rõ ràng cho công chúng biết tác phẩm này đã bị thu hồi vì lý do gì.
     * @param tokenId Mã ID của tài sản bị thu hồi
     * @param reason Lý do thu hồi (VD: "Phát hiện sao chép tranh phong cảnh của họa sĩ khác")
     */
    function revokeAsset(uint256 tokenId, string memory reason) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");

        // Cập nhật trạng thái thu hồi
        assets[tokenId].isRevoked = true;
        assets[tokenId].revocationReason = reason;

        // Bắn sự kiện thu hồi on-chain
        emit AssetRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    // ==============================================================================
    // 7. CƠ CHẾ DỪNG KHẨN CẤP (EMERGENCY CIRCUIT BREAKER)
    // ==============================================================================

    /**
     * @notice Tạm dừng toàn bộ các thao tác ghi dữ liệu (Mint, Transfer) khi hệ thống gặp sự cố.
     * @dev Chỉ Admin (`onlyOwner`) mới được gọi hàm này.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Mở lại hoạt động bình thường sau khi bảo trì hoặc xử lý sự cố xong.
     * @dev Chỉ Admin (`onlyOwner`) mới được gọi hàm này.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
