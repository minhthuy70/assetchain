const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Starting Deployment of AssetRegistry.sol ===");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
  const contract = await AssetRegistry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("AssetRegistry deployed successfully at:", contractAddress);

  // Xuất file ABI và Address sang thư mục src/contracts để Frontend sử dụng ngay
  const targetDir = path.join(__dirname, "../../src/contracts");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("AssetRegistry");
  const contractData = {
    address: contractAddress,
    chainId: 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const outputPath = path.join(targetDir, "AssetRegistry.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
  console.log("Saved ABI & Address to:", outputPath);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

