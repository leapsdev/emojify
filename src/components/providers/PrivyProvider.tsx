'use client';

import { Loading } from '@/components/ui/Loading';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import dynamic from 'next/dynamic';

const PrivyProviderClient = dynamic(
  () => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider),
  { ssr: false },
);

function FirebaseAuthSync({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useFirebaseAuth();

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    console.error('Firebase認証エラー:', error);
    // エラーがあってもアプリは継続して動作させる
  }

  return <>{children}</>;
}

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
      }}
    >
      <FirebaseAuthSync>{children}</FirebaseAuthSync>
    </PrivyProviderClient>
  );
}
