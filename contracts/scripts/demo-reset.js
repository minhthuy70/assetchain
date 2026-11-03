const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== RESETTING ASSETCHAIN DEMO ENVIRONMENT ===");

// 1. Reset Database SQLite
console.log("1. Pushing clean Prisma SQLite schema...");
execSync("npx prisma db push --force-reset", { stdio: "inherit" });

// 2. Chạy Seed dữ liệu ban đầu
console.log("2. Seeding initial accounts and assets...");
execSync("node contracts/scripts/seed.js", { stdio: "inherit" });

// 3. Xuất ABI sang src/contracts/AssetRegistry.json nếu node chưa chạy
const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/contracts/AssetRegistry.sol/AssetRegistry.json"
);
const targetDir = path.join(__dirname, "../../src/contracts");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(artifactPath)) {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const contractData = {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    chainId: 31337,
    deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };
  fs.writeFileSync(
    path.join(targetDir, "AssetRegistry.json"),
    JSON.stringify(contractData, null, 2)
  );
  console.log("3. Exported ABI to src/contracts/AssetRegistry.json");
}

console.log("=== DEMO ENVIRONMENT IS 100% READY FOR PRESENTATION! ===");

