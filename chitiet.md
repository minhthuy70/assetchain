# Hướng Dẫn Triển Khai Chi Tiết - AssetChain (Team 2 Người)

## Tổng Quan

| Thành Viên | Vai Trò | Thư Mục Chính |
|-----------|---------|---------------|
| **Thành Viên A** | Backend + Smart Contract | `contracts/`, `backend/` |
| **Thành Viên B** | Frontend | `frontend/` |

---

## PHASE 1 - Khởi Tạo Workspace (Cả 2 người làm song song)

### Cả 2 người: Cài đặt môi trường chung

```bash
# Kiểm tra Node.js version (cần >= 18.x)
node --version

# Kiểm tra Docker (để chạy PostgreSQL)
docker --version
docker compose --version

# Kiểm tra Git
git --version
```

---

### Thành Viên A - Khởi tạo Hardhat Project

#### Bước 1: Tạo thư mục contracts

```bash
# Từ root assetchain/
mkdir contracts
cd contracts

# Khởi tạo Hardhat project với TypeScript
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# Chọn:
# - Create a TypeScript project
# - Do you want to install this sample project? No
```

#### Bước 2: Cài đặt dependencies

```bash
cd contracts

# OpenZeppelin contracts
npm install @openzeppelin/contracts

# ethers.js v6
npm install ethers

# Testing
npm install --save-dev @nomicfoundation/hardhat-chai-matchers chai @types/node

# Lint
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier
```

#### Bước 3: Cấu hình hardhat.config.ts

Tạo file `contracts/hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
```

#### Bước 4: Tạo cấu trúc thư mục

```bash
cd contracts

mkdir -p contracts test scripts
```

#### Bước 5: Kiểm tra compile

```bash
cd contracts
npx hardhat compile

# Nên thấy: Compiled 1 Solidity file successfully
```

#### Bước 6: Tạo file .gitignore cho contracts

Tạo file `contracts/.gitignore`:

```
node_modules/
.env
coverage/
coverage.json
typechain/
typechain-types/

# Hardhat files
cache/
artifacts/

# macOS
.DS_Store

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
```

---

### Thành Viên A - Khởi tạo NestJS Backend

#### Bước 1: Tạo thư mục backend

```bash
# Từ root assetchain/
cd ..

# Cài NestJS CLI global (nếu chưa có)
npm install -g @nestjs/cli

# Tạo NestJS project
nest new backend

# Chọn:
# - Package manager: npm
# - Để các option default
```

#### Bước 2: Cài đặt dependencies

```bash
cd backend

# Prisma ORM
npm install prisma @prisma/client
npx prisma init

# Validation
npm install class-validator class-transformer

# Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/bcrypt @types/passport-jwt

# ethers.js v6 cho blockchain
npm install ethers

# File upload
npm install --save-dev @types/multer

# Environment
npm install @nestjs/config

# CORS
npm install @nestjs/platform-express
```

#### Bước 3: Cấu hình main.ts

Mở file `backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
```

#### Bước 4: Cấu hình .env

Tạo file `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://assetchain_admin:assetchain_password@localhost:5432/assetchain_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Blockchain
HARDHAT_RPC_URL="http://127.0.0.1:8545"
CHAIN_ID=31337
CONTRACT_ADDRESS="" # Sẽ điền sau khi deploy
```

#### Bước 5: Tạo cấu trúc modules

```bash
cd backend/src

mkdir -p modules/auth modules/users modules/assets modules/blockchain modules/ownership
```

---

### Thành Viên A - Khởi tạo Prisma Schema

#### Bước 1: Thiết kế schema

