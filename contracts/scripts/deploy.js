const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("BẮT ĐẦU TRIỂN KHAI SMART CONTRACT ASSETREGISTRY...");
  console.log("----------------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log("Địa chỉ ví Deployer (Admin):", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Số dư ví Deployer:", ethers.formatEther(balance), "ETH");

  const AssetRegistryFactory = await ethers.getContractFactory("AssetRegistry");
  const assetRegistry = await AssetRegistryFactory.deploy();
  await assetRegistry.waitForDeployment();

  const contractAddress = await assetRegistry.getAddress();
  console.log("✅ HỢP ĐỒNG ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG TẠI:", contractAddress);

  // 1. Lấy thông tin ABI từ Artifacts của Hardhat
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/contracts/AssetRegistry.sol/AssetRegistry.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Không tìm thấy file artifact tại ${artifactPath}`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // 2. Định dạng file cấu hình Frontend
  const outputData = {
    address: contractAddress,
    chainId: 31337,
    networkName: "Hardhat Local EVM",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    abi: artifact.abi,
  };

  // 3. Tự động ghi ra src/contracts/AssetRegistry.json
  const targetDir = path.join(__dirname, "../../src/contracts");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, "AssetRegistry.json");
  fs.writeFileSync(targetPath, JSON.stringify(outputData, null, 2));

  console.log(`✅ ĐÃ XUẤT ABI VÀ ĐỊA CHỈ CONTRACT RA: ${targetPath}`);
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Lỗi khi triển khai:", error);
    process.exit(1);
  });
