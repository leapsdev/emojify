'use client';

import { ProfilePage } from '@/components/pages/ProfilePage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUserById } from '@/repository/db/user/actions';
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState<string>('');

  useEffect(() => {
    const initializePage = async () => {
      const decodedParams = await params;
      const id = decodeURIComponent(decodedParams.id);
      setTargetUserId(id);
    };

    initializePage();
  }, [params]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && walletAddress && targetUserId) {
        try {
          const [target, current] = await Promise.all([
            getUserById(targetUserId),
            getUserById(walletAddress),
          ]);
          setTargetUser(target);
          setCurrentUser(current);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchUserData();
  }, [isAuthenticated, walletAddress, targetUserId]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // フレンド状態の初期値を取得
  const initialIsFriend = Boolean(currentUser?.friends?.[targetUserId]);

  return (
    <ProfilePage
      user={targetUser}
      walletAddress={targetUserId}
      isOwnProfile={false}
      currentWalletAddress={walletAddress || ''}
      initialIsFriend={initialIsFriend}
    />
  );
}