Mở file `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  CREATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum AssetStatus {
  DRAFT
  PENDING_ONCHAIN
  REGISTERED
  TRANSFERRED
  FLAGGED
  REVOKED
}

enum OwnershipEventType {
  MINT
  TRANSFER
  REVOKE
}

enum DisputeStatus {
  PENDING
  UNDER_REVIEW
  RESOLVED
  REJECTED
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  passwordHash   String
  fullName       String?
  role           UserRole     @default(USER)
  walletAddress String?      @unique
  nonce          String?
  status         UserStatus   @default(ACTIVE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  creatorProfile CreatorProfile?
  createdAssets  Asset[]      @relation("CreatorAssets")
  ownedAssets    Asset[]      @relation("OwnerAssets")
  fromTransfers  OwnershipHistory[] @relation("FromUser")
  toTransfers    OwnershipHistory[] @relation("ToUser")
  disputes       DisputeReport[]
}

model CreatorProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  displayName   String
  bio           String?
  portfolioUrl  String?
  avatarUrl     String?
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Asset {
  id                      String       @id @default(uuid())
  tokenId                 BigInt?      @unique
  title                   String
  description             String?      @db.Text
  category                String?
  fileUrl                 String
  fileHash                String       @unique
  fileSizeBytes           BigInt
  mimeType                String
  metadataUri             String
  creatorId               String
  currentOwnerId          String
  creatorWalletAddress    String
  currentOwnerWalletAddress String
  txHash                  String?
  blockNumber             BigInt?
  chainId                 Int
  status                  AssetStatus  @default(DRAFT)
  registeredAt            DateTime?
  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt

  creator                 User         @relation("CreatorAssets", fields: [creatorId], references: [id])
  currentOwner            User         @relation("OwnerAssets", fields: [currentOwnerId], references: [id])
  ownershipHistory        OwnershipHistory[]
  licenses                LicenseAgreement[]
  disputes                DisputeReport[]
}

model OwnershipHistory {
  id                String             @id @default(uuid())
  assetId           String
  tokenId           BigInt
  fromWalletAddress String
  toWalletAddress   String
  fromUserId        String?
  toUserId          String?
  txHash            String             @unique
  blockNumber       BigInt
  eventType         OwnershipEventType
  timestamp         DateTime

  asset             Asset              @relation(fields: [assetId], references: [id], onDelete: Cascade)
  fromUser          User?              @relation("FromUser", fields: [fromUserId], references: [id])
  toUser            User?              @relation("ToUser", fields: [toUserId], references: [id])
}

model LicenseAgreement {
  id                String   @id @default(uuid())
  assetId           String
  licensorId        String
  licenseeId        String
  licenseeWalletAddress String
  licenseType       String
  feeAmount         Decimal @db.Decimal(10, 2)
  validFrom         DateTime
  validUntil        DateTime
  termsUri          String?
  status            String   @default("ACTIVE")
  txHash            String?
  createdAt         DateTime @default(now())

  asset             Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
}

model DisputeReport {
  id                 String        @id @default(uuid())
  assetId            String
  reporterId         String
  reason             String
  evidenceDescription String?       @db.Text
  evidenceFileUrl    String?
  status             DisputeStatus @default(PENDING)
  resolutionNote     String?       @db.Text
  resolvedByUserId   String?
  resolvedAt         DateTime?
  createdAt          DateTime      @default(now())

  asset              Asset         @relation(fields: [assetId], references: [id], onDelete: Cascade)
  reporter           User         @relation(fields: [reporterId], references: [id])
  resolvedBy         User?         @relation("ResolvedBy", fields: [resolvedByUserId], references: [id])
}

model BlockchainSyncLog {
  id              String   @id @default(uuid())
  contractAddress String
  lastProcessedBlock BigInt
  eventName       String
  syncStatus      String   @default("SUCCESS")
  errorDetails    String?  @db.Text
  updatedAt       DateTime @updatedAt
}
```

#### Bước 2: Tạo migration

```bash
cd backend

# Đảm bảo PostgreSQL đang chạy
docker compose up -d

# Tạo migration
npx prisma migrate dev --name init

# Seed admin account (optional)
npx prisma db seed
```

#### Bước 3: Tạo seed script

Tạo file `backend/prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetchain.local' },
    update: {},
    create: {
      email: 'admin@assetchain.local',
      passwordHash: hashedPassword,
      fullName: 'System Admin',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `backend/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Cài ts-node:

```bash
cd backend
npm install --save-dev ts-node
```

Run seed:

```bash
npx prisma db seed
```

---

### Thành Viên B - Khởi tạo Next.js Frontend

#### Bước 1: Tạo Next.js project

```bash
# Từ root assetchain/
cd ..

# Tạo Next.js project với TypeScript và Tailwind
npx create-next-app@latest frontend

# Chọn:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - `src/` directory: Yes
# - App Router: Yes
# - Customize default import alias: No
```

#### Bước 2: Cài đặt dependencies

```bash
cd frontend

# ethers.js v6
npm install ethers

# UI components (optional - có thể dùng shadcn/ui sau)
npm install lucide-react clsx tailwind-merge

# Form handling
npm install react-hook-form @hookform/resolvers zod

# HTTP client
npm install axios
```

#### Bước 3: Cấu hình environment

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_CONTRACT_ADDRESS= # Sẽ điền sau khi deploy
```

#### Bước 4: Cấu hình tailwind.config.ts

File này đã được tạo tự động, chỉ cần kiểm tra:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

#### Bước 5: Tạo cấu trúc thư mục

```bash
cd frontend/src

mkdir -p components hooks lib types app/auth app/verify app/explore app/dashboard
```

#### Bước 6: Tạo API client

Tạo file `frontend/src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để handle lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Bước 7: Tạo types

