'use client';

import { PrivyProvider } from '@/components/providers/privy-provider';
import { config } from '@/lib/wagmi';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
          <Toaster />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
