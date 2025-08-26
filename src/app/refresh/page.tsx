'use client';

import {
  getFarcasterCookieAttributes,
  isFarcasterMiniAppEnvironment,
  waitForFarcasterAuth,
} from '@/lib/farcaster-utils';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const isFarcaster = isFarcasterMiniAppEnvironment();
        console.log('Refresh page - Farcaster environment:', isFarcaster);

        // Farcaster環境では認証完了を待機
        if (isFarcaster) {
          console.log('Waiting for Farcaster authentication...');
          await waitForFarcasterAuth();
        }

        const token = await getAccessToken();
        const redirectUrl = searchParams.get('redirect_uri') || '/';

        console.log('Token obtained:', !!token);

        if (token) {
          // 環境に応じたクッキー属性を使用
          const cookieAttributes = getFarcasterCookieAttributes();
          document.cookie = `privy-token=${token}; ${cookieAttributes}`;
          console.log('Token set in cookie with attributes:', cookieAttributes);

          // 少し待ってからリダイレクト（クッキー設定の確実な反映のため）
          setTimeout(() => {
            router.push(redirectUrl);
          }, 100);
        } else {
          console.log('No token available, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        router.push('/');
      }
    };

    handleRefresh();
  }, [getAccessToken, searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>認証中...</p>
      </div>
    </div>
  );
}
