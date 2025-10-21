'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';
import { base, baseSepolia } from 'wagmi/chains';

export function OnchainProvider({ children }: { children: ReactNode }) {
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={isProd ? base : baseSepolia}
      config={{
        appearance: {
          mode: 'auto',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