Tạo file `frontend/src/types/index.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  walletAddress?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Asset {
  id: string;
  tokenId?: bigint;
  title: string;
  description?: string;
  category?: string;
  fileUrl: string;
  fileHash: string;
  fileSizeBytes: bigint;
  mimeType: string;
  metadataUri: string;
  creatorId: string;
  currentOwnerId: string;
  creatorWalletAddress: string;
  currentOwnerWalletAddress: string;
  txHash?: string;
  blockNumber?: bigint;
  chainId: number;
  status: 'DRAFT' | 'PENDING_ONCHAIN' | 'REGISTERED' | 'TRANSFERRED' | 'FLAGGED' | 'REVOKED';
  registeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  portfolioUrl?: string;
  avatarUrl?: string;
  isVerified: boolean;
}
```

---

### Cả 2 người: Chuẩn hóa Docker Compose

File này đã có ở root, kiểm tra `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: assetchain_postgres
    environment:
      POSTGRES_USER: assetchain_admin
      POSTGRES_PASSWORD: assetchain_password
      POSTGRES_DB: assetchain_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U assetchain_admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: assetchain_adminer
    ports:
      - "8081:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Chạy PostgreSQL:

```bash
# Từ root assetchain/
docker compose up -d

# Kiểm tra
docker compose ps
```

---

## CHECKPOINT 1: Xác nhận Phase 1 hoàn thành

### Thành Viên A kiểm tra:

```bash
# Contracts
cd contracts
npx hardhat compile
# ✅ Should see: Compiled X Solidity files successfully

# Backend
cd ../backend
npm run start:dev
# ✅ Should see: Backend running on http://localhost:3001

