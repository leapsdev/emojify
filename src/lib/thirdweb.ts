import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';

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

// コントラクトアドレス
export const EMOJI_CONTRACT_ADDRESS =
  '0x70f37e00D14b12A8Fe1386E84BAa73cFDc59EF4a';
