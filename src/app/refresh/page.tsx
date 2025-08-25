'use client';

import { useFarcasterEnvironment } from '@/hooks/useFarcasterEnvironment';
import { setAuthToken } from '@/lib/cookies';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();
  const { isFarcasterEnvironment, isDetectionComplete } =
    useFarcasterEnvironment();

  useEffect(() => {
    // 環境検出が完了してからトークン処理を開始
    if (!isDetectionComplete) {
      return;
    }

    const handleRefresh = async () => {
      try {
        const token = await getAccessToken();
        const redirectUrl = searchParams.get('redirect_uri') || '/chat'; // デフォルトを/chatに変更

        if (token) {
          // 環境に応じたクッキー設定でトークンを保存
          const environment = isFarcasterEnvironment ? 'farcaster' : 'normal';

          // Privyトークンを環境設定で保存
          setAuthToken(token, environment, 'PRIVY_TOKEN');

          // Farcaster環境の場合は追加のデバッグ情報を出力
          if (process.env.NODE_ENV === 'development') {
            console.log('RefreshPage - Token set with environment:', {
              environment,
              isFarcasterEnvironment,
              tokenLength: token.length,
              redirectUrl,
            });
          }

          // リダイレクト
          router.push(redirectUrl);
        } else {
          console.warn(
            'RefreshPage - No token available, redirecting to signin',
          );
          router.push('/');
        }
      } catch (error) {
        console.error('RefreshPage - Token refresh error:', error);
        // エラーの場合もFarcaster環境を考慮
        if (isFarcasterEnvironment) {
          // Farcaster環境では認証エラー時により詳細な情報を出力
          console.error('Farcaster environment authentication error:', {
            error: error instanceof Error ? error.message : error,
            userAgent: navigator.userAgent,
            url: window.location.href,
          });
        }
        router.push('/');
      }
    };

    handleRefresh();
  }, [
    getAccessToken,
    searchParams,
    router,
    isFarcasterEnvironment,
    isDetectionComplete,
  ]);

  // ローディング状態を環境に応じてカスタマイズ
  const loadingMessage = isFarcasterEnvironment
    ? '認証中... (Farcaster)'
    : '認証中...';

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>{loadingMessage}</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-500">
            <p>
              Environment: {isFarcasterEnvironment ? 'Farcaster' : 'Normal'}
            </p>
            <p>Detection: {isDetectionComplete ? 'Complete' : 'In Progress'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
