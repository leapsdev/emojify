'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PrivyProviderClient = dynamic(
  () => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  },
);

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PrivyProviderClient
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        config={{
          loginMethods: ['wallet', 'email'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            showWalletLoginFirst: true,
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        {children}
      </PrivyProviderClient>
    </Suspense>
  );
}
