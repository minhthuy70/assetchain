// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AssetRegistry
 * @dev Hợp đồng thông minh lõi của hệ thống AssetChain:
 *      - Kế thừa tiêu chuẩn ERC-721 với URIStorage để quản lý Metadata
 *      - Lưu vết mốc thời gian và mã băm SHA-256 (bytes32) phục vụ Proof of Existence
 *      - Kiểm soát quyền quản trị thông qua Ownable và tạm dừng hệ thống qua Pausable
 */
contract AssetRegistry is ERC721URIStorage, Ownable, Pausable {
    uint256 private _nextTokenId;

    struct AssetRecord {
        uint256 tokenId;
        bytes32 contentHash;
        address creator;
        uint256 registeredAt;
        bool isRevoked;
        string revocationReason;
    }

    // Mapping từ tokenId sang AssetRecord chi tiết
    mapping(uint256 => AssetRecord) public assets;

    // Mapping từ contentHash sang tokenId (chống trùng lặp tuyệt đối on-chain)
    mapping(bytes32 => uint256) public hashToTokenId;

    // Kiểm tra nhanh hash đã tồn tại hay chưa
    mapping(bytes32 => bool) public isHashRegistered;

    // Sự kiện khi tài sản được đăng ký và mint thành công
    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 indexed contentHash,
        string tokenURI,
        uint256 timestamp
    );

    // Sự kiện khi quyền sở hữu tài sản được chuyển nhượng
    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // Sự kiện khi tài sản bị cơ quan quản trị thu hồi
    event AssetRevoked(
        uint256 indexed tokenId,
        address indexed admin,
        string reason,
        uint256 timestamp
    );

    constructor() ERC721("AssetChain Digital Asset", "ASSET") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @notice Đăng ký tài sản số mới lên Blockchain và mint NFT cho tác giả
     * @param to Địa chỉ ví người thụ hưởng/tác giả
     * @param uri Đường dẫn metadata JSON của tài sản
     * @param contentHash Mã băm SHA-256 nhị phân (32 bytes) của file gốc
     */
    function registerAsset(
        address to,
        string memory uri,
        bytes32 contentHash
    ) external whenNotPaused returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(contentHash != bytes32(0), "Invalid hash");
        require(!isHashRegistered[contentHash], "Hash already registered on-chain");

        uint256 currentId = _nextTokenId;
        _nextTokenId++;

        assets[currentId] = AssetRecord({
            tokenId: currentId,
            contentHash: contentHash,
            creator: to,
            registeredAt: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        hashToTokenId[contentHash] = currentId;
        isHashRegistered[contentHash] = true;

        _safeMint(to, currentId);
        _setTokenURI(currentId, uri);

        emit AssetRegistered(currentId, to, contentHash, uri, block.timestamp);
        return currentId;
    }

    /**
     * @notice Hàm tra cứu 0 Gas theo mã băm file (dùng cho cổng xác minh 1-Click)
     * @param contentHash Mã băm SHA-256 của file cần kiểm định
     */
    function getAssetByHash(bytes32 contentHash) external view returns (
        uint256 tokenId,
        address creator,
        address currentOwner,
        uint256 registeredAt,
        bool isRevoked,
        string memory uri
    ) {
        require(isHashRegistered[contentHash], "Asset hash not found");
        uint256 id = hashToTokenId[contentHash];
        AssetRecord memory item = assets[id];
        return (
            item.tokenId,
            item.creator,
            ownerOf(id),
            item.registeredAt,
            item.isRevoked,
            tokenURI(id)
        );
    }

    /**
     * @notice Tra cứu chi tiết tài sản theo Token ID
     * @param tokenId ID của tài sản NFT
     */
    function getAssetById(uint256 tokenId) external view returns (
        AssetRecord memory record,
        address currentOwner,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        return (assets[tokenId], ownerOf(tokenId), tokenURI(tokenId));
    }

    /**
     * @notice Chuyển nhượng quyền sở hữu tài sản an toàn
     * @param to Địa chỉ ví người nhận mới
     * @param tokenId ID của tài sản cần chuyển nhượng
     */
    function transferAsset(address to, uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Caller is not asset owner");
        require(to != address(0), "Cannot transfer to zero address");
        safeTransferFrom(msg.sender, to, tokenId);
        emit AssetTransferred(tokenId, msg.sender, to, block.timestamp);
    }

    /**
     * @notice Thu hồi tài sản khi phát hiện vi phạm bản quyền (Chỉ Admin Deployer)
     * @param tokenId ID tài sản cần thu hồi
     * @param reason Lý do thu hồi minh bạch
     */
    function revokeAsset(uint256 tokenId, string memory reason) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        assets[tokenId].isRevoked = true;
        assets[tokenId].revocationReason = reason;
        emit AssetRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Quản trị tạm dừng khẩn cấp
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Mở lại hoạt động bình thường
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
