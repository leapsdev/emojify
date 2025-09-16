'use client';

import { Loading } from '@/components/ui/Loading';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

interface FarcasterAuthProviderProps {
  children: React.ReactNode;
}

export function FarcasterAuthProvider({
  children,
}: FarcasterAuthProviderProps) {
  const {
    isFarcasterAuthenticated,
    isFirebaseAuthenticated,
    isLoading,
    error,
    authenticateWithFarcaster,
  } = useFarcasterAuth();

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
    console.error('Farcaster認証エラー:', error);

    let errorMessage = 'Farcaster認証エラーが発生しました';
    let errorDetails = '';

    if (error.includes('Farcaster SDKが初期化されていません')) {
      errorMessage = 'Farcaster Mini Appの初期化に失敗しました';
      errorDetails = 'このアプリはFarcaster Mini App環境で実行してください';
    } else if (error.includes('Farcasterトークンの取得に失敗しました')) {
      errorMessage = 'Farcaster認証の初期化に失敗しました';
      errorDetails = 'Farcaster認証を確認してください';
    } else if (error.includes('Firebaseトークンの取得に失敗しました')) {
      errorMessage = 'Firebase認証の初期化に失敗しました';
      errorDetails = 'ネットワーク接続または認証設定を確認してください';
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
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => authenticateWithFarcaster()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
            >
              再試行
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors w-full"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 認証されていない場合の表示
  if (!isFarcasterAuthenticated || !isFirebaseAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Farcaster認証が必要です
          </h2>
          <p className="text-sm text-blue-600 mb-4">
            このアプリを使用するには、Farcaster認証が必要です。
          </p>
          <button
            type="button"
            onClick={() => authenticateWithFarcaster()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Farcasterで認証
          </button>
        </div>
      </div>
    );
  }

  // 認証済みの場合、子コンポーネントを表示
  return <>{children}</>;
}
