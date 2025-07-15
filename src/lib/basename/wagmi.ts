'use client';
import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const isProd = process.env.NODE_ENV === 'production';

export const config = createConfig({
  chains: [isProd ? base : baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
