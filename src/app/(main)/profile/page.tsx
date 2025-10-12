'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { normalizeWalletAddress } from '@/lib/wallet-utils';
import type { User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/clientAction';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  // 前回のウォレットアドレスを追跡
  const previousWalletAddressRef = useRef<string | null>(null);

  // ウォレットアドレス変更を検出してデータをクリア・再取得
  useEffect(() => {
    if (walletAddress && previousWalletAddressRef.current) {
      // ウォレットアドレスが変更された場合
      if (
        normalizeWalletAddress(walletAddress) !==
        normalizeWalletAddress(previousWalletAddressRef.current)
      ) {
        console.log('🔄 Wallet address changed, clearing user data:', {
          previous: previousWalletAddressRef.current,
          current: walletAddress,
        });

        // データをクリアして再取得を促す
        setUserData(null);
        setIsDataLoading(true);
      }
    }

    // 現在のウォレットアドレスを記録
    previousWalletAddressRef.current = walletAddress || null;
  }, [walletAddress]);

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
          <Loading size="md" text="Loading..." />
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
        <Loading size="md" text="Loading profile..." />
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
