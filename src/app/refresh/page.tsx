'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RefreshContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();

  const handleRefresh = async () => {
    const token = await getAccessToken();
    const redirectUrl = searchParams.get('redirect_uri') || '/';

    if (token) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  // 即時実行
  handleRefresh();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">認証状態を確認中...</p>
    </div>
  );
}

export default function RefreshPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <RefreshContent />
    </Suspense>
  );
}
