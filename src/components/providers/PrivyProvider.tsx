'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { Loading } from '@/components/ui/Loading';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { PrivyProvider } from '@privy-io/react-auth';

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

export function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
  const { isMiniApp } = useIsMiniApp();
  const { isLoading } = usePrivyAuth();

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
        // Mini App環境ではウォレット機能を無効化
        loginMethods: isMiniApp
          ? ['farcaster', 'email']
          : ['wallet', 'farcaster', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: !isMiniApp, // Mini App環境ではウォレットログインを無効化
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: !isMiniApp, // Mini App環境ではウォレットUIを表示しない
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
