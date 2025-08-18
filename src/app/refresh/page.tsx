'use client';

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
        console.log('Token refresh started...');
        const token = await getAccessToken();
        const redirectUrl = searchParams.get('redirect_uri') || '/';

        if (token) {
          console.log('Token obtained, setting cookie...');
          // トークンをクッキーに設定
          document.cookie = `privy-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
          console.log('Cookie set, redirecting...');
          router.push(redirectUrl);
        } else {
          console.log('No token obtained, redirecting to home...');
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
