const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetRegistry Smart Contract - Comprehensive Test Suite", function () {
  let assetRegistry;
  let owner, creator, buyer, attacker;
  const sampleHash1 = ethers.keccak256(ethers.toUtf8Bytes("Test Artwork Sen Vang 1"));
  const sampleHash2 = ethers.keccak256(ethers.toUtf8Bytes("Test Artwork Sen Vang 2"));
  const sampleUri1 = "https://assetchain.local/metadata/1.json";
  const sampleUri2 = "https://assetchain.local/metadata/2.json";

  beforeEach(async function () {
    [owner, creator, buyer, attacker] = await ethers.getSigners();
    const AssetRegistryFactory = await ethers.getContractFactory("AssetRegistry");
    assetRegistry = await AssetRegistryFactory.deploy();
    await assetRegistry.waitForDeployment();
  });

  describe("1. Deployment & Initialization", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await assetRegistry.name()).to.equal("AssetChain Digital Asset");
      expect(await assetRegistry.symbol()).to.equal("ASSET");
    });

    it("Should assign deployer as the owner", async function () {
      expect(await assetRegistry.owner()).to.equal(owner.address);
    });
  });

  describe("2. Asset Registration & Proof of Existence", function () {
    it("Should register a new asset and mint tokenId 1", async function () {
      const tx = await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
      await expect(tx)
        .to.emit(assetRegistry, "AssetRegistered")
        .withArgs(1, creator.address, sampleHash1, sampleUri1, (val) => val > 0);

      expect(await assetRegistry.ownerOf(1)).to.equal(creator.address);
      expect(await assetRegistry.tokenURI(1)).to.equal(sampleUri1);
      expect(await assetRegistry.isHashRegistered(sampleHash1)).to.equal(true);
      expect(await assetRegistry.hashToTokenId(sampleHash1)).to.equal(1);
    });

    it("Should increment tokenId sequentially for multiple assets", async function () {
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
      await assetRegistry.connect(buyer).registerAsset(buyer.address, sampleUri2, sampleHash2);

      expect(await assetRegistry.ownerOf(1)).to.equal(creator.address);
      expect(await assetRegistry.ownerOf(2)).to.equal(buyer.address);
    });

    it("Should REVERT if registering the exact same hash twice (Anti-Duplication)", async function () {
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);

      await expect(
        assetRegistry.connect(attacker).registerAsset(attacker.address, "fake-uri", sampleHash1)
      ).to.be.revertedWith("Hash already registered on-chain");
    });

    it("Should REVERT if recipient address is address(0)", async function () {
      await expect(
        assetRegistry.registerAsset(ethers.ZeroAddress, sampleUri1, sampleHash1)
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should REVERT if URI is empty string", async function () {
      await expect(
        assetRegistry.registerAsset(creator.address, "", sampleHash1)
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should REVERT if hash is bytes32(0)", async function () {
      await expect(
        assetRegistry.registerAsset(creator.address, sampleUri1, ethers.ZeroHash)
      ).to.be.revertedWith("Invalid hash");
    });
  });

  describe("3. 1-Click Verification & View Functions", function () {
    beforeEach(async function () {
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
    });

    it("Should return correct record via getAssetByHash without gas", async function () {
      const res = await assetRegistry.getAssetByHash(sampleHash1);
      expect(res.tokenId).to.equal(1);
      expect(res.creator).to.equal(creator.address);
      expect(res.currentOwner).to.equal(creator.address);
      expect(res.isRevoked).to.equal(false);
      expect(res.uri).to.equal(sampleUri1);
    });

    it("Should REVERT getAssetByHash if hash is not registered", async function () {
      const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("Unknown Asset"));
      await expect(assetRegistry.getAssetByHash(unknownHash)).to.be.revertedWith(
        "Asset hash not found"
      );
    });

    it("Should return correct record via getAssetById", async function () {
      const [record, currentOwner, uri] = await assetRegistry.getAssetById(1);
      expect(record.tokenId).to.equal(1);
      expect(record.contentHash).to.equal(sampleHash1);
      expect(record.creator).to.equal(creator.address);
      expect(currentOwner).to.equal(creator.address);
      expect(uri).to.equal(sampleUri1);
    });

    it("Should REVERT getAssetById for non-existent tokenId", async function () {
      await expect(assetRegistry.getAssetById(999)).to.be.revertedWith(
        "Asset does not exist"
      );
    });
  });

  describe("4. Ownership Transfer", function () {
    beforeEach(async function () {
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
    });

    it("Should allow asset owner to transfer ownership", async function () {
      const tx = await assetRegistry.connect(creator).transferAsset(buyer.address, 1);
      await expect(tx)
        .to.emit(assetRegistry, "AssetTransferred")
        .withArgs(1, creator.address, buyer.address, (val) => val > 0);

      expect(await assetRegistry.ownerOf(1)).to.equal(buyer.address);

      // Verify that getAssetByHash now reflects the new owner
      const res = await assetRegistry.getAssetByHash(sampleHash1);
      expect(res.creator).to.equal(creator.address); // Creator stays immutable
      expect(res.currentOwner).to.equal(buyer.address); // Owner updated
    });

    it("Should REVERT transfer if caller is not the owner", async function () {
      await expect(
        assetRegistry.connect(attacker).transferAsset(attacker.address, 1)
      ).to.be.revertedWith("Caller is not asset owner");
    });

    it("Should REVERT transfer to address(0)", async function () {
      await expect(
        assetRegistry.connect(creator).transferAsset(ethers.ZeroAddress, 1)
      ).to.be.revertedWith("Cannot transfer to zero address");
    });

    it("Should REVERT transfer to oneself (Cannot transfer to yourself)", async function () {
      await expect(
        assetRegistry.connect(creator).transferAsset(creator.address, 1)
      ).to.be.revertedWith("Cannot transfer to yourself");
    });

    it("Should REVERT transfer if asset has been revoked (transfers are frozen)", async function () {
      await assetRegistry.connect(owner).revokeAsset(1, "Legal dispute");

      await expect(
        assetRegistry.connect(creator).transferAsset(buyer.address, 1)
      ).to.be.revertedWith("Asset is revoked: transfers are frozen");
    });
  });

  describe("5. Admin Revocation", function () {
    beforeEach(async function () {
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
    });

    it("Should allow only contract owner/admin to revoke asset", async function () {
      const reason = "Copyright infringement reported by rightful author";
      const tx = await assetRegistry.connect(owner).revokeAsset(1, reason);

      await expect(tx)
        .to.emit(assetRegistry, "AssetRevoked")
        .withArgs(1, owner.address, reason, (val) => val > 0);

      const res = await assetRegistry.getAssetByHash(sampleHash1);
      expect(res.isRevoked).to.equal(true);

      const [record] = await assetRegistry.getAssetById(1);
      expect(record.isRevoked).to.equal(true);
      expect(record.revocationReason).to.equal(reason);
    });

    it("Should REVERT revocation if called by non-admin", async function () {
      await expect(
        assetRegistry.connect(attacker).revokeAsset(1, "Malicious attempt")
      ).to.be.revertedWithCustomError(assetRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should REVERT revocation if asset is already revoked", async function () {
      await assetRegistry.connect(owner).revokeAsset(1, "Reason 1");
      await expect(
        assetRegistry.connect(owner).revokeAsset(1, "Reason 2")
      ).to.be.revertedWith("Asset already revoked");
    });

    it("Should REVERT revocation if reason is empty string", async function () {
      await expect(
        assetRegistry.connect(owner).revokeAsset(1, "")
      ).to.be.revertedWith("Revocation reason cannot be empty");
    });
  });

  describe("6. Total Assets Tracker", function () {
    it("Should accurately track total registered assets", async function () {
      expect(await assetRegistry.totalAssets()).to.equal(0);
      await assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1);
      expect(await assetRegistry.totalAssets()).to.equal(1);
      await assetRegistry.connect(buyer).registerAsset(buyer.address, sampleUri2, sampleHash2);
      expect(await assetRegistry.totalAssets()).to.equal(2);
    });
  });

  describe("7. Pausable Mechanism", function () {
    it("Should pause and unpause properly", async function () {
      await assetRegistry.connect(owner).pause();
      expect(await assetRegistry.paused()).to.equal(true);

      await expect(
        assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1)
      ).to.be.revertedWithCustomError(assetRegistry, "EnforcedPause");

      await assetRegistry.connect(owner).unpause();
      expect(await assetRegistry.paused()).to.equal(false);

      await expect(
        assetRegistry.connect(creator).registerAsset(creator.address, sampleUri1, sampleHash1)
      ).to.not.be.reverted;
    });
  });
});
