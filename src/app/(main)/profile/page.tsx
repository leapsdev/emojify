'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/clientAction';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Profile page - Auth state:', {
      isAuthenticated,
      isLoading,
      walletAddress,
      user: !!user,
      userUid: user?.uid,
    });

    // Firebase認証が完了してからデータを取得
    if (!isAuthenticated || !walletAddress) {
      console.log(
        'Skipping user data fetch - not authenticated or no wallet address',
      );
      setIsDataLoading(false);
      return;
    }

    // Firebase認証が完了するまで待機
    if (!user) {
      console.log(
        'Waiting for Firebase authentication to complete before fetching user data',
      );
      return; // ローディング状態を維持
    }

    const fetchUserData = async () => {
      console.log('Fetching user data for:', walletAddress);
      try {
        // Firebase認証が完了していることを確認
        if (user.uid !== walletAddress) {
          console.warn('Firebase UID and wallet address mismatch:', {
            firebaseUid: user.uid,
            walletAddress,
          });
        }

        const data = await getUser(walletAddress);
        console.log('User data fetched:', data);
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress, isLoading, user]);

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
