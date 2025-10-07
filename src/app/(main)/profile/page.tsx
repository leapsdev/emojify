'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/clientAction';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[Profile page] Fetching user data triggered:', {
      isAuthenticated,
      walletAddress,
    });

    // ウォレットアドレスが変更された場合は、必ずデータを再取得
    const fetchUserData = async () => {
      // 認証チェック
      if (!isAuthenticated || !walletAddress) {
        console.log(
          '[Profile page] Skipping user data fetch - not authenticated or no wallet address',
        );
        setUserData(null);
        setIsDataLoading(false);
        return;
      }

      // ローディング開始
      setIsDataLoading(true);
      console.log('[Profile page] Fetching user data for:', walletAddress);

      try {
        const data = await getUser(walletAddress);
        console.log('[Profile page] User data fetched:', {
          walletAddress,
          hasData: !!data,
          username: data?.username,
        });
        setUserData(data);
      } catch (error) {
        console.error('[Profile page] Failed to fetch user data:', error);
        setUserData(null);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.push('/');
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">Authenticating...</p>
          )}
          {!isLoading && isDataLoading && (
            <p className="text-sm text-gray-500 mt-2">Loading profile...</p>
          )}
        </div>
      </div>
    );
  }

  // プロフィールデータが取得できていない場合はローディングを表示
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfilePage user={userData || null} walletAddress={walletAddress || ''} />
  );
}
