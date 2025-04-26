'use client';

import dynamic from 'next/dynamic';

const PrivyProviderClient = dynamic(
  () => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider),
  { ssr: false },
);

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
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
        defaultChain: {
          id: 84532, // Base Sepolia
          name: 'Base Sepolia',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: { http: ['https://sepolia.base.org'] },
            public: { http: ['https://sepolia.base.org'] },
          },
        },
      }}
    >
      {children}
    </PrivyProviderClient>
  );
}
