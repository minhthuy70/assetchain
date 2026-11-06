import { ethers } from "ethers";
import contractInfo from "@/contracts/AssetRegistry.json";
import { hexToBytes32 } from "@/lib/crypto";

export const LOCAL_CHAIN_ID = 31337;
export const LOCAL_RPC_URL = "http://127.0.0.1:8545";

export interface OnChainAssetRecord {
  tokenId: number;
  creator: string;
  currentOwner: string;
  registeredAt: number;
  isRevoked: boolean;
  tokenURI: string;
}

/**
 * Lấy BrowserProvider từ window.ethereum (MetaMask)
 */
export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return null;
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

/**
 * Lấy Signer từ BrowserProvider
 */
export async function getBrowserSigner(): Promise<ethers.JsonRpcSigner | null> {
  const provider = getBrowserProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch (err) {
    console.error("Lỗi lấy signer MetaMask:", err);
    return null;
  }
}

/**
 * Khởi tạo Instance của AssetRegistry Smart Contract
 */
export function getAssetRegistryContract(
  signerOrProvider?: ethers.ContractRunner
): ethers.Contract {
  if (!contractInfo || !contractInfo.address) {
    throw new Error(
      "Không tìm thấy cấu hình Smart Contract. Vui lòng chạy lệnh npx hardhat run contracts/scripts/deploy.js!"
    );
  }

  const runner =
    signerOrProvider ||
    new ethers.JsonRpcProvider(LOCAL_RPC_URL);

  return new ethers.Contract(contractInfo.address, contractInfo.abi, runner);
}

/**
 * Bẫy lỗi và dịch mã lỗi Web3 / MetaMask sang thông báo thân thiện (Day 12 Plan)
 */
export function parseWeb3ErrorMessage(error: any): string {
  if (!error) return "Đã xảy ra lỗi không xác định.";

  // Người dùng hủy giao dịch trên ví
  if (
    error.code === 4001 ||
    error.code === "ACTION_REJECTED" ||
    error.message?.includes("user rejected")
  ) {
    return "Bạn đã từ chối ký giao dịch trên MetaMask.";
  }

  // Lỗi không đủ gas ETH
  if (
    error.code === "INSUFFICIENT_FUNDS" ||
    error.message?.includes("insufficient funds")
  ) {
    return "Số dư ETH trong ví không đủ để chi trả phí Gas giao dịch.";
  }

  // Lỗi mạng hoặc node ngắt kết nối
  if (
    error.code === "NETWORK_ERROR" ||
    error.message?.includes("could not detect network") ||
    error.message?.includes("Failed to fetch")
  ) {
    return "Không thể kết nối mạng Hardhat Local EVM tại http://127.0.0.1:8545. Hãy đảm bảo node đang chạy!";
  }

  if (error.reason) {
    return `Lỗi hợp đồng thông minh: ${error.reason}`;
  }

  return error.message || "Giao dịch Blockchain thất bại.";
}

/**
 * Kiểm tra và chuyển đổi mạng sang Hardhat Local EVM (31337)
 */
export async function ensureHardhatNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) return false;

  try {
    const provider = getBrowserProvider();
    if (!provider) return false;
    const network = await provider.getNetwork();

    if (Number(network.chainId) === LOCAL_CHAIN_ID) {
      return true;
    }

    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7a69" }], // 31337 in hex
    });
    return true;
  } catch (switchError: any) {
    // Chain chưa được thêm vào MetaMask (Code 4902)
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7a69",
              chainName: "Hardhat Local EVM",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: [LOCAL_RPC_URL],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Lỗi thêm mạng Hardhat:", addError);
        return false;
      }
    }
    console.error("Lỗi chuyển mạng MetaMask:", switchError);
    return false;
  }
}

/**
 * Gọi hàm registerAsset trên smart contract để mint NFT ERC-721 (Day 6 Plan)
 * Tích hợp pre-flight check chống trùng lặp on-chain để tiết kiệm Gas cho người dùng.
 */
export async function mintAssetOnChain(asset: {
  title: string;
  description: string;
  filePath: string;
  fileHash: string;
  walletAddress: string;
}): Promise<{
  tokenId: number;
  txHash: string;
  blockNumber: number;
  ownerAddress: string;
}> {
  // 1. Đảm bảo đúng mạng Hardhat Local EVM
  await ensureHardhatNetwork();

  const signer = await getBrowserSigner();
  if (!signer) {
    throw new Error("Vui lòng kết nối ví MetaMask để ký giao dịch!");
  }

  const userAddress = await signer.getAddress();
  const contract = getAssetRegistryContract(signer);
  const bytes32Hash = hexToBytes32(asset.fileHash);

  // 2. Pre-flight check: Kiểm tra xem hash đã được mint on-chain chưa
  const isAlreadyRegistered = await contract.isHashRegistered(bytes32Hash);
  if (isAlreadyRegistered) {
    throw new Error("Mã băm tác phẩm này đã được khắc dấu trên Smart Contract từ trước!");
  }

  const metadataUri = JSON.stringify({
    title: asset.title,
    description: asset.description,
    image: asset.filePath,
    fileHash: asset.fileHash,
    creator: userAddress,
    createdAt: new Date().toISOString(),
  });

  // 3. Gọi smart contract registerAsset
  const tx = await contract.registerAsset(
    userAddress,
    metadataUri,
    bytes32Hash
  );

  const receipt = await tx.wait();

  // 4. Trích xuất tokenId từ Event AssetRegistered
  let tokenId = 1;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === "AssetRegistered") {
        tokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch {}
  }

  return {
    tokenId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    ownerAddress: userAddress,
  };
}

/**
 * Chuyển nhượng quyền sở hữu tài sản sang ví mới (Day 10 Plan)
 */
export async function transferAssetOnChain(
  toAddress: string,
  tokenId: number
): Promise<{ txHash: string; blockNumber: number }> {
  await ensureHardhatNetwork();

  const signer = await getBrowserSigner();
  if (!signer) {
    throw new Error("Vui lòng kết nối ví MetaMask để ký chuyển nhượng!");
  }

  const contract = getAssetRegistryContract(signer);
  const tx = await contract.transferAsset(toAddress, tokenId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Tra cứu thông tin tài sản trên Smart Contract theo SHA-256 (0 Gas View)
 */
export async function getAssetByHashOnChain(
  fileHash: string
): Promise<OnChainAssetRecord | null> {
  try {
    const contract = getAssetRegistryContract();
    const bytes32Hash = hexToBytes32(fileHash);
    const res = await contract.getAssetByHash(bytes32Hash);

    return {
      tokenId: Number(res.tokenId),
      creator: res.creator,
      currentOwner: res.currentOwner,
      registeredAt: Number(res.registeredAt),
      isRevoked: res.isRevoked,
      tokenURI: res.uri,
    };
  } catch (err) {
    console.warn("Không tìm thấy asset trên chuỗi:", err);
    return null;
  }
}