# Prisma
npx prisma studio
# ✅ Should open Prisma Studio at http://localhost:5555
```

### Thành Viên B kiểm tra:

```bash
# Frontend
cd frontend
npm run dev
# ✅ Should see: Ready in Xms on http://localhost:3000
```

### Cả 2 người sync:

- [ ] Thành Viên A gửi cho Thành Viên B: API base URL, Prisma schema structure
- [ ] Thành Viên B gửi cho Thành Viên A: Frontend base URL, env structure
- [ ] Cả 2 có thể chạy local environment song song

---

## PHASE 2 - Smart Contract (Thành Viên A)

### Bước 1: Tạo AssetRegistry.sol

Tạo file `contracts/contracts/AssetRegistry.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AssetRegistry is ERC721URIStorage, Ownable, Pausable {
    struct AssetRecord {
        uint256 tokenId;
        bytes32 contentHash;
        address creator;
        uint256 registeredAt;
        bool isRevoked;
        string revocationReason;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => AssetRecord) public assets;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(bytes32 => bool) public isHashRegistered;

    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 indexed contentHash,
        string tokenURI,
        uint256 timestamp
    );

    event AssetRevoked(
        uint256 indexed tokenId,
        address indexed admin,
        string reason,
        uint256 timestamp
    );

    constructor() ERC721("AssetChain Registry", "ACR") Ownable(msg.sender) {}

    function registerAsset(
        address to,
        string memory uri,
        bytes32 contentHash
    ) public whenNotPaused returns (uint256) {
        require(to != address(0), "Invalid address");
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(contentHash != bytes32(0), "Hash cannot be zero");
        require(!isHashRegistered[contentHash], "Hash already registered");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        assets[tokenId] = AssetRecord({
            tokenId: tokenId,
            contentHash: contentHash,
            creator: msg.sender,
            registeredAt: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        hashToTokenId[contentHash] = tokenId;
        isHashRegistered[contentHash] = true;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit AssetRegistered(tokenId, msg.sender, contentHash, uri, block.timestamp);

        return tokenId;
    }

    function getAssetByHash(
        bytes32 contentHash
    ) public view returns (
        uint256 tokenId,
        address creator,
        address currentOwner,
        uint256 registeredAt,
        bool isRevoked,
        string memory uri
    ) {
        require(isHashRegistered[contentHash], "Hash not registered");

        tokenId = hashToTokenId[contentHash];
        AssetRecord memory record = assets[tokenId];

        return (
            tokenId,
            record.creator,
            ownerOf(tokenId),
            record.registeredAt,
            record.isRevoked,
            tokenURI(tokenId)
        );
    }

    function revokeAsset(
        uint256 tokenId,
        string memory reason
    ) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        assets[tokenId].isRevoked = true;
        assets[tokenId].revocationReason = reason;

        emit AssetRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
```

### Bước 2: Viết unit test

Tạo file `contracts/test/AssetRegistry.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { AssetRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AssetRegistry", function () {
  let assetRegistry: AssetRegistry;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let user: SignerWithAddress;

  const SAMPLE_URI = "ipfs://QmTest123";
  const SAMPLE_HASH = ethers.keccak256(ethers.toUtf8Bytes("test content"));

  beforeEach(async function () {
    [owner, creator, user] = await ethers.getSigners();

    const AssetRegistryFactory = await ethers.getContractFactory("AssetRegistry");
    assetRegistry = await AssetRegistryFactory.deploy();
    await assetRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await assetRegistry.owner()).to.equal(owner.address);
    });

    it("Should set correct name and symbol", async function () {
      expect(await assetRegistry.name()).to.equal("AssetChain Registry");
      expect(await assetRegistry.symbol()).to.equal("ACR");
    });
  });

  describe("Asset Registration", function () {
    it("Should register asset successfully", async function () {
      const tx = await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "AssetRegistered"
      );

      expect(event).to.not.be.undefined;

      const tokenId = await assetRegistry.hashToTokenId(SAMPLE_HASH);
      expect(tokenId).to.equal(0);

      const asset = await assetRegistry.assets(tokenId);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.contentHash).to.equal(SAMPLE_HASH);
      expect(asset.isRevoked).to.be.false;
    });

    it("Should prevent duplicate hash registration", async function () {
      await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      await expect(
        assetRegistry.connect(user).registerAsset(
          user.address,
          SAMPLE_URI,
          SAMPLE_HASH
        )
      ).to.be.revertedWith("Hash already registered");
    });

    it("Should prevent zero address", async function () {
      await expect(
        assetRegistry.connect(creator).registerAsset(
          ethers.ZeroAddress,
          SAMPLE_URI,
          SAMPLE_HASH
        )
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent empty URI", async function () {
      await expect(
        assetRegistry.connect(creator).registerAsset(
          creator.address,
          "",
          SAMPLE_HASH
        )
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should prevent zero hash", async function () {
      await expect(
        assetRegistry.connect(creator).registerAsset(
          creator.address,
          SAMPLE_URI,
          ethers.ZeroHash
        )
      ).to.be.revertedWith("Hash cannot be zero");
    });
  });

  describe("Asset Query", function () {
    it("Should return asset by hash", async function () {
      await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      const result = await assetRegistry.getAssetByHash(SAMPLE_HASH);

      expect(result.tokenId).to.equal(0);
      expect(result.creator).to.equal(creator.address);
      expect(result.currentOwner).to.equal(creator.address);
      expect(result.uri).to.equal(SAMPLE_URI);
      expect(result.isRevoked).to.be.false;
    });

    it("Should revert for unregistered hash", async function () {
      await expect(
        assetRegistry.getAssetByHash(SAMPLE_HASH)
      ).to.be.revertedWith("Hash not registered");
    });
  });

  describe("Asset Revocation", function () {
    it("Should allow owner to revoke asset", async function () {
      await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      await assetRegistry.revokeAsset(0, "Copyright violation");

      const asset = await assetRegistry.assets(0);
      expect(asset.isRevoked).to.be.true;
      expect(asset.revocationReason).to.equal("Copyright violation");
    });

    it("Should prevent non-owner from revoking", async function () {
      await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      await expect(
        assetRegistry.connect(user).revokeAsset(0, "Test")
      ).to.be.revertedWithCustomError(assetRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await assetRegistry.pause();
      expect(await assetRegistry.paused()).to.be.true;
    });

    it("Should prevent registration when paused", async function () {
      await assetRegistry.pause();

      await expect(
        assetRegistry.connect(creator).registerAsset(
          creator.address,
          SAMPLE_URI,
          SAMPLE_HASH
        )
      ).to.be.revertedWithCustomError(assetRegistry, "EnforcedPause");
    });

    it("Should allow registration after unpause", async function () {
      await assetRegistry.pause();
      await assetRegistry.unpause();

      await assetRegistry.connect(creator).registerAsset(
        creator.address,
        SAMPLE_URI,
        SAMPLE_HASH
      );

      expect(await assetRegistry.hashToTokenId(SAMPLE_HASH)).to.equal(0);
    });
  });
});
```

### Bước 3: Chạy test

```bash
cd contracts
npx hardhat test

