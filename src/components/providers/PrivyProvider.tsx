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

    // エラーの種類に応じて適切なメッセージを表示
    let errorMessage = '認証エラーが発生しました';
    let errorDetails = '';

    if (error.includes('Firebaseトークンの取得に失敗しました')) {
      errorMessage = 'Firebase認証の初期化に失敗しました';
      errorDetails = 'ネットワーク接続または認証設定を確認してください';
    } else if (error.includes('Privyアクセストークンの取得に失敗しました')) {
      errorMessage = 'Privy認証の初期化に失敗しました';
      errorDetails = 'ウォレット接続またはFarcaster認証を確認してください';
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {errorMessage}
          </h2>
          {errorDetails && (
            <p className="text-sm text-red-600 mb-4">{errorDetails}</p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderClient
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['farcaster', 'wallet', 'email'], // Farcasterを最初に配置
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: false, // Farcasterを優先
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: true,
        },
      }}
    >
      <FirebaseAuthSync>{children}</FirebaseAuthSync>
    </PrivyProviderClient>
  );
}
