'use client';

import EthereumProviders from '@/lib/basename/EthereumProviders';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { OnchainProvider } from './OnchainKitProvider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * すべてのプロバイダーを統合したコンポーネント
 * ChunkLoadErrorを防ぐため、Client Component境界を明示的に定義
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <EthereumProviders>
        <OnchainProvider>{children}</OnchainProvider>
      </EthereumProviders>
    </AuthProvider>
  );
}
