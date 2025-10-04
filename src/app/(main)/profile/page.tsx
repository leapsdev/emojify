'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  console.log('🏁 Profile page component started');

  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  console.log('📊 Profile page initial state:', {
    isAuthenticated,
    isLoading,
    walletAddress,
    userData,
    isDataLoading,
  });

  // 認証状態のデバッグログ
  useEffect(() => {
    console.log('📊 Profile page auth state:', {
      isAuthenticated,
      isLoading,
      walletAddress,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, isLoading, walletAddress]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && walletAddress) {
        try {
          console.log('📱 Fetching user data for wallet:', walletAddress);
          const data = await getUser(walletAddress);
          console.log('✅ User data fetched:', data);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress]);

  // 未認証の場合はホームページにリダイレクト
  useEffect(() => {
    console.log('🔄 Profile page redirect check:', {
      isLoading,
      isAuthenticated,
      shouldRedirect: !isLoading && !isAuthenticated,
    });

    if (!isLoading && !isAuthenticated) {
      console.log('🚀 Redirecting to / due to unauthenticated state');
      console.log('🚨 REDIRECT TRIGGERED - Current URL:', window.location.href);
      console.log('🚨 REDIRECT TRIGGERED - Auth state:', {
        isLoading,
        isAuthenticated,
      });
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isDataLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <ProfilePage user={userData || null} />;
}
