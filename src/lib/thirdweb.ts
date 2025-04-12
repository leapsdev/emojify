import { createThirdwebClient } from 'thirdweb';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { defineChain } from 'thirdweb/chains';
import { Sepolia } from '@thirdweb-dev/chains';

// Base Sepolia Testnet
export const baseSepolia = defineChain(84532);

// サーバーサイド用のクライアント
export function getServerClient() {
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error(
      'THIRDWEB_SECRET_KEY is not defined in environment variables',
    );
  }

  return createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
}

// コントラクトアドレス（Sepolia Testnet）
export const EMOJI_CONTRACT_ADDRESS =
  '0x70f37e00D14b12A8Fe1386E84BAa73cFDc59EF4a';

// SDKの初期化
export const getSDK = () => {
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error('THIRDWEB_SECRET_KEY is not defined');
  }
  
  // Sepoliaネットワークの設定
  // カスタムSepoliaチェーン設定
  const sepoliaChain = {
    chainId: 11155111,
    rpc: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18
    },
    slug: "sepolia"
  };

  return new ThirdwebSDK(sepoliaChain, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID
  });
};
