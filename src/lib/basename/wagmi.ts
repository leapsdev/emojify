'use client';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

export const config = createConfig({
  chains: [isProd ? base : baseSepolia],
  connectors: [
    farcasterMiniApp(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
  multiInjectedProviderDiscovery: false,
});
