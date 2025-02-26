import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const handleRefresh = async () => {
      const token = await getAccessToken();
      const redirectUrl = searchParams.get('redirect_uri') || '/';

      if (token) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    };

    handleRefresh();
  }, [getAccessToken, router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">認証状態を確認中...</p>
    </div>
  );
}
