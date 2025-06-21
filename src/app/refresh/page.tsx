'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RefreshPage() {
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

  return null;
}
