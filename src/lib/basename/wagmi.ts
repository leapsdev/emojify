'use client';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

// Mini App環境ではFarcaster SDKのウォレット機能を直接使用するため、
// Wagmiコネクターは設定しない（Privyのデフォルトコネクターのみ使用）
export const config = createConfig({
  chains: [isProd ? base : baseSepolia],
  connectors: [], // Mini App環境ではFarcaster SDKを直接使用
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  // WalletConnectの重複初期化を防ぐ設定
  multiInjectedProviderDiscovery: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
