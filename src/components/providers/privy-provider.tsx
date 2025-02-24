'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
      }}
    >
      {children}
    </Privy>
  );
}