# ✅ Should see all tests passing
```

### Bước 4: Deploy lên local Hardhat node

Tạo file `contracts/scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AssetRegistry...");

  const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
  const assetRegistry = await AssetRegistry.deploy();

  await assetRegistry.waitForDeployment();

  const address = await assetRegistry.getAddress();
  console.log("AssetRegistry deployed to:", address);

  // Lưu thông tin deploy vào file để frontend/backend dùng
  const deploymentInfo = {
    contractAddress: address,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: (await ethers.getSigners())[0].address,
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Deploy:

```bash
cd contracts

# Bắt đầu Hardhat node ở terminal khác (chạy background)
npx hardhat node

# Ở terminal hiện tại, deploy
npx hardhat run scripts/deploy.ts --network localhost

# ✅ Should see: AssetRegistry deployed to: 0x...
```

### Bước 5: Export ABI

```bash
cd contracts

# ABI nằm ở artifacts/contracts/AssetRegistry.sol/AssetRegistry.json
# Copy file này cho frontend và backend
```

### Bước 6: Cập nhật .env cho cả backend và frontend

**Backend (.env):**
```env
CONTRACT_ADDRESS=0x... # Điền address từ deploy
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Điền address từ deploy
```

---

## CHECKPOINT 2: Contract Deploy Thành Công

### Thành Viên A gửi cho Thành Viên B:

1. **Contract ABI** - File `contracts/artifacts/contracts/AssetRegistry.sol/AssetRegistry.json`
2. **Contract Address** - Địa chỉ contract vừa deploy
3. **Chain ID** - 31337
4. **Example ethers.js integration code**

Example code gửi cho Thành Viên B:

```typescript
// Example: frontend/src/lib/contract.ts
import { ethers } from 'ethers';
import AssetRegistryABI from './AssetRegistry.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337');

export async function getContract() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    AssetRegistryABI.abi,
    signer
  );

  return contract;
}

export async function registerAsset(uri: string, contentHash: string) {
  const contract = await getContract();
  const tx = await contract.registerAsset(
    await contract.signer.getAddress(),
    uri,
    contentHash
  );
  return tx.wait();
}
```

---

## PHASE 3 - Backend Implementation (Thành Viên A)

### Bước 1: Implement Prisma Service

Tạo file `backend/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Tạo file `backend/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import vào `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

### Bước 2: Implement Auth Module

#### Bước 2.1: Tạo DTOs

Tạo file `backend/src/modules/auth/dto/register.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}
```

Tạo file `backend/src/modules/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

Tạo file `backend/src/modules/auth/dto/wallet-challenge.dto.ts`:

```typescript
import { IsString, IsEthereumAddress } from 'class-validator';

export class WalletChallengeDto {
  @IsString()
  @IsEthereumAddress()
  walletAddress: string;
}

export class WalletSignDto {
  @IsString()
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  signature: string;

  @IsString()
  message: string;
}
```

#### Bước 2.2: Tạo Auth Service

Tạo file `backend/src/modules/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, WalletChallengeDto, WalletSignDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    };
  }

  async generateWalletChallenge(dto: WalletChallengeDto) {
    const nonce = this.generateNonce();

    await this.prisma.user.updateMany({
      where: { walletAddress: dto.walletAddress },
      data: { nonce },
    });

    const message = `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

    return { message, nonce };
  }

  async verifyWalletSignature(dto: WalletSignDto) {
    const user = await this.prisma.user.findFirst({
      where: { walletAddress: dto.walletAddress },
    });

    if (!user || user.nonce !== this.extractNonce(dto.message)) {
      throw new UnauthorizedException('Invalid challenge');
    }

    // TODO: Verify signature using ethers.js
    // const recoveredAddress = ethers.verifyMessage(dto.message, dto.signature);
    // if (recoveredAddress.toLowerCase() !== dto.walletAddress.toLowerCase()) {
    //   throw new UnauthorizedException('Invalid signature');
    // }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { nonce: null },
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private extractNonce(message: string): string {
    const match = message.match(/Nonce: (.+)/);
    return match ? match[1] : '';
  }
}
```

#### Bước 2.3: Tạo Auth Controller

Tạo file `backend/src/modules/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, WalletChallengeDto, WalletSignDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('wallet/challenge')
  async generateWalletChallenge(@Body() dto: WalletChallengeDto) {
    return this.authService.generateWalletChallenge(dto);
  }

  @Post('wallet/verify')
  async verifyWalletSignature(@Body() dto: WalletSignDto) {
    return this.authService.verifyWalletSignature(dto);
  }
}
```

#### Bước 2.4: Tạo Auth Module

Tạo file `backend/src/modules/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

Import vào `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### Bước 3: Test Auth API

```bash
cd backend
npm run start:dev
```

Test với Postman/Insomnia:

**POST** `http://localhost:3001/api/v1/auth/register`
```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**POST** `http://localhost:3001/api/v1/auth/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## PHASE 4 - Frontend Implementation (Thành Viên B)

### Bước 1: Tạo Layout và Navigation

Tạo file `frontend/src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AssetChain - Digital Asset Ownership",
  description: "Blockchain-based digital asset registration and verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

Tạo file `frontend/src/components/Navbar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              AssetChain
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              href="/verify"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/verify' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Verify
            </Link>
            <Link
              href="/explore"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/explore' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Bước 2: Tạo trang Home

Tạo file `frontend/src/app/page.tsx`:

