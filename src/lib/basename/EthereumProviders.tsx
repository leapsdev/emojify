'use client';

import { config } from '@/lib/basename/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
// import { WagmiProvider } from '@privy-io/wagmi'; // 一時的にコメントアウト
import { WagmiProvider } from 'wagmi'; // 標準のWagmiProviderを使用

const queryClient = new QueryClient();

export default function EthereumProviders({
  children,
}: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
