'use client';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

export const config = createConfig({
  chains: [isProd ? base : baseSepolia],
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: http('https://mainnet.base.org', {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [baseSepolia.id]: http('https://sepolia.base.org', {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