```typescript
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Digital Asset Ownership on Blockchain
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Register, verify, and manage your digital assets with immutable proof of existence
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/verify"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Verify Asset
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              Explore Assets
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Proof of Existence</h3>
            <p className="mt-2 text-gray-600">
              Immutable timestamp and SHA-256 fingerprint on blockchain
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Integrity Verification</h3>
            <p className="mt-2 text-gray-600">
              Instantly verify if a file matches the original registered asset
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Transparent Provenance</h3>
            <p className="mt-2 text-gray-600">
              Complete ownership history with blockchain audit trail
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Bước 3: Tạo trang Verify

Tạo file `frontend/src/app/verify/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);

    try {
      // TODO: Call backend API to calculate hash and verify
      // For now, mock response
      setTimeout(() => {
        setResult({
          status: 'valid',
          message: 'Asset is valid and registered on blockchain',
          tokenId: '1',
          creator: '0x123...',
          registeredAt: new Date().toISOString(),
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Verify Asset Integrity</h1>
        <p className="mt-2 text-gray-600">
          Upload a file or enter a hash to verify its authenticity
        </p>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Hash
            </label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="SHA-256 hash"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || (!file && !hash)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Result</h2>
            <div className={`p-4 rounded-md ${
              result.status === 'valid' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result.message}
            </div>

            {result.status === 'valid' && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Token ID:</strong> {result.tokenId}</p>
                <p><strong>Creator:</strong> {result.creator}</p>
                <p><strong>Registered At:</strong> {new Date(result.registeredAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

### Bước 4: Test Frontend

```bash
cd frontend
npm run dev
```

Mở browser tại `http://localhost:3000`:
- Home page hiển thị
- Verify page hiển thị
- Navigation hoạt động

---

## CHECKPOINT 3: Frontend + Auth Basic Done

- [ ] Frontend dev server chạy được
- [ ] Backend auth API sẵn sàng
- [ ] Cả 2 có thể test basic flow

---

---

## PHASE 5 - Backend Asset Module (Thành Viên A)

### Bước 1: Implement Creator Profile Module

#### Bước 1.1: Tạo DTOs

Tạo file `backend/src/modules/users/dto/create-profile.dto.ts`:

```typescript
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MaxLength(100)
  displayName: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
```

Tạo file `backend/src/modules/users/dto/update-profile.dto.ts`:

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
```

#### Bước 1.2: Tạo Users Service

Tạo file `backend/src/modules/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileByWallet(walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.getProfile(user.id);
  }

  async createProfile(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ForbiddenException('Profile already exists');
    }

    return this.prisma.creatorProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.creatorProfile.update({
      where: { userId },
      data: dto,
    });
  }
}
```

#### Bước 1.3: Tạo Users Controller

Tạo file `backend/src/modules/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getMyProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Get('profile/:walletAddress')
  async getProfileByWallet(@Param('walletAddress') walletAddress: string) {
    return this.usersService.getProfileByWallet(walletAddress);
  }

  @Post('profile')
  async createProfile(@Request() req, @Body() dto: CreateProfileDto) {
    return this.usersService.createProfile(req.user.userId, dto);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }
}
```

#### Bước 1.4: Tạo JWT Auth Guard

Tạo file `backend/src/modules/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Tạo file `backend/src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

Update `backend/src/modules/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### Bước 1.5: Tạo Users Module

Tạo file `backend/src/modules/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

Import vào `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

---

### Bước 2: Implement Asset Module (Upload & Hash)

#### Bước 2.1: Cài đặt crypto library

```bash
cd backend
npm install crypto
npm install --save-dev @types/crypto-js
```

Hoặc dùng native Node crypto:

```bash
# Không cần cài thêm, Node.js có sẵn crypto module
```

#### Bước 2.2: Tạo DTOs

Tạo file `backend/src/modules/assets/dto/upload-asset.dto.ts`:

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadAssetDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
```

Tạo file `backend/src/modules/assets/dto/prepare-registration.dto.ts`:

```typescript
import { IsString, IsUUID } from 'class-validator';

export class PrepareRegistrationDto {
  @IsUUID()
  assetId: string;
}
```

Tạo file `backend/src/modules/assets/dto/confirm-registration.dto.ts`:

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmRegistrationDto {
  @IsString()
  @IsNotEmpty()
  txHash: string;
}
```

#### Bước 2.3: Tạo Assets Service

Tạo file `backend/src/modules/assets/assets.service.ts`:

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadAssetDto, PrepareRegistrationDto, ConfirmRegistrationDto } from './dto';
import * as crypto from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  // Tính SHA-256 hash từ file buffer
  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Validate MIME type
  private validateMimeType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
    ];
    return allowedTypes.includes(mimeType);
  }

  // Lưu file và tính hash
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    dto: UploadAssetDto
  ) {
    // Validate file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // Validate MIME type
    if (!this.validateMimeType(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // Calculate hash
    const fileHash = this.calculateHash(file.buffer);

    // Check duplicate in database
    const existing = await this.prisma.asset.findUnique({
      where: { fileHash },
    });

    if (existing) {
      throw new ConflictException('File already registered');
    }

    // Save file to storage
    const fileName = `${fileHash}${this.getExtension(file.mimetype)}`;
    const filePath = join(process.cwd(), 'uploads', fileName);

    await writeFile(filePath, file.buffer);

    // Create asset record
    const asset = await this.prisma.asset.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        fileUrl: filePath,
        fileHash: fileHash,
        fileSizeBytes: BigInt(file.size),
        mimeType: file.mimetype,
        metadataUri: '', // Will be filled later
        creatorId: userId,
        currentOwnerId: userId,
        creatorWalletAddress: '', // Will be filled when wallet is bound
        currentOwnerWalletAddress: '',
        chainId: 31337,
        status: 'DRAFT',
      },
    });

    return asset;
  }

  private getExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'video/mp4': '.mp4',
    };
    return extensions[mimeType] || '.bin';
  }

  async prepareRegistration(userId: string, dto: PrepareRegistrationDto) {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: dto.assetId,
        creatorId: userId,
        status: 'DRAFT',
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found or already registered');
    }

    // Check duplicate on-chain (TODO: Call contract)
    // For now, just update status

    // Generate metadata URI
    const metadataUri = `ipfs://Qm${asset.fileHash.substring(0, 32)}`;

    const updated = await this.prisma.asset.update({
      where: { id: asset.id },
      data: {
        metadataUri,
        status: 'PENDING_ONCHAIN',
      },
    });

    return updated;
  }

  async confirmRegistration(userId: string, dto: ConfirmRegistrationDto) {
    // Find asset with PENDING_ONCHAIN status
    const asset = await this.prisma.asset.findFirst({
      where: {
        creatorId: userId,
        status: 'PENDING_ONCHAIN',
      },
    });

    if (!asset) {
      throw new NotFoundException('No pending registration found');
    }

    // TODO: Verify transaction receipt from blockchain
    // For now, mock verification

    // Update status to REGISTERED
    const updated = await this.prisma.asset.update({
      where: { id: asset.id },
      data: {
        status: 'REGISTERED',
        txHash: dto.txHash,
        registeredAt: new Date(),
      },
    });

    // Create ownership history
    await this.prisma.ownershipHistory.create({
      data: {
        assetId: asset.id,
        tokenId: BigInt(1), // TODO: Get from contract
        fromWalletAddress: '0x0000000000000000000000000000000000000000',
        toWalletAddress: asset.creatorWalletAddress,
        fromUserId: null,
        toUserId: userId,
        txHash: dto.txHash,
        blockNumber: BigInt(1), // TODO: Get from receipt
        eventType: 'MINT',
        timestamp: new Date(),
      },
    });

    return updated;
  }

  async getAssets(query: any) {
    const { page = 1, limit = 10, search, category, status } = query;

    const where: any = {
      status: 'REGISTERED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              walletAddress: true,
            },
          },
          currentOwner: {
            select: {
              id: true,
              fullName: true,
              walletAddress: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            creatorProfile: true,
          },
        },
        currentOwner: {
          include: {
            creatorProfile: true,
          },
        },
        ownershipHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async verifyIntegrity(fileHash: string) {
    // Check database
    const dbAsset = await this.prisma.asset.findUnique({
      where: { fileHash },
      include: {
        creator: true,
        currentOwner: true,
      },
    });

    if (!dbAsset) {
      return {
        status: 'unregistered',
        message: 'Asset not found in database',
      };
    }

    // TODO: Check on-chain
    // For now, return database result

    return {
      status: dbAsset.status === 'REGISTERED' ? 'valid' : dbAsset.status.toLowerCase(),
      message: 'Asset found',
      asset: dbAsset,
    };
  }
}
```

#### Bước 2.4: Tạo Assets Controller

Tạo file `backend/src/modules/assets/assets.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { UploadAssetDto, PrepareRegistrationDto, ConfirmRegistrationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  async getAssets(@Query() query: any) {
    return this.assetsService.getAssets(query);
  }

  @Get(':id')
  async getAssetById(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body() dto: UploadAssetDto
  ) {
    return this.assetsService.uploadFile(file, req.user.userId, dto);
  }

  @Post('prepare-registration')
  @UseGuards(JwtAuthGuard)
  async prepareRegistration(@Request() req, @Body() dto: PrepareRegistrationDto) {
    return this.assetsService.prepareRegistration(req.user.userId, dto);
  }

  @Post('confirm-registration')
  @UseGuards(JwtAuthGuard)
  async confirmRegistration(@Request() req, @Body() dto: ConfirmRegistrationDto) {
    return this.assetsService.confirmRegistration(req.user.userId, dto);
  }

  @Post('verify')
  async verifyIntegrity(@Body('fileHash') fileHash: string) {
    return this.assetsService.verifyIntegrity(fileHash);
  }
}
```

#### Bước 2.5: Tạo Assets Module

Tạo file `backend/src/modules/assets/assets.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
```

Import vào `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
  ],
})
export class AppModule {}
```

#### Bước 2.6: Tạo uploads directory

```bash
cd backend
mkdir uploads
```

Update `backend/.gitignore`:

```
uploads/
```

---

### Bước 3: Implement Blockchain Service

#### Bước 3.1: Tạo Blockchain Service

Tạo file `backend/src/modules/blockchain/blockchain.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.HARDHAT_RPC_URL || 'http://127.0.0.1:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (contractAddress) {
      // TODO: Load ABI from file
      // For now, placeholder
      // this.contract = new ethers.Contract(contractAddress, ABI, this.provider);
    }
  }

  async getTransactionReceipt(txHash: string) {
    return this.provider.getTransactionReceipt(txHash);
  }

  async verifyAssetRegistration(txHash: string) {
    const receipt = await this.getTransactionReceipt(txHash);

    if (!receipt || receipt.status === 0) {
      throw new Error('Transaction failed or not found');
    }

    // TODO: Parse event logs
    // For now, return receipt
    return receipt;
  }

  async getAssetByHash(contentHash: string) {
    // TODO: Call contract.getAssetByHash
    // For now, placeholder
    return null;
  }
}
```

#### Bước 3.2: Tạo Blockchain Module

Tạo file `backend/src/modules/blockchain/blockchain.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Module({
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
```

Import vào `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    BlockchainModule,
  ],
})
export class AppModule {}
```

---

## CHECKPOINT 4: Backend Core Done

### Thành Viên A kiểm tra:

```bash
cd backend
npm run start:dev
```

Test APIs với Postman:

**POST** `http://localhost:3001/api/v1/auth/register` - Đăng ký user
**POST** `http://localhost:3001/api/v1/auth/login` - Login lấy token
**POST** `http://localhost:3001/api/v1/users/profile` - Tạo profile (cần JWT token)
**POST** `http://localhost:3001/api/v1/assets/upload` - Upload file (cần JWT token + file)
**GET** `http://localhost:3001/api/v1/assets` - List assets

