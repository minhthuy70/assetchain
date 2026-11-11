const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("====================================================");
  console.log("BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU SEED LÊN BLOCKCHAIN LOCAL...");
  console.log("====================================================");

  const [admin, creator1, creator2] = await ethers.getSigners();
  console.log("• Admin (Account #0):", admin.address);
  console.log("• Creator 1 (Account #1):", creator1.address);
  console.log("• Creator 2 (Account #2):", creator2.address);

  // 1. Đọc thông tin hợp đồng đã triển khai
  const contractInfoPath = path.join(__dirname, "../../src/contracts/AssetRegistry.json");
  let contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  let abi;

  if (fs.existsSync(contractInfoPath)) {
    const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, "utf8"));
    contractAddress = contractInfo.address;
    abi = contractInfo.abi;
  } else {
    const artifactPath = path.join(
      __dirname,
      "../artifacts/contracts/contracts/AssetRegistry.sol/AssetRegistry.json"
    );
    if (!fs.existsSync(artifactPath)) {
      throw new Error("Vui lòng biên dịch hợp đồng trước bằng lệnh: npx hardhat compile");
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const assetRegistry = new ethers.Contract(contractAddress, abi, admin);
  console.log("\nKết nối tới Smart Contract tại:", contractAddress);

  const seedTokens = [
    {
      id: 1,
      title: "Tranh Kỹ Thuật Số Sen Vàng Triều Nguyễn",
      creatorSigner: creator1,
      recipient: creator1.address,
      hash: "0x3178b1b391477fcd50ee1d3b9bcc5370418cea33a6d4465f03f8acf5ed7390e3",
      uri: "https://assetchain.local/metadata/1.json",
      shouldRevoke: false,
    },
    {
      id: 2,
      title: "Bộ Ảnh Nghệ Thuật Chân Dung AI Generative Model V5",
      creatorSigner: creator1,
      recipient: creator1.address,
      hash: "0x0a80c9eccdc654d36be98d5be949acbd3920ca7e9e793ac9940878eb33a864ad",
      uri: "https://assetchain.local/metadata/2.json",
      shouldRevoke: true,
      revokeReason:
        "Quyền sở hữu bị hủy bỏ theo Quyết định Trọng tài Bản quyền Số 45/2026 do tác giả vi phạm cam kết sử dụng dữ liệu huấn luyện thương mại không phép.",
    },
    {
      id: 3,
      title: "Hồ Sơ Bản Quyền Nhận Diện Thương Hiệu TechCorp 2026",
      creatorSigner: creator2,
      recipient: creator2.address,
      hash: "0xe17accd10ae176a8a203fdaf4d236d1c41130cc4fd8645e4dc1f5cb5749b71bb",
      uri: "https://assetchain.local/metadata/3.json",
      shouldRevoke: false,
    },
  ];

  for (const item of seedTokens) {
    const isRegistered = await assetRegistry.isHashRegistered(item.hash);
    if (isRegistered) {
      console.log(`[Bỏ qua] Token #${item.id} (${item.title}) đã tồn tại trên chuỗi.`);
      continue;
    }

    console.log(`\n⏳ Đang đúc Token #${item.id}: "${item.title}"...`);
    const tx = await assetRegistry
      .connect(item.creatorSigner)
      .registerAsset(item.recipient, item.uri, item.hash);
    const receipt = await tx.wait();
    console.log(`✅ Đã đúc Token #${item.id} on-chain (Tx: ${receipt.hash.slice(0, 18)}...)`);

    if (item.shouldRevoke) {
      console.log(`⏳ Đang thực thi thu hồi on-chain Token #${item.id}...`);
      const revokeTx = await assetRegistry.connect(admin).revokeAsset(item.id, item.revokeReason);
      await revokeTx.wait();
      console.log(`⚠️ Đã thu hồi quyền sở hữu Token #${item.id} thành công!`);
    }
  }

  const total = await assetRegistry.totalAssets();
  console.log("\n====================================================");
  console.log(`🎉 ĐỒNG BỘ HOÀN TẤT! TỔNG SỐ TOKEN TRÊN CHUỖI: ${total}`);
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Lỗi khi đồng bộ on-chain:", err);
    process.exit(1);
  });

