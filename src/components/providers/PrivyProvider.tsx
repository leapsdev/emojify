'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { Loading } from '@/components/ui/Loading';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { PrivyProvider } from '@privy-io/react-auth';

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

export function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
  const { isMiniApp } = useIsMiniApp();
  const { isLoading } = useFirebaseAuth();

  if (!isMiniApp && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['wallet', 'farcaster', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