---

## PHASE 6 - Frontend Auth & Registration (Thành Viên B)

### Bước 1: Tạo Auth Pages

#### Bước 1.1: Tạo trang Login

Tạo file `frontend/src/app/auth/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </main>
    </div>
  );
}
```

#### Bước 1.2: Tạo trang Register

Tạo file `frontend/src/app/auth/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </main>
    </div>
  );
}
```

### Bước 2: Tạo Dashboard

Tạo file `frontend/src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchAssets();
  }, [router]);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch assets');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.fullName || user.email}</h2>
          <p className="text-gray-600">Role: {user.role}</p>
          {user.walletAddress && (
            <p className="text-gray-600">Wallet: {user.walletAddress}</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold">{asset.title}</h3>
                <p className="text-sm text-gray-600">{asset.category}</p>
                <p className="text-sm text-gray-600">Status: {asset.status}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Register New Asset
        </button>
      </main>
    </div>
  );
}
```

---

## PHASE 7 - Integration & Testing (Cả 2 người)

### Bước 1: Test End-to-End Flow

#### Thành Viên A:
```bash
# Backend
cd backend
npm run start:dev
```

#### Thành Viên B:
```bash
# Frontend
cd frontend
npm run dev
```

#### Test Flow:
1. Mở frontend `http://localhost:3000`
2. Đăng ký tài khoản mới
3. Login
4. Vào dashboard
5. Upload file (mock)
6. Xem asset list

---

## TÀI LIỆU THAM KHẢO

- Hardhat: https://hardhat.org/docs
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- ethers.js: https://docs.ethers.org/v6
- Prisma: https://www.prisma.io/docs
- MetaMask: https://docs.metamask.io

---

## LƯU Ý QUAN TRỌNG

1. **Security:** Không commit `.env` file, private keys, hoặc sensitive data
2. **Testing:** Luôn test API trước khi integrate với frontend
3. **Error Handling:** Handle errors gracefully trên cả backend và frontend
4. **Type Safety:** Sử dụng TypeScript interfaces để đảm bảo type safety
5. **Git:** Commit thường xuyên với meaningful messages

---

## NEXT STEPS (Tùy chọn - Sau MVP)

Các tính năng nâng cao có thể thêm sau:
- MetaMask integration cho registration flow
- Transfer functionality
- Admin dashboard
- IPFS integration
- Licensing module
- Dispute resolution workflow


---

## TÀI LIỆU THAM KHẢO

- Hardhat: https://hardhat.org/docs
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- ethers.js: https://docs.ethers.org/v6
- Prisma: https://www.prisma.io/docs
