'use client';

import { Loading } from '@/components/ui/Loading';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

interface FarcasterAutoLoginProps {
  children: React.ReactNode;
}

export function FarcasterAutoLogin({ children }: FarcasterAutoLoginProps) {
  const {
    isAuthenticating,
    error,
    userContext,
    isInFarcasterApp,
    farcasterToken,
  } = useFarcasterAuth();

  // Farcaster Mini App内でない場合は通常の子コンポーネントを表示
  if (!isInFarcasterApp) {
    return <>{children}</>;
  }

  // 認証中の場合
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">
            Farcasterアカウントでログイン中...
          </p>
          {userContext && (
            <p className="mt-2 text-sm text-gray-500">
              {userContext.displayName || userContext.username} としてログイン中
            </p>
          )}
        </div>
      </div>
    );
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ログインエラー
          </h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // 認証成功時のデバッグ情報（開発時のみ）
  if (process.env.NODE_ENV === 'development' && farcasterToken) {
    console.log('Farcaster認証成功:', {
      userContext,
      token: `${farcasterToken.substring(0, 20)}...`,
    });
  }

  // 認証成功または通常の表示
  return <>{children}</>;
}
