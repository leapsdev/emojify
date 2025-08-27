'use client';

import { getTokenStorage } from '@/lib/utils';
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
        const token = await getAccessToken();
        const redirectUrl = searchParams.get('redirect_uri') || '/';

        if (token) {
          // 環境に応じたトークン保存方法を使用
          const tokenStorage = getTokenStorage();
          tokenStorage.setToken(token);

          router.push(redirectUrl);
        } else {
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
