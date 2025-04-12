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
  '0x87E56d3F8F6FCb8455b98aE3c0852B95EdD0Ba1a'; // テスト用のコントラクトアドレス

// SDKの初期化
export const getSDK = () => {
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error('THIRDWEB_SECRET_KEY is not defined');
  }
  
  // Sepolia testnetの詳細設定
  const sepolia = {
    ...Sepolia,
    rpc: [
      "https://rpc.sepolia.org",
      "https://eth-sepolia.g.alchemy.com/v2/demo",
      "https://sepolia.infura.io/v3/",
    ],
    chainId: 11155111,
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
  };

  return new ThirdwebSDK(sepolia, {
    clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
};
