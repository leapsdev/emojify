'use client';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

// Mini App環境ではFarcaster SDKのウォレット機能を直接使用するため、
// Wagmiコネクターは設定しない（Privyのデフォルトコネクターのみ使用）
// 将来的には @farcaster/frame-wagmi-connector を使用して統合することも可能
export const config = createConfig({
  chains: [isProd ? base : baseSepolia],
  connectors: [], // Mini App環境ではFarcaster SDKを直接使用
  transports: {
    // 公開RPCエンドポイントを使用（読み取り専用操作用）
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  // WalletConnectの重複初期化を防ぐ設定
  multiInjectedProviderDiscovery: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
