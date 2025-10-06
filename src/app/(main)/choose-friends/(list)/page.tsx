'use client';

import { ClientChooseFriendsPage } from '@/components/pages/ChooseFriendsPage';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { getUsersWithFriendship } from '@/repository/db/user/actions';
import { useEffect, useState } from 'react';

export default function ChooseFriendsPage() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [friendshipData, setFriendshipData] = useState<{
    friends: Array<User & { walletAddress: string }>;
    others: Array<User & { walletAddress: string }>;
  }>({ friends: [], others: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchFriendshipData = async () => {
      console.log('[ChooseFriendsPage] データ取得開始:', {
        isAuthenticated,
        walletAddress,
        hasFirebaseUser: !!user,
        timestamp: new Date().toISOString(),
      });

      if (isAuthenticated && walletAddress && user) {
        try {
          console.log('[ChooseFriendsPage] getUsersWithFriendship呼び出し:', {
            walletAddress,
          });
          const data = await getUsersWithFriendship(walletAddress);
          console.log('[ChooseFriendsPage] データ取得成功:', {
            friendsCount: data.friends.length,
            othersCount: data.others.length,
          });
          setFriendshipData(data);
        } catch (error) {
          console.error('[ChooseFriendsPage] データ取得エラー:', error);
        }
      } else {
        console.log('[ChooseFriendsPage] データ取得スキップ:', {
          isAuthenticated,
          walletAddress,
          hasFirebaseUser: !!user,
        });
      }
      setIsDataLoading(false);
    };

    fetchFriendshipData();
  }, [isAuthenticated, walletAddress, user]);

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

  return (
    <ClientChooseFriendsPage
      initialFriends={friendshipData.friends}
      initialOthers={friendshipData.others}
    />
  );
}
